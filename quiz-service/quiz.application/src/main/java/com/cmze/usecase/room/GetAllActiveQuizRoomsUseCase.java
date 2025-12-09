package com.cmze.usecase.room;

import com.cmze.repository.QuizEntrantRepository;
import com.cmze.repository.QuizRoomRepository;
import com.cmze.response.GetActiveQuizRoomResponse;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;

@UseCase
public class GetAllActiveQuizRoomsUseCase {

    private static final Logger logger = LoggerFactory.getLogger(GetAllActiveQuizRoomsUseCase.class);

    private final QuizRoomRepository quizRoomRepository;
    private final QuizEntrantRepository entrantRepository;

    public GetAllActiveQuizRoomsUseCase(final QuizRoomRepository quizRoomRepository,
                                        final QuizEntrantRepository entrantRepository) {
        this.quizRoomRepository = quizRoomRepository;
        this.entrantRepository = entrantRepository;
    }

    @Transactional(readOnly = true)
    public ActionResult<Page<GetActiveQuizRoomResponse>> execute(final Pageable pageable) {
        try {
            final var activeRooms = quizRoomRepository.findAllPublicActiveRooms(pageable);

            final var responsePage = activeRooms.map(room -> {
                final long participantsCount = entrantRepository.countByQuizRoom_Id(room.getId());

                final String quizTitle = room.getQuiz().getTitle();

                return new GetActiveQuizRoomResponse(
                        room.getId(),
                        quizTitle,
                        room.getHostId(),
                        participantsCount,
                        room.getMaxParticipants(),
                        room.getStatus()
                );
            });

            return ActionResult.success(responsePage);

        } catch (Exception e) {
            logger.error("Failed to fetch active quiz rooms", e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error fetching active rooms"
            ));
        }
    }
}
