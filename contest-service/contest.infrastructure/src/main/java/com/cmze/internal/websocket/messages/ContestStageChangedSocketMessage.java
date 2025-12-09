package com.cmze.internal.websocket.messages;

import com.cmze.enums.StageType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ContestStageChangedSocketMessage extends ContestSocketMessage {

    private Long stageId;
    private String stageName;
    private StageType stageType;

    public ContestStageChangedSocketMessage(Long stageId, String stageName, StageType stageType) {
        super("STAGE_CHANGED");
        this.stageId = stageId;
        this.stageName = stageName;
        this.stageType = stageType;
    }
}
