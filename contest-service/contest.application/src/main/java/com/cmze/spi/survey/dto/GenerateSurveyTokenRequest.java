package com.cmze.spi.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenerateSurveyTokenRequest {
    private UUID userId;
}
