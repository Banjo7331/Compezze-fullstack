package com.cmze.usecase.session;

import com.cmze.enums.ContestStatus;
import com.cmze.repository.ContestRepository;
import com.cmze.repository.ParticipantRepository;
import com.cmze.repository.RoomRepository;
import com.cmze.shared.ActionResult;
import com.cmze.spi.StageSettingsContext;
import com.cmze.usecase.UseCase;
import com.cmze.ws.event.ContestFinishedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.time.LocalDateTime;
import java.util.UUID;

@UseCase
public class CloseContestUseCase {

    private static final Logger logger = LoggerFactory.getLogger(CloseContestUseCase.class);

    private final ContestRepository contestRepository;
    private final RoomRepository roomRepository;
    private final ParticipantRepository participantRepository;
    private final StageSettingsContext stageContext;
    private final ApplicationEventPublisher eventPublisher;

    public CloseContestUseCase(final ContestRepository contestRepository,
                                   final RoomRepository roomRepository,
                                   final ParticipantRepository participantRepository,
                                   final StageSettingsContext stageContext,
                                   final ApplicationEventPublisher eventPublisher) {
        this.contestRepository = contestRepository;
        this.roomRepository = roomRepository;
        this.participantRepository = participantRepository;
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

            final var roomOpt = roomRepository.findByContest_Id(contestId);
            if (roomOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Live Room not found."));
            }
            final var room = roomOpt.get();

            final int currentPosition = room.getCurrentStagePosition() != null ? room.getCurrentStagePosition() : 0;

            if (currentPosition > 0) {
                final var currentStage = contest.getStages().stream()
                        .filter(s -> s.getPosition() == currentPosition)
                        .findFirst()
                        .orElse(null);

                if (currentStage != null) {
                    logger.info("Closing contest while stage active (Position: {}, Name: {}). Finishing stage...", currentPosition, currentStage.getName());
                    try {
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
                    } catch (Exception e) {
                        logger.error("Failed to gracefully finish stage during contest close. Ignoring to force close.", e);
                    }
                }
            }

            contest.setStatus(ContestStatus.FINISHED);
            contestRepository.save(contest);

            room.setActive(false);
            room.setClosedAt(LocalDateTime.now());
            roomRepository.save(room);

            logger.info("Contest {} closed by organizer {}", contestId, organizerId);

            eventPublisher.publishEvent(new ContestFinishedEvent(contestId));

            return ActionResult.success(null);

        } catch (Exception e) {
            logger.error("Error closing contest room", e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Error closing contest"));
        }
    }
}