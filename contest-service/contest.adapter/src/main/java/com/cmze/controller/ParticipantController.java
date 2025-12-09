package com.cmze.controller;

import com.cmze.usecase.contest.GetContestParticipantsUseCase;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("contest/{contestId}/participant")
public class ParticipantController {

    private final GetContestParticipantsUseCase getContestParticipantsUseCase;

    public ParticipantController(GetContestParticipantsUseCase getContestParticipantsUseCase) {
        this.getContestParticipantsUseCase = getContestParticipantsUseCase;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getParticipants(@PathVariable final Long contestId) {

        final var result = getContestParticipantsUseCase.execute(contestId);
        return result.toResponseEntity(HttpStatus.OK);
    }
}
