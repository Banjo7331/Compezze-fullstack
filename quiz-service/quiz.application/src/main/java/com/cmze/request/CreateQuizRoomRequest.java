package com.cmze.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuizRoomRequest {

    @NotNull(message = "Quiz Form ID is required")
    private Long quizFormId;

    @Min(value = 1, message = "Minimum 1 participant")
    @Max(value = 1000, message = "Maximum 1000 participants")
    private Integer maxParticipants = 50;

    @Min(value = 5, message = "Minimum 5 seconds per question")
    @Max(value = 270, message = "Maximum 270 seconds per question")
    private Integer timePerQuestion = 15;

    private boolean isPrivate;

    private List<UUID> allowedUserIds;
}

