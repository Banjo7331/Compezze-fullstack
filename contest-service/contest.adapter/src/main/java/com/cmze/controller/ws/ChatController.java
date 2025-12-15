package com.cmze.controller.ws;

import com.cmze.request.ChatCommand;
import com.cmze.ws.event.ContestChatMessageEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Instant;


@Controller
public class ChatController {

    private final ApplicationEventPublisher eventPublisher;

    public ChatController(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    @MessageMapping("/chat/{contestId}/send")
    public void receiveMessage(
            @DestinationVariable String contestId,
            @Payload ChatCommand request,
            Principal principal
    ) {
        String userId = principal.getName();

        String displayName = request.getSenderName();
        if (displayName == null || displayName.isBlank()) {
            displayName = "Użytkownik " + userId;
        }

        eventPublisher.publishEvent(new ContestChatMessageEvent(
                contestId,
                userId,
                displayName,
                request.getContent(),
                Instant.now()
        ));
    }
}
