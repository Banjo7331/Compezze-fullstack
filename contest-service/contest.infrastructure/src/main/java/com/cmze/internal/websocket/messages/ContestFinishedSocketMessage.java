package com.cmze.internal.websocket.messages;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ContestFinishedSocketMessage extends ContestSocketMessage {

    private Long contestId;

    public ContestFinishedSocketMessage(Long contestId) {
        super("CONTEST_FINISHED");
        this.contestId = contestId;
    }
}
