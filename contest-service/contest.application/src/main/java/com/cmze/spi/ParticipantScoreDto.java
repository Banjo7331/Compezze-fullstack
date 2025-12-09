package com.cmze.spi;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantScoreDto {
    private String userId;
    private Long totalScore;
}
