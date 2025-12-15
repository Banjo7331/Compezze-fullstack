package com.cmze.ws.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@Getter
@AllArgsConstructor
public class InvitationsGeneratedEvent {
    private final String contestId;
    private final String contestTitle;
    private final String inviterName;
    private final Map<String, String> invitations;
}
