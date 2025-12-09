package com.cmze.usecase.room;

import com.cmze.entity.SurveyRoom;
import com.cmze.repository.SurveyRoomRepository;
import com.cmze.response.MySurveyRoomResultsResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.helpers.room.SurveyResultCounter;
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
public class GetMySurveyRoomsResultsUseCase {

    private static final Logger logger = LoggerFactory.getLogger(GetMySurveyRoomsResultsUseCase.class);

    private final SurveyRoomRepository surveyRoomRepository;
    private final SurveyResultCounter surveyResultCounter;

    public GetMySurveyRoomsResultsUseCase(final SurveyRoomRepository surveyRoomRepository,
                                          final SurveyResultCounter surveyResultCounter) {
        this.surveyRoomRepository = surveyRoomRepository;
        this.surveyResultCounter = surveyResultCounter;
    }

    @Transactional(readOnly = true)
    public ActionResult<Page<MySurveyRoomResultsResponse>> execute(final UUID userId, final Pageable pageable) {
        try {
            final var roomsPage = surveyRoomRepository.findByUserId(userId, pageable);

            final var dtoPage = roomsPage.map(this::mapToDto);

            return ActionResult.success(dtoPage);

        } catch (Exception e) {
            logger.error("Failed to fetch survey room results for user {}: {}", userId, e.getMessage(), e);

            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "An unexpected error occurred while fetching your history."
            ));
        }
    }

    private MySurveyRoomResultsResponse mapToDto(final SurveyRoom room) {
        final var stats = surveyResultCounter.calculate(room.getId());

        return new MySurveyRoomResultsResponse(
                room.getId(),
                room.getSurvey().getTitle(),
                room.isOpen(),
                room.isPrivate(),
                room.getCreatedAt(),
                room.getValidUntil(),
                stats.getTotalParticipants(),
                stats.getTotalSubmissions()
        );
    }
}
