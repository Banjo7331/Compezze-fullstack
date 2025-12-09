package com.cmze.internal.service.invitation.strategy.impl;

import com.cmze.entity.Stage;
import com.cmze.entity.stagesettings.SurveyStage;
import com.cmze.enums.StageType;
import com.cmze.internal.service.invitation.strategy.InvitationStrategy;
import com.cmze.spi.survey.SurveyServiceClient;
import com.cmze.spi.survey.dto.GenerateSurveyTokenRequest;
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
        if (roomId == null) {
            throw new IllegalStateException("Survey stage has not started yet.");
        }

        try {
            final var tokenResponse = surveyServiceClient.generateToken(
                    roomId,
                    new GenerateSurveyTokenRequest(userId)
            );

            return tokenResponse.getToken();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate access token for Survey", e);
        }
    }
}
