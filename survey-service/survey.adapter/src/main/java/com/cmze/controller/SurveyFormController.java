package com.cmze.controller;

import com.cmze.entity.SurveyForm;
import com.cmze.request.CreateSurveyFormRequest;
import com.cmze.usecase.form.CreateSurveyFormUseCase;
import com.cmze.usecase.form.DeleteSurveyFormUseCase;
import com.cmze.usecase.form.GetAllSurveyFormsUseCase;
import com.cmze.usecase.form.GetMySurveyFormsUseCase;
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
@RequestMapping("survey/form")
public class SurveyFormController {

    private final CreateSurveyFormUseCase createSurveyFormUseCase;
    private final GetAllSurveyFormsUseCase getAllSurveyFormsUseCase;
    private final DeleteSurveyFormUseCase deleteSurveyFormUseCase;
    private final GetMySurveyFormsUseCase getMySurveyFormsUseCase;

    public SurveyFormController(CreateSurveyFormUseCase createSurveyFormUseCase,
                                GetAllSurveyFormsUseCase getAllSurveyFormsUseCase,
                                DeleteSurveyFormUseCase deleteSurveyFormUseCase,
                                GetMySurveyFormsUseCase getMySurveyFormsUseCase) {
        this.createSurveyFormUseCase = createSurveyFormUseCase;
        this.getAllSurveyFormsUseCase = getAllSurveyFormsUseCase;
        this.deleteSurveyFormUseCase = deleteSurveyFormUseCase;
        this.getMySurveyFormsUseCase = getMySurveyFormsUseCase;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createSurveyForm(
            @RequestBody @Valid final CreateSurveyFormRequest request,
            final Authentication authentication
    ) {
        final var ownerUserId = (UUID) authentication.getPrincipal();

        final var result = createSurveyFormUseCase.execute(request, ownerUserId);

        return result.toResponseEntity(HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllSurveyForms(
            @And({
                    @Spec(path = "title", params = "search", spec = LikeIgnoreCase.class)
            }) Specification<SurveyForm> filters,
            @PageableDefault(size = 20, sort = "title") final Pageable pageable,
            final Authentication authentication
    ) {
        final var currentUserId = (UUID) authentication.getPrincipal();

        final var result = getAllSurveyFormsUseCase.execute(currentUserId, filters, pageable);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyForms(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            final Authentication authentication

    ) {
        final var userId = (UUID) authentication.getPrincipal();

        final var result = getMySurveyFormsUseCase.execute(userId, pageable);

        return result.toResponseEntity(HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteSurveyForm(
            @PathVariable final Long id,
            final Authentication authentication
    ) {
        final var userId = (UUID) authentication.getPrincipal();

        final var result = deleteSurveyFormUseCase.execute(id, userId);

        return result.toResponseEntity(HttpStatus.NO_CONTENT);
    }
}
