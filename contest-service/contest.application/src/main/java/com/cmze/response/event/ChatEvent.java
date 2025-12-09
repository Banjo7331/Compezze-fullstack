package com.cmze.response.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatEvent {
    public enum Type { CHAT_MESSAGE }

    private String  messageId;   // UUID nadawany przez serwer
    private long    atEpochMs;   // timestamp serwera
    private String  userId;      // z sesji/JWT (nie z payloadu)
    private String  nickname;    // to co chcemy pokazać
    private String  text;        // treść po ewent. filtracji
    private Type type;
    private String  roomKey;     // kanał, na który poszło
}