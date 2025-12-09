package com.cmze.usecase.contest;

import com.cmze.entity.Participant;
import com.cmze.enums.ContestStatus;
import com.cmze.repository.ContestRepository;
import com.cmze.repository.ParticipantRepository;
import com.cmze.response.JoinContestResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.identity.IdentityServiceClient;
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

    public JoinContestUseCase(final ContestRepository contestRepository,
                              final ParticipantRepository participantRepository,
                              final IdentityServiceClient identityClient) {
        this.contestRepository = contestRepository;
        this.participantRepository = participantRepository;
        this.identityClient = identityClient;
    }

    @Transactional
    public ActionResult<JoinContestResponse> execute(final Long contestId, final UUID userId) {
        try {

            final var contestOpt = contestRepository.findById(contestId);
            if (contestOpt.isEmpty()) return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Contest not found"));
            final var contest = contestOpt.get();

            if (contest.getStatus() == ContestStatus.DRAFT) return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Contest not in draft mode"));

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
}
