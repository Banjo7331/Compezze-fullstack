package com.cmze.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenerateContestInvitesRequest {

    @NotEmpty(message = "List of user IDs cannot be empty")
    private List<UUID> userIds;
}
