package com.cmze.controller.ws;

import com.cmze.request.ChatCommand;
import com.cmze.usecase.session.SendChatMessageUseCase;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class ContestRoomController {

    private final SendChatMessageUseCase sendChatMessageUseCase;

    public  ContestRoomController(SendChatMessageUseCase sendChatMessageUseCase) {
        this.sendChatMessageUseCase = sendChatMessageUseCase;
    }

//    @MessageMapping("/rooms/{roomKey}/chat.send")
//    public void sendChat(@DestinationVariable String roomKey,
//                         @Payload @Valid ChatCommand cmd,
//                         @Header("simpSessionAttributes") Map<String, Object> attrs) {
//        String userId = attrs != null && attrs.get("userId") != null ? attrs.get("userId").toString() : null;
//        sendChatMessageUseCase.execute(roomKey, userId, cmd);
//    }
}
