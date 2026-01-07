package com.cmze.internal.websocket.messages;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContestInvitationSocketMessage {
    private String contestId;
    private String name;
    private String invitationToken;
}