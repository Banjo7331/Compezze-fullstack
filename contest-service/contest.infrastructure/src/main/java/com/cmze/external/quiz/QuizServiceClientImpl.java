package com.cmze.external.quiz;

import com.cmze.spi.quiz.QuizServiceClient;
import com.cmze.spi.quiz.dto.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class QuizServiceClientImpl implements QuizServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(QuizServiceClientImpl.class);

    private final ObjectMapper objectMapper;
    private final InternalQuizApi internalApi;

    public QuizServiceClientImpl(ObjectMapper objectMapper,
                                 InternalQuizApi internalApi) {
        this.objectMapper = objectMapper;
        this.internalApi = internalApi;
    }

    @Override
    public CreateQuizRoomResponse createRoom(CreateQuizRoomRequest request) {
        try {
            logger.info("Calling QuizService to create room for form: {}", request.getQuizFormId());
            return internalApi.createRoom(request);

        } catch (FeignException ex) {
            String errorDetail = extractErrorDetail(ex);

            logger.error("Error from Quiz Service: {}", errorDetail);

            if (ex.status() == 422 || ex.status() == 400) {
                throw new ResponseStatusException(HttpStatus.valueOf(ex.status()), errorDetail);
            }

            throw new RuntimeException("Quiz service error: " + errorDetail, ex);
        } catch (Exception e) {
            logger.error("Quiz service unavailable or failed", e);
            throw new RuntimeException("Quiz service is unavailable", e);
        }
    }

    @Override
    public GenerateQuizTokenResponse generateToken(String roomId, GenerateQuizTokenRequest request) {
        try {
            return internalApi.generateToken(roomId, request);
        } catch (Exception e) {
            logger.error("Failed to generate token via Quiz Service for room {}", roomId, e);
            throw new RuntimeException("Failed to generate access token", e);
        }
    }

    @Override
    public GetQuizRoomDetailsResponse getRoomDetails(String roomId) {
        try {
            return internalApi.getRoomDetails(roomId);
        } catch (Exception e) {
            logger.error("Failed to get room details for {}", roomId, e);
            throw new RuntimeException("Failed to fetch quiz results", e);
        }
    }
    @Override
    public void closeRoom(String roomId) {
        try {
            internalApi.closeRoom(roomId);
            logger.info("Closed remote quiz room: {}", roomId);
        } catch (Exception e) {
            logger.error("Failed to close remote quiz room {}", roomId, e);
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
            logger.warn("Could not parse error body from QuizService", e);
        }
        return ex.getMessage();
    }
}
