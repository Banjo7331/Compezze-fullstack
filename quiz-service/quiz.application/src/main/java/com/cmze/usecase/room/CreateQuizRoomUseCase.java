package com.cmze.usecase.room;

import com.cmze.entity.QuizRoom;
import com.cmze.enums.QuizRoomStatus;
import com.cmze.repository.QuizFormRepository;
import com.cmze.repository.QuizRoomRepository;
import com.cmze.request.CreateQuizRoomRequest;
import com.cmze.request.JoinQuizRoomRequest;
import com.cmze.response.CreateQuizRoomResponse;
import com.cmze.response.JoinQuizRoomResponse;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.time.LocalDateTime;
import java.util.UUID;

@UseCase
public class CreateQuizRoomUseCase {

    private static final Logger logger = LoggerFactory.getLogger(CreateQuizRoomUseCase.class);

    private static final int ROOM_TTL_MINUTES = 100;

    private final QuizFormRepository quizFormRepository;
    private final QuizRoomRepository quizRoomRepository;
    private final JoinQuizRoomUseCase joinQuizRoomUseCase;

    public CreateQuizRoomUseCase(final QuizFormRepository quizFormRepository,
                                 final QuizRoomRepository quizRoomRepository,
                                 final JoinQuizRoomUseCase joinQuizRoomUseCase) {
        this.quizFormRepository = quizFormRepository;
        this.quizRoomRepository = quizRoomRepository;
        this.joinQuizRoomUseCase = joinQuizRoomUseCase;
    }

    @Transactional
    public ActionResult<CreateQuizRoomResponse> execute(final CreateQuizRoomRequest request, final UUID hostId) {
        try {
            logger.info("Attempting to create quiz room for form {} by user {}", request.getQuizFormId(), hostId);

            final var formOpt = quizFormRepository.findById(request.getQuizFormId());

            if (formOpt.isEmpty()) {
                logger.warn("Quiz template not found: {}", request.getQuizFormId());
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.NOT_FOUND, "Quiz template not found"
                ));
            }

            final var form = formOpt.get();

            if (form.isPrivate() && !form.getCreatorId().equals(hostId)) {
                logger.warn("Access denied: User {} is not owner of private quiz {}", hostId, form.getId());
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.FORBIDDEN, "Access denied to private quiz template"
                ));
            }

            final var room = new QuizRoom();
            room.setQuiz(form);
            room.setHostId(hostId);
            room.setTimePerQuestion(request.getTimePerQuestion());
            room.setMaxParticipants(request.getMaxParticipants());
            room.setStatus(QuizRoomStatus.LOBBY);
            room.setCurrentQuestionIndex(-1);
            room.setCreatedAt(LocalDateTime.now());
            room.setPrivate(request.isPrivate());

            room.setValidUntil(LocalDateTime.now().plusMinutes(ROOM_TTL_MINUTES));

            final var savedRoom = quizRoomRepository.save(room);

            final var joinRequest = new JoinQuizRoomRequest(
                    "HOST",
                    null
            );

            final ActionResult<JoinQuizRoomResponse> joinResult = joinQuizRoomUseCase.execute(
                    savedRoom.getId(),
                    hostId,
                    joinRequest
            );

            if (joinResult.isFailure()) {
                logger.error("FATAL: Failed to join host to quiz room {}. Rolling back.", savedRoom.getId());

                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Failed to initialize quiz session"
                ));
            }

            logger.info("Quiz Room {} created successfully (Status: LOBBY).", savedRoom.getId());

            return ActionResult.success(new CreateQuizRoomResponse(
                    savedRoom.getId(),
                    form.getId(),
                    form.getTitle(),
                    null
            ));

        } catch (Exception e) {
            logger.error("Unexpected error creating quiz room", e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred while creating the quiz room."
            ));
        }
    }
}
