package com.cmze.response;

import com.cmze.response.stagesettings.StageSettingsResponse;
import com.cmze.spi.leadboard.ContestLeaderboardEntryDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetContestRoomDetailsResponse {

    private String roomId;
    private boolean active;

    private Integer currentStagePosition;
    private Long currentStageId;

    private List<ContestLeaderboardEntryDto> leaderboard;
    private StageSettingsResponse currentStageSettings;
}
