package com.cmze.request.CreateQuizFormRequest;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuestionOptionRequest {

    @NotBlank(message = "Option text cannot be empty")
    private String text;

    @JsonProperty("isCorrect")
    private boolean isCorrect;
}
