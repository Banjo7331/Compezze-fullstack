package com.cmze.usecase.form;

import com.cmze.repository.QuizFormRepository;
import com.cmze.repository.QuizRoomRepository;
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
public class DeleteQuizFormUseCase {

    private static final Logger logger = LoggerFactory.getLogger(DeleteQuizFormUseCase.class);

    private final QuizFormRepository quizFormRepository;
    private final QuizRoomRepository quizRoomRepository;

    public DeleteQuizFormUseCase(final QuizFormRepository quizFormRepository,
                                 final QuizRoomRepository quizRoomRepository) {
        this.quizFormRepository = quizFormRepository;
        this.quizRoomRepository = quizRoomRepository;
    }

    @Transactional
    public ActionResult<Void> execute(final Long formId, final UUID userId) {
        try {
            final var formOpt = quizFormRepository.findById(formId);

            if (formOpt.isEmpty()) {
                logger.warn("Delete failed: QuizForm not found with id {}", formId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.NOT_FOUND, "Quiz not found"
                ));
            }

            final var form = formOpt.get();

            if (!form.getCreatorId().equals(userId)) {
                logger.warn("Delete failed: User {} is not owner of quiz {}", userId, formId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.FORBIDDEN, "Not authorized to delete this quiz"
                ));
            }

            final boolean hasActiveRooms = quizRoomRepository.existsActiveRoomsForQuiz(formId);

            if (hasActiveRooms) {
                logger.warn("Delete failed: Active rooms exist for quiz {}", formId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.CONFLICT,
                        "Cannot delete quiz while active game sessions exist. Finish them first."
                ));
            }

            form.setDeleted(true);
            quizFormRepository.save(form);

            logger.info("Quiz form {} soft-deleted by user {}", formId, userId);
            return ActionResult.success(null);

        } catch (Exception e) {
            logger.error("Unexpected error while deleting quiz {}: {}", formId, e.getMessage(), e);

            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "An unexpected error occurred."
            ));
        }
    }
}
