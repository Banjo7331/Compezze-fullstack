package com.cmze.spi.quiz.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GetQuizRoomDetailsResponse {

    private String status;
    private QuizResultsDto currentResults;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizResultsDto {
        private List<QuizLeaderboardEntry> leaderboard;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizLeaderboardEntry {
        private UUID userId;
        private int score;
        private int rank;
    }
}
