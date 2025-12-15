package com.cmze.usecase.form;

import com.cmze.entity.QuizForm;
import com.cmze.repository.QuizFormRepository;
import com.cmze.response.GetQuizFormSummaryResponse;
import com.cmze.shared.ActionResult;
import com.cmze.specification.QuizFormSpecification;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@UseCase
public class GetAllQuizFormsUseCase {

    private static final Logger logger = LoggerFactory.getLogger(GetAllQuizFormsUseCase.class);
    private final QuizFormRepository quizFormRepository;

    public GetAllQuizFormsUseCase(final QuizFormRepository quizFormRepository) {
        this.quizFormRepository = quizFormRepository;
    }

    @Transactional(readOnly = true)
    public ActionResult<Page<GetQuizFormSummaryResponse>> execute(final UUID currentUserId, final Specification<QuizForm> filtersFromUrl, final Pageable pageable) {
        try {
            final Specification<QuizForm> finalSpec = QuizFormSpecification.availableForUser(currentUserId)
                    .and(filtersFromUrl);

            final var formsPage = quizFormRepository.findAll(finalSpec, pageable);

            final var dtoPage = formsPage.map(this::mapToDto);

            return ActionResult.success(dtoPage);

        } catch (Exception e) {
            logger.error("Failed to fetch quiz feed for user {}: {}", currentUserId, e.getMessage(), e);

            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "An unexpected error occurred while loading quizzes."
            ));
        }
    }

    private GetQuizFormSummaryResponse mapToDto(final QuizForm form) {
        return new GetQuizFormSummaryResponse(
                form.getId(),
                form.getTitle(),
                form.isPrivate(),
                form.getCreatorId()
        );
    }
}
