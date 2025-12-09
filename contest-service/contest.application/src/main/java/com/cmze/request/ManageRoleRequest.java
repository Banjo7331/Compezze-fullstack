package com.cmze.request;

import com.cmze.enums.ContestRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManageRoleRequest {

    @NotNull(message = "Target user ID is required")
    private UUID targetUserId;

    @NotNull(message = "Role is required")
    private ContestRole role;

    private boolean assign;
}
