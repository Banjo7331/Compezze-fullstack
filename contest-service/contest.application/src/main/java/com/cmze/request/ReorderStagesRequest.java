package com.cmze.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReorderStagesRequest {

    @NotEmpty(message = "Stage IDs list cannot be empty")
    @NotNull
    private List<Long> stageIds;
}
