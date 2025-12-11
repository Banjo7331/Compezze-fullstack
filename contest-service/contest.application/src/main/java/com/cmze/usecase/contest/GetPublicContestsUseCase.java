package com.cmze.usecase.contest;

import com.cmze.repository.ContestRepository;
import com.cmze.response.GetContestSummaryResponse;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@UseCase
public class GetPublicContestsUseCase {

    private static final Logger logger = LoggerFactory.getLogger(GetPublicContestsUseCase.class);
    private final ContestRepository contestRepository;

    public GetPublicContestsUseCase(final ContestRepository contestRepository) {
        this.contestRepository = contestRepository;
    }

    @Transactional(readOnly = true)
    public ActionResult<Page<GetContestSummaryResponse>> execute(final Pageable pageable) {
        try {
            final var contestsPage = contestRepository.findPublicContestsToJoin(LocalDateTime.now(), pageable);

            final var responsePage = contestsPage.map(c -> new GetContestSummaryResponse(
                    c.getId().toString(),
                    c.getName(),
                    c.getContestCategory(),
                    c.getStartDate(),
                    c.getStatus(),
                    false
            ));

            return ActionResult.success(responsePage);

        } catch (Exception e) {
            logger.error("Failed to fetch public contests", e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching public contests"
            ));
        }
    }
}
