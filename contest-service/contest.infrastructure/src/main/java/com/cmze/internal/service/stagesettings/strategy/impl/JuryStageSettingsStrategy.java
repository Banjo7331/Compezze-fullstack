package com.cmze.internal.service.stagesettings.strategy.impl;

import com.cmze.entity.Stage;
import com.cmze.entity.Submission;
import com.cmze.entity.stagesettings.JuryVoteStage;
import com.cmze.enums.StageType;
import com.cmze.external.redis.VoteRedisService;
import com.cmze.internal.service.stagesettings.strategy.StageSettingsStrategy;
import com.cmze.repository.StageRepository;
import com.cmze.repository.SubmissionRepository;
import com.cmze.request.StageRequest;
import com.cmze.request.UpdateStageRequest;
import com.cmze.response.stagesettings.JuryVotingSettingsResponse;
import com.cmze.response.stagesettings.StageSettingsResponse;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class JuryStageSettingsStrategy implements StageSettingsStrategy {

    private final StageRepository stageRepository;
    private final SubmissionRepository submissionRepository;
    private final VoteRedisService voteRedisService;

    public JuryStageSettingsStrategy(final StageRepository stageRepository,
                                     final SubmissionRepository submissionRepository,
                                     final StringRedisTemplate redisTemplate, VoteRedisService voteRedisService) {
        this.stageRepository = stageRepository;
        this.submissionRepository = submissionRepository;
        this.voteRedisService = voteRedisService;
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
        if (!(stage instanceof JuryVoteStage juryStage)) {
            throw new IllegalStateException("Wrong type for JuryVotingStrategy");
        }
        final double weight = juryStage.getWeight();

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
