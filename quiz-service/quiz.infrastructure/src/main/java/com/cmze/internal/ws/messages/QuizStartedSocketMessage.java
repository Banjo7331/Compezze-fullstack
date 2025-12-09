package com.cmze.internal.ws.messages;

import lombok.Data;

@Data
public class QuizStartedSocketMessage {
    private final String event = "QUIZ_STARTED";
}
