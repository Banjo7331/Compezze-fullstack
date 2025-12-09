package com.cmze.usecase.room;

import com.cmze.entity.SurveyRoom;
import com.cmze.repository.SurveyRoomRepository;
import com.cmze.response.GetSurveyRoomDetailsResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.helpers.room.FinalRoomResultDto;
import com.cmze.spi.helpers.room.SurveyResultCounter;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@UseCase
public class GetSurveyRoomDetailsUseCase {

    private static final Logger logger = LoggerFactory.getLogger(GetSurveyRoomDetailsUseCase.class);

    private final SurveyRoomRepository surveyRoomRepository;
    private final SurveyResultCounter surveyResultCounter;

    public GetSurveyRoomDetailsUseCase(final SurveyRoomRepository surveyRoomRepository,
                                       final SurveyResultCounter surveyResultCounter) {
        this.surveyRoomRepository = surveyRoomRepository;
        this.surveyResultCounter = surveyResultCounter;
    }

    @Transactional(readOnly = true)
    public ActionResult<GetSurveyRoomDetailsResponse> execute(final UUID roomId) {
        try {
            final var roomOpt = surveyRoomRepository.findByIdWithSurveyAndQuestions(roomId);

            if (roomOpt.isEmpty()) {
                logger.warn("Room details not found for id: {}", roomId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.NOT_FOUND, "Room not found"
                ));
            }

            final SurveyRoom room = roomOpt.get();

            final FinalRoomResultDto results = surveyResultCounter.calculate(room.getId());

            final var response = new GetSurveyRoomDetailsResponse(
                    room.getId(),
                    room.getSurvey().getTitle(),
                    room.getUserId(),
                    room.isOpen(),
                    room.isPrivate(),
                    results.getTotalParticipants(),
                    results
            );

            return ActionResult.success(response);

        } catch (Exception e) {
            logger.error("Failed to fetch details for room {}: {}", roomId, e.getMessage(), e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "An unexpected error occurred while loading room details."
            ));
        }
    }
}
