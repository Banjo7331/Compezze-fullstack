package com.cmze.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VoteRequest {
    @NotNull(message = "Stage ID is required")
    private Long stageId;

    @NotNull(message = "Submission ID is required")
    private String submissionId;

    @Min(value = 1, message = "Score must be at least 1")
    @Max(value = 10, message = "Score must not exceed limit")
    private Integer score;
}
