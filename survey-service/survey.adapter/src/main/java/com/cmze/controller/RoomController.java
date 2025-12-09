package com.cmze.controller;

import com.cmze.request.CreateSurveyRoomRequest;
import com.cmze.request.GenerateRoomInvitesRequest;
import com.cmze.request.JoinSurveyRoomRequest;
import com.cmze.request.SubmitSurveyAttemptRequest.SubmitSurveyAttemptRequest;
import com.cmze.usecase.room.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.UUID;

@RestController
@RequestMapping("survey/room")
public class RoomController {

    private final CreateSurveyRoomUseCase createSurveyRoomUseCase;
    private final JoinSurveyRoomUseCase joinSurveyRoomUseCase;
    private final SubmitSurveyAttemptUseCase submitSurveyAttemptUseCase;
    private final CloseSurveyRoomUseCase closeSurveyRoomUseCase;
    private final GetAllActiveSurveyRoomsUseCase getAllActiveSurveyRoomsUseCase;
    private final InviteUsersForSurveyRoomUseCase inviteUsersForSurveyRoomUseCase;
    private final GetSurveyRoomDetailsUseCase getSurveyRoomDetailsUseCase;
    private final GetMySurveyRoomsResultsUseCase getMySurveyRoomsResultsUseCase;

    public RoomController(CreateSurveyRoomUseCase createSurveyRoomUseCase,
                          JoinSurveyRoomUseCase joinSurveyRoomUseCase,
                          SubmitSurveyAttemptUseCase submitSurveyAttemptUseCase,
                          CloseSurveyRoomUseCase closeSurveyRoomUseCase,
                          GetAllActiveSurveyRoomsUseCase getAllActiveSurveyRoomsUseCase,
                          InviteUsersForSurveyRoomUseCase inviteUsersForSurveyRoomUseCase,
                          GetSurveyRoomDetailsUseCase getSurveyRoomDetailsUseCase,
                          GetMySurveyRoomsResultsUseCase getMySurveyRoomsResultsUseCase) {
        this.createSurveyRoomUseCase = createSurveyRoomUseCase;
        this.joinSurveyRoomUseCase = joinSurveyRoomUseCase;
        this.submitSurveyAttemptUseCase = submitSurveyAttemptUseCase;
        this.closeSurveyRoomUseCase = closeSurveyRoomUseCase;
        this.getAllActiveSurveyRoomsUseCase = getAllActiveSurveyRoomsUseCase;
        this.inviteUsersForSurveyRoomUseCase = inviteUsersForSurveyRoomUseCase;
        this.getSurveyRoomDetailsUseCase = getSurveyRoomDetailsUseCase;
        this.getMySurveyRoomsResultsUseCase = getMySurveyRoomsResultsUseCase;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createRoom(
            @RequestBody @Valid final CreateSurveyRoomRequest request,
            final Authentication authentication
    ) {
        final var creatorUserId = (UUID) authentication.getPrincipal();

        final var result = createSurveyRoomUseCase.execute(request, creatorUserId);

        return result.toResponseEntity(HttpStatus.CREATED);
    }

    @GetMapping("/{roomId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getRoomDetails(@PathVariable final UUID roomId) {

        final var result = getSurveyRoomDetailsUseCase.execute(roomId);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getActiveRooms(
            @PageableDefault(size = 20) final Pageable pageable
    ) {
        final var result = getAllActiveSurveyRoomsUseCase.execute(pageable);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyRooms(
            final Authentication authentication,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) final Pageable pageable
    ) {
        final var userId = (UUID) authentication.getPrincipal();

        final var result = getMySurveyRoomsResultsUseCase.execute(userId, pageable);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @PostMapping("/{roomId}/join")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> joinRoom(
            @PathVariable final UUID roomId,
            @RequestBody(required = false) final JoinSurveyRoomRequest request,
            final Authentication authentication
    ) {
        final var participantUserId = (UUID) authentication.getPrincipal();

        final var result = joinSurveyRoomUseCase.execute(roomId, participantUserId, request);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @PostMapping("/{roomId}/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> submitAnswers(
            @PathVariable final UUID roomId,
            @RequestBody @Valid final SubmitSurveyAttemptRequest request,
            final Authentication authentication
    ) {
        final var participantUserId = (UUID) authentication.getPrincipal();

        final var result = submitSurveyAttemptUseCase.execute(roomId, participantUserId, request);

        return result.toResponseEntity(HttpStatus.CREATED);
    }

    @PostMapping("/{roomId}/close")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> closeRoom(
            @PathVariable final UUID roomId,
            final Authentication authentication
    ) {
        final var hostUserId = (UUID) authentication.getPrincipal();

        final var result = closeSurveyRoomUseCase.execute(roomId, hostUserId);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @PostMapping("/{roomId}/invites")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> generateInvites(
            @PathVariable final UUID roomId,
            @RequestBody final GenerateRoomInvitesRequest request,
            final Authentication authentication
    ) {
        final var hostId = (UUID) authentication.getPrincipal();

        final var result = inviteUsersForSurveyRoomUseCase.execute(roomId, request, hostId);

        return result.toResponseEntity(HttpStatus.CREATED);
    }
}
