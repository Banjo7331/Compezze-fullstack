package com.cmze.spi.leadboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContestLeaderboardEntryDto {
    private String userId;
    private String displayName;
    private Long totalScore;
    private int rank;
}
