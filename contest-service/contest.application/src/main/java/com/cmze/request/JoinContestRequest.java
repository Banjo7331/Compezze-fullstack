package com.cmze.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JoinContestRequest {
    @NotEmpty
    private String userId;

    @NotEmpty
    private String contestId;
}
