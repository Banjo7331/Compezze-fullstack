package com.cmze.controller;

import com.cmze.response.TemplateResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.minio.MediaLocation;
import com.cmze.usecase.resources.templates.ListTemplatesUseCase;
import com.cmze.usecase.resources.templates.UploadTemplateUseCase;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/templates")
public class TemplateController {

    private final ListTemplatesUseCase listTemplatesUseCase;
    private final UploadTemplateUseCase uploadTemplateUseCase;

    public TemplateController(ListTemplatesUseCase listTemplatesUseCase, UploadTemplateUseCase uploadTemplateUseCase) {
        this.listTemplatesUseCase = listTemplatesUseCase;
        this.uploadTemplateUseCase = uploadTemplateUseCase;
    }

//    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<?> uploadTemplate(
//            @RequestPart("file") MultipartFile file,
//            @RequestHeader("X-Authenticated-User") String username,
//            @RequestHeader("X-User-Roles") String roles)
//    {
//        if (roles == null || !roles.contains("ROLE_ADMIN")) {
//            ProblemDetail pd = ProblemDetail.forStatusAndDetail(
//                    HttpStatus.FORBIDDEN, "Access Denied. Admin role required."
//            );
//            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(pd);
//        }
//        ActionResult<MediaLocation> result = uploadTemplateUseCase.execute(file, username);
//
//        if (!result.isSuccess()) {
//            return ResponseEntity
//                    .status(result.getError().getStatus())
//                    .body(result.getError());
//        }
//        return ResponseEntity.status(HttpStatus.CREATED).body(result.getValue());
//    }
//
//    @GetMapping
//    public ResponseEntity<?> listTemplates() { // Changed to wildcard ? to handle ActionResult
//        ActionResult<List<TemplateResponse>> result = listTemplatesUseCase.execute();
//
//        if (!result.isSuccess()) {
//            return ResponseEntity
//                    .status(result.getError().getStatus())
//                    .body(result.getError());
//        }
//        return ResponseEntity.ok(result.getValue());
//    }
//
//    @DeleteMapping
//    public ResponseEntity<?> deleteTemplate(
//            @RequestParam("key") String templateKey,
//            @RequestHeader("X-User-Roles") String roles) {
//
//        // 1. Manual Authorization
//        if (roles == null || !roles.contains("ROLE_ADMIN")) {
//            ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Access Denied. Admin role required.");
//            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(pd);
//        }
//
//        // 2. Execute Use Case
//        ActionResult<String> result = deleteTemplateUseCase.execute(templateKey);
//
//        // 3. Return Response
//        if (!result.isSuccess()) {
//            return ResponseEntity
//                    .status(result.getError().getStatus())
//                    .body(result.getError());
//        }
//        // HTTP 204 No Content is standard for a successful DELETE
//        return ResponseEntity.noContent().build();
//    }
}
