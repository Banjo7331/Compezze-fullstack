package com.cmze.response;

import com.cmze.enums.QuizRoomStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetMyQuizRoomResultResponse {
    private UUID roomId;
    private String quizTitle;
    private QuizRoomStatus status;
    private boolean isPrivate;
    private LocalDateTime createdAt;
    private LocalDateTime validUntil;
    private long totalParticipants;
    private long totalSubmissions;
}
