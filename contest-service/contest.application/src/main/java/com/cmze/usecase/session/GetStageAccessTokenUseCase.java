package com.cmze.usecase.session;

import com.cmze.entity.Stage;
import com.cmze.entity.stagesettings.QuizStage;
import com.cmze.entity.stagesettings.SurveyStage;
import com.cmze.exception.ExternalStageFinishedException;
import com.cmze.exception.ExternalStageNotFoundException;
import com.cmze.repository.ContestRepository;
import com.cmze.repository.ParticipantRepository;
import com.cmze.repository.RoomRepository;
import com.cmze.repository.StageRepository;
import com.cmze.shared.ActionResult;
import com.cmze.spi.InvitationContext;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@UseCase
public class GetStageAccessTokenUseCase {

    private static final Logger logger = LoggerFactory.getLogger(GetStageAccessTokenUseCase.class);

    private final StageRepository stageRepository;
    private final RoomRepository roomRepository;
    private final ContestRepository contestRepository;
    private final ParticipantRepository participantRepository;
    private final InvitationContext invitationContext;

    public GetStageAccessTokenUseCase(final StageRepository stageRepository,
                                    final RoomRepository roomRepository,
                                    final ContestRepository contestRepository,
                                    final ParticipantRepository participantRepository,
                                    final InvitationContext invitationContext) {
        this.stageRepository = stageRepository;
        this.roomRepository = roomRepository;
        this.contestRepository = contestRepository;
        this.participantRepository = participantRepository;
        this.invitationContext = invitationContext;
    }

    @Transactional(readOnly = true)
    public ActionResult<String> execute(final Long contestId, final String activeRoomId, final UUID userId) {
        try {
            final var contest = contestRepository.findById(contestId)
                    .orElseThrow(() -> new RuntimeException("Contest not found"));

            final var room = roomRepository.findById(activeRoomId)
                    .orElseThrow(() -> new RuntimeException("Live Room not found"));

            if (!room.getContest().getId().equals(contestId)) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.BAD_REQUEST, "Room does not belong to this contest"
                ));
            }

            Integer currentPosition = room.getCurrentStagePosition();
            if (currentPosition == null || currentPosition <= 0) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.CONFLICT, "No active stage in this room (Lobby/Intermission)"
                ));
            }

            Stage foundStage = contest.getStages().stream()
                    .filter(s -> s.getPosition() == currentPosition)
                    .findFirst()
                    .orElse(null);

            if (foundStage == null) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.NOT_FOUND, "Stage configuration not found for position: " + currentPosition
                ));
            }

            boolean isParticipant = participantRepository.findByContestIdAndUserId(
                    contestId,
                    userId.toString()
            ).isPresent();

            boolean isOrganizer = contest.getOrganizerId().equals(userId.toString());

            if (!isParticipant && !isOrganizer) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.FORBIDDEN, "You are not a participant of this contest"
                ));
            }

            try {
                String token = invitationContext.getInvitationToken(foundStage, userId);

                if (token == null) {
                    return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                            HttpStatus.BAD_REQUEST, "Could not generate token"
                    ));
                }
                return ActionResult.success(token);

            } catch (ExternalStageFinishedException e) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.CONFLICT, // 409
                        "Cannot join stage: The session is already finished."
                ));

            } catch (ExternalStageNotFoundException e) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.NOT_FOUND,
                        "External room not found."
                ));
            }

        } catch (RuntimeException e) {
            if ("Contest not found".equals(e.getMessage()) || "Live Room not found".equals(e.getMessage())) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage()));
            }
            logger.error("Runtime error in GetStageAccessUrlUseCase", e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Error processing request"
            ));
        } catch (Exception e) {
            logger.error("Unexpected error", e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error"
            ));
        }
    }
}
