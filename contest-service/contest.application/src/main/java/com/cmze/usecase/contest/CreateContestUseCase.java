package com.cmze.usecase.contest;

import com.cmze.entity.Contest;
import com.cmze.entity.Participant;
import com.cmze.entity.Stage;

import com.cmze.enums.ContestRole;
import com.cmze.enums.ContestStatus;
import com.cmze.repository.ParticipantRepository;
import com.cmze.request.CreateContestRequest;

import com.cmze.repository.ContestRepository;
import com.cmze.spi.StageSettingsContext;

import com.cmze.response.CreateContestResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.identity.IdentityServiceClient;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.UUID;

@UseCase
public class CreateContestUseCase {

    private static final Logger logger = LoggerFactory.getLogger(CreateContestUseCase.class);

    private final ContestRepository contestRepository;
    private final ParticipantRepository participantRepository;
    private final StageSettingsContext stageContext;
    private final IdentityServiceClient identityClient;

    // private final MinioService minioService;
    // private final ObjectKeyFactory objectKeyFactory;

    @Value("${app.media.publicBaseUrl:}")
    private String publicBaseUrl;

    public CreateContestUseCase(final ContestRepository contestRepository,
                                final ParticipantRepository participantRepository,
                                final StageSettingsContext stageContext,
                                final IdentityServiceClient identityClient
                                // , final MinioService minioService,
                                // final ObjectKeyFactory objectKeyFactory
    ) {
        this.contestRepository = contestRepository;
        this.participantRepository = participantRepository;
        this.stageContext = stageContext;
        this.identityClient = identityClient;
        // this.minioService = minioService;
        // this.objectKeyFactory = objectKeyFactory;
    }

    @Transactional
    public ActionResult<CreateContestResponse> execute(final CreateContestRequest request, final String organizerId) {

        if (request.getStartDate().isAfter(request.getEndDate())) {
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.UNPROCESSABLE_ENTITY, "End date must be after start date."
            ));
        }

        // MediaLocation location = null;

        try {
            // --- LOGIKA MINIO (ZAKOMENTOWANA) ---
            /*
            String templateKey = request.getTemplateId();
            if (templateKey != null && !templateKey.isBlank()) {
                String templateBucket = objectKeyFactory.getPublicBucket();
                location = objectKeyFactory.generateForContestCover(organizerId, templateKey);

                ObjectMetadata templateMetadata = minioService.copyAndGetMetadata(
                        templateBucket, templateKey,
                        location.getBucket(), location.getObjectKey()
                );

                String publicUrl = buildPublicUrl(publicBaseUrl, location.getObjectKey());

                // Ustawimy w encji poniżej:
                // contest.setCoverImage(new Contest.CoverImageRef(...));
            }
            */
            // ------------------------------------

            final var contest = new Contest();
            contest.setName(request.getName());
            contest.setDescription(request.getDescription());
            contest.setLocation(request.getLocation());
            contest.setContestCategory(request.getContestCategory());
            contest.setStartDate(request.getStartDate());
            contest.setEndDate(request.getEndDate());
            contest.setParticipantLimit(request.getParticipantLimit());
            contest.setPrivate(request.isPrivate());
            contest.setHasPreliminaryStage(request.isHasPreliminaryStage());
            contest.setSubmissionMediaPolicy(request.getSubmissionMediaPolicy());

            contest.setOrganizerId(organizerId);
            contest.setOpen(true);
            contest.setStatus(ContestStatus.CREATED);
            contest.setContentVerified(false);
            contest.setCoverImage(null);

            // 2. Tworzenie i Sortowanie Etapów
            final var stages = new ArrayList<Stage>();

            if (request.getStages() != null) {
                // A. SORTOWANIE: Ufamy 'position' z DTO, żeby ustalić kolejność
                // Jeśli frontend wysłał [5, 1], to sortujemy na [1, 5]
                // null-safe: jeśli position brak, traktujemy jako 0
                request.getStages().sort(Comparator.comparingInt(s ->
                        s.getOrder() != null ? s.getOrder() : 0
                ));

                int positionCounter = 1;

                for (final var stageDto : request.getStages()) {

                    final var validationError = stageContext.validate(stageDto);
                    if (validationError != null) {
                        return ActionResult.failure(validationError);
                    }

                    final var stageEntity = stageContext.createStage(stageDto);

                    if (stageEntity != null) {
                        stageEntity.setName(stageDto.getName());
                        stageEntity.setDurationMinutes(stageDto.getDurationMinutes());

                        stageEntity.setPosition(positionCounter++);

                        stageEntity.setContest(contest);
                        stages.add(stageEntity);
                    }
                }
            }
            contest.setStages(stages);

            final var savedContest = contestRepository.save(contest);

            String hostDisplayName = "Organizer";
            try {
                final var userDto = identityClient.getUserById(UUID.fromString(organizerId));
                if (userDto != null) hostDisplayName = userDto.getUsername();
            } catch (Exception e) {
                logger.warn("Could not fetch organizer name, using default.");
            }

            final var organizerParticipant = new Participant();
            organizerParticipant.setContest(savedContest);
            organizerParticipant.setUserId(organizerId);
            organizerParticipant.setDisplayName(hostDisplayName);
            organizerParticipant.setCreatedAt(LocalDateTime.now());

            organizerParticipant.getRoles().add(ContestRole.ORGANIZER);

            participantRepository.save(organizerParticipant);

            logger.info("Contest created with id {} by organizer {}", savedContest.getId(), organizerId);

            return ActionResult.success(new CreateContestResponse(savedContest.getId()));

        } catch (Exception ex) {
            logger.error("Failed to create contest for organizer {}: {}", organizerId, ex.getMessage(), ex);

            // --- KOMPENSACJA MINIO (ZAKOMENTOWANA) ---
            /*
            if (location != null) {
                try {
                    minioService.delete(location.getBucket(), location.getObjectKey());
                } catch (Exception e) {
                    logger.error("COMPENSATION FAILED: Could not delete MinIO object {}", location.getObjectKey(), e);
                }
            }
            */

            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create contest."));
        }
    }

    /*
    private static String buildPublicUrl(String baseUrl, String key) {
        if (baseUrl == null || baseUrl.isBlank()) return null;
        String cleanKey = key.startsWith("/") ? key.substring(1) : key;
        String cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        return cleanBaseUrl + "/" + cleanKey;
    }
    */
}