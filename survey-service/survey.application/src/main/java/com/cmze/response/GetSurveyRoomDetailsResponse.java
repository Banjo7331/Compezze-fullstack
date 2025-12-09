package com.cmze.response;

import com.cmze.spi.helpers.room.FinalRoomResultDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetSurveyRoomDetailsResponse {
    private UUID roomId;
    private String surveyTitle;
    private UUID hostId;
    private boolean isOpen;
    private boolean isPrivate;
    private long currentParticipants;
    private FinalRoomResultDto currentResults;
}
