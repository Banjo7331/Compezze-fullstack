package com.cmze.usecase.session;

import com.cmze.entity.Room;
import com.cmze.enums.ContestStatus;
import com.cmze.repository.ContestRepository;
import com.cmze.repository.ParticipantRepository;
import com.cmze.repository.RoomRepository;
import com.cmze.response.CreateRoomResponse;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;


@UseCase
public class CreateContestRoomUseCase {

    private static final Logger logger = LoggerFactory.getLogger(CreateContestRoomUseCase.class);

    private final ContestRepository contestRepository;
    private final RoomRepository roomRepository;
    private final ParticipantRepository participantRepository;

    public CreateContestRoomUseCase(final ContestRepository contestRepository,
                                    final RoomRepository roomRepository,
                                    final ParticipantRepository participantRepository) {
        this.contestRepository = contestRepository;
        this.roomRepository = roomRepository;
        this.participantRepository = participantRepository;
    }

    @Transactional
    public ActionResult<CreateRoomResponse> execute(final Long contestId, final UUID organizerId) {
        try {
            final var contest = contestRepository.findById(contestId)
                    .orElseThrow(() -> new RuntimeException("Contest not found"));

            if (!contest.getOrganizerId().equals(organizerId.toString())) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Only organizer can open the room"));
            }

            final var existingRoom = roomRepository.findByContest_Id(contestId);
            if (existingRoom.isPresent()) {
                return ActionResult.success(new CreateRoomResponse(
                        existingRoom.get().getId(),
                        existingRoom.get().getRoomKey()
                ));
            }

            final var hostParticipant = participantRepository.findByContestIdAndUserId(contestId, organizerId.toString())
                    .orElseThrow(() -> new IllegalStateException("Host is not a participant (Data integrity error)"));

            contest.setStatus(ContestStatus.ACTIVE);
            contestRepository.save(contest);

            final var room = new Room();
            room.setContest(contest);
            room.setOpenedBy(hostParticipant);
            room.setActive(true);
            room.setCreatedAt(LocalDateTime.now());
            room.setCurrentStagePosition(0);
            room.setRoomKey(generateRoomKey());

            roomRepository.save(room);
            logger.info("Live room created for contest {}", contestId);

            return ActionResult.success(new CreateRoomResponse(room.getId(), room.getRoomKey()));

        } catch (Exception e) {
            logger.error("Failed to create room", e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating room"));
        }
    }

    private String generateRoomKey() {
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
