package com.cmze.usecase.room;

import com.cmze.entity.QuizRoom;
import com.cmze.enums.QuizRoomStatus;
import com.cmze.repository.QuizRoomRepository;
import com.cmze.shared.ActionResult;
import com.cmze.spi.helpers.room.LeaderboardEntryDto;
import com.cmze.usecase.UseCase;
import com.cmze.ws.event.QuizRoomClosedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.ArrayList;
import java.util.UUID;

@UseCase
public class CloseQuizRoomUseCase {

    private static final Logger logger = LoggerFactory.getLogger(CloseQuizRoomUseCase.class);

    private final QuizRoomRepository quizRoomRepository;
    private final ApplicationEventPublisher eventPublisher;

    public CloseQuizRoomUseCase(final QuizRoomRepository quizRoomRepository,
                                final ApplicationEventPublisher eventPublisher) {
        this.quizRoomRepository = quizRoomRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ActionResult<Void> execute(final UUID roomId, final UUID hostId) {
        try {
            final var roomOpt = quizRoomRepository.findByIdWithQuiz(roomId);

            if (roomOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Room not found"));
            }
            final var room = roomOpt.get();

            if (!room.getHostId().equals(hostId)) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.FORBIDDEN, "Only host can close this room"
                ));
            }

            if (room.getStatus() == QuizRoomStatus.FINISHED) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.CONFLICT, "Quiz is already finished"
                ));
            }

            return closeRoomInternal(room);

        } catch (Exception e) {
            logger.error("Failed to close quiz room {}: {}", roomId, e.getMessage(), e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Error closing room"
            ));
        }
    }

    @Transactional
    public void executeSystemForceClose(final QuizRoom room) {
        try {
            final var freshRoom = quizRoomRepository.findByIdWithQuiz(room.getId()).orElseThrow();

            if (freshRoom.getStatus() != QuizRoomStatus.FINISHED) {
                logger.info("System force-closing expired quiz room: {}", freshRoom.getId());
                closeRoomInternal(freshRoom);
            }
        } catch (Exception e) {
            logger.error("System failed to close quiz room {}", room.getId(), e);
        }
    }

    private ActionResult<Void> closeRoomInternal(final QuizRoom room) {
        room.setStatus(QuizRoomStatus.FINISHED);
        room.setCurrentQuestionEndTime(null);

        quizRoomRepository.save(room);

        final var finalRanking = new ArrayList<LeaderboardEntryDto>();

        eventPublisher.publishEvent(new QuizRoomClosedEvent(room.getId(), finalRanking));

        logger.info("Quiz Room {} closed successfully.", room.getId());

        return ActionResult.success(null);
    }
}
