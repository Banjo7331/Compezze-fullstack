package com.cmze.spi.survey;

import com.cmze.spi.survey.dto.*;

public interface SurveyServiceClient {
    CreateSurveyRoomResponse createRoom(CreateSurveyRoomRequest request);
    GenerateSurveyTokenResponse generateToken(String roomId, GenerateSurveyTokenRequest request);
    GetSurveyRoomDetailsResponse getRoomDetails(String roomId);
    void closeRoom(String roomId);
}
