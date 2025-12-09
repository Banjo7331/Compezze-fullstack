package com.cmze.controller;

import com.cmze.enums.SubmissionStatus;
import com.cmze.request.ReviewSubmissionRequest;
import com.cmze.usecase.participant.WithdrawSubmissionUseCase;
import com.cmze.usecase.submission.GetSubmissionMediaUrlUseCase;
import com.cmze.usecase.submission.ListSubmissionsForReviewUseCase;
import com.cmze.usecase.submission.ReviewSubmissionUseCase;
import com.cmze.usecase.participant.SubmitEntryForContestUseCase;
import com.cmze.usecase.submission.DeleteSubmissionUseCase;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("contest/{contestId}/submission")
public class SubmissionController {

    private final SubmitEntryForContestUseCase submitEntryForContestUseCase;
    private final WithdrawSubmissionUseCase withdrawSubmissionUseCase;
    private final DeleteSubmissionUseCase deleteSubmissionUseCase;
    private final ReviewSubmissionUseCase reviewSubmissionUseCase;
    private final ListSubmissionsForReviewUseCase listSubmissionsForReviewUseCase;
    private final GetSubmissionMediaUrlUseCase getSubmissionMediaUrlUseCase;

    public SubmissionController(SubmitEntryForContestUseCase submitEntryForContestUseCase,
                                WithdrawSubmissionUseCase withdrawSubmissionUseCase,
                                DeleteSubmissionUseCase deleteSubmissionUseCase,
                                ReviewSubmissionUseCase reviewSubmissionUseCase,
                                ListSubmissionsForReviewUseCase listSubmissionsForReviewUseCase,
                                GetSubmissionMediaUrlUseCase getSubmissionMediaUrlUseCase) {
        this.submitEntryForContestUseCase = submitEntryForContestUseCase;
        this.withdrawSubmissionUseCase = withdrawSubmissionUseCase;
        this.deleteSubmissionUseCase = deleteSubmissionUseCase;
        this.reviewSubmissionUseCase = reviewSubmissionUseCase;
        this.listSubmissionsForReviewUseCase = listSubmissionsForReviewUseCase;
        this.getSubmissionMediaUrlUseCase = getSubmissionMediaUrlUseCase;
    }

    @PutMapping("/{submissionId}/review")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> reviewSubmission(
            @PathVariable final Long contestId,
            @PathVariable final String submissionId,
            @RequestBody @Valid final ReviewSubmissionRequest request,
            final Authentication authentication
    ) {
        final var reviewerId = (UUID) authentication.getPrincipal();

        final var result = reviewSubmissionUseCase.execute(
                contestId,
                reviewerId,
                submissionId,
                request
        );

        return result.toResponseEntity(HttpStatus.OK);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getSubmissions(
            @PathVariable Long contestId,
            @RequestParam(required = false) SubmissionStatus status,
            @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication
    ) {
        var userId = (UUID) authentication.getPrincipal();
        var result = listSubmissionsForReviewUseCase.execute(contestId, userId, status, pageable);
        return result.toResponseEntity(HttpStatus.OK);
    }

    @GetMapping("/{submissionId}/url")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMediaUrl(
            @PathVariable Long contestId,
            @PathVariable String submissionId,
            Authentication authentication
    ) {
        var userId = (UUID) authentication.getPrincipal();
        var result = getSubmissionMediaUrlUseCase.execute(contestId, submissionId, userId);
        return result.toResponseEntity(HttpStatus.OK);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> submitEntry(
            @PathVariable final Long contestId,
            @RequestPart("file") final MultipartFile file,
            final Authentication authentication
    ) {
        final var userId = (UUID) authentication.getPrincipal();

        final var result = submitEntryForContestUseCase.execute(
                contestId,
                userId,
                file
        );

        return result.toResponseEntity(HttpStatus.CREATED);
    }

    @DeleteMapping("my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> withdrawMySubmission(
            @PathVariable final Long contestId,
            final Authentication authentication
    ) {
        final var userId = (UUID) authentication.getPrincipal();

        final var result = withdrawSubmissionUseCase.execute(contestId, userId);

        return result.toResponseEntity(HttpStatus.NO_CONTENT);
    }

//    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<?> submitForContest(@PathVariable("contestId") String contestId,
//                                              @RequestPart(value = "name") String name,
//                                              @RequestHeader("X-User-Id") String userId,
//                                              @RequestPart("file") MultipartFile file
//    ) {
//        var result = submitEntryForContestUseCase.execute(contestId, userId, name, file);
//
//        return result.toResponseEntity(HttpStatus.CREATED);
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<?> deleteSubmission(@PathVariable("contestId") String contestId,
//                                              @PathVariable("id") String submissionId,
//                                              @RequestHeader("X-User-Id") String requesterUserId) {
//        var res = deleteSubmissionUseCase.execute(contestId, requesterUserId, submissionId);
//        return res.toResponseEntity(HttpStatus.NO_CONTENT);
//    }

//    @GetMapping
//    public ResponseEntity<?> list(@PathVariable String contestId,
//                                  @RequestParam(name = "status", defaultValue = "PENDING") SubmissionStatus status,
//                                  @RequestParam(defaultValue = "0") int page,
//                                  @RequestParam(defaultValue = "20") int size) {
//        var res = listSubmissionsForReviewUseCase.execute(contestId, status, page, size);
//        return res.toResponseEntity(HttpStatus.OK);
//    }
//
//    @GetMapping("/{id}/media-url")
//    public ResponseEntity<?> mediaUrl(@PathVariable String contestId,
//                                      @PathVariable String submissionId,
//                                      @RequestHeader("X-User-Id") String userId) {
//        var res = getSubmissionMediaUrlUseCase.execute(contestId, submissionId, userId);
//        return res.toResponseEntity(HttpStatus.OK);
//    }
//
//    @PostMapping("/{id}/review")
//    public ResponseEntity<?> review(@PathVariable("contestid") String contestId,
//                                    @PathVariable("id") String submissionId,
//                                    @RequestHeader("X-User-Id") String reviewerUserId,
//                                    @RequestBody @Valid ReviewSubmissionRequest body) {
//        var res = reviewSubmissionUseCase.execute(contestId, submissionId, reviewerUserId, body);
//        return res.toResponseEntity(HttpStatus.NO_CONTENT);
//    }
}
