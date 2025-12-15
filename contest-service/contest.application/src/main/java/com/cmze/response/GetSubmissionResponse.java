package com.cmze.response;

import com.cmze.enums.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GetSubmissionResponse {
    private String id;
    private String participantName;
    private String userId;
    private SubmissionStatus status;
    private String originalFilename;
    private String comment;
    private LocalDateTime createdAt;
}
