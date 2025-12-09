package com.cmze.spi.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuizRoomResponse {
    private String roomId;
    private Long quizFormId;
    private String quizTitle;
}
