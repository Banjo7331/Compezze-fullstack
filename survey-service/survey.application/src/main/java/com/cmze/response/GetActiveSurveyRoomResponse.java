package com.cmze.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GetActiveSurveyRoomResponse {
    private UUID roomId;
    private String surveyTitle;
    private UUID hostId;
    private long currentParticipants;
    private Integer maxParticipants;
}
