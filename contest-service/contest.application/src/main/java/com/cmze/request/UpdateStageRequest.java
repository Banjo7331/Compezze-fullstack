package com.cmze.request;

import com.cmze.enums.JuryRevealMode;
import com.cmze.enums.StageType;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        property = "type",
        visible = true
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = UpdateStageRequest.UpdateQuizStageRequest.class, name = "QUIZ"),
        @JsonSubTypes.Type(value = UpdateStageRequest.UpdateSurveyStageRequest.class, name = "SURVEY"),
        @JsonSubTypes.Type(value = UpdateStageRequest.UpdateJuryStageRequest.class, name = "JURY_VOTE"),
        @JsonSubTypes.Type(value = UpdateStageRequest.UpdatePublicStageRequest.class, name = "PUBLIC_VOTE"),
        @JsonSubTypes.Type(value = UpdateStageRequest.UpdateGenericStageRequest.class, name = "GENERIC")
})
public abstract class UpdateStageRequest {

    @Size(max = 100)
    private String name;

    @Min(1)
    private Integer durationMinutes;

    private StageType type;


    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class UpdateQuizStageRequest extends UpdateStageRequest {
        private Long quizFormId;
        private Double weight;

        @Min(1) @Max(1000)
        private Integer maxParticipants;

        @Min(5) @Max(300)
        private Integer timePerQuestion;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class UpdateSurveyStageRequest extends UpdateStageRequest {
        private Long surveyFormId;
        private Integer maxParticipants;
        private Integer durationMinutes;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class UpdateJuryStageRequest extends UpdateStageRequest {
        private Double weight;

        @Min(1)
        private Integer maxScore;

        private JuryRevealMode juryRevealMode;
        private Boolean showJudgeNames;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class UpdatePublicStageRequest extends UpdateStageRequest {
        private Double weight;

        @Min(1)
        private Integer maxScore;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class UpdateGenericStageRequest extends UpdateStageRequest {
    }
}
