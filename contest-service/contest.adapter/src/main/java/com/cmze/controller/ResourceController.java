package com.cmze.controller;

import com.cmze.usecase.resources.icons.ListAvatarsUseCase;
import com.cmze.usecase.resources.templates.ListTemplatesUseCase;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("contest/resources")
public class ResourceController {

    private final ListAvatarsUseCase listAvatarsUseCase;
    private final ListTemplatesUseCase listTemplatesUseCase;

    public ResourceController(final ListAvatarsUseCase listAvatarsUseCase,
                              final ListTemplatesUseCase listTemplatesUseCase) {
        this.listAvatarsUseCase = listAvatarsUseCase;
        this.listTemplatesUseCase = listTemplatesUseCase;
    }

    @GetMapping("/avatars")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAvatars() {
        var result = listAvatarsUseCase.execute();
        return result.toResponseEntity(HttpStatus.OK);
    }

    @GetMapping("/templates")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getTemplates() {
        var result = listTemplatesUseCase.execute();
        return result.toResponseEntity(HttpStatus.OK);
    }
}
