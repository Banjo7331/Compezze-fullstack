package com.cmze.internal.ws.messages;

import lombok.Data;

import java.util.Map;

@Data
public class QuestionFinishedSocketMessage {
    private final String event = "QUESTION_FINISHED";

    private Long correctOptionId;
    private Map<Long, Long> answerStats;

    public QuestionFinishedSocketMessage(Long correctOptionId, Map<Long, Long> answerStats) {
        this.correctOptionId = correctOptionId;
        this.answerStats = answerStats;
    }
}
