package com.cmze.usecase.room;

import com.cmze.entity.QuizQuestionOption;
import com.cmze.entity.QuizRoom;
import com.cmze.enums.QuizRoomStatus;
import com.cmze.repository.QuizRoomRepository;
import com.cmze.shared.ActionResult;
import com.cmze.spi.helpers.room.QuizResultCounter;
import com.cmze.ws.event.QuizLeaderboardEvent;
import com.cmze.usecase.UseCase;
import com.cmze.ws.event.QuizQuestionFinishedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.time.LocalDateTime;
import java.util.UUID;

@UseCase
public class FinishCurrentQuestionUseCase {

    private static final Logger logger = LoggerFactory.getLogger(FinishCurrentQuestionUseCase.class);

    private static final int INTERMISSION_SECONDS = 10;

    private final QuizRoomRepository quizRoomRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final QuizResultCounter quizResultCounter;

    public FinishCurrentQuestionUseCase(final QuizRoomRepository quizRoomRepository,
                                        final ApplicationEventPublisher eventPublisher,
                                        final QuizResultCounter quizResultCounter) {
        this.quizRoomRepository = quizRoomRepository;
        this.eventPublisher = eventPublisher;
        this.quizResultCounter = quizResultCounter;
    }

    @Transactional
    public ActionResult<Void> execute(final UUID roomId, final UUID hostId) {
        try {
            final var roomOpt = quizRoomRepository.findByIdWithFullQuizStructure(roomId);

            if (roomOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Room not found"));
            }
            final var room = roomOpt.get();

            if (!room.getHostId().equals(hostId)) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Only host can finish question"));
            }

            if (room.getStatus() != QuizRoomStatus.QUESTION_ACTIVE) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Question is not active"));
            }

            finishQuestionInternal(room);
            return ActionResult.success(null);

        } catch (Exception e) {
            logger.error("Error finishing question manually", e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Error"));
        }
    }

    @Transactional
    public void executeSystem(final QuizRoom room) {
        try {
            final var freshRoom = quizRoomRepository.findByIdWithFullQuizStructure(room.getId()).orElseThrow();

            if (freshRoom.getStatus() == QuizRoomStatus.QUESTION_ACTIVE) {
                finishQuestionInternal(freshRoom);
            }
        } catch (Exception e) {
            logger.error("System failed to finish question for room {}", room.getId(), e);
        }
    }

    private void finishQuestionInternal(final QuizRoom room) {
        logger.info("Finishing question index {} for room {}", room.getCurrentQuestionIndex(), room.getId());

        room.setStatus(QuizRoomStatus.QUESTION_FINISHED);

        room.setCurrentQuestionEndTime(LocalDateTime.now().plusSeconds(INTERMISSION_SECONDS));

        quizRoomRepository.save(room);

        final var questions = room.getQuiz().getQuestions();
        final int currentIndex = room.getCurrentQuestionIndex();

        Long correctOptionId = null;

        if (currentIndex >= 0 && currentIndex < questions.size()) {
            final var currentQuestion = questions.get(currentIndex);
            correctOptionId = currentQuestion.getOptions().stream()
                    .filter(QuizQuestionOption::isCorrect)
                    .map(QuizQuestionOption::getId)
                    .findFirst()
                    .orElse(null);
        }

        final var resultsDto = quizResultCounter.calculate(room.getId());

        eventPublisher.publishEvent(new QuizLeaderboardEvent(
                room.getId(),
                resultsDto.getLeaderboard()
        ));

        eventPublisher.publishEvent(new QuizQuestionFinishedEvent(
                room.getId(),
                (questions.isEmpty()) ? null : questions.get(currentIndex).getId(),
                correctOptionId
        ));
    }
}
