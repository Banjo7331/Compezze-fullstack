package com.cmze.internal.service.stagesettings.strategy.impl;

import com.cmze.entity.Stage;
import com.cmze.entity.stagesettings.QuizStage;
import com.cmze.enums.StageType;
import com.cmze.internal.service.stagesettings.strategy.StageSettingsStrategy;
import com.cmze.repository.StageRepository;
import com.cmze.request.StageRequest;
import com.cmze.request.UpdateStageRequest;
import com.cmze.response.stagesettings.QuizSettingsResponse;
import com.cmze.response.stagesettings.StageSettingsResponse;
import com.cmze.spi.quiz.QuizServiceClient;
import com.cmze.spi.quiz.dto.CreateQuizRoomRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class QuizStageSettingsStrategy implements StageSettingsStrategy {

    private final QuizServiceClient quizClient;
    private final StageRepository stageRepository;

    public QuizStageSettingsStrategy(QuizServiceClient quizClient, StageRepository stageRepository){
        this.quizClient = quizClient;
        this.stageRepository = stageRepository;
    }

    @Override
    public StageType type() {
        return StageType.QUIZ;
    }

    @Override
    public ProblemDetail validate(final StageRequest dto) {
        if (!(dto instanceof StageRequest.QuizStageRequest surveyDto)) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid DTO type for QUIZ");
        }
        if (surveyDto.getQuizFormId() == null) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "QUIZ Form ID is required");
        }
        return null;
    }

    @Override
    public Stage createStage(final StageRequest dto) {
        if (dto instanceof StageRequest.QuizStageRequest quizDto) {
            return QuizStage.builder()
                    .quizFormId(quizDto.getQuizFormId())
                    .weight(quizDto.getWeight())
                    .maxParticipants(quizDto.getMaxParticipants())
                    .timePerQuestion(quizDto.getTimePerQuestion())
                    .build();
        }
        throw new IllegalArgumentException("Invalid DTO for Quiz Strategy");
    }

    @Override
    public void updateStage(UpdateStageRequest dto, Stage stage) {
        if (!(stage instanceof QuizStage quizStage)) throw new IllegalStateException("Type mismatch");
        if (!(dto instanceof UpdateStageRequest.UpdateQuizStageRequest req)) throw new IllegalArgumentException("DTO mismatch");

        if (req.getQuizFormId() != null) quizStage.setQuizFormId(req.getQuizFormId());
        if (req.getWeight() != null) quizStage.setWeight(req.getWeight());
        if (req.getMaxParticipants() != null) quizStage.setMaxParticipants(req.getMaxParticipants());
        if (req.getTimePerQuestion() != null) quizStage.setTimePerQuestion(req.getTimePerQuestion());

    }

    @Override
    public StageSettingsResponse runStage(final long stageId) {
        final var stageOpt = stageRepository.findById(stageId);
        if (stageOpt.isEmpty() || !(stageOpt.get() instanceof QuizStage)) {
            throw new IllegalStateException("Invalid stage for QUIZ strategy");
        }
        final var stage = (QuizStage) stageOpt.get();

        if (stage.getActiveRoomId() != null) {
            return new QuizSettingsResponse(
                    stage.getId(),
                    "QUIZ",
                    stage.getQuizFormId(),
                    stage.getWeight(),
                    stage.getMaxParticipants(),
                    stage.getTimePerQuestion(),
                    stage.getActiveRoomId()
            );
        }

        final var request = CreateQuizRoomRequest.builder()
                .quizFormId(stage.getQuizFormId())
                .maxParticipants(stage.getMaxParticipants())
                .timePerQuestion(stage.getTimePerQuestion())
                .isPrivate(true)
                .build();

        try {
            final var response = quizClient.createRoom(request);

            stage.setActiveRoomId(response.getRoomId());
            stageRepository.save(stage);

            return new QuizSettingsResponse(
                    stage.getId(),
                    "QUIZ",
                    stage.getQuizFormId(),
                    stage.getWeight(),
                    stage.getMaxParticipants(),
                    stage.getTimePerQuestion(),
                    response.getRoomId()
            );
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to start remote Quiz room", e);
        }
    }

    @Override
    public StageSettingsResponse getSettings(final Stage stage) {
        if (!(stage instanceof QuizStage quizStage)) throw new IllegalStateException("Wrong type");

        return new QuizSettingsResponse(
                quizStage.getId(),
                "QUIZ",
                quizStage.getQuizFormId(),
                quizStage.getWeight(),
                quizStage.getMaxParticipants(),
                quizStage.getTimePerQuestion(),
                quizStage.getActiveRoomId()
        );
    }

    @Override
    public Map<UUID, Double> finishStage(final Stage stage) {
        if (!(stage instanceof QuizStage quizStage)) throw new IllegalStateException("Wrong type");

        final String roomId = quizStage.getActiveRoomId();
        if (roomId == null) {
            return Collections.emptyMap();
        }

        try {
            quizClient.closeRoom(roomId);

            final var roomDetails = quizClient.getRoomDetails(roomId);

            final Map<UUID, Double> results = new HashMap<>();
            final double weight = quizStage.getWeight();

            if (roomDetails != null
                    && roomDetails.getCurrentResults() != null
                    && roomDetails.getCurrentResults().getLeaderboard() != null) {

                for (final var entry : roomDetails.getCurrentResults().getLeaderboard()) {
                    double finalScore = entry.getScore() * weight;

                    results.put(entry.getUserId(), finalScore);
                }
            }

            return results;

        } catch (Exception e) {
            throw new RuntimeException("Failed to finish remote quiz room and collect results", e);
        }
    }
}
