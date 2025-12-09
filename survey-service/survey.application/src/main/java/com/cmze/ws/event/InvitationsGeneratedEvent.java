package com.cmze.ws.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.Map;
import java.util.UUID;

@Getter
public class InvitationsGeneratedEvent extends ApplicationEvent {

    private final String roomId;
    private final String surveyTitle;
    private final Map<UUID, String> invitations;

    public InvitationsGeneratedEvent(Object source, String roomId, String surveyTitle, Map<UUID, String> invitations) {
        super(source);
        this.roomId = roomId;
        this.surveyTitle = surveyTitle;
        this.invitations = invitations;
    }
}