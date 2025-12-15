package com.cmze.internal.websocket;

import com.cmze.internal.websocket.messages.*;
import com.cmze.ws.event.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ContestEventWebSocketNotifier {

    private static final Logger logger = LoggerFactory.getLogger(ContestEventWebSocketNotifier.class);
    private final SimpMessagingTemplate messagingTemplate;

    public ContestEventWebSocketNotifier(final SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleStageChanged(final ContestStageChangedEvent event) {
        final var contestId = event.getContestId();
        final var topic = "/topic/contest/" + contestId;

        final var payload = new ContestStageChangedSocketMessage(
                event.getStageId(),
                event.getStageName(),
                event.getStageType()
        );

        logger.info("Contest: Stage changed in {} to {} ({})",
                contestId, event.getStageName(), event.getStageType());

        messagingTemplate.convertAndSend(topic, payload);
    }

    @EventListener
    public void handleParticipantJoined(final ContestParticipantJoinedEvent event) {
        final var contestId = event.getContestId();
        final var topic = "/topic/contest/" + contestId;

        final var payload = new ParticipantJoinedSocketMessage(
                event.getUserId(),
                event.getDisplayName()
        );

        logger.info("Contest: User {} joined live room {}", event.getDisplayName(), contestId);

        messagingTemplate.convertAndSend(topic, payload);
    }

    @EventListener
    public void handleVoteRecorded(final ContestVoteRecordedEvent event) {
        final var topic = "/topic/contest/" + event.getContestId();

        final var payload = new VoteUpdateSocketMessage(
                event.getSubmissionId(),
                event.getNewTotalScore()
        );

        messagingTemplate.convertAndSend(topic, payload);
    }

    @EventListener
    public void handleSubmissionPresented(final ContestSubmissionPresentedEvent event) {
        final var topic = "/topic/contest/" + event.getContestId();

        final var payload = new SubmissionPresentedSocketMessage(
                event.getSubmissionId(),
                event.getParticipantName(),
                event.getContentUrl(),
                event.getContentType()
        );

        logger.info("WS: Presenting submission {} in contest {}", event.getSubmissionId(), event.getContestId());
        messagingTemplate.convertAndSend(topic, payload);
    }

    @EventListener
    public void handleContestFinished(final ContestFinishedEvent event) {
        final var topic = "/topic/contest/" + event.getContestId();

        final var payload = new ContestFinishedSocketMessage(event.getContestId());

        logger.info("WS: Contest finished {}", event.getContestId());
        messagingTemplate.convertAndSend(topic, payload);
    }

    @EventListener
    public void handleInvitationsGenerated(final InvitationsGeneratedEvent event) {
        logger.info("Processing invitations for contest {} ({} users)",
                event.getContestId(), event.getInvitations().size());

        event.getInvitations().forEach((userId, token) -> {

            final var payload = new InvitationSocketMessage(
                    event.getContestId(),
                    event.getContestTitle(),
                    token,
                    event.getInviterName()
            );

            try {
                messagingTemplate.convertAndSendToUser(
                        userId,
                        "/queue/invitations",
                        payload
                );
            } catch (Exception e) {
                logger.error("Failed to send invitation to user {}", userId, e);
            }
        });
    }

    @EventListener
    public void handleChatMessage(final ContestChatMessageEvent event) {
        final var topic = "/topic/contest/" + event.getContestId();

        final var payload = new ChatSocketMessage(
                event.getUserId(),
                event.getUserDisplayName(),
                event.getContent(),
                event.getTimestamp()
        );

        messagingTemplate.convertAndSend(topic, payload);
    }
}