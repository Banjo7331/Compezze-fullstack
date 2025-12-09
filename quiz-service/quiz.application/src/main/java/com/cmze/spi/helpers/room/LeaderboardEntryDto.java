package com.cmze.spi.helpers.room;

import lombok.Data;

import java.util.UUID;

@Data
public class LeaderboardEntryDto {
        private UUID userId;
        private String username;
        private int score;
        private int rank;

    public LeaderboardEntryDto(UUID userId, String username, int score, int rank) {
        this.userId = userId;
        this.username = username;
        this.score = score;
        this.rank = rank;
    }
}
