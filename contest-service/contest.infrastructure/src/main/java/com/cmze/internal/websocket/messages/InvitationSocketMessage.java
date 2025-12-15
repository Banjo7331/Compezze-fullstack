package com.cmze.internal.websocket.messages;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class InvitationSocketMessage extends ContestSocketMessage{
    private String contestId;
    private String title;
    private String token;
    private String inviterName;

    public InvitationSocketMessage(String contestId, String title, String token, String inviterName) {
        super("CONTEST_INVITATION");
        this.contestId = contestId;
        this.title = title;
        this.token = token;
        this.inviterName = inviterName;
    }
}

