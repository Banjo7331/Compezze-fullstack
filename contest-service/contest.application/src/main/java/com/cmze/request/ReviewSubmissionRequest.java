package com.cmze.request;

import com.cmze.enums.SubmissionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSubmissionRequest {

    @NotNull
    private SubmissionStatus status;

    private String comment;
}
