package com.cmze.usecase.session;

import com.cmze.entity.Room;
import com.cmze.repository.RoomRepository;
import com.cmze.request.ChatCommand;
import com.cmze.response.event.ChatEvent;
import com.cmze.response.event.RoomEvent;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

import java.util.UUID;

@UseCase
public class SendChatMessageUseCase {

//    private final RoomRepository roomRepository;
//    private final RoomGateway roomGateway;
//
//    public SendChatMessageUseCase(RoomRepository roomRepository,
//                                  RoomGateway roomGateway) {
//        this.roomRepository = roomRepository;
//        this.roomGateway = roomGateway;
//    }
//
//    @Transactional
//    public ActionResult<Void> execute(String roomKey, String userId, ChatCommand cmd) {
//        Room room = roomRepository.findByRoomKey(roomKey);
//        if (room == null || !room.isActive()) {
//            roomGateway.publishRoomEvent(
//                    new RoomEvent(RoomEvent.Type.ERROR, System.currentTimeMillis(), roomKey, "Room not active or missing"));
//            return ActionResult.failure(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Room not active or missing"));
//        }
//
//        // (opcjonalnie) moderacja/anty-spam tutaj
//
//        ChatEvent event = new ChatEvent(
//                UUID.randomUUID().toString().replace("-", ""),
//                System.currentTimeMillis(),
//                userId,
//                cmd.getNickname(),
//                cmd.getText(),
//                ChatEvent.Type.CHAT_MESSAGE,
//                roomKey
//        );
//        roomGateway.publishChatEvent(event);
//        return ActionResult.success(null);
//    }
}
