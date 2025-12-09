package com.cmze.internal.ws;

import com.cmze.internal.ws.messages.InvitationSocketMessage;
import com.cmze.spi.helpers.room.SurveyResultCounter;
import com.cmze.ws.event.EntrantJoinedEvent;
import com.cmze.ws.event.InvitationsGeneratedEvent;
import com.cmze.ws.event.RoomClosedEvent;
import com.cmze.ws.event.SurveyAttemptSubmittedEvent;
import com.cmze.internal.ws.messages.LiveResultUpdateSocketMessage;
import com.cmze.internal.ws.messages.RoomClosedSocketMessage;
import com.cmze.internal.ws.messages.UserJoinedSocketMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;


@Service
public class SurveyEventWebSocketNotifier {

    private static final Logger logger = LoggerFactory.getLogger(SurveyEventWebSocketNotifier.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final SurveyResultCounter resultsCounter;

    public SurveyEventWebSocketNotifier(final SimpMessagingTemplate messagingTemplate,
                                        final SurveyResultCounter resultsCounter) {
        this.messagingTemplate = messagingTemplate;
        this.resultsCounter = resultsCounter;
    }

    @EventListener
    public void handleParticipantJoined(final EntrantJoinedEvent event) {
        final var participant = event.getParticipant();
        final var roomId = participant.getSurveyRoom().getId();
        final var topic = "/topic/survey/" + roomId;

        final var payload = new UserJoinedSocketMessage(
                participant.getId(),
                participant.getUserId(),
                event.getNewParticipantCount()
        );

        logger.info("Sending USER_JOINED to {}: userId {}", topic, participant.getUserId());
        messagingTemplate.convertAndSend(topic, payload);
    }

    @EventListener
    public void handleSurveySubmitted(final SurveyAttemptSubmittedEvent event) {
        final var roomId = event.getSurveyAttempt().getParticipant().getSurveyRoom().getId();
        final var topic = "/topic/survey/" + roomId;

        final var liveResults = resultsCounter.calculate(roomId);

        final var payload = new LiveResultUpdateSocketMessage(liveResults);

        logger.info("Sending LIVE_RESULTS_UPDATE to {}: {} submissions", topic, liveResults.getTotalSubmissions());
        messagingTemplate.convertAndSend(topic, payload);
    }

    @EventListener
    public void handleRoomClosed(final RoomClosedEvent event) {
        final var roomId = event.getRoom().getId();
        final var topic = "/topic/survey/" + roomId;

        final var finalResults = resultsCounter.calculate(roomId);

        final var payload = new RoomClosedSocketMessage(finalResults);

        logger.info("Sending ROOM_CLOSED to {}: {} participants", topic, finalResults.getTotalParticipants());
        messagingTemplate.convertAndSend(topic, payload);
    }

    @EventListener
    public void handleInvitationsGenerated(final InvitationsGeneratedEvent event) {
        logger.info("Processing generated invitations for room {}", event.getRoomId());

        event.getInvitations().forEach((userId, token) -> {
            final var payload = new InvitationSocketMessage(
                    event.getRoomId(),
                    event.getSurveyTitle(),
                    token
            );

            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/invitations",
                    payload
            );
        });
    }
}
