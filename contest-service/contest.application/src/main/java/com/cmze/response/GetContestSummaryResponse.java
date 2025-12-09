package com.cmze.response;

import com.cmze.enums.ContestCategory;
import com.cmze.enums.ContestStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetContestSummaryResponse {
    private String id;
    private String name;
    private ContestCategory category;
    private LocalDateTime startDate;
    private ContestStatus status;
    private boolean isOrganizer;
}
