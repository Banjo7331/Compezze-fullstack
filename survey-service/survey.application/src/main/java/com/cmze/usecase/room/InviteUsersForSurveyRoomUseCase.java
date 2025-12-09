package com.cmze.usecase.room;

import com.cmze.repository.SurveyRoomRepository;
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
public class InviteUsersForSurveyRoomUseCase {

    private static final Logger logger = LoggerFactory.getLogger(InviteUsersForSurveyRoomUseCase.class);

    private final SurveyRoomRepository surveyRoomRepository;
    private final SoulboundTokenService soulboundTokenService;
    private final ApplicationEventPublisher eventPublisher;

    public InviteUsersForSurveyRoomUseCase(
            final SurveyRoomRepository surveyRoomRepository,
            final SoulboundTokenService soulboundTokenService,
            final ApplicationEventPublisher eventPublisher) {
        this.surveyRoomRepository = surveyRoomRepository;
        this.soulboundTokenService = soulboundTokenService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ActionResult<GenerateRoomInvitesResponse> execute(final UUID roomId, final GenerateRoomInvitesRequest request, final UUID requestingHostId) {
        try {
            final var roomOpt = surveyRoomRepository.findById(roomId);

            if (roomOpt.isEmpty()) {
                logger.warn("Invite generation failed: Room {} not found", roomId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.NOT_FOUND, "Room not found"
                ));
            }

            final var room = roomOpt.get();

            if (!room.getUserId().equals(requestingHostId)) {
                logger.warn("Invite generation failed: User {} is not host of room {}", requestingHostId, roomId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.FORBIDDEN, "Only host can generate invites"
                ));
            }

            final var generatedTokens = new HashMap<UUID, String>();

            final var surveyTitle = room.getSurvey().getTitle();

            for (final var targetUserId : request.getUserIds()) {
                final var token = soulboundTokenService.mintInvitationToken(roomId, targetUserId);
                generatedTokens.put(targetUserId, token);
            }

            eventPublisher.publishEvent(new InvitationsGeneratedEvent(
                    this,
                    roomId.toString(),
                    surveyTitle,
                    generatedTokens
            ));

            logger.info("Generated invites for {} users in room {}", generatedTokens.size(), roomId);

            final var response = new GenerateRoomInvitesResponse(generatedTokens);

            return ActionResult.success(response);

        } catch (Exception e) {
            logger.error("Failed to generate invites for room {}: {}", roomId, e.getMessage(), e);

            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred."
            ));
        }
    }
}
