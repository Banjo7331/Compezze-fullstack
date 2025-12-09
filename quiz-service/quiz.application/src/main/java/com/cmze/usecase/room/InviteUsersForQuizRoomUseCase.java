package com.cmze.usecase.room;

import com.cmze.repository.QuizRoomRepository;
import com.cmze.request.GenerateRoomInvitesRequest;
import com.cmze.response.GenerateRoomInvitesResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.helpers.invites.SoulboundTokenService;
import com.cmze.usecase.UseCase;
import com.cmze.ws.event.InvitationsGeneratedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.HashMap;
import java.util.UUID;

@UseCase
public class InviteUsersForQuizRoomUseCase {

    private static final Logger logger = LoggerFactory.getLogger(InviteUsersForQuizRoomUseCase.class);

    private final QuizRoomRepository quizRoomRepository;
    private final SoulboundTokenService soulboundTokenService;
    private final ApplicationEventPublisher eventPublisher;

    public InviteUsersForQuizRoomUseCase(final QuizRoomRepository quizRoomRepository,
                                         final SoulboundTokenService soulboundTokenService,
                                         final ApplicationEventPublisher eventPublisher) {
        this.quizRoomRepository = quizRoomRepository;
        this.soulboundTokenService = soulboundTokenService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ActionResult<GenerateRoomInvitesResponse> execute(final UUID roomId, final GenerateRoomInvitesRequest request, final UUID requestingHostId) {
        try {
            final var roomOpt = quizRoomRepository.findByIdWithQuiz(roomId);

            if (roomOpt.isEmpty()) {
                logger.warn("Invite generation failed: Quiz Room {} not found", roomId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.NOT_FOUND, "Quiz Room not found"
                ));
            }

            final var room = roomOpt.get();

            if (!room.getHostId().equals(requestingHostId)) {
                logger.warn("Invite generation failed: User {} is not host of quiz room {}", requestingHostId, roomId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.FORBIDDEN, "Only host can generate invites"
                ));
            }

            final var generatedTokens = new HashMap<UUID, String>();

            final var quizTitle = room.getQuiz().getTitle();

            for (final var targetUserId : request.getUserIds()) {
                final var token = soulboundTokenService.mintInvitationToken(roomId, targetUserId);
                generatedTokens.put(targetUserId, token);
            }

            eventPublisher.publishEvent(new InvitationsGeneratedEvent(
                    this,
                    roomId.toString(),
                    quizTitle,
                    generatedTokens
            ));

            logger.info("Generated invites for {} users in quiz room {}", generatedTokens.size(), roomId);

            final var response = new GenerateRoomInvitesResponse(generatedTokens);

            return ActionResult.success(response);

        } catch (Exception e) {
            logger.error("Failed to generate invites for quiz room {}: {}", roomId, e.getMessage(), e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred."
            ));
        }
    }
}
