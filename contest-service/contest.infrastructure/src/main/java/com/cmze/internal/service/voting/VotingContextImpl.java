package com.cmze.internal.service.voting;

import com.cmze.entity.Contest;
import com.cmze.entity.Stage;
import com.cmze.enums.ContestStatus;
import com.cmze.enums.StageType;
import com.cmze.internal.service.voting.strategy.VotingStrategy;
import com.cmze.repository.*;
import com.cmze.request.VoteRequest;
import com.cmze.shared.ActionResult;
import com.cmze.spi.VotingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class VotingContextImpl implements VotingContext {

    private static final Logger logger = LoggerFactory.getLogger(VotingContextImpl.class);

    private final Map<StageType, VotingStrategy> strategies;
    private final ContestRepository contestRepository;
    private final StageRepository stageRepository;
    private final SubmissionRepository submissionRepository;
    private final ParticipantRepository participantRepository;
    private final RoomRepository roomRepository;

    public VotingContextImpl(List<VotingStrategy> strategyList,
                             ContestRepository contestRepository,
                             StageRepository stageRepository,
                             SubmissionRepository submissionRepository,
                             ParticipantRepository participantRepository,
                             RoomRepository roomRepository) {
        this.strategies = strategyList.stream()
                .collect(Collectors.toMap(
                        VotingStrategy::getStageType,
                        Function.identity(),
                        (a, b) -> a,
                        () -> new EnumMap<>(StageType.class)
                ));
        this.contestRepository = contestRepository;
        this.stageRepository = stageRepository;
        this.submissionRepository = submissionRepository;
        this.participantRepository = participantRepository;
        this.roomRepository = roomRepository;
    }

    @Override
    public ActionResult<Void> executeVote(Long contestId, UUID userId, VoteRequest request) {
        try {
            Contest contest = contestRepository.findById(contestId)
                    .orElseThrow(() -> new IllegalArgumentException("Contest not found"));

            if (contest.getStatus() != ContestStatus.ACTIVE) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Contest is not active."));
            }

            Stage stage = stageRepository.findById(request.getStageId())
                    .orElseThrow(() -> new IllegalArgumentException("Stage not found"));

            if (!stage.getContest().getId().equals(contestId)) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Stage does not belong to contest"));
            }

            var roomOpt = roomRepository.findByContest_Id(contestId);
            if (roomOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Live room not started"));
            }
            var room = roomOpt.get();

            if (stage.getPosition() != room.getCurrentStagePosition()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,
                        "This stage is not currently active (Active pos: " + room.getCurrentStagePosition() + ")"));
            }

            var voter = participantRepository.findByContestIdAndUserId(contestId, userId.toString())
                    .orElseThrow(() -> new IllegalStateException("User is not a participant"));

            var submission = submissionRepository.findByIdAndContest_Id(request.getSubmissionId(), contestId)
                    .orElseThrow(() -> new IllegalArgumentException("Submission not found in this contest"));

            VotingStrategy strategy = strategies.get(stage.getType());
            if (strategy == null) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Voting not supported for stage type: " + stage.getType()));
            }

            strategy.vote(stage, voter, submission, request.getScore());

            return ActionResult.success(null);

        } catch (IllegalArgumentException | IllegalStateException e) {
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage()));
        } catch (Exception e) {
            logger.error("Voting failed", e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Internal voting error"));
        }
    }

}
