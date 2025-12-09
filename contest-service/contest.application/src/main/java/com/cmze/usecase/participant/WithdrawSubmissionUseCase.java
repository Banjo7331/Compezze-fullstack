package com.cmze.usecase.participant;

import com.cmze.enums.ContestRole;
import com.cmze.enums.ContestStatus;
import com.cmze.repository.ParticipantRepository;
import com.cmze.repository.SubmissionRepository;
import com.cmze.shared.ActionResult;
import com.cmze.spi.minio.MinioService;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.UUID;

@UseCase
public class WithdrawSubmissionUseCase {

    private static final Logger logger = LoggerFactory.getLogger(WithdrawSubmissionUseCase.class);

    private final SubmissionRepository submissionRepo;
    private final ParticipantRepository participantRepo;
    private final MinioService minioService;

    @Value("${app.media.private.bucket:contest-media-private}")
    private String bucketName;

    public WithdrawSubmissionUseCase(final SubmissionRepository submissionRepo,
                                     final ParticipantRepository participantRepo,
                                     final MinioService minioService) {
        this.submissionRepo = submissionRepo;
        this.participantRepo = participantRepo;
        this.minioService = minioService;
    }

    @Transactional
    public ActionResult<Void> execute(final Long contestId, final UUID userId) {
        try {
            final var participantOpt = participantRepo.findByContestIdAndUserId(contestId, userId.toString());
            if (participantOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "You are not a participant."));
            }
            final var participant = participantOpt.get();

            final var submissionOpt = submissionRepo.findByContest_IdAndParticipantId(contestId, participant.getId());
            if (submissionOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "No submission found to withdraw."));
            }
            final var submission = submissionOpt.get();

            if (submission.getContest().getStatus() != ContestStatus.CREATED) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.CONFLICT, "Cannot withdraw submission. Contest is already in progress or closed."
                ));
            }

            if (submission.getFile() != null && submission.getFile().getObjectKey() != null) {
                try {
                    minioService.delete(bucketName, submission.getFile().getObjectKey());
                } catch (Exception e) {
                    logger.warn("Failed to delete file from MinIO, but continuing with DB deletion", e);
                }
            }

            submissionRepo.delete(submission);

            if (participant.getRoles().contains(ContestRole.COMPETITOR)) {
                participant.getRoles().remove(ContestRole.COMPETITOR);
                participantRepo.save(participant);
                logger.info("Removed COMPETITOR role from user {} after withdrawal", userId);
            }

            logger.info("User {} withdrew submission {}", userId, submission.getId());
            return ActionResult.success(null);

        } catch (Exception e) {
            logger.error("Failed to withdraw submission", e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Error withdrawing submission"
            ));
        }
    }
}
