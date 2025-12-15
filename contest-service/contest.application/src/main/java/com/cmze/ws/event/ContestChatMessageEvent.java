package com.cmze.ws.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class ContestChatMessageEvent {
    private final String contestId;
    private final String userId;
    private final String userDisplayName;
    private final String content;
    private final Instant timestamp;
}
