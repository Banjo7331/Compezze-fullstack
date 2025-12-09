package com.cmze.spi.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSurveyRoomRequest {
    private Long surveyFormId;
    private Integer maxParticipants;
    private boolean isPrivate;
    private Integer durationMinutes;
}
