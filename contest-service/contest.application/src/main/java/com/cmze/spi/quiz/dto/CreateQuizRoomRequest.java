package com.cmze.spi.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuizRoomRequest {
    private Long quizFormId;
    private Integer maxParticipants;
    private boolean isPrivate;
    private Integer timePerQuestion;
}
