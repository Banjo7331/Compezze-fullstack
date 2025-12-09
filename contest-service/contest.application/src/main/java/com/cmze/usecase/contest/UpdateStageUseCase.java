package com.cmze.usecase.contest;

import com.cmze.repository.StageRepository;
import com.cmze.request.UpdateStageRequest;
import com.cmze.response.UpdateStageResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.StageSettingsContext;
import com.cmze.usecase.UseCase;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.UUID;

@UseCase
public class UpdateStageUseCase {

    private static final Logger logger = LoggerFactory.getLogger(UpdateStageUseCase.class);

    private final StageRepository stageRepository;
    private final StageSettingsContext stageContext;

    public UpdateStageUseCase(final StageRepository stageRepository,
                              final StageSettingsContext stageContext) {
        this.stageRepository = stageRepository;
        this.stageContext = stageContext;
    }

    @Transactional
    public ActionResult<UpdateStageResponse> execute(final Long contestId,
                                                     final Long stageId,
                                                     final UUID organizerId,
                                                     final UpdateStageRequest req) {
        try {
            final var stageOpt = stageRepository.findById(stageId);
            if (stageOpt.isEmpty()) return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Stage not found."));

            final var stage = stageOpt.get();

            if (stage.getContest() == null || !contestId.equals(stage.getContest().getId())) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Stage does not belong to this contest."));
            }

            if (!stage.getContest().getOrganizerId().equals(organizerId.toString())) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Not the organizer."));
            }

            if (req.getName() != null) stage.setName(req.getName());
            if (req.getDurationMinutes() != null) stage.setDurationMinutes(req.getDurationMinutes());

            stageContext.updateStage(req, stage);

            stageRepository.save(stage);
            logger.info("Stage {} updated by organizer {}", stageId, organizerId);

            return ActionResult.success(new UpdateStageResponse(stage.getId()));

        } catch (Exception e) {
            logger.error("Failed to update stage {}", stageId, e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Error updating stage"));
        }
    }
}
