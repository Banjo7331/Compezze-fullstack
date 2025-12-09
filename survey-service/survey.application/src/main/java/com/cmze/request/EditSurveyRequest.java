package com.cmze.request;

import jakarta.validation.constraints.NotBlank;
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
public class EditSurveyRequest {
    @NotNull(message = "Id cannot be null")
    private Long id;

    @NotBlank(message = "Title cannot be empty.")
    @Size(min = 8, max = 20, message = "Survey title must be between {min} and {max} characters.")
    private String title;

    @Size(min = 1, message = "There must be at least one question in the survey.")
    @Size(max = 20, message = "There can not be more than 20 questions in the survey.")
    @NotNull
    private List<EditQuestionRequest> editQuestionRequests;
}
