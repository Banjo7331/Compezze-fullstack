package com.cmze.ws.event;

import com.cmze.entity.SurveyAttempt;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;


@Getter
public class SurveyAttemptSubmittedEvent extends ApplicationEvent {

    private final SurveyAttempt surveyAttempt;

    public SurveyAttemptSubmittedEvent(Object source, SurveyAttempt surveyAttempt) {
        super(source);
        this.surveyAttempt = surveyAttempt;
    }
}
