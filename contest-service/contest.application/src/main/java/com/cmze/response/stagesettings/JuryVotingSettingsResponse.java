package com.cmze.response.stagesettings;

import com.cmze.enums.JuryRevealMode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JuryVotingSettingsResponse implements StageSettingsResponse {

    private Long stageId;
    private String type;
    private Double weight;
    private Integer maxScore;
    private JuryRevealMode juryRevealMode;
    private Boolean showJudgeNames;

}
