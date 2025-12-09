package com.cmze.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateSurveyRoomRequest {

    @NotNull
    private Long surveyFormId;

    @Min(value = 1, message = "Max participants must be at least 1")
    @Max(value = 1000, message = "Maximum 1000 participants")
    private Integer maxParticipants;

    private boolean isPrivate;

    @Min(value = 15, message = "Survey session must take at least 15 minutes")
    private Integer durationMinutes;
}
