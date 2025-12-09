package com.cmze.usecase.session;

import com.cmze.repository.RoomRepository;
import com.cmze.response.GetContestRoomDetailsResponse;
import com.cmze.response.stagesettings.StageSettingsResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.StageSettingsContext;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@UseCase
public class GetContestRoomDetailsUseCase {

    private static final Logger logger = LoggerFactory.getLogger(GetContestRoomDetailsUseCase.class);

    private final RoomRepository roomRepository;
    private final StageSettingsContext stageContext;

    public GetContestRoomDetailsUseCase(final RoomRepository roomRepository,
                                        final StageSettingsContext stageContext) {
        this.roomRepository = roomRepository;
        this.stageContext = stageContext;
    }

    @Transactional(readOnly = true)
    public ActionResult<GetContestRoomDetailsResponse> execute(final Long contestId, final UUID userId) {
        try {
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

            final var response = new GetContestRoomDetailsResponse(
                    room.getId(),
                    room.isActive(),
                    currentPos,
                    currentStageId,
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
}
