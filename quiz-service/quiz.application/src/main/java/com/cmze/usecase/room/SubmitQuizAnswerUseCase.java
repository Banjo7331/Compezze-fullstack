package com.cmze.usecase.room;

import com.cmze.entity.QuizAnswer;
import com.cmze.entity.QuizRoom;
import com.cmze.enums.QuizRoomStatus;
import com.cmze.repository.QuizAnswerRepository;
import com.cmze.repository.QuizEntrantRepository;
import com.cmze.repository.QuizRoomRepository;
import com.cmze.request.SubmitQuizAnswerRequest;
import com.cmze.response.SubmitQuizAnswerResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.helpers.room.QuizScoringCalculator;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@UseCase
public class SubmitQuizAnswerUseCase {

    private static final Logger logger = LoggerFactory.getLogger(SubmitQuizAnswerUseCase.class);

    private final QuizRoomRepository quizRoomRepository;
    private final QuizEntrantRepository quizEntrantRepository;
    private final QuizAnswerRepository quizAnswerRepository;
    private final QuizScoringCalculator scoringStrategy;

    private static final int AUTO_FINISH_DELAY_SECONDS = 5;

    public SubmitQuizAnswerUseCase(final QuizRoomRepository quizRoomRepository,
                                   final QuizEntrantRepository quizEntrantRepository,
                                   final QuizAnswerRepository quizAnswerRepository,
                                   final QuizScoringCalculator scoringStrategy) {
        this.quizRoomRepository = quizRoomRepository;
        this.quizEntrantRepository = quizEntrantRepository;
        this.quizAnswerRepository = quizAnswerRepository;
        this.scoringStrategy = scoringStrategy;
    }

    @Transactional
    public ActionResult<SubmitQuizAnswerResponse> execute(final UUID roomId, final UUID userId, final SubmitQuizAnswerRequest request) {
        try {
            final var roomOpt = quizRoomRepository.findByIdWithFullQuizStructure(roomId);

            if (roomOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Room not found"));
            }
            final var room = roomOpt.get();

            if (room.getStatus() != QuizRoomStatus.QUESTION_ACTIVE) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.CONFLICT, "Question is not active. Too late or too early."
                ));
            }

            final int currentIndex = room.getCurrentQuestionIndex();
            final var questions = room.getQuiz().getQuestions();

            if (currentIndex < 0 || currentIndex >= questions.size()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.INTERNAL_SERVER_ERROR, "Invalid question index state"
                ));
            }

            final var currentQuestion = questions.get(currentIndex);

            if (!currentQuestion.getId().equals(request.getQuestionId())) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.BAD_REQUEST, "Sync error: answering wrong question ID."
                ));
            }

            final var now = LocalDateTime.now();
            final long elapsedMs = ChronoUnit.MILLIS.between(room.getCurrentQuestionStartTime(), now);
            final long limitMs = room.getTimePerQuestion() * 1000L;

            if (elapsedMs > (limitMs + 2000)) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.GONE, "Time is up!"
                ));
            }

            if (quizAnswerRepository.existsByUserIdAndRoomIdAndQuestionIndex(userId, roomId, currentIndex)) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.CONFLICT, "You have already submitted an answer for this question."
                ));
            }

            final var selectedOption = currentQuestion.getOptions().stream()
                    .filter(o -> o.getId().equals(request.getSelectedOptionId()))
                    .findFirst()
                    .orElse(null);

            if (selectedOption == null) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid option ID"));
            }

            final boolean isCorrect = selectedOption.isCorrect();
            int pointsAwarded = 0;

            if (isCorrect) {
                pointsAwarded = scoringStrategy.calculateScore(
                        currentQuestion.getPoints(),
                        room.getTimePerQuestion(),
                        elapsedMs
                );
            }

            final var entrantOpt = quizEntrantRepository.findByQuizRoom_IdAndUserId(roomId, userId);

            if (entrantOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "You are not in this room"));
            }
            final var entrant = entrantOpt.get();

            entrant.setTotalScore(entrant.getTotalScore() + pointsAwarded);

            if (isCorrect) {
                entrant.setComboStreak(entrant.getComboStreak() + 1);
                entrant.setLastAnswerCorrect(true);
            } else {
                entrant.setComboStreak(0);
                entrant.setLastAnswerCorrect(false);
            }

            final var answer = new QuizAnswer();
            answer.setEntrant(entrant);
            answer.setQuestionId(currentQuestion.getId());
            answer.setQuestionIndex(currentIndex);
            answer.setSelectedOptionId(selectedOption.getId());
            answer.setTimeTakenMs(elapsedMs);
            answer.setCorrect(isCorrect);
            answer.setPointsAwarded(pointsAwarded);

            quizAnswerRepository.save(answer);
            quizEntrantRepository.save(entrant);

            checkAndScheduleAutoFinish(room, currentIndex);

            logger.info("User {} answered Q{} in {}ms. Correct: {}, Points: {}",
                    userId, currentIndex, elapsedMs, isCorrect, pointsAwarded);

            final var response = new SubmitQuizAnswerResponse(
                    isCorrect,
                    pointsAwarded,
                    entrant.getTotalScore(),
                    entrant.getComboStreak()
            );

            return ActionResult.success(response);

        } catch (Exception e) {
            logger.error("Submit answer failed for room {}: {}", roomId, e.getMessage(), e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Error processing answer"
            ));
        }
    }

    private void checkAndScheduleAutoFinish(final QuizRoom room, int questionIndex) {
        long totalEntrants = quizEntrantRepository.countByQuizRoom_Id(room.getId());
        long activePlayersCount = Math.max(0, totalEntrants - 1);

        if (activePlayersCount <= 0) return;

        long submittedAnswersCount = quizAnswerRepository.countByRoomIdAndQuestionIndex(room.getId(), questionIndex);

        if (submittedAnswersCount >= activePlayersCount) {
            logger.info("All players answered in room {}! Shortening timer.", room.getId());

            final var now = LocalDateTime.now();
            final var newEndTime = now.plusSeconds(AUTO_FINISH_DELAY_SECONDS);

            if (newEndTime.isBefore(room.getCurrentQuestionEndTime())) {
                room.setCurrentQuestionEndTime(newEndTime);
                quizRoomRepository.save(room);
            }
        }
    }
}
