package com.cmze.response;


import com.cmze.response.GetSurveyResponse.GetSurveyFormResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JoinSurveyRoomResponse {
    private Long participantId;
    private GetSurveyFormResponse survey;
    private boolean hasSubmitted;
    private boolean isHost;
}