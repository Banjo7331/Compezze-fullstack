package com.cmze.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetQuizFormSummaryResponse {
    private Long id;
    private String title;
    private boolean isPrivate;
    private UUID creatorId;
}
