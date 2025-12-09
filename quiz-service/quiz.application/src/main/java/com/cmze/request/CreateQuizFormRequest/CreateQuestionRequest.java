package com.cmze.request.CreateQuizFormRequest;

import com.cmze.enums.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuestionRequest {

    @NotBlank(message = "Question title is required")
    private String title;

    @NotNull(message = "Question type is required")
    private QuestionType type;

    @Min(value = 1, message = "Points must be positive")
    private Integer points = 1000;

    @NotEmpty(message = "Question must have options")
    @Valid
    private List<CreateQuestionOptionRequest> options;
}
