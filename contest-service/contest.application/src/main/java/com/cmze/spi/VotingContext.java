package com.cmze.spi;

import com.cmze.request.VoteRequest;
import com.cmze.shared.ActionResult;

import java.util.UUID;

public interface VotingContext {
    ActionResult<Void> executeVote(Long contestId, UUID userId, VoteRequest request);
}
