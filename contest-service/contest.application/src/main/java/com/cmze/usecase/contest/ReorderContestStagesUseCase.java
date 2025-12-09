package com.cmze.usecase.contest;

import com.cmze.entity.Stage;
import com.cmze.repository.ContestRepository;
import com.cmze.request.ReorderStagesRequest;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@UseCase
public class ReorderContestStagesUseCase {

    private static final Logger logger = LoggerFactory.getLogger(ReorderContestStagesUseCase.class);

    private final ContestRepository contestRepository;

    public ReorderContestStagesUseCase(final ContestRepository contestRepository) {
        this.contestRepository = contestRepository;
    }

    @Transactional
    public ActionResult<Void> execute(final Long contestId, final ReorderStagesRequest request, final UUID organizerId) {
        try {
            final var contestOpt = contestRepository.findById(contestId);

            if (contestOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Contest not found"));
            }
            final var contest = contestOpt.get();

            if (!contest.getOrganizerId().equals(organizerId.toString())) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Not authorized to modify this contest"));
            }

            final var currentStages = contest.getStages();

            if (currentStages.size() != request.getStageIds().size()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.BAD_REQUEST,
                        "Mismatch in stage count. Expected " + currentStages.size() + ", got " + request.getStageIds().size()
                ));
            }

            final var stagesMap = currentStages.stream()
                    .collect(Collectors.toMap(Stage::getId, Function.identity()));

            int newPosition = 1;

            for (final Long stageId : request.getStageIds()) {
                final var stage = stagesMap.get(stageId);

                if (stage == null) {
                    return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                            HttpStatus.BAD_REQUEST,
                            "Stage with ID " + stageId + " does not belong to contest " + contestId
                    ));
                }

                stage.setPosition(newPosition++);
            }

            contestRepository.save(contest);

            logger.info("Reordered stages for contest {}", contestId);
            return ActionResult.success(null);

        } catch (Exception e) {
            logger.error("Failed to reorder stages for contest {}", contestId, e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred while reordering stages."
            ));
        }
    }
}