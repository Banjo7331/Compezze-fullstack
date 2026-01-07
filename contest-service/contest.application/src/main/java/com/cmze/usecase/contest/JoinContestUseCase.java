package com.cmze.usecase.contest;

import com.cmze.request.JoinContestRequest;
import com.cmze.entity.Participant;
import com.cmze.entity.Contest;
import com.cmze.enums.ContestStatus;
import com.cmze.repository.ContestRepository;
import com.cmze.repository.ParticipantRepository;
import com.cmze.response.JoinContestResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.identity.IdentityServiceClient;
import com.cmze.spi.helpers.SoulboundTokenService;
import com.cmze.usecase.UseCase;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.time.LocalDateTime;
import java.util.UUID;

@UseCase
public class JoinContestUseCase {

    private static final Logger logger = LoggerFactory.getLogger(JoinContestUseCase.class);

    private final ContestRepository contestRepository;
    private final ParticipantRepository participantRepository;
    private final IdentityServiceClient identityClient;
    private final SoulboundTokenService soulboundTokenService;

    public JoinContestUseCase(final ContestRepository contestRepository,
                              final ParticipantRepository participantRepository,
                              final IdentityServiceClient identityClient,
                              final SoulboundTokenService soulboundTokenService) {
        this.contestRepository = contestRepository;
        this.participantRepository = participantRepository;
        this.identityClient = identityClient;
        this.soulboundTokenService = soulboundTokenService;
    }

    @Transactional
    public ActionResult<JoinContestResponse> execute(final Long contestId, final UUID userId, final JoinContestRequest request) {
        try {

            final var contestOpt = contestRepository.findById(contestId);
            if (contestOpt.isEmpty()) return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Contest not found"));
            final var contest = contestOpt.get();

            if (contest.getStatus() == ContestStatus.DRAFT || contest.getStatus() == ContestStatus.FINISHED) return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Contest not in draft mode"));

            final var token = (request != null) ? request.getInvitationToken() : null;
            if (contest.isPrivate() && !isAccessAllowed(contest, userId, token)) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Access denied. Private contest requires valid invitation."));
            }

            final var existing = participantRepository.findByContestIdAndUserId(contestId, userId.toString());
            if (existing.isPresent()) return ActionResult.success(new JoinContestResponse(existing.get().getId()));

            if (contest.getParticipantLimit() != null && contest.getParticipantLimit() > 0) {
                long currentCount = participantRepository.countByContest_Id(contestId);
                if (currentCount >= contest.getParticipantLimit()) return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Contest is full"));
            }

            String displayName = "Participant";
            try {
                final var userDto = identityClient.getUserById(userId);
                if (userDto != null) {
                    displayName = userDto.getUsername();
                }
            } catch (Exception e) {
                logger.warn("Could not fetch user details for {}. Using fallback.", userId);
                displayName = "User-" + userId.toString().substring(0, 8);
            }

            final var participant = new Participant();
            participant.setContest(contest);
            participant.setUserId(userId.toString());
            participant.setDisplayName(displayName);
            participant.setCreatedAt(LocalDateTime.now());

            final var savedParticipant = participantRepository.save(participant);

            logger.info("User {} ({}) joined contest {}", userId, displayName, contestId);

            return ActionResult.success(new JoinContestResponse(savedParticipant.getId()));

        } catch (Exception e) {
            logger.error("Join failed", e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Join failed"));
        }
    }

    private boolean isAccessAllowed(final Contest contest, final UUID userId, final String token) {
        if (contest.getOrganizerId().equals(userId.toString())) {
            return true;
        }

        if (token != null && !token.isBlank()) {
            return soulboundTokenService.validateSoulboundToken(token, userId, contest.getId());
        }

        return false;
    }
}
