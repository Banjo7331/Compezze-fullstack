package com.cmze.external.survey;

import com.cmze.external.quiz.QuizServiceClientImpl;
import com.cmze.spi.quiz.dto.CreateQuizRoomRequest;
import com.cmze.spi.quiz.dto.GenerateQuizTokenRequest;
import com.cmze.spi.survey.SurveyRoomDto;
import com.cmze.spi.survey.SurveyServiceClient;
import com.cmze.spi.survey.dto.*;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;


@Component
public class SurveyServiceClientImpl implements SurveyServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(QuizServiceClientImpl.class);
    private final InternalSurveyApi internalApi;

    public SurveyServiceClientImpl(InternalSurveyApi internalApi) {
        this.internalApi = internalApi;
    }

    @Override
    public CreateSurveyRoomResponse createRoom(CreateSurveyRoomRequest request) {
        try {
            logger.info("Calling SurveyService to create room for form: {}", request.getSurveyFormId());
            return internalApi.createRoom(request);

        } catch (FeignException.BadRequest | FeignException.NotFound ex) {
            logger.error("Client error creating survey room: {}", ex.getMessage());
            throw new RuntimeException("Invalid request to Survey Service: " + ex.getMessage(), ex);
        } catch (Exception e) {
            logger.error("Survey service unavailable or failed: {}", e.getMessage());
            throw new RuntimeException("Survey service is unavailable", e);
        }
    }

    @Override
    public GenerateSurveyTokenResponse generateToken(String roomId, GenerateSurveyTokenRequest request) {
        try {
            return internalApi.generateToken(roomId, request);
        } catch (Exception e) {
            logger.error("Failed to generate token via Survey Service for room {}", roomId, e);
            throw new RuntimeException("Failed to generate access token", e);
        }
    }

    @Override
    public GetSurveyRoomDetailsResponse getRoomDetails(String roomId) {
        try {
            return internalApi.getRoomDetails(roomId);
        } catch (Exception e) {
            logger.error("Failed to get room details for {}", roomId, e);
            throw new RuntimeException("Failed to fetch survey results", e);
        }
    }

    @Override
    public void closeRoom(String roomId) {
        try {
            internalApi.closeRoom(roomId);
            logger.info("Closed remote survey room: {}", roomId);
        } catch (Exception e) {
            logger.error("Failed to close remote survey room {}", roomId, e);
        }
    }
}
