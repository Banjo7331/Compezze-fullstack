package com.cmze.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuizRoomResponse {
    private UUID roomId;
    private Long quizFormId;
    private String quizTitle;
    private String joinCode;
}
