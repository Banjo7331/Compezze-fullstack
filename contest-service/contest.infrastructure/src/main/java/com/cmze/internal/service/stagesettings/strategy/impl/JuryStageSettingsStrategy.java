package com.cmze.internal.service.stagesettings.strategy.impl;

import com.cmze.entity.Stage;
import com.cmze.entity.stagesettings.JuryVoteStage;
import com.cmze.enums.StageType;
import com.cmze.internal.service.stagesettings.strategy.StageSettingsStrategy;
import com.cmze.repository.StageRepository;
import com.cmze.repository.VoteMarkerRepository;
import com.cmze.request.StageRequest;
import com.cmze.request.UpdateStageRequest;
import com.cmze.response.stagesettings.JuryVotingSettingsResponse;
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
public class JuryStageSettingsStrategy implements StageSettingsStrategy {

    private final StageRepository stageRepository;
    private final VoteMarkerRepository voteMarkerRepository;
    private final StringRedisTemplate redisTemplate;

    public JuryStageSettingsStrategy(final StageRepository stageRepository,
                                     final VoteMarkerRepository voteMarkerRepository,
                                     final StringRedisTemplate redisTemplate) {
        this.stageRepository = stageRepository;
        this.voteMarkerRepository = voteMarkerRepository;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public StageType type() {
        return StageType.JURY_VOTE;
    }

    @Override
    public ProblemDetail validate(final StageRequest dto) {
        if (!(dto instanceof StageRequest.JuryStageRequest)) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid DTO type for JURY strategy");
        }
        return null;
    }

    @Override
    public Stage createStage(final StageRequest dto) {
        if (dto instanceof StageRequest.JuryStageRequest req) {
            return JuryVoteStage.builder()
                    .weight(req.getWeight())
                    .maxScore(req.getMaxScore())
                    .juryRevealMode(req.getJuryRevealMode())
                    .showJudgeNames(req.getShowJudgeNames())
                    .build();
        }
        throw new IllegalArgumentException("Invalid DTO for JURY strategy");
    }

    @Override
    public void updateStage(UpdateStageRequest dto, Stage stage) {

    }

    @Override
    public StageSettingsResponse runStage(final long stageId) {
        final var stageOpt = stageRepository.findById(stageId);
        if (stageOpt.isEmpty() || !(stageOpt.get() instanceof JuryVoteStage)) {
            throw new IllegalStateException("Invalid stage for JURY strategy");
        }
        final var stage = (JuryVoteStage) stageOpt.get();

        return new JuryVotingSettingsResponse(
                stage.getId(),
                "JURY_VOTE",
                stage.getWeight(),
                stage.getMaxScore(),
                stage.getJuryRevealMode(),
                stage.isShowJudgeNames()
        );
    }

    @Override
    public StageSettingsResponse getSettings(final Stage stage) {
        if (!(stage instanceof JuryVoteStage juryStage)) throw new IllegalStateException("Wrong type");

        return new JuryVotingSettingsResponse(
                juryStage.getId(),
                "JURY_VOTE",
                juryStage.getWeight(),
                juryStage.getMaxScore(),
                juryStage.getJuryRevealMode(),
                juryStage.isShowJudgeNames()
        );
    }

    @Override
    public Map<UUID, Double> finishStage(final Stage stage) {
        if (!(stage instanceof JuryVoteStage juryStage)) throw new IllegalStateException("Wrong type");

        final double weight = juryStage.getWeight();
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
                            int score = vote.getScore() != null ? vote.getScore() : 0;
                            return score * weight;
                        })
                ));
    }

}
