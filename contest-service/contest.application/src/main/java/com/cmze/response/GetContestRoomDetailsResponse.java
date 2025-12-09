package com.cmze.response;

import com.cmze.response.stagesettings.StageSettingsResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetContestRoomDetailsResponse {

    private String roomId;
    private boolean active;

    private Integer currentStagePosition;
    private Long currentStageId;

    private StageSettingsResponse currentStageSettings;
}
