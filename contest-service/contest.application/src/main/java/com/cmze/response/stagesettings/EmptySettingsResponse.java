package com.cmze.response.stagesettings;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmptySettingsResponse implements StageSettingsResponse {
    private Long stageId;
    private String type;
}
