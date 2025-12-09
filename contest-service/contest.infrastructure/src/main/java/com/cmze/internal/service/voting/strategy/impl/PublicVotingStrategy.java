package com.cmze.internal.service.voting.strategy.impl;

import com.cmze.entity.Participant;
import com.cmze.entity.Stage;
import com.cmze.entity.Submission;
import com.cmze.entity.VoteMarker;
import com.cmze.enums.StageType;
import com.cmze.internal.service.voting.strategy.VotingStrategy;
import com.cmze.repository.VoteMarkerRepository;
import com.cmze.ws.event.ContestVoteRecordedEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
public class PublicVotingStrategy implements VotingStrategy {

    private final VoteMarkerRepository voteMarkerRepository;
    private final StringRedisTemplate redisTemplate;
    private final ApplicationEventPublisher eventPublisher;

    public PublicVotingStrategy(final VoteMarkerRepository voteMarkerRepository,
                                final StringRedisTemplate redisTemplate,
                                final ApplicationEventPublisher eventPublisher) {
        this.voteMarkerRepository = voteMarkerRepository;
        this.redisTemplate = redisTemplate;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public StageType getStageType() {
        return StageType.PUBLIC_VOTE;
    }

    @Override
    public void vote(final Stage stage, final Participant voter, final Submission submission, final int score) {
        if (voteMarkerRepository.existsByStage_IdAndSubmission_IdAndParticipant_UserId(
                stage.getId(), submission.getId(), voter.getUserId())) {
            throw new IllegalStateException("You have already voted for this submission.");
        }

        final var vote = new VoteMarker();
        vote.setStage(stage);
        vote.setParticipant(voter);
        vote.setSubmission(submission);
        vote.setScore(1);
        vote.setCreatedAt(OffsetDateTime.now());

        voteMarkerRepository.save(vote);

        final String redisKey = "contest:stage:" + stage.getId() + ":scores";
        final String authorId = submission.getParticipant().getUserId();

        final Double currentTotalScore = redisTemplate.opsForZSet().incrementScore(redisKey, authorId, 1.0);

        if (currentTotalScore != null) {
            eventPublisher.publishEvent(new ContestVoteRecordedEvent(
                    stage.getContest().getId().toString(),
                    submission.getId(),
                    currentTotalScore
            ));
        }
    }
}
