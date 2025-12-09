package com.cmze.usecase.room;

import com.cmze.entity.SurveyForm;
import com.cmze.entity.SurveyRoom;
import com.cmze.repository.SurveyFormRepository;
import com.cmze.repository.SurveyRoomRepository;
import com.cmze.request.CreateSurveyRoomRequest;
import com.cmze.request.JoinSurveyRoomRequest;
import com.cmze.response.CreateSurveyRoomResponse;
import com.cmze.response.JoinSurveyRoomResponse;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.time.LocalDateTime;
import java.util.UUID;

@UseCase
public class CreateSurveyRoomUseCase {

    private static final Logger logger = LoggerFactory.getLogger(CreateSurveyRoomUseCase.class);
    private static final int DEFAULT_DURATION_MINUTES = 15;
    private static final int MAX_DURATION_MINUTES = 90;

    private final SurveyFormRepository surveyFormRepository;
    private final SurveyRoomRepository surveyRoomRepository;
    private final JoinSurveyRoomUseCase joinSurveyRoomUseCase;

    public CreateSurveyRoomUseCase(final SurveyRoomRepository surveyRoomRepository,
                                   final SurveyFormRepository surveyFormRepository,
                                   final JoinSurveyRoomUseCase joinSurveyRoomUseCase) {
        this.surveyRoomRepository = surveyRoomRepository;
        this.surveyFormRepository = surveyFormRepository;
        this.joinSurveyRoomUseCase = joinSurveyRoomUseCase;
    }

    @Transactional
    public ActionResult<CreateSurveyRoomResponse> execute(final CreateSurveyRoomRequest request, final UUID creatorUserId) {
        try {
            logger.info("Attempting to create room for survey {} by user {}", request.getSurveyFormId(), creatorUserId);

            final var surveyFormOpt = surveyFormRepository.findById(request.getSurveyFormId());

            if (surveyFormOpt.isEmpty()) {
                logger.warn("SurveyForm not found with id: {}", request.getSurveyFormId());
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.NOT_FOUND,
                        "SurveyForm not found"
                ));
            }

            final SurveyForm surveyForm = surveyFormOpt.get();

            if (surveyForm.isPrivate() && !surveyForm.getCreatorId().equals(creatorUserId)) {
                logger.warn("User {} forbidden to create room for private survey {}", creatorUserId, surveyForm.getId());
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.FORBIDDEN,
                        "Access denied to private survey template"
                ));
            }

            final var room = new SurveyRoom();
            room.setSurvey(surveyForm);
            room.setUserId(creatorUserId);
            room.setMaxParticipants(request.getMaxParticipants());
            room.setPrivate(request.isPrivate());

            final int requestedDuration = (request.getDurationMinutes() != null && request.getDurationMinutes() > 0)
                    ? request.getDurationMinutes() : DEFAULT_DURATION_MINUTES;

            room.setValidUntil(LocalDateTime.now().plusMinutes(Math.min(requestedDuration, MAX_DURATION_MINUTES)));

            final var savedRoom = surveyRoomRepository.save(room);

            final ActionResult<JoinSurveyRoomResponse> joinResult = joinSurveyRoomUseCase.execute(
                    savedRoom.getId(),
                    creatorUserId,
                    new JoinSurveyRoomRequest(null)
            );

            if (joinResult.isFailure()) {
                logger.error("FATAL: Failed to join host to room {}. Rolling back creation.", savedRoom.getId());

                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Failed to initialize room session"
                ));
            }

            logger.info("Room {} created successfully.", savedRoom.getId());

            return ActionResult.success(new CreateSurveyRoomResponse(
                    savedRoom.getId(),
                    savedRoom.getUserId(),
                    savedRoom.getSurvey().getId(),
                    savedRoom.getMaxParticipants()
            ));

        } catch (Exception e) {
            logger.error("Unexpected error creating room", e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred"
            ));
        }
    }
}
