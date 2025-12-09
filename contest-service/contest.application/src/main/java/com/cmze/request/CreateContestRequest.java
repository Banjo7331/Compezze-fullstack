package com.cmze.request;

import com.cmze.enums.ContestCategory;
import com.cmze.enums.SubmissionMediaPolicy;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateContestRequest {
    @NotBlank @Size(min = 3, max = 100)
    private String name;

    @NotBlank @Size(max = 1000)
    private String description;

    @Size(max = 255)
    private String location;

    @NotNull
    private ContestCategory contestCategory;

    @Min(1)
    private Integer participantLimit;

    @NotNull @FutureOrPresent
    private LocalDateTime startDate;

    @NotNull @Future
    private LocalDateTime endDate;

    private boolean isPrivate = false;

    private boolean hasPreliminaryStage = false;

    @NotBlank(message = "A templateId must be selected.")
    private String templateId;

    private SubmissionMediaPolicy submissionMediaPolicy;

    @Size(min = 1, max = 10)
    @Valid
    private List<StageRequest> stages;
}
