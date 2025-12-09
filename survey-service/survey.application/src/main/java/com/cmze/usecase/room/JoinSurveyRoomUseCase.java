package com.cmze.usecase.room;

import com.cmze.entity.SurveyEntrant;
import com.cmze.entity.SurveyForm;
import com.cmze.entity.SurveyRoom;
import com.cmze.repository.SurveyEntrantRepository;
import com.cmze.repository.SurveyRoomRepository;
import com.cmze.request.JoinSurveyRoomRequest;
import com.cmze.response.GetSurveyResponse.GetQuestionResponse;
import com.cmze.response.GetSurveyResponse.GetSurveyFormResponse;
import com.cmze.response.JoinSurveyRoomResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.helpers.invites.SoulboundTokenService;
import com.cmze.usecase.UseCase;
import com.cmze.ws.event.EntrantJoinedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.HashSet;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@UseCase
public class JoinSurveyRoomUseCase {
    private static final Logger logger = LoggerFactory.getLogger(JoinSurveyRoomUseCase.class);

    private final SurveyRoomRepository surveyRoomRepository;
    private final SurveyEntrantRepository surveyEntrantRepository;
    private final SoulboundTokenService soulboundTokenService;
    private final ApplicationEventPublisher eventPublisher;

    public JoinSurveyRoomUseCase(final SurveyRoomRepository surveyRoomRepository,
                                 final SurveyEntrantRepository surveyEntrantRepository,
                                 final SoulboundTokenService soulboundTokenService,
                                 final ApplicationEventPublisher eventPublisher) {
        this.surveyRoomRepository = surveyRoomRepository;
        this.surveyEntrantRepository = surveyEntrantRepository;
        this.soulboundTokenService = soulboundTokenService;
        this.eventPublisher = eventPublisher;
    }

    public ActionResult<JoinSurveyRoomResponse> execute(final UUID roomId, final UUID participantUserId, final JoinSurveyRoomRequest request) {
        try {
            final Optional<SurveyRoom> roomOpt = surveyRoomRepository.findByIdWithSurveyAndQuestions(roomId);
            if (roomOpt.isEmpty()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Room not found."));
            }
            final SurveyRoom room = roomOpt.get();

            if (!room.isOpen()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.GONE, "Room closed."));
            }

            final String token = (request != null) ? request.getInvitationToken() : null;
            if (room.isPrivate() && !isAccessAllowed(room, participantUserId, token)) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Access denied."));
            }

            final Optional<SurveyEntrant> existingEntrantOpt = surveyEntrantRepository
                    .findBySurveyRoom_IdAndParticipantUserId(roomId, participantUserId);

            final boolean isHost = room.getUserId().equals(participantUserId);

            if (existingEntrantOpt.isPresent()) {
                final SurveyEntrant existingEntrant = existingEntrantOpt.get();
                final boolean hasSubmitted = (existingEntrant.getSurveyAttempt() != null);

                return ActionResult.success(new JoinSurveyRoomResponse(
                        existingEntrant.getId(),
                        mapSurveyToDto(room.getSurvey()),
                        hasSubmitted,
                        isHost
                ));
            }

            final long currentSize = surveyEntrantRepository.countBySurveyRoom_Id(roomId);
            if (room.getMaxParticipants() != null && currentSize >= room.getMaxParticipants()) {
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Room is full."));
            }

            final SurveyEntrant newEntrant = new SurveyEntrant();
            newEntrant.setSurveyRoom(room);
            newEntrant.setUserId(participantUserId);

            SurveyEntrant savedParticipant;

            try {
                savedParticipant = surveyEntrantRepository.save(newEntrant);
                logger.info("User {} joined room {}", participantUserId, roomId);

                final long newSize = currentSize + 1;
                eventPublisher.publishEvent(new EntrantJoinedEvent(this, savedParticipant, newSize));

            } catch (DataIntegrityViolationException e) {
                logger.info("Race condition: User {} already joined. Fetching existing.", participantUserId);

                savedParticipant = surveyEntrantRepository.findBySurveyRoom_IdAndParticipantUserId(roomId, participantUserId)
                        .orElseThrow(() -> new IllegalStateException("DB Inconsistency"));
            }

            return ActionResult.success(new JoinSurveyRoomResponse(
                    savedParticipant.getId(),
                    mapSurveyToDto(room.getSurvey()),
                    false,
                    isHost
            ));

        } catch (Exception e) {
            logger.error("Join failed for room {}: {}", roomId, e.getMessage(), e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error."
            ));
        }
    }


    private boolean isAccessAllowed(final SurveyRoom room, final UUID participantUserId, final String token) {
        if (room.getUserId().equals(participantUserId)) return true;
        if (token != null && !token.isBlank()) {
            return soulboundTokenService.validateSoulboundToken(token, participantUserId, room.getId());
        }
        return false;
    }

    private GetSurveyFormResponse mapSurveyToDto(final SurveyForm survey) {
        if (survey == null) return null;
        return new GetSurveyFormResponse(
                survey.getId(),
                survey.getTitle(),
                survey.getQuestions().stream()
                        .map(q -> new GetQuestionResponse(
                                q.getId(),
                                q.getTitle(),
                                q.getType(),
                                new HashSet<>(q.getPossibleChoices())
                        )).collect(Collectors.toList())
        );
    }
}