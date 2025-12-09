package com.cmze.ws.event;

import com.cmze.entity.SurveyRoom;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class RoomClosedEvent extends ApplicationEvent {

    private final SurveyRoom room;

    public RoomClosedEvent(Object source, SurveyRoom room) {
        super(source);
        this.room = room;
    }
}
