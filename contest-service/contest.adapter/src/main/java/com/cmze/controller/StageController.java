package com.cmze.controller;

import com.cmze.request.ReorderStagesRequest;
import com.cmze.request.UpdateStageRequest;
import com.cmze.usecase.contest.ReorderContestStagesUseCase;
import com.cmze.usecase.contest.UpdateStageUseCase;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("contest/{contestId}")
public class StageController {

    private final UpdateStageUseCase updateStageUseCase;
    private final ReorderContestStagesUseCase reorderContestStagesUseCase;

    public StageController(ReorderContestStagesUseCase reorderContestStagesUseCase,
                           UpdateStageUseCase updateStageUseCase
    ) {
        this.reorderContestStagesUseCase = reorderContestStagesUseCase;
        this.updateStageUseCase = updateStageUseCase;
    }

    @PutMapping("/stage/{stageId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateStage(
            @PathVariable final Long contestId,
            @PathVariable final Long stageId,
            @RequestBody @Valid final UpdateStageRequest request,
            final Authentication authentication
    ) {
        final var organizerId = (UUID) authentication.getPrincipal();

        final var result = updateStageUseCase.execute(contestId, stageId, organizerId, request);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @PatchMapping("/stage/reorder")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> reorderStages(
            @PathVariable final Long contestId,
            @RequestBody @Valid final ReorderStagesRequest request,
            final Authentication authentication
    ) {
        final var organizerId = (UUID) authentication.getPrincipal();

        final var result = reorderContestStagesUseCase.execute(contestId, request, organizerId);

        return result.toResponseEntity(HttpStatus.NO_CONTENT);
    }
}
