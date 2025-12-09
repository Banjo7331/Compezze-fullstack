package com.cmze.internal.ws.messages;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvitationSocketMessage {
    private String roomId;
    private String title;
    private String invitationToken;
}
