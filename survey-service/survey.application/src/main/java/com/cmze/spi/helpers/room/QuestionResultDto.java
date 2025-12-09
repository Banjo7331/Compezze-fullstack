package com.cmze.spi.helpers.room;

import com.cmze.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResultDto {
    private Long questionId;
    private String title;
    private QuestionType type;
    private Map<String, Long> answerCounts;

    private List<String> openAnswers;
}
