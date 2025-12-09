package com.cmze.usecase.participant;

import com.cmze.usecase.UseCase;

@UseCase
public class RejectCompetitorUseCase {

//    private static final Logger logger = LoggerFactory.getLogger(DeleteSubmissionUseCase.class);
//
//    private final SubmissionRepository submissionRepo;
//    private final ContestParticipantRepository participantRepo;
//    private final ContestRepository contestRepo;
//    // private final MinioService minioService;
//
//    public DeleteSubmissionUseCase(final SubmissionRepository submissionRepo,
//                                   final ContestParticipantRepository participantRepo,
//                                   final ContestRepository contestRepo) {
//        this.submissionRepo = submissionRepo;
//        this.participantRepo = participantRepo;
//        this.contestRepo = contestRepo;
//    }
//
//    @Transactional
//    public ActionResult<Void> execute(final String contestIdString, final String submissionId, final UUID organizerId) {
//        try {
//            Long contestId = Long.valueOf(contestIdString);
//
//            // 1. Walidacja Organizatora
//            final var contest = contestRepo.findById(contestId).orElseThrow();
//            if (!contest.getOrganizerId().equals(organizerId.toString())) {
//                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
//                        HttpStatus.FORBIDDEN, "Only organizer can manage submissions here."
//                ));
//            }
//
//            // 2. Pobranie zgłoszenia
//            final var submissionOpt = submissionRepo.findByIdAndContest_Id(submissionId, contestId);
//            if (submissionOpt.isEmpty()) {
//                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
//                        HttpStatus.NOT_FOUND, "Submission not found."
//                ));
//            }
//            final var submission = submissionOpt.get();
//            final var participant = submission.getParticipant();
//
//            // 3. ZMIANA LOGIKI: Zamiast usuwać, oznaczamy jako REJECTED (Soft Delete)
//            // Dzięki temu nie tracimy danych, ale wykluczamy pracę z konkursu.
//            submission.setStatus(SubmissionStatus.REJECTED);
//            submission.setComment("Removed by organizer via management panel."); // Komentarz systemowy
//
//            submissionRepo.save(submission);
//
//            // (Opcjonalnie: Jeśli jednak chcesz usuwać plik z S3 przy Reject, odkomentuj to)
//            /*
//            if (submission.getFile() != null) {
//               // minioService.delete(...)
//            }
//            */
//
//            // 4. ✅ AKTUALIZACJA ROLI UCZESTNIKA
//            // Zabieramy rolę COMPETITOR, bo jego zgłoszenie zostało "usunięte" (odrzucone)
//            if (participant.hasRole(ContestRole.Competitor)) {
//                participant.removeRole(ContestRole.Competitor);
//                participantRepo.save(participant);
//                logger.info("Removed COMPETITOR role from user {}", participant.getUserId());
//            }
//
//            logger.info("Rejected submission {} by organizer {} (Admin Action)", submissionId, organizerId);
//            return ActionResult.success(null);
//
//        } catch (Exception e) {
//            logger.error("Failed to delete/reject submission", e);
//            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
//            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
//                    HttpStatus.INTERNAL_SERVER_ERROR, "Error processing submission removal"
//            ));
//        }
//    }
}
