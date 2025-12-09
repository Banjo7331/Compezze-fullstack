package com.cmze.internal.websocket.messages;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ParticipantJoinedSocketMessage extends ContestSocketMessage {

    private String userId;
    private String displayName;

    public ParticipantJoinedSocketMessage(String userId, String displayName) {
        super("PARTICIPANT_JOINED");
        this.userId = userId;
        this.displayName = displayName;
    }
}
