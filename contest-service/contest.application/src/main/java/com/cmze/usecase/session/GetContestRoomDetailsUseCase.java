package com.cmze.usecase.session;

import com.cmze.entity.Participant;
import com.cmze.enums.ContestStatus;
import com.cmze.repository.ContestRepository;
import com.cmze.repository.ParticipantRepository;
import com.cmze.repository.RoomRepository;
import com.cmze.response.GetContestRoomDetailsResponse;
import com.cmze.response.stagesettings.StageSettingsResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.StageSettingsContext;
import com.cmze.spi.leadboard.ContestLeaderboardEntryDto;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@UseCase
public class GetContestRoomDetailsUseCase {

    private static final Logger logger = LoggerFactory.getLogger(GetContestRoomDetailsUseCase.class);

    private final ContestRepository contestRepository;
    private final RoomRepository roomRepository;
    private final ParticipantRepository participantRepository;
    private final StageSettingsContext stageContext;

    public GetContestRoomDetailsUseCase(final ContestRepository contestRepository,
                                        final RoomRepository roomRepository,
                                        final ParticipantRepository participantRepository,
                                        final StageSettingsContext stageContext) {
        this.contestRepository = contestRepository;
        this.roomRepository = roomRepository;
        this.participantRepository = participantRepository;
        this.stageContext = stageContext;
    }

    @Transactional(readOnly = true)
    public ActionResult<GetContestRoomDetailsResponse> execute(final Long contestId, final UUID userId) {
        try {
            final var contestOpt = contestRepository.findById(contestId);
            if (contestOpt.isEmpty()){
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.NOT_FOUND, "Contest not found"
                ));
            }

            final var contest = contestOpt.get();

            if (contest.getStatus() == ContestStatus.FINISHED) {

                final var leaderBoard = calculateLeaderboard(contestId);

                final var response = new GetContestRoomDetailsResponse(
                        "FINISHED",
                        false,
                        null,
                        null,
                        leaderBoard,
                        null
                );
                return ActionResult.success(response);
            }

            final var roomOpt = roomRepository.findByContest_Id(contestId);
            if (roomOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.NOT_FOUND, "Live Room not found (Session not started)"
                ));
            }
            final var room = roomOpt.get();

            StageSettingsResponse settings = null;
            Long currentStageId = null;

            final int currentPos = room.getCurrentStagePosition() != null ? room.getCurrentStagePosition() : 0;

            if (currentPos > 0) {
                final var currentStage = room.getContest().getStages().stream()
                        .filter(s -> s.getPosition() == currentPos)
                        .findFirst()
                        .orElse(null);

                if (currentStage != null) {
                    currentStageId = currentStage.getId();
                    settings = stageContext.getSettings(currentStage);
                }
            }

            final var leaderBoard = calculateLeaderboard(contestId);

            final var response = new GetContestRoomDetailsResponse(
                    room.getId(),
                    room.isActive(),
                    currentPos,
                    currentStageId,
                    leaderBoard,
                    settings
            );

            return ActionResult.success(response);

        } catch (NumberFormatException e) {
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid contest ID"));
        } catch (Exception e) {
            logger.error("Failed to get room details for contest {}", contestId, e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching room details"));
        }
    }

    private List<ContestLeaderboardEntryDto> calculateLeaderboard(Long contestId) {
        List<Participant> participants = participantRepository.findAllByContest_Id(contestId);

        List<ContestLeaderboardEntryDto> leaderboard = participants.stream()
                .sorted(Comparator.comparingLong(Participant::getTotalScore).reversed())
                .map(p -> new ContestLeaderboardEntryDto(
                        p.getUserId(),
                        p.getDisplayName(),
                        p.getTotalScore(),
                        0
                ))
                .collect(Collectors.toList());

        for (int i = 0; i < leaderboard.size(); i++) {
            leaderboard.get(i).setRank(i + 1);
        }

        return leaderboard;
    }
}
