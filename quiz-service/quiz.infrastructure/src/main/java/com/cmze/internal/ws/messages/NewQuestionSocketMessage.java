package com.cmze.internal.ws.messages;

import com.cmze.spi.helpers.room.QuestionOptionDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewQuestionSocketMessage {
    private final String event = "NEW_QUESTION";
    private Long questionId;
    private int questionIndex;
    private String title;
    private List<QuestionOptionDto> options;
    private int timeLimitSeconds;
    private LocalDateTime startTime;

}
