package com.cmze.ws.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class ContestInvitationsGeneratedEvent {
    private final Object source;
    private final String contestId;
    private final String contestName;
    private final Map<UUID, String> invitations;
}