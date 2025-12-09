package com.cmze.response;

import com.cmze.enums.StageType;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GetStageDetailsResponse{
    private Long id;
    private String name;
    private StageType type;
    private int durationMinutes;
    private int position;
}
