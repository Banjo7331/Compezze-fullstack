package com.cmze.internal.service.invitation.strategy.impl;

import com.cmze.entity.Stage;
import com.cmze.entity.stagesettings.QuizStage;
import com.cmze.enums.StageType;
import com.cmze.exception.ExternalStageFinishedException;
import com.cmze.exception.ExternalStageNotFoundException;
import com.cmze.internal.service.invitation.strategy.InvitationStrategy;
import com.cmze.spi.quiz.QuizServiceClient;
import com.cmze.spi.quiz.dto.GenerateQuizTokenRequest;
import feign.FeignException;
import org.springframework.http.HttpStatus;
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

        try {
            final var tokenResponse = quizServiceClient.generateToken(
                    roomId,
                    new GenerateQuizTokenRequest(userId)
            );
            return tokenResponse.getToken();

        } catch (FeignException.Conflict e) {
            throw new ExternalStageFinishedException("Quiz session is already finished.");

        } catch (FeignException.NotFound e) {
            throw new ExternalStageNotFoundException("Quiz room not found.");

        } catch (Exception e) {
            throw new RuntimeException("Unexpected error during token generation", e);
        }
    }
}
