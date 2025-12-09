package com.cmze.request;


import com.cmze.enums.QuestionType;
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
public class CreateQuestionRequest {

    @NotBlank(message = "Title cannot be empty.")
    private String title;

    @NotNull(message = "Question type is required.")
    private QuestionType type;

    @Size(max = 8, message = "There can not be more than 8 possible choices.")
    private List<@NotBlank String> possibleChoices;

}
