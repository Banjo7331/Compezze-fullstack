package com.cmze.ws.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ContestFinishedEvent {
    private final Long contestId;
}
