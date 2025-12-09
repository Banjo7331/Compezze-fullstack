package com.cmze.spi.quiz;

import com.cmze.spi.quiz.dto.*;

public interface QuizServiceClient {
    CreateQuizRoomResponse createRoom(CreateQuizRoomRequest request);
    GenerateQuizTokenResponse generateToken(String roomId, GenerateQuizTokenRequest request);
    GetQuizRoomDetailsResponse getRoomDetails(String roomId);
    void closeRoom(String roomId);
}
