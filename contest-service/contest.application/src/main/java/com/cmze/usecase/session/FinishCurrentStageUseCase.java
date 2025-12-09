package com.cmze.usecase.session;

import com.cmze.repository.ContestRepository;
import com.cmze.repository.ParticipantRepository;
import com.cmze.repository.RoomRepository;
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

import java.util.UUID;

@UseCase
public class FinishCurrentStageUseCase {

    private static final Logger logger = LoggerFactory.getLogger(FinishCurrentStageUseCase.class);

    private final ContestRepository contestRepository;
    private final ParticipantRepository participantRepository;
    private final RoomRepository roomRepository;
    private final StageSettingsContext stageContext;
    private final ApplicationEventPublisher eventPublisher;

    public FinishCurrentStageUseCase(final ContestRepository contestRepository,
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
    public ActionResult<Void> execute(final Long contestId, final UUID organizerId) {
        try {
            final var contest = contestRepository.findById(contestId)
                    .orElseThrow(() -> new RuntimeException("Contest not found"));

            if (!contest.getOrganizerId().equals(organizerId.toString())) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Not organizer"));
            }

            final var liveRoomOpt = roomRepository.findByContest_Id(contestId);
            if (liveRoomOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Live Room not created."));
            }
            final var liveRoom = liveRoomOpt.get();

            final int currentPosition = liveRoom.getCurrentStagePosition() != null ? liveRoom.getCurrentStagePosition() : 0;

            if (currentPosition <= 0) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "No active stage to finish (already in lobby/intermission?)"));
            }

            final var currentStage = contest.getStages().stream()
                    .filter(s -> s.getPosition() == currentPosition)
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("Active stage position " + currentPosition + " not found in stages list"));

            logger.info("Finishing stage: {}", currentStage.getName());

            final var scores = stageContext.finishStage(currentStage);

            if (!scores.isEmpty()) {
                scores.forEach((userId, points) -> {
                    participantRepository.findByContestIdAndUserId(contestId, userId.toString())
                            .ifPresent(p -> {
                                p.setTotalScore(p.getTotalScore() + points.longValue());
                                participantRepository.save(p);
                            });
                });
                logger.info("Updated scores for {} participants", scores.size());
            }


            eventPublisher.publishEvent(new ContestStageChangedEvent(
                    contestId,
                    null,
                    "PRZERWA / WYNIKI",
                    null
            ));

            return ActionResult.success(null);

        } catch (Exception e) {
            logger.error("Error finishing stage for contest {}", contestId, e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Error finishing stage"));
        }
    }
}
