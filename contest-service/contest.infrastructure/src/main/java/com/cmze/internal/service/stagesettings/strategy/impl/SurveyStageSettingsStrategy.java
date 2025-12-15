package com.cmze.internal.service.stagesettings.strategy.impl;

import com.cmze.entity.Stage;
import com.cmze.entity.stagesettings.SurveyStage;
import com.cmze.enums.StageType;
import com.cmze.internal.service.stagesettings.strategy.StageSettingsStrategy;
import com.cmze.repository.StageRepository;
import com.cmze.request.StageRequest;
import com.cmze.request.UpdateStageRequest;
import com.cmze.response.stagesettings.StageSettingsResponse;
import com.cmze.response.stagesettings.SurveySettingsResponse;
import com.cmze.spi.survey.SurveyServiceClient;
import com.cmze.spi.survey.dto.CreateSurveyRoomRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class SurveyStageSettingsStrategy implements StageSettingsStrategy {
    private final SurveyServiceClient surveyClient;
    private final StageRepository stageRepository;

    public SurveyStageSettingsStrategy(final SurveyServiceClient surveyClient,
                                       final StageRepository stageRepository) {
        this.surveyClient = surveyClient;
        this.stageRepository = stageRepository;
    }

    @Override
    public StageType type() {
        return StageType.SURVEY;
    }

    @Override
    public ProblemDetail validate(final StageRequest dto) {
        if (!(dto instanceof StageRequest.SurveyStageRequest surveyDto)) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid DTO type for SURVEY");
        }
        if (surveyDto.getSurveyFormId() == null) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Survey Form ID is required");
        }
        return null;
    }

    @Override
    public Stage createStage(final StageRequest dto) {
        if (dto instanceof StageRequest.SurveyStageRequest req) {
            return SurveyStage.builder()
                    .surveyFormId(req.getSurveyFormId())
                    .maxParticipants(req.getMaxParticipants())
                    .durationMinutes(req.getDurationMinutes())
                    .build();
        }
        throw new IllegalArgumentException("Invalid DTO type for SURVEY strategy");
    }

    @Override
    public void updateStage(UpdateStageRequest dto, Stage stage) {

    }

    @Override
    public StageSettingsResponse runStage(final long stageId) {
        final var stageOpt = stageRepository.findById(stageId);
        if (stageOpt.isEmpty() || !(stageOpt.get() instanceof SurveyStage)) {
            throw new IllegalStateException("Invalid stage for SURVEY strategy");
        }
        final var stage = (SurveyStage) stageOpt.get();

        if (stage.getActiveRoomId() != null) {
            return new SurveySettingsResponse(
                    stage.getId(),
                    "SURVEY",
                    stage.getSurveyFormId(),
                    stage.getMaxParticipants(),
                    stage.getDurationMinutes(),
                    stage.getActiveRoomId()
            );
        }

        final var request = CreateSurveyRoomRequest.builder()
                .surveyFormId(stage.getSurveyFormId())
                .maxParticipants(stage.getMaxParticipants())
                .durationMinutes(stage.getDurationMinutes())
                .isPrivate(true)
                .build();

        try {
            final var response = surveyClient.createRoom(request);

            stage.setActiveRoomId(response.getRoomId().toString());
            stageRepository.save(stage);

            return new SurveySettingsResponse(
                    stage.getId(),
                    "SURVEY",
                    stage.getSurveyFormId(),
                    stage.getMaxParticipants(),
                    stage.getDurationMinutes(),
                    response.getRoomId().toString()
            );
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to start remote Survey room", e);
        }
    }

    @Override
    public StageSettingsResponse getSettings(final Stage stage) {
        if (!(stage instanceof SurveyStage surveyStage)) throw new IllegalStateException("Wrong type");

        return new SurveySettingsResponse(
                surveyStage.getId(),
                "SURVEY",
                surveyStage.getSurveyFormId(),
                surveyStage.getMaxParticipants(),
                surveyStage.getDurationMinutes(),
                surveyStage.getActiveRoomId()
        );
    }

    @Override
    public Map<UUID, Double> finishStage(final Stage stage) {
        if (!(stage instanceof SurveyStage surveyStage)) throw new IllegalStateException("Wrong type");

        final String roomId = surveyStage.getActiveRoomId();
        if (roomId == null) {
            return Collections.emptyMap();
        }

        try {
            surveyClient.closeRoom(roomId);

            return Collections.emptyMap();

        } catch (Exception e) {
            throw new RuntimeException("Failed to finish remote survey room", e);
        }
    }

}
