package com.cmze.usecase.form;

import com.cmze.repository.SurveyFormRepository;
import com.cmze.repository.SurveyRoomRepository;
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
public class DeleteSurveyFormUseCase {

    private static final Logger logger = LoggerFactory.getLogger(DeleteSurveyFormUseCase.class);

    private final SurveyFormRepository surveyFormRepository;
    private final SurveyRoomRepository surveyRoomRepository;

    public DeleteSurveyFormUseCase(final SurveyFormRepository surveyFormRepository,
                                   final SurveyRoomRepository surveyRoomRepository) {
        this.surveyFormRepository = surveyFormRepository;
        this.surveyRoomRepository = surveyRoomRepository;
    }

    @Transactional
    public ActionResult<Void> execute(final Long formId, final UUID userId) {
        try {
            final var formOpt = surveyFormRepository.findById(formId);

            if (formOpt.isEmpty()) {
                logger.warn("Delete failed: Form not found with id {}", formId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.NOT_FOUND, "Form not found"
                ));
            }

            final var form = formOpt.get();

            if (!form.getCreatorId().equals(userId)) {
                logger.warn("Delete failed: User {} is not owner of form {}", userId, formId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.FORBIDDEN, "Not authorized"
                ));
            }

            final boolean hasActiveRooms = surveyRoomRepository.existsBySurvey_IdAndIsOpenTrue(formId);
            if (hasActiveRooms) {
                logger.warn("Delete failed: Active rooms exist for form {}", formId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.CONFLICT,
                        "Cannot delete template while active rooms exist. Close them first."
                ));
            }

            form.setDeleted(true);
            surveyFormRepository.save(form);

            logger.info("Survey form {} soft-deleted by user {}", formId, userId);
            return ActionResult.success(null);

        } catch (Exception e) {
            logger.error("Unexpected error while deleting form {}: {}", formId, e.getMessage(), e);

            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "An unexpected error occurred."
            ));
        }
    }
}
