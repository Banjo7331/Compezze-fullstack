package com.cmze.usecase.contest;

import com.cmze.entity.Submission;
import com.cmze.repository.ContestRepository;
import com.cmze.repository.ParticipantRepository;
import com.cmze.repository.SubmissionRepository;
import com.cmze.response.GetContestParticipantResponse;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@UseCase
public class GetContestParticipantsUseCase {

    private static final Logger logger = LoggerFactory.getLogger(GetContestParticipantsUseCase.class);
    private final ParticipantRepository participantRepository;
    private final SubmissionRepository submissionRepository;
    private final ContestRepository contestRepository;

    public GetContestParticipantsUseCase(final ParticipantRepository participantRepository,
                                         final SubmissionRepository submissionRepository,
                                         final ContestRepository contestRepository) {
        this.participantRepository = participantRepository;
        this.submissionRepository = submissionRepository;
        this.contestRepository = contestRepository;
    }

    @Transactional(readOnly = true)
    public ActionResult<List<GetContestParticipantResponse>> execute(final Long contestId) {
        try {
            final var contest = contestRepository.findById(contestId);
            if (contest.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Contest not found"));
            }

            final var participants = participantRepository.findAllByContest_Id(contestId);

            final var dtoList = participants.stream()
                    .map(p -> {
                        var submissionOpt = submissionRepository.findByContest_IdAndParticipantId(contestId, p.getId());

                        String subId = submissionOpt.map(Submission::getId).orElse(null);
                        String subStatus = submissionOpt.map(s -> s.getStatus().name()).orElse(null);

                        return new GetContestParticipantResponse(
                                p.getId(),
                                p.getUserId(),
                                p.getDisplayName(),
                                p.getRoles(),
                                subId,
                                subStatus
                        );
                    })
                    .collect(Collectors.toList());

            return ActionResult.success(dtoList);

        } catch (NumberFormatException e) {
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid contest ID"));
        } catch (Exception e) {
            logger.error("Failed to fetch participants for contest {}", contestId, e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching participants"));
        }
    }
}
