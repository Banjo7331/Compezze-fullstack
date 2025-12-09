package com.cmze.internal.ws.messages;

import com.cmze.spi.helpers.room.FinalRoomResultDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomClosedSocketMessage {
    private String event = "ROOM_CLOSED";
    private FinalRoomResultDto finalResults;

    public RoomClosedSocketMessage(FinalRoomResultDto finalResults) {
        this.finalResults = finalResults;
    }
}
