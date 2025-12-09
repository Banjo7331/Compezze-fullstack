package com.cmze.ws.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class QuizStartedEvent {
    private final UUID roomId;
}
