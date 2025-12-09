package com.cmze.spi.helpers.room;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinalRoomResultDto {
    private long totalParticipants;
    private long totalSubmissions;
    private List<QuestionResultDto> results;
}
