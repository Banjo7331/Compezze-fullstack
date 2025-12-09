package com.cmze.request.CreateQuizFormRequest;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuizFormRequest {

    @NotBlank(message = "Quiz title is required")
    private String title;

    @JsonProperty("isPrivate")
    private boolean isPrivate;

    @NotEmpty(message = "Quiz must have at least one question")
    @Valid
    private List<CreateQuestionRequest> questions;
}
