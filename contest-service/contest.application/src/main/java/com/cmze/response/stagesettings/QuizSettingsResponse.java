package com.cmze.response.stagesettings;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSettingsResponse implements StageSettingsResponse {

    private Long stageId;
    private String type;
    private Long quizFormId;
    private Double weight;
    private Integer maxParticipants;
    private Integer timePerQuestion;

    private String activeRoomId;
}
