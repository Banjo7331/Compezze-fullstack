package com.cmze.usecase.form;

import com.cmze.entity.SurveyForm;
import com.cmze.repository.SurveyFormRepository;
import com.cmze.response.GetSurveyFormSummaryResponse;
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
public class GetAllSurveyFormsUseCase {

    private static final Logger logger = LoggerFactory.getLogger(GetAllSurveyFormsUseCase.class);
    private final SurveyFormRepository surveyFormRepository;

    public GetAllSurveyFormsUseCase(final SurveyFormRepository surveyFormRepository) {
        this.surveyFormRepository = surveyFormRepository;
    }

    @Transactional(readOnly = true)
    public ActionResult<Page<GetSurveyFormSummaryResponse>> execute(final UUID currentUserId, final Pageable pageable) {
        try {
            final var formsPage = surveyFormRepository.findAllPublicAndOwnedByUser(currentUserId, pageable);

            final var dtoPage = formsPage.map(this::mapToDto);

            return ActionResult.success(dtoPage);

        } catch (Exception e) {
            logger.error("Failed to get survey forms for user {}: {}", currentUserId, e.getMessage(), e);

            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "An unexpected error occurred while fetching surveys."
            ));
        }
    }

    private GetSurveyFormSummaryResponse mapToDto(final SurveyForm form) {
        return new GetSurveyFormSummaryResponse(
                form.getId(),
                form.getTitle(),
                form.isPrivate(),
                form.getCreatorId()
        );
    }
}

