package com.cmze.usecase.contest;

import com.cmze.entity.Stage;
import com.cmze.enums.ContestRole;
import com.cmze.repository.ContestRepository;
import com.cmze.repository.ParticipantRepository;
import com.cmze.response.GetContestDetailsResponse;
import com.cmze.response.GetStageDetailsResponse;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Comparator;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@UseCase
public class GetContestDetailsUseCase {

    private static final Logger logger = LoggerFactory.getLogger(GetContestDetailsUseCase.class);

    private final ContestRepository contestRepository;
    private final ParticipantRepository participantRepository;

    public GetContestDetailsUseCase(final ContestRepository contestRepository,
                                    final ParticipantRepository participantRepository) {
        this.contestRepository = contestRepository;
        this.participantRepository = participantRepository;
    }

    @Transactional(readOnly = true)
    public ActionResult<GetContestDetailsResponse> execute(final Long contestId, final UUID userId) {
        try {
            final var contestOpt = contestRepository.findById(contestId);
            if (contestOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.NOT_FOUND, "Contest not found"
                ));
            }
            final var contest = contestOpt.get();

            boolean isOrganizer = contest.getOrganizerId().equals(userId.toString());

            final var participantOpt = participantRepository.findByContestIdAndUserId(contestId, userId.toString());

            boolean isParticipant = participantOpt.isPresent();

            Set<ContestRole> myRoles = isParticipant ? participantOpt.get().getRoles() : Collections.emptySet();

            long currentParticipantsCount = participantRepository.countByContest_Id(contestId);

            final var stagesDto = contest.getStages().stream()
                    .sorted(Comparator.comparingInt(Stage::getPosition))
                    .map(s -> new GetStageDetailsResponse(
                            s.getId(),
                            s.getName(),
                            s.getType(),
                            s.getDurationMinutes(),
                            s.getPosition()
                    ))
                    .collect(Collectors.toList());



            final var response = new GetContestDetailsResponse(
                    contest.getId().toString(),
                    contest.getName(),
                    contest.getDescription(),
                    contest.getLocation(),
                    contest.getContestCategory(),
                    contest.getStartDate(),
                    contest.getEndDate(),
                    contest.getStatus(),
                    contest.getParticipantLimit() != null ? contest.getParticipantLimit() : 0,
                    contest.isPrivate(),
                    currentParticipantsCount,
                    isOrganizer,
                    isParticipant,
                    myRoles,
                    stagesDto
            );

            return ActionResult.success(response);

        } catch (NumberFormatException e) {
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid ID format"));
        } catch (Exception e) {
            logger.error("Failed to get contest details {}", contestId, e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Error"));
        }
    }
}
