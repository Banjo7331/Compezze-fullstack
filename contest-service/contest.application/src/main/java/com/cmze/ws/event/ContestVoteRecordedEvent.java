package com.cmze.ws.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ContestVoteRecordedEvent {
    private final String contestId;
    private final String submissionId;

    private final Number newTotalScore;
}
