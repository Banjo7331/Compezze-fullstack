package com.cmze.usecase.room;

import com.cmze.entity.QuizRoom;
import com.cmze.enums.QuizRoomStatus;
import com.cmze.repository.QuizRoomRepository;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import com.cmze.ws.event.QuizNewQuestionEvent;
import com.cmze.ws.event.QuizRoomClosedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.UUID;

@UseCase
public class NextQuestionUseCase {

    private static final Logger logger = LoggerFactory.getLogger(NextQuestionUseCase.class);

    private final QuizRoomRepository quizRoomRepository;
    private final ApplicationEventPublisher eventPublisher;

    public NextQuestionUseCase(final QuizRoomRepository quizRoomRepository,
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
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Only host can change questions"));
            }

            if (room.getStatus() == QuizRoomStatus.FINISHED) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Quiz is already finished"));
            }

            return nextQuestionInternal(room);

        } catch (Exception e) {
            logger.error("Failed to proceed to next question", e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Error"));
        }
    }

    @Transactional
    public void executeSystem(final QuizRoom room) {
        try {
            final var freshRoom = quizRoomRepository.findByIdWithFullQuizStructure(room.getId()).orElseThrow();

            // Automat działa tylko, jeśli jesteśmy w przerwie (QUESTION_FINISHED)
            if (freshRoom.getStatus() == QuizRoomStatus.QUESTION_FINISHED) {
                nextQuestionInternal(freshRoom);
            }
        } catch (Exception e) {
            logger.error("System failed to start next question", e);
        }
    }

    private ActionResult<Void> nextQuestionInternal(final QuizRoom room) {
        final var questions = room.getQuiz().getQuestions();
        final int nextIndex = room.getCurrentQuestionIndex() + 1;

        if (nextIndex >= questions.size()) {
            logger.info("No more questions in room {}. Finishing quiz.", room.getId());

            room.setStatus(QuizRoomStatus.FINISHED);
            room.setCurrentQuestionIndex(nextIndex);
            room.setCurrentQuestionEndTime(null);

            quizRoomRepository.save(room);

            eventPublisher.publishEvent(new QuizRoomClosedEvent(room.getId(), new ArrayList<>()));

            return ActionResult.success(null);
        }

        final var nextQuestion = questions.get(nextIndex);
        final var now = LocalDateTime.now();
        final int timeLimit = room.getTimePerQuestion();

        room.setStatus(QuizRoomStatus.QUESTION_ACTIVE);
        room.setCurrentQuestionIndex(nextIndex);
        room.setCurrentQuestionStartTime(now);
        room.setCurrentQuestionEndTime(now.plusSeconds(timeLimit));

        quizRoomRepository.save(room);
        logger.info("Starting Question {} for room {}", nextIndex, room.getId());

        eventPublisher.publishEvent(new QuizNewQuestionEvent(
                room.getId(),
                nextQuestion,
                nextIndex,
                now,
                timeLimit
        ));

        return ActionResult.success(null);
    }
}
