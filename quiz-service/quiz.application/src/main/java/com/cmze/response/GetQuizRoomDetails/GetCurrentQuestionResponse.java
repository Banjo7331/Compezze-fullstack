package com.cmze.response.GetQuizRoomDetails;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetCurrentQuestionResponse {
    private Long questionId;
    private int questionIndex;
    private String title;
    private LocalDateTime startTime;
    private int timeLimit;
    private List<GetQuestionOptionResponse> options;
}
