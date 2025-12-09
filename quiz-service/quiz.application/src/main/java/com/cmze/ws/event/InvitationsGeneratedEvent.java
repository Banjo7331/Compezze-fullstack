package com.cmze.ws.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class InvitationsGeneratedEvent {
    private final Object source;
    private final String roomId;
    private final String quizTitle;
    private final Map<UUID, String> invitations;
}
