package com.cmze.response.stagesettings;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.EXTERNAL_PROPERTY,
        property = "type",
        visible = true,
        defaultImpl = EmptySettingsResponse.class
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = PublicVotingSettingsResponse.class, name = "PUBLIC_VOTE"),
        @JsonSubTypes.Type(value = JuryVotingSettingsResponse.class,   name = "JURY_VOTE"),
        @JsonSubTypes.Type(value = QuizSettingsResponse.class, name = "QUIZ"),
        @JsonSubTypes.Type(value = SurveySettingsResponse.class,   name = "SURVEY"),
        @JsonSubTypes.Type(value = EmptySettingsResponse.class,   name = "GENERIC"  )
})
public interface StageSettingsResponse { }
