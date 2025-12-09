package com.cmze.internal.ws.messages;

import com.cmze.spi.helpers.room.LeaderboardEntryDto;
import lombok.Data;

import java.util.List;

@Data
public class LeaderboardSocketMessage {
    private final String event = "LEADERBOARD_UPDATE";

    private List<LeaderboardEntryDto> topPlayers;

    public LeaderboardSocketMessage(List<LeaderboardEntryDto> topPlayers) {
        this.topPlayers = topPlayers;
    }
}
