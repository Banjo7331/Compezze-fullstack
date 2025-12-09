package com.cmze.response;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@NotNull
public class UpdateStageResponse {
    private Long stageId;
}
