package com.cmze.controller;

import com.cmze.request.CreateQuizFormRequest.CreateQuizFormRequest;
import com.cmze.usecase.form.CreateQuizFormUseCase;
import com.cmze.usecase.form.DeleteQuizFormUseCase;
import com.cmze.usecase.form.GetAllQuizFormsUseCase;
import com.cmze.usecase.form.GetMyQuizFormsUseCase;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("quiz/form")
public class QuizFormController {

    private final CreateQuizFormUseCase createQuizFormUseCase;
    private final GetAllQuizFormsUseCase getAllQuizFormsUseCase;
    private final GetMyQuizFormsUseCase getMyQuizFormsUseCase;
    private final DeleteQuizFormUseCase deleteQuizFormUseCase;

    public QuizFormController(final CreateQuizFormUseCase createQuizFormUseCase,
                              final GetAllQuizFormsUseCase getAllQuizFormsUseCase,
                              final GetMyQuizFormsUseCase getMyQuizFormsUseCase,
                              final DeleteQuizFormUseCase deleteQuizFormUseCase) {
        this.createQuizFormUseCase = createQuizFormUseCase;
        this.getAllQuizFormsUseCase = getAllQuizFormsUseCase;
        this.getMyQuizFormsUseCase = getMyQuizFormsUseCase;
        this.deleteQuizFormUseCase = deleteQuizFormUseCase;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createQuiz(
            @RequestBody @Valid final CreateQuizFormRequest request,
            final Authentication authentication
    ) {
        final var userId = (UUID) authentication.getPrincipal();
        final var result = createQuizFormUseCase.execute(request, userId);

        return result.toResponseEntity(HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllQuizzes(
            final Authentication authentication,
            @PageableDefault(size = 20, sort = "title") final Pageable pageable
    ) {
        final var userId = (UUID) authentication.getPrincipal();
        final var result = getAllQuizFormsUseCase.execute(userId, pageable);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyQuizzes(
            final Authentication authentication,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) final Pageable pageable
    ) {
        final var userId = (UUID) authentication.getPrincipal();
        final var result = getMyQuizFormsUseCase.execute(userId, pageable);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteQuiz(
            @PathVariable final Long id,
            final Authentication authentication
    ) {
        final var userId = (UUID) authentication.getPrincipal();
        final var result = deleteQuizFormUseCase.execute(id, userId);

        return result.toResponseEntity(HttpStatus.NO_CONTENT);
    }
}
