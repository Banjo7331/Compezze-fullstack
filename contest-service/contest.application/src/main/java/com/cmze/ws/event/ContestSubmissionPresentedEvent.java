package com.cmze.ws.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ContestSubmissionPresentedEvent {
    private final String contestId;
    private final String submissionId;
    private final String participantName;
    private final String contentUrl;
    private final String contentType;
}
