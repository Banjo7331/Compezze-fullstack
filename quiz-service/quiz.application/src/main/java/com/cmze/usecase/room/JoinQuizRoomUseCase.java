package com.cmze.usecase.room;

import com.cmze.entity.QuizEntrant;
import com.cmze.entity.QuizRoom;
import com.cmze.enums.QuizRoomStatus;
import com.cmze.repository.QuizEntrantRepository;
import com.cmze.repository.QuizRoomRepository;
import com.cmze.request.JoinQuizRoomRequest;
import com.cmze.response.JoinQuizRoomResponse;
import com.cmze.response.QuizInfoResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.helpers.invites.SoulboundTokenService;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.cmze.ws.event.QuizEntrantJoinedEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.UUID;

@UseCase
public class JoinQuizRoomUseCase {

    private static final Logger logger = LoggerFactory.getLogger(JoinQuizRoomUseCase.class);

    private final QuizRoomRepository quizRoomRepository;
    private final QuizEntrantRepository quizEntrantRepository;
    private final SoulboundTokenService soulboundTokenService;
    private final ApplicationEventPublisher eventPublisher;

    public JoinQuizRoomUseCase(final QuizRoomRepository quizRoomRepository,
                               final QuizEntrantRepository quizEntrantRepository,
                               final SoulboundTokenService soulboundTokenService,
                               final ApplicationEventPublisher eventPublisher) {
        this.quizRoomRepository = quizRoomRepository;
        this.quizEntrantRepository = quizEntrantRepository;
        this.soulboundTokenService = soulboundTokenService;
        this.eventPublisher = eventPublisher;
    }

    public ActionResult<JoinQuizRoomResponse> execute(final UUID roomId, final UUID participantUserId, final JoinQuizRoomRequest request) {
        try {
            final var roomOpt = quizRoomRepository.findByIdWithQuiz(roomId);
            if (roomOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Quiz Room not found."));
            }
            final var room = roomOpt.get();

            if (room.getStatus() == QuizRoomStatus.FINISHED) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.GONE, "Quiz has finished."));
            }

            final var token = (request != null) ? request.getInvitationToken() : null;
            if (room.getQuiz().isPrivate() && !isAccessAllowed(room, participantUserId, token)) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Access denied."));
            }

            final var existingEntrantOpt = quizEntrantRepository.findByQuizRoom_IdAndUserId(roomId, participantUserId);
            final boolean isHost = room.getHostId().equals(participantUserId);

            if (existingEntrantOpt.isPresent()) {
                return returnSuccess(existingEntrantOpt.get(), room, isHost);
            }

            String nickname = (request != null) ? request.getNickname() : null;

            if (isHost && (nickname == null || nickname.isBlank())) {
                nickname = "HOST";
            } else if (nickname == null || nickname.isBlank()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Nickname is required."));
            }

            if (quizEntrantRepository.existsByQuizRoom_IdAndNickname(roomId, nickname)) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Nickname '" + nickname + "' is already taken in this room."));
            }

            final long currentSize = quizEntrantRepository.countByQuizRoom_Id(roomId);
            final int maxParticipants = (room.getMaxParticipants() != null) ? room.getMaxParticipants() : 1000;
            if (currentSize >= maxParticipants) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Quiz Room is full."));
            }

            final var newEntrant = new QuizEntrant();
            newEntrant.setQuizRoom(room);
            newEntrant.setUserId(participantUserId);
            newEntrant.setNickname(nickname);

            QuizEntrant savedParticipant;
            try {
                savedParticipant = quizEntrantRepository.save(newEntrant);

                final long newSize = currentSize + 1;

                eventPublisher.publishEvent(new QuizEntrantJoinedEvent(
                        roomId,
                        savedParticipant.getId(),
                        participantUserId,
                        nickname,
                        newSize
                ));

            } catch (DataIntegrityViolationException e) {
                savedParticipant = quizEntrantRepository.findByQuizRoom_IdAndUserId(roomId, participantUserId).orElseThrow();
            }

            return returnSuccess(savedParticipant, room, isHost);

        } catch (Exception e) {
            logger.error("Join failed", e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Error"));
        }
    }

    private ActionResult<JoinQuizRoomResponse> returnSuccess(final QuizEntrant entrant, final QuizRoom room, final boolean isHost) {
        final var quiz = room.getQuiz();

        final var safeInfo = new QuizInfoResponse(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getQuestions() != null ? quiz.getQuestions().size() : 0
        );

        final var response = new JoinQuizRoomResponse(
                entrant.getId(),
                safeInfo,
                isHost,
                room.getStatus().name()
        );
        return ActionResult.success(response);
    }

    private boolean isAccessAllowed(final QuizRoom room, final UUID participantUserId, final String token) {
        if (room.getHostId().equals(participantUserId)) return true;
        if (token != null && !token.isBlank()) {
            return soulboundTokenService.validateSoulboundToken(token, participantUserId, room.getId());
        }
        return false;
    }
}
