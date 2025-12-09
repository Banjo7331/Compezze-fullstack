package com.cmze.internal.ws;

import com.cmze.internal.ws.messages.*;
import com.cmze.spi.helpers.room.QuestionOptionDto;
import com.cmze.ws.event.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class QuizEventWebSocketNotifier {

    private static final Logger logger = LoggerFactory.getLogger(QuizEventWebSocketNotifier.class);
    private final SimpMessagingTemplate messagingTemplate;

    public QuizEventWebSocketNotifier(final SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleParticipantJoined(final QuizEntrantJoinedEvent event) {
        final var roomId = event.getRoomId();
        final var topic = "/topic/quiz/" + roomId;

        final var payload = new QuizUserJoinedSocketMessage(
                event.getParticipantId(),
                event.getUserId(),
                event.getUsername(),
                event.getTotalParticipants()
        );

        logger.info("Quiz: User {} joined room {}", event.getUsername(), roomId);
        messagingTemplate.convertAndSend(topic, payload);
    }

    @EventListener
    public void handleQuizStarted(final QuizStartedEvent event) {
        final var topic = "/topic/quiz/" + event.getRoomId();

        logger.info("Quiz started: {}", event.getRoomId());
        messagingTemplate.convertAndSend(topic, new QuizStartedSocketMessage());
    }

    @EventListener
    public void handleNewQuestion(final QuizNewQuestionEvent event) {
        final var topic = "/topic/quiz/" + event.getRoomId();
        final var question = event.getQuestion();

        final var optionsDto = question.getOptions().stream()
                .map(o -> new QuestionOptionDto(o.getId(), o.getText()))
                .toList();

        final var payload = new NewQuestionSocketMessage(
                question.getId(),
                event.getQuestionIndex(),
                question.getTitle(),
                optionsDto,
                event.getTimeLimitSeconds(),
                event.getStartTime()
        );

        logger.info("Quiz: New question {} sent to room {}", event.getQuestionIndex(), event.getRoomId());
        messagingTemplate.convertAndSend(topic, payload);
    }

    @EventListener
    public void handleQuestionFinished(final QuizQuestionFinishedEvent event) {
        final var topic = "/topic/quiz/" + event.getRoomId();

        final var payload = new QuestionFinishedSocketMessage(
                event.getCorrectOptionId(),
                null
        );

        logger.info("Quiz: Question finished in room {}", event.getRoomId());
        messagingTemplate.convertAndSend(topic, payload);
    }

    @EventListener
    public void handleLeaderboardUpdate(final QuizLeaderboardEvent event) {
        final var topic = "/topic/quiz/" + event.getRoomId();

        final var payload = new LeaderboardSocketMessage(event.getTopPlayers());

        logger.info("Quiz: Leaderboard updated for room {}", event.getRoomId());
        messagingTemplate.convertAndSend(topic, payload);
    }

    @EventListener
    public void handleRoomClosed(final QuizRoomClosedEvent event) {
        final var topic = "/topic/quiz/" + event.getRoomId();

        final var payload = new QuizRoomClosedSocketMessage(
                new LeaderboardSocketMessage(event.getFinalRanking())
        );

        logger.info("Quiz: Room closed {}", event.getRoomId());
        messagingTemplate.convertAndSend(topic, payload);
    }

    @EventListener
    public void handleInvitationsGenerated(final InvitationsGeneratedEvent event) {
        logger.info("Processing generated invitations for quiz room {}", event.getRoomId());

        event.getInvitations().forEach((userId, token) -> {

            final var payload = new InvitationSocketMessage(
                    event.getRoomId(),
                    event.getQuizTitle(),
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
