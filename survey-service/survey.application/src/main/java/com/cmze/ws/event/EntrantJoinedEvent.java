package com.cmze.ws.event;

import com.cmze.entity.SurveyEntrant;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class EntrantJoinedEvent extends ApplicationEvent {

    private final SurveyEntrant participant;
    private final long newParticipantCount;

    public EntrantJoinedEvent(Object source, SurveyEntrant participant, long newParticipantCount) {
        super(source);
        this.participant = participant;
        this.newParticipantCount = newParticipantCount;
    }
}
