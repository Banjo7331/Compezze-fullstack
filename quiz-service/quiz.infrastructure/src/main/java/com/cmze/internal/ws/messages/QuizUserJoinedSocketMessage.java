package com.cmze.internal.ws.messages;

import lombok.Data;

import java.util.UUID;

@Data
public class QuizUserJoinedSocketMessage {
    private final String event = "USER_JOINED";

    private Long participantId;
    private UUID userId;
    private String username;
    private long newParticipantCount;

    public QuizUserJoinedSocketMessage(Long participantId, UUID userId, String username, long newParticipantCount) {
        this.participantId = participantId;
        this.userId = userId;
        this.username = username;
        this.newParticipantCount = newParticipantCount;
    }
}
