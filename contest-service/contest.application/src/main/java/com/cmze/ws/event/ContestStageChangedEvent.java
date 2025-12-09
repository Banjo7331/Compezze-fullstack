package com.cmze.ws.event;

import com.cmze.enums.StageType;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ContestStageChangedEvent {
    private final Long contestId;
    private final Long stageId;
    private final String stageName;
    private final StageType stageType;
}
