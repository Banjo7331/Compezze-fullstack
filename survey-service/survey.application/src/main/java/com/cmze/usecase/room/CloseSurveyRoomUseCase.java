package com.cmze.usecase.room;

import com.cmze.entity.SurveyRoom;
import com.cmze.repository.SurveyRoomRepository;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import com.cmze.ws.event.RoomClosedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.UUID;

@UseCase
public class CloseSurveyRoomUseCase {

    private static final Logger logger = LoggerFactory.getLogger(CloseSurveyRoomUseCase.class);

    private final SurveyRoomRepository surveyRoomRepository;
    private final ApplicationEventPublisher eventPublisher;

    public CloseSurveyRoomUseCase(final SurveyRoomRepository surveyRoomRepository,
                                  final ApplicationEventPublisher eventPublisher) {
        this.surveyRoomRepository = surveyRoomRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ActionResult<Void> execute(final UUID roomId, final UUID hostUserId) {
        try {
            final var roomOpt = surveyRoomRepository.findById(roomId);

            if (roomOpt.isEmpty()) {
                logger.warn("Close failed: Room {} not found", roomId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.NOT_FOUND, "Room not found."
                ));
            }

            final var room = roomOpt.get();

            if (!room.getUserId().equals(hostUserId)) {
                logger.warn("Close failed: User {} is not host of room {}", hostUserId, roomId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.FORBIDDEN, "Only the host can close this room."
                ));
            }

            if (!room.isOpen()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.CONFLICT, "This room is already closed."
                ));
            }

            return closeRoomInternal(room);

        } catch (Exception e) {
            logger.error("Failed to close room {}: {}", roomId, e.getMessage(), e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "An unexpected error occurred while closing the room."
            ));
        }
    }

    @Transactional
    public void executeSystemClose(final SurveyRoom room) {
        logger.info("System closing expired room: {}", room.getId());
        try {
            closeRoomInternal(room);
        } catch (Exception e) {
            logger.error("System failed to close room {}: {}", room.getId(), e.getMessage(), e);
            throw e;
        }
    }

    private ActionResult<Void> closeRoomInternal(final SurveyRoom room) {
        if (!room.isOpen()) {
            return ActionResult.success(null);
        }

        room.setOpen(false);
        final var savedRoom = surveyRoomRepository.save(room);

        logger.info("Room {} closed successfully.", savedRoom.getId());

        eventPublisher.publishEvent(new RoomClosedEvent(this, savedRoom));

        return ActionResult.success(null);
    }
}
