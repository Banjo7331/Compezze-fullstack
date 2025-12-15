package com.cmze.internal.service.stagesettings.strategy.impl;

import com.cmze.entity.Stage;
import com.cmze.entity.Submission;
import com.cmze.entity.stagesettings.PublicVoteStage;
import com.cmze.enums.StageType;
import com.cmze.external.redis.VoteRedisService;
import com.cmze.internal.service.stagesettings.strategy.StageSettingsStrategy;
import com.cmze.repository.StageRepository;
import com.cmze.repository.SubmissionRepository;
import com.cmze.request.StageRequest;
import com.cmze.request.UpdateStageRequest;
import com.cmze.response.stagesettings.PublicVotingSettingsResponse;
import com.cmze.response.stagesettings.StageSettingsResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class PublicStageSettingsStrategy implements StageSettingsStrategy {

    private final StageRepository stageRepository;
    private final SubmissionRepository submissionRepository;
    private final VoteRedisService voteRedisService;

    public PublicStageSettingsStrategy(final StageRepository stageRepository,
                                       final SubmissionRepository submissionRepository,
                                       final VoteRedisService voteRedisService) {
        this.stageRepository = stageRepository;
        this.submissionRepository = submissionRepository;
        this.voteRedisService = voteRedisService;
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
        if (!(stage instanceof PublicVoteStage publicStage)) {
            throw new IllegalStateException("Wrong type for PublicVotingStrategy");
        }
        final double weight = publicStage.getWeight();

        Map<String, Double> rawScores = voteRedisService.getAllScores(stage.getId());

        if (rawScores.isEmpty()) {
            return Collections.emptyMap();
        }

        List<Submission> submissions = submissionRepository.findAllByIdIn(rawScores.keySet());

        return submissions.stream()
                .collect(Collectors.toMap(
                        submission -> UUID.fromString(submission.getParticipant().getUserId()),
                        submission -> {
                            Double rawScore = rawScores.getOrDefault(submission.getId(), 0.0);
                            return rawScore * weight;
                        },
                        Double::sum
                ));
    }

}
