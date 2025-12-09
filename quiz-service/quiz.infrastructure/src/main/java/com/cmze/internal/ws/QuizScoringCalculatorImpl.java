package com.cmze.internal.ws;

import com.cmze.spi.helpers.room.QuizScoringCalculator;
import org.springframework.stereotype.Component;

@Component
public class QuizScoringCalculatorImpl implements QuizScoringCalculator {

    @Override
    public int calculateScore(final int maxPoints, final int timeLimitSeconds, final long timeTakenMs) {
        final long limitMs = timeLimitSeconds * 1000L;

        if (timeTakenMs <= 0) return maxPoints;

        double timeRatio = (double) timeTakenMs / limitMs;

        if (timeRatio > 1.0) timeRatio = 1.0;

        double scoreFactor = 1.0 - (timeRatio / 2.0);

        return (int) Math.max(0, maxPoints * scoreFactor);
    }
}
