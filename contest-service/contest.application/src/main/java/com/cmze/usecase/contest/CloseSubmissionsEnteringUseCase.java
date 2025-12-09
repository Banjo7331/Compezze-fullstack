package com.cmze.usecase.contest;

import com.cmze.enums.ContestStatus;
import com.cmze.repository.ContestRepository;
import com.cmze.shared.ActionResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
public class CloseSubmissionsEnteringUseCase {

    private static final Logger logger = LoggerFactory.getLogger(CloseSubmissionsEnteringUseCase.class);
    private final ContestRepository contestRepository;

    public CloseSubmissionsEnteringUseCase(final ContestRepository contestRepository) {
        this.contestRepository = contestRepository;
    }

    @Transactional
    public ActionResult<Void> execute(final Long contestId, final UUID organizerId) {
        try {
            final var contestOpt = contestRepository.findById(contestId);
            if (contestOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Contest not found"));
            }
            final var contest = contestOpt.get();

            if (!contest.getOrganizerId().equals(organizerId.toString())) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Only organizer can close submissions."));
            }

            if (contest.getStatus() != ContestStatus.CREATED) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Contest can not be change to draft again."));
            }

            contest.setStatus(ContestStatus.DRAFT);

            contestRepository.save(contest);

            logger.info("Submissions closed for contest {}. Status set to DRAFT (Review Mode).", contestId);

            return ActionResult.success(null);

        } catch (NumberFormatException e) {
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid contest ID"));
        } catch (Exception e) {
            logger.error("Failed to close submissions", e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Error closing submissions"));
        }
    }
}
