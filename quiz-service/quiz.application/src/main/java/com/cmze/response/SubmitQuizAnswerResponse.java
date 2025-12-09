package com.cmze.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitQuizAnswerResponse {
    private boolean correct;
    private int pointsAwarded;
    private int currentTotalScore;
    private int comboStreak;
}
