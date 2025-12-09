package com.cmze.request;

import com.cmze.enums.JuryRevealMode;
import com.cmze.enums.StageType;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        property = "type",
        visible = true
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = StageRequest.JuryStageRequest.class, name = "JURY_VOTE"),
        @JsonSubTypes.Type(value = StageRequest.QuizStageRequest.class, name = "QUIZ"),
        @JsonSubTypes.Type(value = StageRequest.SurveyStageRequest.class, name = "SURVEY"),
        @JsonSubTypes.Type(value = StageRequest.PublicStageRequest.class, name = "PUBLIC_VOTE"),
        @JsonSubTypes.Type(value = StageRequest.GenericStageRequest.class, name = "GENERIC")
})
public abstract class StageRequest {

    @NotBlank(message = "Stage name is required")
    @Size(max = 100)
    private String name;

    @Min(1)
    private Integer order;

    @Min(1)
    private Integer durationMinutes;

    @NotNull(message = "Stage type is required")
    private StageType type;

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class QuizStageRequest extends StageRequest {

        @NotNull
        private Long quizFormId;
        @NotNull
        private Double weight = 1.0;
        @Min(1) @Max(1000)
        private Integer maxParticipants = 100;
        @Min(5) @Max(300)
        private Integer timePerQuestion = 30;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class SurveyStageRequest extends StageRequest {

        @NotNull
        private Long surveyFormId;
        @Min(1) @Max(1000)
        private Integer maxParticipants = 100;
        @Min(15)
        private Integer durationMinutes = 20;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class JuryStageRequest extends StageRequest {

        @NotNull
        private Double weight = 1.0;
        @NotNull @Min(1)
        private Integer maxScore = 10;
        @NotNull
        private JuryRevealMode juryRevealMode = JuryRevealMode.IMMEDIATE;
        @NotNull
        private Boolean showJudgeNames = true;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class PublicStageRequest extends StageRequest {
        @NotNull
        private Double weight = 1.0;
        @NotNull @Min(1)
        private Integer maxScore = 1;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class GenericStageRequest extends StageRequest {
    }
}