package com.cmze.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MySurveyRoomResultsResponse {
    private UUID roomId;
    private String surveyTitle;
    private boolean isOpen;
    private boolean isPrivate;
    private LocalDateTime createdAt;
    private LocalDateTime validUntil;

    private long totalParticipants;
    private long totalSubmissions;
}
