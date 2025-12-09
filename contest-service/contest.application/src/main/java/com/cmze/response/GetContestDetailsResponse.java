package com.cmze.response;

import com.cmze.enums.ContestCategory;
import com.cmze.enums.ContestRole;
import com.cmze.enums.ContestStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetContestDetailsResponse {

    private String id;
    private String name;
    private String description;
    private String location;
    private ContestCategory category;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private ContestStatus status;
    private int participantLimit;
    private boolean isPrivate;

    private long currentParticipantsCount;

    private boolean isOrganizer;
    private boolean isParticipant;
    private Set<ContestRole> myRoles;

    private List<GetStageDetailsResponse> stages;
}
