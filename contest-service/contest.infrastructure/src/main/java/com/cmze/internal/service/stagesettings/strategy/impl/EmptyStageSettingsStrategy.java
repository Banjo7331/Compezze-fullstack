package com.cmze.internal.service.stagesettings.strategy.impl;

import com.cmze.entity.Stage;
import com.cmze.entity.stagesettings.GenericStage;
import com.cmze.entity.stagesettings.JuryVoteStage;
import com.cmze.enums.StageType;
import com.cmze.internal.service.stagesettings.strategy.StageSettingsStrategy;
import com.cmze.repository.StageRepository;
import com.cmze.request.StageRequest;
import com.cmze.request.UpdateStageRequest;
import com.cmze.response.stagesettings.EmptySettingsResponse;
import com.cmze.response.stagesettings.StageSettingsResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@Component
public class EmptyStageSettingsStrategy implements StageSettingsStrategy {


    private final StageRepository stageRepository;

    public EmptyStageSettingsStrategy(StageRepository stageRepository) {
        this.stageRepository = stageRepository;
    }

    @Override
    public StageType type() { return StageType.GENERIC; }

    @Override
    public ProblemDetail validate(final StageRequest dto) {
        if (!(dto instanceof StageRequest.GenericStageRequest)) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid DTO type for Generic strategy");
        }
        return null;
    }

    @Override
    public Stage createStage(final StageRequest dto) {
        if (dto instanceof StageRequest.GenericStageRequest req) {
            return new GenericStage();
        }
        throw new IllegalArgumentException("Invalid DTO for JURY strategy");
    }

    @Override
    public void updateStage(UpdateStageRequest dto, Stage stage) {

    }
    @Override
    public StageSettingsResponse runStage(final long stageId) {
        return new EmptySettingsResponse(stageId, "GENERIC");
    }

    @Override
    public StageSettingsResponse getSettings(final Stage stage) {
        Long id = (stage != null) ? stage.getId() : 0L;
        return new EmptySettingsResponse(id, "GENERIC");
    }

    @Override
    public Map<UUID, Double> finishStage(final Stage stage) {
        return Collections.emptyMap();
    }

}
