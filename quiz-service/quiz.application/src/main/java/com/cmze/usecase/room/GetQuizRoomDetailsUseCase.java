package com.cmze.usecase.room;

import com.cmze.entity.Question;
import com.cmze.entity.QuizRoom;
import com.cmze.enums.QuizRoomStatus;
import com.cmze.repository.QuizEntrantRepository;
import com.cmze.repository.QuizRoomRepository;
import com.cmze.response.GetQuizRoomDetails.GetCurrentQuestionResponse;
import com.cmze.response.GetQuizRoomDetails.GetQuestionOptionResponse;
import com.cmze.response.GetQuizRoomDetails.GetQuizRoomDetailsResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.helpers.room.QuizResultCounter;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

@UseCase
public class GetQuizRoomDetailsUseCase {

    private static final Logger logger = LoggerFactory.getLogger(GetQuizRoomDetailsUseCase.class);

    private final QuizRoomRepository quizRoomRepository;
    private final QuizEntrantRepository quizEntrantRepository;
    private final QuizResultCounter quizResultCounter;

    public GetQuizRoomDetailsUseCase(final QuizRoomRepository quizRoomRepository,
                                     final QuizEntrantRepository quizEntrantRepository,
                                     final QuizResultCounter quizResultCounter) {
        this.quizRoomRepository = quizRoomRepository;
        this.quizEntrantRepository = quizEntrantRepository;
        this.quizResultCounter = quizResultCounter;
    }

    @Transactional(readOnly = true)
    public ActionResult<GetQuizRoomDetailsResponse> execute(final UUID roomId, final UUID requestingUserId) {
        try {
            final var roomOpt = quizRoomRepository.findByIdWithQuiz(roomId);

            if (roomOpt.isEmpty()) {
                logger.warn("Quiz room details not found for id: {}", roomId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.NOT_FOUND, "Room not found"
                ));
            }

            final var room = roomOpt.get();

            final var results = quizResultCounter.calculate(room.getId());

            final long participantsCount = quizEntrantRepository.countByQuizRoom_Id(roomId);

            final boolean isParticipant = quizEntrantRepository
                    .findByQuizRoom_IdAndUserId(roomId, requestingUserId)
                    .isPresent();

            final var currentQuestionDto = resolveCurrentQuestion(room);

            final var response = new GetQuizRoomDetailsResponse(
                    room.getId(),
                    room.getQuiz().getTitle(),
                    room.getHostId(),
                    isParticipant,
                    room.getStatus(),
                    room.isPrivate(),
                    participantsCount,
                    results,
                    currentQuestionDto
            );

            return ActionResult.success(response);

        } catch (Exception e) {
            logger.error("Failed to fetch details for quiz room {}: {}", roomId, e.getMessage(), e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "An unexpected error occurred while loading room details."
            ));
        }
    }

    private GetCurrentQuestionResponse resolveCurrentQuestion(final QuizRoom room) {
        if (room.getStatus() == QuizRoomStatus.QUESTION_ACTIVE && room.getCurrentQuestionIndex() >= 0) {
            final var qEntity = room.getQuiz().getQuestions().get(room.getCurrentQuestionIndex());
            return mapToCurrentQuestionDto(qEntity,
                                           room.getCurrentQuestionStartTime(),
                                           room.getTimePerQuestion(),
                                           room.getCurrentQuestionIndex()
            );
        }
        return null;
    }

    private GetCurrentQuestionResponse mapToCurrentQuestionDto(Question q, LocalDateTime startTime, int timeLimit, int index) {
        final var options = q.getOptions().stream()
                .map(o -> new GetQuestionOptionResponse(o.getId(), o.getText()))
                .collect(Collectors.toList());

        return new GetCurrentQuestionResponse(
                q.getId(),
                index,
                q.getTitle(),
                startTime,
                timeLimit,
                options
        );
    }
}
