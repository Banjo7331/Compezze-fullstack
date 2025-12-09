package com.cmze.usecase.submission;

import com.cmze.entity.Submission;
import com.cmze.enums.ContestRole;
import com.cmze.enums.SubmissionStatus;
import com.cmze.repository.ContestRepository;
import com.cmze.repository.ParticipantRepository;
import com.cmze.repository.SubmissionRepository;
import com.cmze.request.ReviewSubmissionRequest;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.UUID;

@UseCase
public class ReviewSubmissionUseCase {

    private static final Logger logger = LoggerFactory.getLogger(ReviewSubmissionUseCase.class);

    private final ContestRepository contestRepository;
    private final SubmissionRepository submissionRepository;
    private final ParticipantRepository participantRepository;

    public ReviewSubmissionUseCase(final ContestRepository contestRepository,
                                   final SubmissionRepository submissionRepository,
                                   final ParticipantRepository participantRepository) {
        this.contestRepository = contestRepository;
        this.submissionRepository = submissionRepository;
        this.participantRepository = participantRepository;
    }

    @Transactional
    public ActionResult<Void> execute(final Long contestId,
                                      final UUID reviewerId,
                                      final String submissionId,
                                      final ReviewSubmissionRequest req) {
        try {
            boolean isAllowed = false;

            var contest = contestRepository.findById(contestId).orElseThrow();
            if (contest.getOrganizerId().equals(reviewerId.toString())) {
                isAllowed = true;
            }
            else {
                var participant = participantRepository.findByContestIdAndUserId(contestId, reviewerId.toString());
                if (participant.isPresent() && participant.get().getRoles().contains(ContestRole.MODERATOR)) {
                    isAllowed = true;
                }
            }

            if (!isAllowed) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Only Organizer or Moderator can review submissions."));
            }

            var submissionOpt = submissionRepository.findByIdAndContest_Id(submissionId, contestId);
            if (submissionOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Submission not found in this contest."));
            }
            Submission submission = submissionOpt.get();

            if (req.getStatus() == SubmissionStatus.PENDING) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Cannot revert to PENDING."));
            }

            String comment = (req.getComment() == null) ? null : req.getComment().trim();

            if (req.getStatus() == SubmissionStatus.REJECTED && (comment == null || comment.isEmpty())) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.UNPROCESSABLE_ENTITY, "Comment is required when rejecting."
                ));
            }

            submission.setStatus(req.getStatus());
            submission.setComment(req.getStatus() == SubmissionStatus.APPROVED ? null : comment);

            submissionRepository.save(submission);

            logger.info("Submission {} reviewed by {}: {}", submissionId, reviewerId, req.getStatus());

            return ActionResult.success(null);

        } catch (Exception e) {
            logger.error("Review failed", e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Error reviewing submission"));
        }
    }
}
