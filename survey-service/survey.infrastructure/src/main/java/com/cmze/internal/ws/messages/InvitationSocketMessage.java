package com.cmze.internal.ws.messages;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvitationSocketMessage {
    private String roomId;
    private String surveyTitle;
    private String invitationToken;
}
