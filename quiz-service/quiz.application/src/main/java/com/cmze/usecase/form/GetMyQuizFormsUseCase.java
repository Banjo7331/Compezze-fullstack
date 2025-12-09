package com.cmze.usecase.form;

import com.cmze.entity.QuizForm;
import com.cmze.repository.QuizFormRepository;
import com.cmze.response.MyQuizFormResponse;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@UseCase
public class GetMyQuizFormsUseCase {

    private static final Logger logger = LoggerFactory.getLogger(GetMyQuizFormsUseCase.class);
    private final QuizFormRepository quizFormRepository;

    public GetMyQuizFormsUseCase(final QuizFormRepository quizFormRepository) {
        this.quizFormRepository = quizFormRepository;
    }

    @Transactional(readOnly = true)
    public ActionResult<Page<MyQuizFormResponse>> execute(final UUID userId, final Pageable pageable) {
        try {
            final var formsPage = quizFormRepository.findByCreatorIdAndDeletedFalse(userId, pageable);

            final var dtoPage = formsPage.map(this::mapToDto);

            return ActionResult.success(dtoPage);

        } catch (Exception e) {
            logger.error("Failed to fetch my quiz forms for user {}: {}", userId, e.getMessage(), e);

            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "An unexpected error occurred while loading your quizzes."
            ));
        }
    }

    private MyQuizFormResponse mapToDto(final QuizForm form) {
        return new MyQuizFormResponse(
                form.getId(),
                form.getTitle(),
                form.isPrivate(),
                form.getCreatedAt(),
                form.getQuestions() != null ? form.getQuestions().size() : 0
        );
    }
}
