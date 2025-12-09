package com.cmze.controller;

import com.cmze.request.CreateContestRequest;
import com.cmze.request.ManageRoleRequest;
import com.cmze.usecase.contest.*;
import com.cmze.usecase.participant.ManageContestRolesUseCase;
import com.cmze.usecase.participant.SubmitEntryForContestUseCase;
import com.cmze.usecase.session.CloseContestUseCase;
import com.cmze.usecase.session.StartContestUseCase;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("contest")
public class ContestController {

    private final CreateContestUseCase createContestUseCase;
    private final GetUpcomingContestUseCase getUpcomingContestUseCase;
    private final GetMyEnteredContestsUseCase getMyEnteredContestsUseCase;
    private final ManageContestRolesUseCase manageContestRolesUseCase;
    private final GetContestDetailsUseCase getContestDetailsUseCase;
    private final JoinContestUseCase joinContestUseCase;
    private final CloseSubmissionsEnteringUseCase closeSubmissionsEnteringUseCase;

    public ContestController(CreateContestUseCase createContestUseCase,
                             GetUpcomingContestUseCase getUpcomingContestUseCase,
                             GetMyEnteredContestsUseCase getMyEnteredContestsUseCase,
                             ManageContestRolesUseCase manageContestRolesUseCase,
                             GetContestDetailsUseCase getContestDetailsUseCase,
                             JoinContestUseCase joinContestUseCase,
                             CloseSubmissionsEnteringUseCase closeSubmissionsEnteringUseCase
    ) {
        this.createContestUseCase = createContestUseCase;
        this.getUpcomingContestUseCase = getUpcomingContestUseCase;
        this.getMyEnteredContestsUseCase = getMyEnteredContestsUseCase;
        this.manageContestRolesUseCase = manageContestRolesUseCase;
        this.getContestDetailsUseCase = getContestDetailsUseCase;
        this.joinContestUseCase = joinContestUseCase;
        this.closeSubmissionsEnteringUseCase = closeSubmissionsEnteringUseCase;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createContest(
            @RequestBody @Valid final CreateContestRequest request,
            final Authentication authentication
    ) {
        final var organizerId = (UUID) authentication.getPrincipal();
        final var result = createContestUseCase.execute(request, organizerId.toString());

        return result.toResponseEntity(HttpStatus.CREATED);
    }

    @GetMapping("/upcoming")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUpcomingContest(final Authentication authentication) {
        final var userId = (UUID) authentication.getPrincipal();
        final var result = getUpcomingContestUseCase.execute(userId);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyContests(
            final Authentication authentication,
            @PageableDefault(size = 10, sort = "startDate") final Pageable pageable
    ) {
        final var userId = (UUID) authentication.getPrincipal();
        final var result = getMyEnteredContestsUseCase.execute(userId, pageable);
        return result.toResponseEntity(HttpStatus.OK);
    }

    @PutMapping("/{contestId}/roles")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> manageRole(
            @PathVariable final Long contestId,
            @RequestBody @Valid final ManageRoleRequest request,
            final Authentication authentication
    ) {
        final var organizerId = (UUID) authentication.getPrincipal();

        final var result = manageContestRolesUseCase.execute(contestId, organizerId, request);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @GetMapping("/{contestId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getDetails(
            @PathVariable Long contestId,
            final Authentication authentication) {
        final var organizerId = (UUID) authentication.getPrincipal();

        final var result = getContestDetailsUseCase.execute(contestId, organizerId);
        return result.toResponseEntity(HttpStatus.OK);
    }

    @PostMapping("/{contestId}/join")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> joinContest(
            @PathVariable final Long contestId,
            final Authentication authentication
    ) {
        final var userId = (UUID) authentication.getPrincipal();

        final var result = joinContestUseCase.execute(contestId, userId);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @PostMapping("/{contestId}/close-submissions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> closeSubmissions(
            @PathVariable final Long contestId,
            final Authentication authentication
    ) {
        final var organizerId = (UUID) authentication.getPrincipal();
        final var result = closeSubmissionsEnteringUseCase.execute(contestId, organizerId);
        return result.toResponseEntity(HttpStatus.OK);
    }

}
