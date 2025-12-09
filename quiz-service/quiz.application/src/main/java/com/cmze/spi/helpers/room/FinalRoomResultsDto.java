package com.cmze.spi.helpers.room;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinalRoomResultsDto {
    private long totalParticipants;

    private List<LeaderboardEntryDto> leaderboard;
}
