package com.cmze.usecase.contest;

import com.cmze.repository.ContestRepository;
import com.cmze.request.GenerateContestInvitesRequest;
import com.cmze.response.GenerateContestInvitesResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.helpers.SoulboundTokenService;
import com.cmze.usecase.UseCase;
import com.cmze.ws.event.InvitationsGeneratedEvent;
import com.cmze.ws.event.ContestInvitationsGeneratedEvent;
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
public class InviteUsersForContestUseCase {

    private static final Logger logger = LoggerFactory.getLogger(InviteUsersForContestUseCase.class);

    private final ContestRepository contestRepository;
    private final SoulboundTokenService soulboundTokenService;
    private final ApplicationEventPublisher eventPublisher;

    public InviteUsersForContestUseCase(final ContestRepository contestRepository,
                                        final SoulboundTokenService soulboundTokenService,
                                        final ApplicationEventPublisher eventPublisher) {
        this.contestRepository = contestRepository;
        this.soulboundTokenService = soulboundTokenService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ActionResult<GenerateContestInvitesResponse> execute(final Long contestId,
                                                             final GenerateContestInvitesRequest request,
                                                             final UUID requestingHostId) {
        try {
            final var contestOpt = contestRepository.findById(contestId);

            if (contestOpt.isEmpty()) {
                logger.warn("Invite generation failed: Contest {} not found", contestId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.NOT_FOUND, "Contest not found"
                ));
            }

            final var contest = contestOpt.get();

            if (!contest.getOrganizerId().equals(requestingHostId.toString())) {
                logger.warn("Invite generation failed: User {} is not organizer of contest {}", requestingHostId, contestId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.FORBIDDEN, "Only the organizer can generate invites"
                ));
            }

            final var generatedTokens = new HashMap<UUID, String>();
            final var contestName = contest.getName();

            for (final var targetUserId : request.getUserIds()) {
                final var token = soulboundTokenService.mintInvitationToken(contestId, targetUserId);
                generatedTokens.put(targetUserId, token);
            }

            eventPublisher.publishEvent(new ContestInvitationsGeneratedEvent(
                    this,
                    contestId.toString(),
                    contest.getName(),
                    generatedTokens
            ));

            logger.info("Generated invites for {} users in contest {}", generatedTokens.size(), contestId);

            final var response = new GenerateContestInvitesResponse(generatedTokens);

            return ActionResult.success(response);

        } catch (Exception e) {
            logger.error("Failed to generate invites for contest {}: {}", contestId, e.getMessage(), e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred."
            ));
        }
    }
}
