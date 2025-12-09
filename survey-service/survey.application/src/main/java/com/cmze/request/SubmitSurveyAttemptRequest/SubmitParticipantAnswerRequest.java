package com.cmze.request.SubmitSurveyAttemptRequest;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubmitParticipantAnswerRequest {

    @NotNull(message = "Answer list cannot be null.")
    @Size(max = 8, message = "There can not be more than 8 possible choices.")
    private List<String> answers;

    @NotNull(message = "Question must be provided.")
    private Long questionId;
}
