package com.cmze.internal.service.voting.strategy.impl;

import com.cmze.entity.Participant;
import com.cmze.entity.Stage;
import com.cmze.entity.Submission;
import com.cmze.enums.StageType;
import com.cmze.external.redis.VoteRedisService;
import com.cmze.internal.service.voting.strategy.VotingStrategy;
import com.cmze.ws.event.ContestVoteRecordedEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
public class PublicVotingStrategy implements VotingStrategy {

    private final VoteRedisService voteRedisService;
    private final ApplicationEventPublisher eventPublisher;

    public PublicVotingStrategy(final VoteRedisService voteRedisService,
                                final ApplicationEventPublisher eventPublisher) {
        this.voteRedisService = voteRedisService;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public StageType getStageType() {
        return StageType.PUBLIC_VOTE;
    }

    @Override
    public void vote(final Stage stage, final Participant voter, final Submission submission, final int scoreIgnored) {
        if (voteRedisService.hasAlreadyVoted(stage.getId(), submission.getId(), voter.getUserId())) {
            throw new IllegalStateException("You have already voted for this submission.");
        }

        int fixedScore = 1;

        Double newTotalScore = voteRedisService.registerVote(
                stage.getId(),
                submission.getId(),
                voter.getUserId(),
                fixedScore
        );

        if (newTotalScore != null) {
            eventPublisher.publishEvent(new ContestVoteRecordedEvent(
                    stage.getContest().getId().toString(),
                    submission.getId(),
                    newTotalScore
            ));
        }
    }
}
