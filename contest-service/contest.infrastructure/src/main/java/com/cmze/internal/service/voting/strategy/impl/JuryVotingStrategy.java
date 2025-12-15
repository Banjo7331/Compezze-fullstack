package com.cmze.internal.service.voting.strategy.impl;

import com.cmze.entity.Participant;
import com.cmze.entity.Stage;
import com.cmze.entity.Submission;
import com.cmze.entity.stagesettings.JuryVoteStage;
import com.cmze.enums.ContestRole;
import com.cmze.enums.StageType;
import com.cmze.external.redis.VoteRedisService;
import com.cmze.internal.service.voting.strategy.VotingStrategy;
import com.cmze.repository.*;
import com.cmze.ws.event.ContestVoteRecordedEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
public class JuryVotingStrategy implements VotingStrategy {

    private final VoteRedisService voteRedisService;
    private final ApplicationEventPublisher eventPublisher;

    public JuryVotingStrategy(final VoteRedisService voteRedisService,
                              final ApplicationEventPublisher eventPublisher) {
        this.voteRedisService = voteRedisService;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public StageType getStageType() {
        return StageType.JURY_VOTE;
    }

    @Override
    public void vote(final Stage stage, final Participant voter, final Submission submission, final int score) {
        if (!voter.getRoles().contains(ContestRole.JURY)) {
            throw new IllegalArgumentException("Only Jury members can vote in this stage.");
        }

        if (stage instanceof JuryVoteStage juryStage) {
            if (score < 1 || score > juryStage.getMaxScore()) {
                throw new IllegalArgumentException("Score must be between 1 and " + juryStage.getMaxScore());
            }
        }

        if (voteRedisService.hasAlreadyVoted(stage.getId(), submission.getId(), voter.getUserId())) {
            throw new IllegalStateException("You have already rated this submission.");
        }

        Double newTotalScore = voteRedisService.registerVote(
                stage.getId(),
                submission.getId(),
                voter.getUserId(),
                score
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