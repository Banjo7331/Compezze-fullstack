package com.cmze.spi;

import com.cmze.response.event.ChatEvent;
import com.cmze.response.event.RoomEvent;

public interface RoomGateway {
    void publishRoomEvent(RoomEvent event);
    void publishChatEvent(ChatEvent event);
}