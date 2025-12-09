package com.cmze.usecase.submission;

import com.cmze.entity.Submission;
import com.cmze.repository.ParticipantRepository;
import com.cmze.repository.SubmissionRepository;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

@UseCase
public class DeleteSubmissionUseCase {

    private final SubmissionRepository submissionRepo;
    private final ParticipantRepository participantRepo;

    public DeleteSubmissionUseCase(SubmissionRepository submissionRepo,
                                   ParticipantRepository participantRepo) {
        this.submissionRepo = submissionRepo;
        this.participantRepo = participantRepo;
    }

//    @Transactional
//    public ActionResult<Void> execute(String contestId, String requesterUserId, String submissionId) {
//        // 1) autoryzacja: Moderator w tym konkursie
//        var pOpt = participantRepo.findByContest_IdAndUserId(contestId, requesterUserId);
//        if (pOpt.isEmpty()) {
//            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Not a participant."));
//        }
//        var roles = Optional.ofNullable(pOpt.get().getRoles()).orElse(Set.of());
//        if (!roles.contains(ContestRole.Moderator)) {
//            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Not allowed. Moderator role required."));
//        }
//
//        // 2) znajdź submission w danym contest
//        Submission s = submissionRepo.findByIdAndContest_Id(submissionId, contestId).orElse(null);
//        if (s == null) {
//            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Submission not found."));
//        }
//
//        // (opcjonalnie) jeśli chcesz przy usunięciu odebrać Competitor:
//        // Participant author = s.getParticipant();
//        // if (author.getRoles().remove(ContestRole.Competitor)) participantRepo.save(author);
//
//        submissionRepo.delete(s);
//
//        // (opcjonalnie) tu dodać kasowanie pliku z MinIO na podstawie s.getFile().getObjectKey()
//
//        return ActionResult.success(null);
//    }
}
