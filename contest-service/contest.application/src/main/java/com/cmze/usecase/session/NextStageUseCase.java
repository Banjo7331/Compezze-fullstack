package com.cmze.usecase.session;

import com.cmze.entity.Stage;
import com.cmze.enums.ContestStatus;
import com.cmze.repository.ContestRepository;
import com.cmze.repository.ParticipantRepository;
import com.cmze.repository.RoomRepository;
import com.cmze.response.stagesettings.StageSettingsResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.StageSettingsContext;
import com.cmze.usecase.UseCase;
import com.cmze.ws.event.ContestFinishedEvent;
import com.cmze.ws.event.ContestStageChangedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.Objects;
import java.util.UUID;

@UseCase
public class NextStageUseCase {

    private static final Logger logger = LoggerFactory.getLogger(NextStageUseCase.class);

    private final ContestRepository contestRepository;
    private final ParticipantRepository participantRepository;
    private final RoomRepository roomRepository;
    private final StageSettingsContext stageContext;
    private final ApplicationEventPublisher eventPublisher;

    public NextStageUseCase(final ContestRepository contestRepository,
                            final ParticipantRepository participantRepository,
                            final RoomRepository roomRepository,
                            final StageSettingsContext stageContext,
                            final ApplicationEventPublisher eventPublisher) {
        this.contestRepository = contestRepository;
        this.participantRepository = participantRepository;
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

            final var liveRoomOpt = roomRepository.findByContest_Id(contestId);
            if (liveRoomOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Live Room not created. Open the room first."));
            }
            final var liveRoom = liveRoomOpt.get();
            if (!Objects.equals(roomId, liveRoom.getId())) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Live Room not created. Open the room first."));
            }
            final int currentPosition = liveRoom.getCurrentStagePosition() != null ? liveRoom.getCurrentStagePosition() : 0;

            if (currentPosition > 0) {
                final var currentStage = contest.getStages().stream()
                        .filter(s -> s.getPosition() == currentPosition)
                        .findFirst()
                        .orElse(null);

                if (currentStage != null) {
                    logger.info("Closing active stage: {} (Pos: {})", currentStage.getName(), currentPosition);

                    final var scores = stageContext.finishStage(currentStage);

                    if (!scores.isEmpty()) {
                        scores.forEach((userId, points) -> {
                            participantRepository.findByContestIdAndUserId(contestId, userId.toString())
                                    .ifPresent(p -> {
                                        p.setTotalScore(p.getTotalScore() + points.longValue());
                                        participantRepository.save(p);
                                    });
                        });
                    }
                }
            }

            final var nextStage = contest.getStages().stream()
                    .filter(s -> s.getPosition() > currentPosition)
                    .min(Comparator.comparingInt(Stage::getPosition))
                    .orElse(null);

            if (nextStage == null) {
                logger.info("No more stages. Finishing contest {}", contestId);

                contest.setStatus(ContestStatus.FINISHED);
                contestRepository.save(contest);

                liveRoom.setActive(false);
                liveRoom.setClosedAt(java.time.LocalDateTime.now());
                roomRepository.save(liveRoom);

                eventPublisher.publishEvent(new ContestFinishedEvent(contestId));

                return ActionResult.success(null);
            }

            logger.info("Starting next stage: {} (Pos: {})", nextStage.getName(), nextStage.getPosition());

            final var stageResponse = stageContext.runStage(nextStage.getId(), nextStage.getType());

            contest.setStatus(ContestStatus.ACTIVE);
            contestRepository.save(contest);

            liveRoom.setCurrentStagePosition(nextStage.getPosition());
            roomRepository.save(liveRoom);

            eventPublisher.publishEvent(new ContestStageChangedEvent(
                    contestId,
                    nextStage.getId(),
                    nextStage.getName(),
                    nextStage.getType()
            ));

            return ActionResult.success(stageResponse);

        } catch (ResponseStatusException e) {
            logger.warn("Business error during stage transition: {}", e.getMessage());
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(e.getStatusCode(), e.getReason()));

        } catch (Exception e) {
            logger.error("Error transitioning to next stage", e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Error transitioning stage"));
        }
    }
}
