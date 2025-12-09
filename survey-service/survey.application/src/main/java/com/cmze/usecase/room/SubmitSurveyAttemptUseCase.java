package com.cmze.usecase.room;

import com.cmze.entity.ParticipantAnswer;
import com.cmze.entity.Question;
import com.cmze.entity.SurveyAttempt;
import com.cmze.entity.SurveyEntrant;
import com.cmze.repository.SurveyAttemptRepository;
import com.cmze.repository.SurveyEntrantRepository;
import com.cmze.request.SubmitSurveyAttemptRequest.SubmitSurveyAttemptRequest;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import com.cmze.ws.event.SurveyAttemptSubmittedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@UseCase
public class SubmitSurveyAttemptUseCase {

    private static final Logger logger = LoggerFactory.getLogger(SubmitSurveyAttemptUseCase.class);

    private final SurveyEntrantRepository surveyEntrantRepository;
    private final SurveyAttemptRepository surveyAttemptRepository;
    private final ApplicationEventPublisher eventPublisher;

    public SubmitSurveyAttemptUseCase(final SurveyEntrantRepository surveyEntrantRepository,
                                      final SurveyAttemptRepository surveyAttemptRepository,
                                      final ApplicationEventPublisher eventPublisher) {
        this.surveyEntrantRepository = surveyEntrantRepository;
        this.surveyAttemptRepository = surveyAttemptRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ActionResult<Void> execute(final UUID roomId, final UUID participantUserId, final SubmitSurveyAttemptRequest request) {
        try {
            final Optional<SurveyEntrant> participantOpt = surveyEntrantRepository
                    .findBySurveyRoom_IdAndParticipantUserId(roomId, participantUserId);

            if (participantOpt.isEmpty()) {
                logger.warn("Submit failed: User {} has not joined room {}", participantUserId, roomId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.FORBIDDEN, "You have not joined this room."
                ));
            }
            final var participant = participantOpt.get();

            if (!participant.getSurveyRoom().isOpen()) {
                logger.warn("Submit failed: Room {} is closed", roomId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.GONE, "This room has been closed by the host."
                ));
            }

            if (participant.getSurveyAttempt() != null) {
                logger.warn("Submit failed: User {} already submitted in room {}", participantUserId, roomId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.CONFLICT, "You have already submitted your answers for this room."
                ));
            }

            final Map<Long, Question> validQuestions = participant.getSurveyRoom().getSurvey().getQuestions().stream()
                    .collect(Collectors.toMap(Question::getId, Function.identity()));

            for (final var answerDto : request.getParticipantAnswers()) {
                if (!validQuestions.containsKey(answerDto.getQuestionId())) {
                    logger.warn("Submit failed: Invalid questionId {} submitted by user {}", answerDto.getQuestionId(), participantUserId);
                    return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                            HttpStatus.BAD_REQUEST, "Invalid questionId provided: " + answerDto.getQuestionId()
                    ));
                }
            }

            final var surveyAttempt = new SurveyAttempt();
            surveyAttempt.setParticipant(participant);
            surveyAttempt.setSurvey(participant.getSurveyRoom().getSurvey());

            final var answers = request.getParticipantAnswers().stream()
                    .map(dto -> {
                        final var pa = new ParticipantAnswer();
                        pa.setQuestion(validQuestions.get(dto.getQuestionId()));

                        pa.setAnswer(new ArrayList<>(dto.getAnswers()));

                        pa.setSurveyAttempt(surveyAttempt);
                        return pa;
                    })
                    .collect(Collectors.toList());

            surveyAttempt.setParticipantAnswers(answers);

            final var savedAttempt = surveyAttemptRepository.save(surveyAttempt);

            logger.info("User {} successfully submitted answers for room {}", participantUserId, roomId);

            eventPublisher.publishEvent(new SurveyAttemptSubmittedEvent(this, savedAttempt));

            return ActionResult.success(null);

        } catch (Exception e) {
            logger.error("Failed to submit survey for user {}: {}", participantUserId, e.getMessage(), e);

            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "An unexpected error occurred while submitting answers."
            ));
        }
    }
}
