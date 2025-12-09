package com.cmze.spi.survey;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyRoomDto {
    private String roomId;
    private Long userId;
}
