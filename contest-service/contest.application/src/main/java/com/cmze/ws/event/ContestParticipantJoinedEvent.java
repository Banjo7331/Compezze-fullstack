package com.cmze.ws.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ContestParticipantJoinedEvent {
    private final String contestId;
    private final String userId;
    private final String displayName;
}
