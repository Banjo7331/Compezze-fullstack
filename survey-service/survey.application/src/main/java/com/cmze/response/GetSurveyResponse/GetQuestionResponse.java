package com.cmze.response.GetSurveyResponse;

import com.cmze.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GetQuestionResponse {
    private Long id;
    private String title;
    private QuestionType type;
    private Set<String> possibleChoices;
}
