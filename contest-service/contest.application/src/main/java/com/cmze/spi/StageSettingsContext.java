package com.cmze.spi;

import com.cmze.entity.Stage;
import com.cmze.enums.StageType;
import com.cmze.request.StageRequest;
import com.cmze.request.UpdateStageRequest;
import com.cmze.response.stagesettings.StageSettingsResponse;
import org.springframework.http.ProblemDetail;

import java.util.Map;
import java.util.UUID;

public interface StageSettingsContext {
    ProblemDetail validate(StageRequest dto);
    Stage createStage(StageRequest dto);
    void updateStage(UpdateStageRequest dto, Stage stage);
    StageSettingsResponse runStage(long stageId, StageType type);
    StageSettingsResponse getSettings(Stage stage);
    Map<UUID, Double> finishStage(Stage stage);
}
