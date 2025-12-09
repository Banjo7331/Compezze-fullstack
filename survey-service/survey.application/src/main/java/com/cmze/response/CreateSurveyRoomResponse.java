package com.cmze.response;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateSurveyRoomResponse {
    private UUID roomId;
    private UUID hostId;
    private Long surveyFormId;

    @Size(min = 1, max = 1000)
    private Integer maxParticipants;
}
