package com.cmze.ws.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class QuizQuestionFinishedEvent {
    private final UUID roomId;
    private final Long questionId;
    private final Long correctOptionId;
}
