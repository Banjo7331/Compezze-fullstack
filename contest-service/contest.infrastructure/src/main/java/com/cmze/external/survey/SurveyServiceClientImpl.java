package com.cmze.external.survey;

import com.cmze.external.quiz.QuizServiceClientImpl;
import com.cmze.spi.quiz.dto.CreateQuizRoomRequest;
import com.cmze.spi.quiz.dto.CreateQuizRoomResponse;
import com.cmze.spi.survey.SurveyServiceClient;
import com.cmze.spi.survey.dto.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;


@Component
public class SurveyServiceClientImpl implements SurveyServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(QuizServiceClientImpl.class);

    private final ObjectMapper objectMapper;
    private final InternalSurveyApi internalApi;

    public SurveyServiceClientImpl(ObjectMapper objectMapper,
                                   InternalSurveyApi internalApi) {
        this.objectMapper = objectMapper;
        this.internalApi = internalApi;
    }

    @Override
    public CreateSurveyRoomResponse createRoom(CreateSurveyRoomRequest request) {
        try {
            logger.info("Calling SurveyService to create room for form: {}", request.getSurveyFormId());
            return internalApi.createRoom(request);

        } catch (FeignException ex) {
            String errorDetail = extractErrorDetail(ex);

            logger.error("Error from Survey Service: {}", errorDetail);

            if (ex.status() == 422 || ex.status() == 400) {
                throw new ResponseStatusException(HttpStatus.valueOf(ex.status()), errorDetail);
            }

            throw new RuntimeException("Survey service error: " + errorDetail, ex);
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

    private String extractErrorDetail(FeignException ex) {
        try {
            String body = ex.contentUTF8();
            if (body != null && !body.isEmpty()) {
                JsonNode node = objectMapper.readTree(body);
                if (node.has("detail")) {
                    return node.get("detail").asText();
                }
                if (node.has("message")) {
                    return node.get("message").asText();
                }
            }
        } catch (Exception e) {
            logger.warn("Could not parse error body from SurveyService", e);
        }
        return ex.getMessage();
    }
}
