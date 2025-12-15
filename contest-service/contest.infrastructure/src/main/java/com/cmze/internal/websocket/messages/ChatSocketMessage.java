package com.cmze.internal.websocket.messages;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ChatSocketMessage extends ContestSocketMessage {

    private String userId;
    private String userDisplayName;
    private String content;
    private Instant timestamp;

    public ChatSocketMessage(String userId, String userDisplayName, String content, Instant timestamp) {
        super("CHAT_MESSAGE");
        this.userId = userId;
        this.userDisplayName = userDisplayName;
        this.content = content;
        this.timestamp = timestamp;
    }
}
