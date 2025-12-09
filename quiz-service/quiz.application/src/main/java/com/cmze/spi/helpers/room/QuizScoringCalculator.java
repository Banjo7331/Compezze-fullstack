package com.cmze.spi.helpers.room;

public interface QuizScoringCalculator {
    int calculateScore(int maxPoints, int timeLimitSeconds, long timeTakenMs);
}
