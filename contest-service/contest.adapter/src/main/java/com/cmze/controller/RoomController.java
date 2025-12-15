package com.cmze.controller;

import com.cmze.request.VoteRequest;
import com.cmze.usecase.session.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("contest/{contestId}")
public class RoomController {

    private final CreateContestRoomUseCase createContestRoomUseCase;
    private final StartContestUseCase startContestUseCase;
    private final GetContestRoomDetailsUseCase getContestRoomDetailsUseCase;
    private final NextStageUseCase nextStageUseCase;
    private final CloseContestUseCase closeContestRoomUseCase;
    private final VoteSubmissionUseCase voteSubmissionUseCase;
    private final GetStageAccessTokenUseCase getStageAccessTokenUseCase;

    public RoomController(CreateContestRoomUseCase createContestRoomUseCase,
                          StartContestUseCase startContestUseCase,
                          GetContestRoomDetailsUseCase getContestRoomDetailsUseCase,
                          NextStageUseCase nextStageUseCase,
                          CloseContestUseCase closeContestRoomUseCase,
                          VoteSubmissionUseCase voteSubmissionUseCase,
                          GetStageAccessTokenUseCase getStageAccessTokenUseCase) {
        this.createContestRoomUseCase = createContestRoomUseCase;
        this.startContestUseCase = startContestUseCase;
        this.getContestRoomDetailsUseCase = getContestRoomDetailsUseCase;
        this.nextStageUseCase = nextStageUseCase;
        this.closeContestRoomUseCase = closeContestRoomUseCase;
        this.voteSubmissionUseCase = voteSubmissionUseCase;
        this.getStageAccessTokenUseCase = getStageAccessTokenUseCase;
    }

    @PostMapping("/room")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createRoom(
            @PathVariable final Long contestId,
            final Authentication authentication
    ) {
        final var organizerId = (UUID) authentication.getPrincipal();
        final var result = createContestRoomUseCase.execute(contestId, organizerId);
        return result.toResponseEntity(HttpStatus.CREATED);
    }

    @GetMapping("/room")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getRoomDetails(
            @PathVariable final Long contestId,
            final Authentication authentication
    ) {
        final var userId = (UUID) authentication.getPrincipal();
        final var result = getContestRoomDetailsUseCase.execute(contestId, userId);
        return result.toResponseEntity(HttpStatus.OK);
    }

    @PostMapping("/room/{roomId}/start")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> startContest(
            @PathVariable final Long contestId,
            @PathVariable final String roomId,
            final Authentication authentication
    ) {
        final var organizerId = (UUID) authentication.getPrincipal();
        final var result = startContestUseCase.execute(contestId, roomId, organizerId);
        return result.toResponseEntity(HttpStatus.OK);
    }

    @PostMapping("/room/{roomId}/next-stage")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> nextStage(
            @PathVariable final Long contestId,
            @PathVariable final String roomId,
            final Authentication authentication
    ) {
        final var organizerId = (UUID) authentication.getPrincipal();
        final var result = nextStageUseCase.execute(contestId, roomId, organizerId);
        return result.toResponseEntity(HttpStatus.OK);
    }

    @PostMapping("/room/{roomId}/close")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> closeContest(
            @PathVariable final Long contestId,
            @PathVariable final String roomId,
            final Authentication authentication
    ) {
        final var organizerId = (UUID) authentication.getPrincipal();
        final var result = closeContestRoomUseCase.execute(contestId, roomId, organizerId);
        return result.toResponseEntity(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/room/{roomId}/vote")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> vote(
            @PathVariable final Long contestId,
            @PathVariable final String roomId,
            @RequestBody VoteRequest request,
            final Authentication authentication
    ) {
        final var userId = (UUID) authentication.getPrincipal();
        final var result = voteSubmissionUseCase.execute(contestId, roomId, userId, request);
        return result.toResponseEntity(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/room/{roomId}/token")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getStageAccessToken(
            @PathVariable final Long contestId,
            @PathVariable final String roomId,
            final Authentication authentication
    ) {
        final var userId = (UUID) authentication.getPrincipal();
        final var result = getStageAccessTokenUseCase.execute(contestId, roomId, userId);
        return result.toResponseEntity(HttpStatus.OK);
    }
}
