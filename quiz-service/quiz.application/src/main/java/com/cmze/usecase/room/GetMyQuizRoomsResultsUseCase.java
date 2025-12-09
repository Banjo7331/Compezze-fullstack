package com.cmze.usecase.room;

import com.cmze.enums.QuizRoomStatus;
import com.cmze.repository.QuizRoomRepository;
import com.cmze.response.GetMyQuizRoomResultResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.helpers.room.QuizResultCounter;
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
public class GetMyQuizRoomsResultsUseCase {

    private static final Logger logger = LoggerFactory.getLogger(GetMyQuizRoomsResultsUseCase.class);

    private final QuizRoomRepository quizRoomRepository;
    private final QuizResultCounter quizResultCounter;

    public GetMyQuizRoomsResultsUseCase(final QuizRoomRepository quizRoomRepository,
                                        final QuizResultCounter quizResultCounter) {
        this.quizRoomRepository = quizRoomRepository;
        this.quizResultCounter = quizResultCounter;
    }

    @Transactional(readOnly = true)
    public ActionResult<Page<GetMyQuizRoomResultResponse>> execute(final UUID userId, final Pageable pageable) {
        try {
            final var roomsPage = quizRoomRepository.findByHostId(userId, pageable);

            final var dtoPage = roomsPage.map(room -> {
                final var stats = quizResultCounter.calculate(room.getId());

                final boolean isOpen = (room.getStatus() != QuizRoomStatus.FINISHED);

                return new GetMyQuizRoomResultResponse(
                        room.getId(),
                        room.getQuiz().getTitle(),
                        room.getStatus(),
                        room.isPrivate(),
                        room.getCreatedAt(),
                        room.getValidUntil(),
                        stats.getTotalParticipants(),
                        0L
                );
            });

            return ActionResult.success(dtoPage);

        } catch (Exception e) {
            logger.error("Failed to fetch quiz room results for user {}: {}", userId, e.getMessage(), e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "An unexpected error occurred while fetching your history."
            ));
        }
    }
}
