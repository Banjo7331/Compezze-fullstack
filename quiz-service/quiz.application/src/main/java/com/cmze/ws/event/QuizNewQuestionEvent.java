package com.cmze.ws.event;

import com.cmze.entity.Question;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class QuizNewQuestionEvent {
    private final UUID roomId;
    private final Question question;
    private final int questionIndex;
    private final LocalDateTime startTime;
    private final int timeLimitSeconds;
}
