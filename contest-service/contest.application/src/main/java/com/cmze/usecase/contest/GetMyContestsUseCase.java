package com.cmze.usecase.contest;

import com.cmze.entity.Contest;
import com.cmze.entity.Participant;
import com.cmze.enums.ContestStatus;
import com.cmze.repository.ContestRepository;
import com.cmze.repository.ParticipantRepository;
import com.cmze.response.GetMyContestResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.leadboard.ContestLeaderboardEntryDto;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@UseCase
public class GetMyContestsUseCase {

    private static final Logger logger = LoggerFactory.getLogger(GetMyContestsUseCase.class);

    private final ContestRepository contestRepository;
    private final ParticipantRepository participantRepository;

    public GetMyContestsUseCase(final ContestRepository contestRepository,
                                final ParticipantRepository participantRepository) {
        this.contestRepository = contestRepository;
        this.participantRepository = participantRepository;
    }

    @Transactional(readOnly = true)
    public ActionResult<Page<GetMyContestResponse>> execute(final UUID userId, final Pageable pageable) {
        try {
            final var contestsPage = contestRepository.findAllByOrganizerId(userId.toString(), pageable);

            final var dtoPage = contestsPage.map(this::mapToDto);

            return ActionResult.success(dtoPage);

        } catch (Exception e) {
            logger.error("Failed to fetch contests for organizer {}", userId, e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error fetching contest history"
            ));
        }
    }

    private GetMyContestResponse mapToDto(final Contest contest) {
        final var stageDtos = contest.getStages().stream()
                .map(s -> new GetMyContestResponse.SimpleStageDto(s.getId(), s.getType(), s.getPosition()))
                .toList();

        List<ContestLeaderboardEntryDto> leaderboard = new ArrayList<>();

        if (contest.getStatus() == ContestStatus.FINISHED) {
            leaderboard = calculateLeaderboard(contest.getId());
        }

        return new GetMyContestResponse(
                contest.getId(),
                contest.getName(),
                contest.getStartDate(),
                contest.getStatus(),
                stageDtos,
                leaderboard
        );
    }

    private List<ContestLeaderboardEntryDto> calculateLeaderboard(final Long contestId) {
        final var participants = participantRepository.findAllByContest_Id(contestId);

        final var lb = participants.stream()
                .sorted(Comparator.comparingLong(Participant::getTotalScore).reversed())
                .limit(5)
                .map(p -> new ContestLeaderboardEntryDto(
                        p.getUserId(),
                        p.getDisplayName(),
                        p.getTotalScore(),
                        0
                ))
                .collect(Collectors.toList());

        for (int i = 0; i < lb.size(); i++) {
            lb.get(i).setRank(i + 1);
        }
        return lb;
    }
}
