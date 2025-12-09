package com.cmze.usecase.submission;

import com.cmze.enums.ContestRole;
import com.cmze.enums.SubmissionStatus;
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

    public ListSubmissionsForReviewUseCase(final SubmissionRepository submissionRepo,
                                           final ParticipantRepository participantRepo) {
        this.submissionRepo = submissionRepo;
        this.participantRepo = participantRepo;
    }

    @Transactional(readOnly = true)
    public ActionResult<Page<GetSubmissionResponse>> execute(final Long contestId,
                                                             final UUID reviewerId,
                                                             final SubmissionStatus status,
                                                             final Pageable pageable) {
        try {

            final var reviewerOpt = participantRepo.findByContestIdAndUserId(contestId, reviewerId.toString());

            boolean isAllowed = reviewerOpt.isPresent() && (
                    reviewerOpt.get().getRoles().contains(ContestRole.MODERATOR) ||
                            reviewerOpt.get().getRoles().contains(ContestRole.ORGANIZER)
            );

            if (!isAllowed) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Access denied. Moderator role required."));
            }

            final var pageResult = (status != null)
                    ? submissionRepo.findByContest_IdAndStatus(contestId, status, pageable)
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