package com.cmze.usecase.submission;

import com.cmze.enums.ContestRole;
import com.cmze.enums.ContestStatus;
import com.cmze.enums.SubmissionStatus;
import com.cmze.repository.ContestRepository;
import com.cmze.repository.ParticipantRepository;
import com.cmze.repository.SubmissionRepository;
import com.cmze.response.GetSubmissionResponse;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@UseCase
public class ListSubmissionsForReviewUseCase {

    private static final Logger logger = LoggerFactory.getLogger(ListSubmissionsForReviewUseCase.class);

    private final SubmissionRepository submissionRepo;
    private final ParticipantRepository participantRepo;
    private final ContestRepository contestRepo;

    public ListSubmissionsForReviewUseCase(final SubmissionRepository submissionRepo,
                                           final ParticipantRepository participantRepo,
                                           final ContestRepository contestRepo) {
        this.submissionRepo = submissionRepo;
        this.participantRepo = participantRepo;
        this.contestRepo = contestRepo;
    }

    @Transactional(readOnly = true)
    public ActionResult<Page<GetSubmissionResponse>> execute(final Long contestId,
                                                             final UUID reviewerId,
                                                             final SubmissionStatus status,
                                                             final Pageable pageable) {
        try {

            final var contestOpt = contestRepo.findById(contestId);

            if (contestOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Contest not found"));
            }

            final var contest = contestOpt.get();

            final var reviewerOpt = participantRepo.findByContestIdAndUserId(contestId, reviewerId.toString());

            if (reviewerOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "User is not a participant."));
            }

            final var participant = reviewerOpt.get();
            final var roles = participant.getRoles();

            boolean isStaff = roles.contains(ContestRole.ORGANIZER) ||
                    roles.contains(ContestRole.MODERATOR) ||
                    roles.contains(ContestRole.JURY);

            if (!ContestStatus.ACTIVE.equals(contest.getStatus()) && !isStaff) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN,
                        "Contest is not active yet. Submissions are hidden for participants."));
            }

            SubmissionStatus effectiveStatus = status;

            if (!isStaff) {
                effectiveStatus = SubmissionStatus.APPROVED;
            }

            final var pageResult = (status != null)
                    ? submissionRepo.findByContest_IdAndStatus(contestId, effectiveStatus, pageable)
                    : submissionRepo.findByContest_Id(contestId, pageable);

            final var dtoPage = pageResult.map(s -> new GetSubmissionResponse(
                    s.getId(),
                    s.getParticipant().getDisplayName(),
                    s.getParticipant().getUserId(),
                    s.getStatus(),
                    s.getOriginalFilename(),
                    s.getComment(),
                    s.getCreatedAt()
            ));

            return ActionResult.success(dtoPage);

        } catch (Exception e) {
            logger.error("Failed to list submissions", e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Error"));
        }
    }
}