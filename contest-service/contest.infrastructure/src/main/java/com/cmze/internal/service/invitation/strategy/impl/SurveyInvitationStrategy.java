package com.cmze.internal.service.invitation.strategy.impl;

import com.cmze.entity.Stage;
import com.cmze.entity.stagesettings.QuizStage;
import com.cmze.entity.stagesettings.SurveyStage;
import com.cmze.enums.StageType;
import com.cmze.exception.ExternalStageFinishedException;
import com.cmze.exception.ExternalStageNotFoundException;
import com.cmze.internal.service.invitation.strategy.InvitationStrategy;
import com.cmze.spi.quiz.dto.GenerateQuizTokenRequest;
import com.cmze.spi.survey.SurveyServiceClient;
import com.cmze.spi.survey.dto.GenerateSurveyTokenRequest;
import feign.FeignException;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class SurveyInvitationStrategy implements InvitationStrategy {

    private final SurveyServiceClient surveyServiceClient;

    public SurveyInvitationStrategy(final SurveyServiceClient surveyServiceClient) {
        this.surveyServiceClient = surveyServiceClient;
    }

    @Override
    public StageType getStageType() {
        return StageType.SURVEY;
    }

    @Override
    public String getAccessToken(Stage stage, UUID userId) {
        if (!(stage instanceof SurveyStage surveyStage)) throw new IllegalStateException("Wrong type");

        final String roomId = surveyStage.getActiveRoomId();

        try {
            final var tokenResponse = surveyServiceClient.generateToken(
                    roomId,
                    new GenerateSurveyTokenRequest(userId)
            );
            return tokenResponse.getToken();

        } catch (FeignException.Conflict e) {
            throw new ExternalStageFinishedException("Survey session is already finished.");

        } catch (FeignException.NotFound e) {
            throw new ExternalStageNotFoundException("Survey room not found.");

        } catch (Exception e) {
            throw new RuntimeException("Unexpected error during token generation", e);
        }
    }
}
