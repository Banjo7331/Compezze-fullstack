package com.cmze.response;

import com.cmze.enums.ContestRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetContestParticipantResponse {
    private Long id;
    private String userId;
    private String displayName;
    private Set<ContestRole> roles;

    private String submissionId;
    private String submissionStatus;
}
