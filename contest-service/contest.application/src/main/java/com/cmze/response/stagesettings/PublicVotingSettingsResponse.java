package com.cmze.response.stagesettings;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PublicVotingSettingsResponse implements StageSettingsResponse {

    private Long stageId;
    private String type;
    @DecimalMin(value = "0.0", inclusive = false)
    private Double weight; // null ⇒ 1.0

    @Min(1)
    private Integer maxScore; // null ⇒ 10
}
