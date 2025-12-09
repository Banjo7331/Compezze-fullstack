package com.cmze.usecase.submission;

import com.cmze.enums.ContestRole;
import com.cmze.repository.ParticipantRepository;
import com.cmze.repository.SubmissionRepository;
import com.cmze.response.GetSubmissionMediaUrlResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.minio.MinioService;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.UUID;

@UseCase
public class GetSubmissionMediaUrlUseCase {

    private static final Logger logger = LoggerFactory.getLogger(GetSubmissionMediaUrlUseCase.class);

    private final SubmissionRepository submissionRepo;
    private final ParticipantRepository participantRepo;
    private final MinioService minio;

    @Value("${app.media.private.bucket:contest-media}")
    private String privateBucket;

    @Value("${app.media.presigned-get-ttl:10m}")
    private Duration presignedGetTtl;

    public GetSubmissionMediaUrlUseCase(final SubmissionRepository submissionRepo,
                                        final ParticipantRepository participantRepo,
                                        final MinioService minio) {
        this.submissionRepo = submissionRepo;
        this.participantRepo = participantRepo;
        this.minio = minio;
    }

    @Transactional(readOnly = true)
    public ActionResult<GetSubmissionMediaUrlResponse> execute(final Long contestId,
                                                               final String submissionId,
                                                               final UUID requesterId) {
        try {
            final var submissionOpt = submissionRepo.findByIdAndContest_Id(submissionId, contestId);
            if (submissionOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Submission not found"));
            }
            final var submission = submissionOpt.get();

            boolean isAuthor = submission.getParticipant().getUserId().equals(requesterId.toString());
            boolean isStaff = false;

            if (!isAuthor) {
                final var requesterOpt = participantRepo.findByContestIdAndUserId(contestId, requesterId.toString());
                if (requesterOpt.isPresent()) {
                    final var roles = requesterOpt.get().getRoles();
                    isStaff = roles.contains(ContestRole.MODERATOR) ||
                            roles.contains(ContestRole.ORGANIZER) ||
                            roles.contains(ContestRole.JURY);
                }
            }

            if (!isAuthor && !isStaff) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Access denied to this file"));
            }

            final var fileRef = submission.getFile();
            if (fileRef == null || fileRef.getObjectKey() == null) {
                logger.warn("Submission {} has no file reference", submissionId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "No file attached"));
            }

            String presignedUrl = minio.getPresignedUrlForDisplay(
                    fileRef.getBucket(),
                    fileRef.getObjectKey(),
                    presignedGetTtl
            ).toString();

            return ActionResult.success(new GetSubmissionMediaUrlResponse(
                    presignedUrl,
                    (int) presignedGetTtl.toSeconds(),
                    fileRef.getContentType(),
                    fileRef.getSize(),
                    submission.getOriginalFilename()
            ));

        } catch (Exception e) {
            logger.error("Failed to generate media URL", e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Error"));
        }
    }
}
