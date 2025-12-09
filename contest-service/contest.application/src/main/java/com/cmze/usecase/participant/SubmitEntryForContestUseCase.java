package com.cmze.usecase.participant;

import com.cmze.entity.Submission;
import com.cmze.enums.ContestRole;
import com.cmze.enums.ContestStatus;
import com.cmze.enums.SubmissionStatus;
import com.cmze.repository.ContestRepository;
import com.cmze.repository.ParticipantRepository;
import com.cmze.repository.SubmissionRepository;
import com.cmze.response.SubmitEntryResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.helpers.MediaValidationService;
import com.cmze.spi.minio.MediaLocation;
import com.cmze.spi.minio.MinioService;
import com.cmze.spi.minio.ObjectKeyFactory;
import com.cmze.usecase.UseCase;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.UUID;

@UseCase
public class SubmitEntryForContestUseCase {

    private static final Logger logger = LoggerFactory.getLogger(SubmitEntryForContestUseCase.class);

    private final ContestRepository contestRepository;
    private final ParticipantRepository participantRepository;
    private final SubmissionRepository submissionRepository;
    private final MinioService minioService;
    private final ObjectKeyFactory objectKeyFactory;
    private final MediaValidationService mediaValidationService;

    @Value("${app.media.private.bucket:contest-media-private}")
    private String bucketName;

    public SubmitEntryForContestUseCase(final ContestRepository contestRepository,
                                        final ParticipantRepository participantRepository,
                                        final SubmissionRepository submissionRepository,
                                        final MinioService minioService,
                                        final ObjectKeyFactory objectKeyFactory,
                                        final MediaValidationService mediaValidationService) {
        this.contestRepository = contestRepository;
        this.participantRepository = participantRepository;
        this.submissionRepository = submissionRepository;
        this.minioService = minioService;
        this.objectKeyFactory = objectKeyFactory;
        this.mediaValidationService = mediaValidationService;
    }

    @Transactional
    public ActionResult<SubmitEntryResponse> execute(final Long contestId,
                                                     final UUID userId,
                                                     final MultipartFile file) {

        MediaLocation location = null;

        try {
            final var contestOpt = contestRepository.findById(contestId);
            if (contestOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Contest not found"));
            }
            final var contest = contestOpt.get();

            if (contest.getStatus() != ContestStatus.CREATED) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Contest is not open for Submissions."));
            }

            final var validationError = mediaValidationService.validateFileAgainstPolicy(
                    contest.getSubmissionMediaPolicy(),
                    file
            );
            if (validationError != null) {
                return ActionResult.failure(validationError);
            }

            final var participantOpt = participantRepository.findByContestIdAndUserId(contestId, userId.toString());
            if (participantOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "You must join the contest first."));
            }
            final var participant = participantOpt.get();

            if (submissionRepository.findByContest_IdAndParticipantId(contestId, participant.getId()).isPresent()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "You have already submitted an entry."));
            }

            location = objectKeyFactory.generateForSubmission(contestId, userId.toString(), file.getOriginalFilename());

            final var media = minioService.upload(
                    bucketName,
                    location.getObjectKey(),
                    file.getInputStream(),
                    file.getSize(),
                    file.getContentType()
            );

            final var submission = new Submission();
            submission.setContest(contest);
            submission.setParticipant(participant);
            submission.setStatus(SubmissionStatus.PENDING);
            submission.setOriginalFilename(file.getOriginalFilename());
            submission.setCreatedAt(LocalDateTime.now());

            submission.setFile(new Submission.FileRef(
                    location.getObjectKey(),
                    bucketName,
                    file.getContentType(),
                    file.getSize()
            ));

            final var savedSubmission = submissionRepository.save(submission);

            if (!participant.getRoles().contains(ContestRole.COMPETITOR)) {
                participant.getRoles().add(ContestRole.COMPETITOR);
                participantRepository.save(participant);
                logger.info("User {} promoted to COMPETITOR", userId);
            }

            return ActionResult.success(new SubmitEntryResponse(
                    savedSubmission.getId(),
                    savedSubmission.getFile().getObjectKey(),
                    null
            ));

        } catch (Exception e) {
            logger.error("Failed to submit entry", e);

            if (location != null) {
                try {
                    minioService.delete(bucketName, location.getObjectKey());
                } catch (Exception deleteEx) {
                    logger.warn("Failed to rollback MinIO upload", deleteEx);
                }
            }

            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Submission failed"));
        }
    }
}
