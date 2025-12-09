package com.cmze.external.quiz;

import com.cmze.spi.quiz.QuizServiceClient;
import com.cmze.spi.quiz.dto.*;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class QuizServiceClientImpl implements QuizServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(QuizServiceClientImpl.class);
    private final InternalQuizApi internalApi;

    public QuizServiceClientImpl(InternalQuizApi internalApi) {
        this.internalApi = internalApi;
    }

    @Override
    public CreateQuizRoomResponse createRoom(CreateQuizRoomRequest request) {
        try {
            logger.info("Calling QuizService to create room for form: {}", request.getQuizFormId());
            return internalApi.createRoom(request);

        } catch (FeignException.BadRequest | FeignException.NotFound ex) {
            logger.error("Client error creating quiz room: {}", ex.getMessage());
            throw new RuntimeException("Invalid request to Quiz Service: " + ex.getMessage(), ex);
        } catch (Exception e) {
            logger.error("Quiz service unavailable or failed: {}", e.getMessage());
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
}
