package com.cmze.usecase.participant;

import com.cmze.repository.ContestRepository;
import com.cmze.repository.ParticipantRepository;
import com.cmze.request.ManageRoleRequest;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.UUID;

@UseCase
public class ManageContestRolesUseCase {

    private static final Logger logger = LoggerFactory.getLogger(ManageContestRolesUseCase.class);

    private final ContestRepository contestRepository;
    private final ParticipantRepository participantRepository;

    public ManageContestRolesUseCase(final ContestRepository contestRepository,
                                     final ParticipantRepository participantRepository) {
        this.contestRepository = contestRepository;
        this.participantRepository = participantRepository;
    }

    @Transactional
    public ActionResult<Void> execute(final Long contestId,
                                      final UUID organizerId,
                                      final ManageRoleRequest request) {
        try {
            final var contestOpt = contestRepository.findById(contestId);
            if (contestOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Contest not found"));
            }
            final var contest = contestOpt.get();

            if (!contest.getOrganizerId().equals(organizerId.toString())) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.FORBIDDEN, "Only the organizer can manage roles."
                ));
            }

            final var participantOpt = participantRepository.findByContestIdAndUserId(contestId, request.getTargetUserId().toString());

            if (participantOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.NOT_FOUND, "Target user is not a participant of this contest."
                ));
            }
            final var participant = participantOpt.get();

            if (request.isAssign()) {
                participant.getRoles().add(request.getRole());
                logger.info("Role {} assigned to user {} in contest {}", request.getRole(), request.getTargetUserId(), contestId);
            } else {
                participant.getRoles().remove(request.getRole());
                logger.info("Role {} removed from user {} in contest {}", request.getRole(), request.getTargetUserId(), contestId);
            }

            participantRepository.save(participant);

            return ActionResult.success(null);

        } catch (NumberFormatException e) {
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid contest ID format"));
        } catch (Exception e) {
            logger.error("Failed to manage roles in contest {}", contestId, e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred."
            ));
        }
    }
}
