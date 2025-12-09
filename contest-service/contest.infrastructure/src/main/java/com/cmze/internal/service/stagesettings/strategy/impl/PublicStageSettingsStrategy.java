package com.cmze.internal.service.stagesettings.strategy.impl;

import com.cmze.entity.Stage;
import com.cmze.entity.stagesettings.PublicVoteStage;
import com.cmze.enums.StageType;
import com.cmze.internal.service.stagesettings.strategy.StageSettingsStrategy;
import com.cmze.repository.StageRepository;
import com.cmze.repository.VoteMarkerRepository;
import com.cmze.request.StageRequest;
import com.cmze.request.UpdateStageRequest;
import com.cmze.response.stagesettings.PublicVotingSettingsResponse;
import com.cmze.response.stagesettings.StageSettingsResponse;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class PublicStageSettingsStrategy implements StageSettingsStrategy {

    private final StageRepository stageRepository;
    private final VoteMarkerRepository voteMarkerRepository;
    private final StringRedisTemplate redisTemplate;

    public PublicStageSettingsStrategy(final StageRepository stageRepository,
                                       final VoteMarkerRepository voteMarkerRepository,
                                       final StringRedisTemplate redisTemplate) {
        this.stageRepository = stageRepository;
        this.voteMarkerRepository  = voteMarkerRepository;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public StageType type() {
        return StageType.PUBLIC_VOTE;
    }

    @Override
    public ProblemDetail validate(final StageRequest dto) {
        if (!(dto instanceof StageRequest.PublicStageRequest req)) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid DTO for PUBLIC strategy");
        }
        if (req.getWeight() != null && req.getWeight() <= 0.0) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, "Weight must be > 0");
        }
        return null;
    }

    @Override
    public Stage createStage(final StageRequest dto) {
        if (dto instanceof StageRequest.PublicStageRequest req) {
            return PublicVoteStage.builder()
                    .weight(req.getWeight())
                    .maxScore(req.getMaxScore())
                    .build();
        }
        throw new IllegalArgumentException("Invalid DTO for PUBLIC strategy");
    }

    @Override
    public void updateStage(UpdateStageRequest dto, Stage stage) {

    }

    @Override
    public StageSettingsResponse runStage(final long stageId) {
        final var stageOpt = stageRepository.findById(stageId);
        if (stageOpt.isEmpty() || !(stageOpt.get() instanceof PublicVoteStage)) {
            throw new IllegalStateException("Invalid stage for PUBLIC strategy");
        }
        final var stage = (PublicVoteStage) stageOpt.get();

        return new PublicVotingSettingsResponse(
                stage.getId(),
                "PUBLIC_VOTE",
                stage.getWeight(),
                stage.getMaxScore()
        );
    }

    @Override
    public StageSettingsResponse getSettings(final Stage stage) {
        if (!(stage instanceof PublicVoteStage publicStage)) throw new IllegalStateException("Wrong type");

        return new PublicVotingSettingsResponse(
                publicStage.getId(),
                "PUBLIC_VOTE",
                publicStage.getWeight(),
                publicStage.getMaxScore()
        );
    }

    @Override
    public Map<UUID, Double> finishStage(final Stage stage) {
        if (!(stage instanceof PublicVoteStage publicStage)) throw new IllegalStateException("Wrong type");

        final double weight = publicStage.getWeight();
        final String redisKey = "contest:stage:" + stage.getId() + ":scores";

        Set<ZSetOperations.TypedTuple<String>> redisResults = redisTemplate.opsForZSet().rangeWithScores(redisKey, 0, -1);

        if (redisResults != null && !redisResults.isEmpty()) {
            return redisResults.stream()
                    .collect(Collectors.toMap(
                            tuple -> UUID.fromString(tuple.getValue()),
                            tuple -> (tuple.getScore() != null ? tuple.getScore() : 0.0) * weight
                    ));
        }

        final var allVotes = voteMarkerRepository.findAllByStage_Id(stage.getId());

        return allVotes.stream()
                .collect(Collectors.groupingBy(
                        vote -> UUID.fromString(vote.getSubmission().getParticipant().getUserId()),
                        Collectors.summingDouble(vote -> {
                            int score = vote.getScore() != null ? vote.getScore() : 1;
                            return score * weight;
                        })
                ));
    }

}
