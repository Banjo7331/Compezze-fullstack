package com.cmze.internal.ws.messages;

import lombok.Data;

@Data
public class QuizRoomClosedSocketMessage {
    private final String event = "ROOM_CLOSED";

    private LeaderboardSocketMessage finalLeaderboard;

    public QuizRoomClosedSocketMessage(LeaderboardSocketMessage finalLeaderboard) {
        this.finalLeaderboard = finalLeaderboard;
    }
}
