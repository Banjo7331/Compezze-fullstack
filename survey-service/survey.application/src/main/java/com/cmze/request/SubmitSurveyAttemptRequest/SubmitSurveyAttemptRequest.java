package com.cmze.request.SubmitSurveyAttemptRequest;

import jakarta.validation.Valid;
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
public class SubmitSurveyAttemptRequest {

    @NotNull(message = "User choices must not be null.")
    @Size(min = 1, max = 20, message = "There must be between 1 and 20 answers for the survey.")
    @Valid
    private List<SubmitParticipantAnswerRequest> participantAnswers;

    @NotNull
    private Long surveyId;
}