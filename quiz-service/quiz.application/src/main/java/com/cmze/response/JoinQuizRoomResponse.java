package com.cmze.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JoinQuizRoomResponse {
    private Long participantId;
    private QuizInfoResponse quizInfo;
    private boolean host;
    private String status;

}
