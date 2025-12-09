package com.cmze.response.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomEvent {
    public enum Type {
        ROOM_READY,
        CONTEST_STARTED,
        PUBLIC_VOTE_ACCEPTED,
        JURY_SCORE_BUFFERED,
        JURY_SCORE_ACCEPTED,
        JURY_ENTRY_REVEALED,
        STAGE_CHANGED,
        CONTEST_FINISHED,
        ERROR,
        ADMIN_START_FAILED
    }

    private Type   type;
    private long   atEpochMs;      // timestamp serwera
    private String roomKey;
    private Object payload;        // dowolny lekki payload (Map/DTO)

    public static RoomEvent of(Type t, String roomKey, Object payload) {
        return new RoomEvent(t, System.currentTimeMillis(), roomKey, payload);
    }
    public static RoomEvent error(String roomKey, String msg) {
        return of(Type.ERROR, roomKey, java.util.Map.of("message", msg));
    }
}
