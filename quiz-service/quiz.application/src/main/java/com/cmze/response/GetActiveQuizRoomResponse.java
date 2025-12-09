package com.cmze.response;

import com.cmze.enums.QuizRoomStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetActiveQuizRoomResponse {
    private UUID roomId;
    private String quizTitle;
    private UUID hostId;
    private long participantsCount;
    private Integer maxParticipants;
    private QuizRoomStatus status;
}
