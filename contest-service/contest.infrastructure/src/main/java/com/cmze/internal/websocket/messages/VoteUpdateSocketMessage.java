package com.cmze.internal.websocket.messages;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class VoteUpdateSocketMessage extends ContestSocketMessage {

    private String submissionId;
    private Number newTotalScore;

    public VoteUpdateSocketMessage(String submissionId, Number newTotalScore) {
        super("VOTE_UPDATE");
        this.submissionId = submissionId;
        this.newTotalScore = newTotalScore;
    }
}
