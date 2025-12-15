package com.cmze.controller;

import com.cmze.entity.QuizRoom;
import com.cmze.request.*;
import com.cmze.usecase.room.*;
import jakarta.validation.Valid;
import net.kaczmarzyk.spring.data.jpa.domain.LikeIgnoreCase;
import net.kaczmarzyk.spring.data.jpa.web.annotation.And;
import net.kaczmarzyk.spring.data.jpa.web.annotation.Spec;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("quiz/room")
public class RoomController {

    private final CreateQuizRoomUseCase createQuizRoomUseCase;
    private final JoinQuizRoomUseCase joinQuizRoomUseCase;
    private final StartQuizUseCase startQuizUseCase;
    private final SubmitQuizAnswerUseCase submitQuizAnswerUseCase;
    private final NextQuestionUseCase nextQuestionUseCase;
    private final FinishCurrentQuestionUseCase finishCurrentQuestionUseCase;
    private final CloseQuizRoomUseCase closeQuizRoomUseCase;
    private final InviteUsersForQuizRoomUseCase inviteUsersForQuizRoomUseCase;
    private final GenerateTokenForUserUseCase generateTokenForUserUseCase;
    private final GetQuizRoomDetailsUseCase getQuizRoomDetailsUseCase;
    private final GetMyQuizRoomsResultsUseCase getMyQuizRoomsResultsUseCase;
    private final GetAllActiveQuizRoomsUseCase getAllActiveQuizRoomsUseCase;

    public RoomController(final CreateQuizRoomUseCase createQuizRoomUseCase,
                          final JoinQuizRoomUseCase joinQuizRoomUseCase,
                          final StartQuizUseCase startQuizUseCase,
                          final SubmitQuizAnswerUseCase submitQuizAnswerUseCase,
                          final NextQuestionUseCase nextQuestionUseCase,
                          final FinishCurrentQuestionUseCase finishCurrentQuestionUseCase,
                          final CloseQuizRoomUseCase closeQuizRoomUseCase,
                          final InviteUsersForQuizRoomUseCase inviteUsersForQuizRoomUseCase,
                          final GenerateTokenForUserUseCase generateTokenForUserUseCase,
                          final GetQuizRoomDetailsUseCase getQuizRoomDetailsUseCase,
                          final GetMyQuizRoomsResultsUseCase getMyQuizRoomsResultsUseCase,
                          final GetAllActiveQuizRoomsUseCase getAllActiveQuizRoomsUseCase) {
        this.createQuizRoomUseCase = createQuizRoomUseCase;
        this.joinQuizRoomUseCase = joinQuizRoomUseCase;
        this.startQuizUseCase = startQuizUseCase;
        this.submitQuizAnswerUseCase = submitQuizAnswerUseCase;
        this.nextQuestionUseCase = nextQuestionUseCase;
        this.finishCurrentQuestionUseCase = finishCurrentQuestionUseCase;
        this.closeQuizRoomUseCase = closeQuizRoomUseCase;
        this.inviteUsersForQuizRoomUseCase = inviteUsersForQuizRoomUseCase;
        this.generateTokenForUserUseCase = generateTokenForUserUseCase;
        this.getQuizRoomDetailsUseCase = getQuizRoomDetailsUseCase;
        this.getMyQuizRoomsResultsUseCase = getMyQuizRoomsResultsUseCase;
        this.getAllActiveQuizRoomsUseCase = getAllActiveQuizRoomsUseCase;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createQuizRoom(
            @RequestBody @Valid final CreateQuizRoomRequest request,
            final Authentication authentication
    ) {
        final var hostId = (UUID) authentication.getPrincipal();
        final var result = createQuizRoomUseCase.execute(request, hostId);

        return result.toResponseEntity(HttpStatus.CREATED);
    }

    @PostMapping("/{roomId}/join")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> joinQuizRoom(
            @PathVariable final UUID roomId,
            @RequestBody(required = false) final JoinQuizRoomRequest request,
            final Authentication authentication
    ) {
        final var userId = (UUID) authentication.getPrincipal();
        final var result = joinQuizRoomUseCase.execute(roomId, userId, request);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @PostMapping("/{roomId}/start")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> startQuiz(
            @PathVariable final UUID roomId,
            final Authentication authentication
    ) {
        final var hostId = (UUID) authentication.getPrincipal();

        final var result = startQuizUseCase.execute(roomId, hostId);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @PostMapping("/{roomId}/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> submitAnswer(
            @PathVariable final UUID roomId,
            @RequestBody @Valid final SubmitQuizAnswerRequest request,
            final Authentication authentication
    ) {
        final var userId = (UUID) authentication.getPrincipal();
        final var result = submitQuizAnswerUseCase.execute(roomId, userId, request);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @PostMapping("/{roomId}/question/next")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> nextQuestion(
            @PathVariable final UUID roomId,
            final Authentication authentication
    ) {
        final var hostId = (UUID) authentication.getPrincipal();
        final var result = nextQuestionUseCase.execute(roomId, hostId);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @PostMapping("/{roomId}/question/finish")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> finishQuestionManually(
            @PathVariable final UUID roomId,
            final Authentication authentication
    ) {
        final var hostId = (UUID) authentication.getPrincipal();

        final var result = finishCurrentQuestionUseCase.execute(roomId, hostId);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @PostMapping("/{roomId}/close")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> closeRoom(
            @PathVariable final UUID roomId,
            final Authentication authentication
    ) {
        final var hostUserId = (UUID) authentication.getPrincipal();

        final var result = closeQuizRoomUseCase.execute(roomId, hostUserId);

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

        final var result = inviteUsersForQuizRoomUseCase.execute(roomId, request, hostId);

        return result.toResponseEntity(HttpStatus.CREATED);
    }

    @PostMapping("/{roomId}/generate-token")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> generateTokenForUser(
            @PathVariable final UUID roomId,
            @RequestBody @Valid final GenerateSessionTokenRequest request
    ) {

        final var result = generateTokenForUserUseCase.execute(roomId, request);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @GetMapping("/{roomId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getRoomDetails(
            final Authentication authentication,
            @PathVariable final UUID roomId) {
        final var userId = (UUID) authentication.getPrincipal();
        final var result = getQuizRoomDetailsUseCase.execute(roomId, userId);
        return result.toResponseEntity(HttpStatus.OK);
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyRooms(
            final Authentication authentication,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) final Pageable pageable
    ) {
        final var userId = (UUID) authentication.getPrincipal();
        final var result = getMyQuizRoomsResultsUseCase.execute(userId, pageable);
        return result.toResponseEntity(HttpStatus.OK);
    }

    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getActiveRooms(
            @And({
                    @Spec(path = "quiz.title", params = "search", spec = LikeIgnoreCase.class)
            }) Specification<QuizRoom> filters,
            @PageableDefault(size = 20) final Pageable pageable
    ) {
        final var result = getAllActiveQuizRoomsUseCase.execute(filters, pageable);

        return result.toResponseEntity(HttpStatus.OK);
    }
}
