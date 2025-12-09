package com.cmze.usecase.session;

import com.cmze.request.VoteRequest;
import com.cmze.shared.ActionResult;
import com.cmze.spi.VotingContext;
import com.cmze.usecase.UseCase;

import java.util.UUID;

@UseCase
public class VoteSubmissionUseCase {

    private final VotingContext votingContext;

    public VoteSubmissionUseCase(VotingContext votingContext) {
        this.votingContext = votingContext;
    }

    public ActionResult<Void> execute(Long contestId, UUID userId, VoteRequest request) {
        return votingContext.executeVote(contestId, userId, request);
    }
}
