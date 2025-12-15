package com.cmze.usecase.session;

import com.cmze.entity.Stage;
import com.cmze.enums.ContestStatus;
import com.cmze.repository.ContestRepository;
import com.cmze.repository.RoomRepository;
import com.cmze.response.stagesettings.StageSettingsResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.StageSettingsContext;
import com.cmze.usecase.UseCase;
import com.cmze.ws.event.ContestStageChangedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.Comparator;
import java.util.UUID;

@UseCase
public class StartContestUseCase {

    private static final Logger logger = LoggerFactory.getLogger(StartContestUseCase.class);

    private final ContestRepository contestRepository;
    private final RoomRepository roomRepository;
    private final StageSettingsContext stageContext;
    private final ApplicationEventPublisher eventPublisher;

    public StartContestUseCase(final ContestRepository contestRepository,
                               final RoomRepository roomRepository,
                               final StageSettingsContext stageContext,
                               final ApplicationEventPublisher eventPublisher) {
        this.contestRepository = contestRepository;
        this.roomRepository = roomRepository;
        this.stageContext = stageContext;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ActionResult<StageSettingsResponse> execute(final Long contestId, final String roomId, final UUID organizerId) {
        try {
            final var contest = contestRepository.findById(contestId)
                    .orElseThrow(() -> new RuntimeException("Contest not found"));

            if (!contest.getOrganizerId().equals(organizerId.toString())) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Not organizer"));
            }

            if (contest.getStatus() == ContestStatus.FINISHED) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Contest is already finished"));
            }

            final var roomOpt = roomRepository.findByContest_Id(contestId);
            if (roomOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Live Room (Lobby) not created. Host must open the room first."));
            }
            final var liveRoom = roomOpt.get();

            final var firstStage = contest.getStages().stream()
                    .min(Comparator.comparingInt(Stage::getPosition))
                    .orElse(null);

            if (firstStage == null) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Cannot start contest: No stages defined"));
            }

            logger.info("Starting contest {} with first stage: {}", contestId, firstStage.getName());

            final var stageResponse = stageContext.runStage(firstStage.getId(), firstStage.getType());

            liveRoom.setCurrentStagePosition(firstStage.getPosition());
            roomRepository.save(liveRoom);

            eventPublisher.publishEvent(new ContestStageChangedEvent(
                    contestId,
                    firstStage.getId(),
                    firstStage.getName(),
                    firstStage.getType()
            ));

            return ActionResult.success(stageResponse);

        } catch (Exception e) {
            logger.error("Failed to start contest", e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Error starting contest"));
        }
    }
}


