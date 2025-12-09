package com.cmze.internal.service.stagesettings;

import com.cmze.entity.Stage;
import com.cmze.enums.StageType;
import com.cmze.internal.service.stagesettings.strategy.StageSettingsStrategy;
import com.cmze.request.StageRequest;
import com.cmze.request.UpdateStageRequest;
import com.cmze.response.stagesettings.EmptySettingsResponse;
import com.cmze.response.stagesettings.StageSettingsResponse;
import com.cmze.spi.StageSettingsContext;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class StageSettingsContextImpl implements StageSettingsContext {

    private final Map<StageType, StageSettingsStrategy> byType;

    public StageSettingsContextImpl(List<StageSettingsStrategy> strategies) {
        this.byType = strategies.stream()
                .collect(Collectors.toMap(StageSettingsStrategy::type, Function.identity(),
                        (a,b)->a, () -> new EnumMap<>(StageType.class)));
    }
    @Override
    public ProblemDetail validate(final StageRequest dto) {
        final var strategy = byType.get(dto.getType());
        return (strategy == null) ? null : strategy.validate(dto);
    }

    @Override
    public Stage createStage(final StageRequest dto) {
        final var strategy = byType.get(dto.getType());

        if (strategy == null) {
            throw new IllegalStateException("No strategy found for stage type: " + dto.getType());
        }

        return strategy.createStage(dto);
    }

    @Override
    public void updateStage(final UpdateStageRequest dto, final Stage stage) {
        final var strategy = byType.get(stage.getType());

        if (strategy == null) {
            throw new IllegalStateException("No strategy found for stage type: " + stage.getType());
        }

        strategy.updateStage(dto, stage);
    }

    @Override
    public StageSettingsResponse runStage(final long stageId, final StageType type) {
        final var strategy = byType.get(type);
        if (strategy == null) {
            throw new IllegalStateException("No strategy for type: " + type);
        }
        return strategy.runStage(stageId);
    }

    @Override
    public StageSettingsResponse getSettings(final Stage stage) {
        final var strategy = byType.get(stage.getType());
        if (strategy == null) {
            return new EmptySettingsResponse(stage.getId(), "GENERIC");
        }
        return strategy.getSettings(stage);
    }

    @Override
    public Map<UUID, Double> finishStage(final Stage stage) {
        final var strategy = byType.get(stage.getType());
        if (strategy == null) {
            return java.util.Collections.emptyMap();
        }
        return strategy.finishStage(stage);
    }
}
