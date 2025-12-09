package com.cmze.internal.service.invitation.strategy.impl;

import com.cmze.entity.Stage;
import com.cmze.entity.stagesettings.QuizStage;
import com.cmze.enums.StageType;
import com.cmze.internal.service.invitation.strategy.InvitationStrategy;
import com.cmze.spi.quiz.QuizServiceClient;
import com.cmze.spi.quiz.dto.GenerateQuizTokenRequest;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class QuizInvitationStrategy implements InvitationStrategy {

    private final QuizServiceClient quizServiceClient;

    public QuizInvitationStrategy(final QuizServiceClient quizServiceClient) {
        this.quizServiceClient = quizServiceClient;
    }

    @Override
    public StageType getStageType() {
        return StageType.QUIZ;
    }

    @Override
    public String getAccessToken(Stage stage, UUID userId) {
        if (!(stage instanceof QuizStage quizStage)) throw new IllegalStateException("Wrong type");

        final String roomId = quizStage.getActiveRoomId();
        if (roomId == null) {
            throw new IllegalStateException("Quiz stage has not started yet (no Active Room ID).");
        }

        try {
            final var tokenResponse = quizServiceClient.generateToken(
                    roomId,
                    new GenerateQuizTokenRequest(userId)
            );

            return tokenResponse.getToken();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate access token for Quiz", e);
        }
    }
}
