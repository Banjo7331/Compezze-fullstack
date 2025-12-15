package com.cmze.response;

import com.cmze.enums.ContestStatus;
import com.cmze.enums.StageType;
import com.cmze.spi.leadboard.ContestLeaderboardEntryDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetMyContestResponse {

    private Long id;
    private String name;
    private LocalDateTime startDate;
    private ContestStatus status;

    private List<SimpleStageDto> stages;

    private List<ContestLeaderboardEntryDto> leaderboard;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SimpleStageDto {
        private Long id;
        private StageType type;
        private int position;
    }
}
