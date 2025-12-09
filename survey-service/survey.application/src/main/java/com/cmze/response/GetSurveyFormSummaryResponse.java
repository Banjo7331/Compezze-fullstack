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
public class GetSurveyFormSummaryResponse {
    private Long surveyFormId;
    private String title;
    private boolean isPrivate;
    private UUID ownerUserId;
}
