package com.cmze.response.stagesettings;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveySettingsResponse implements StageSettingsResponse {

    private Long stageId;
    private String type;
    private Long surveyFormId;
    private Integer maxParticipants;
    private Integer durationMinutes;

    private String activeRoomId;

}
