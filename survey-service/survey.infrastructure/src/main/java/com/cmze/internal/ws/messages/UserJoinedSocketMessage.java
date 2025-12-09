package com.cmze.internal.ws.messages;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserJoinedSocketMessage {

    private String event = "USER_JOINED";
    private Long participantId;
    private UUID userId;
    private long newParticipantCount;

    public UserJoinedSocketMessage(Long participantId, UUID userId, long newParticipantCount) {
        this.participantId = participantId;
        this.userId = userId;
        this.newParticipantCount = newParticipantCount;
    }
}
