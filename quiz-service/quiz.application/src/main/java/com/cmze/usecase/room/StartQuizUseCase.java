package com.cmze.usecase.room;

import com.cmze.enums.QuizRoomStatus;
import com.cmze.repository.QuizRoomRepository;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import com.cmze.ws.event.QuizNewQuestionEvent;
import com.cmze.ws.event.QuizStartedEvent;
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
public class StartQuizUseCase {

    private static final Logger logger = LoggerFactory.getLogger(StartQuizUseCase.class);

    private final QuizRoomRepository quizRoomRepository;
    private final ApplicationEventPublisher eventPublisher;

    public StartQuizUseCase(final QuizRoomRepository quizRoomRepository,
                            final ApplicationEventPublisher eventPublisher) {
        this.quizRoomRepository = quizRoomRepository;
        this.eventPublisher = eventPublisher;
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
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Only host can start the quiz"));
            }

            if (room.getStatus() != QuizRoomStatus.LOBBY) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.CONFLICT,
                        "Quiz cannot be started. Current status: " + room.getStatus()
                ));
            }

            final var questions = room.getQuiz().getQuestions();
            if (questions == null || questions.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Quiz has no questions!"));
            }

            final int firstIndex = 0;
            final var firstQuestion = questions.get(firstIndex);

            room.setStatus(QuizRoomStatus.QUESTION_ACTIVE);
            room.setCurrentQuestionIndex(firstIndex);

            final var now = LocalDateTime.now();
            room.setCurrentQuestionStartTime(now);

            final var timeLimit = room.getTimePerQuestion();

            room.setCurrentQuestionEndTime(now.plusSeconds(timeLimit));

            quizRoomRepository.save(room);
            logger.info("Quiz {} started by host {}. Question 0 active.", roomId, hostId);

            eventPublisher.publishEvent(new QuizStartedEvent(roomId));

            eventPublisher.publishEvent(new QuizNewQuestionEvent(
                    roomId,
                    firstQuestion,
                    firstIndex,
                    now,
                    timeLimit
            ));

            return ActionResult.success(null);

        } catch (Exception e) {
            logger.error("Failed to start quiz room {}: {}", roomId, e.getMessage(), e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred while starting the quiz."
            ));
        }
    }
}
