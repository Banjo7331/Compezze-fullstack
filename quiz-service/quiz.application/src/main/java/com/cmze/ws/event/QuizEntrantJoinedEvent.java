package com.cmze.ws.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class QuizEntrantJoinedEvent {
    private final UUID roomId;
    private final Long participantId;
    private final UUID userId;
    private final String username;
    private final long totalParticipants;
}
