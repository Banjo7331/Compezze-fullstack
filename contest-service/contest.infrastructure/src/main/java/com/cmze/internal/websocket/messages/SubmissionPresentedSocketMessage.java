package com.cmze.internal.websocket.messages;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SubmissionPresentedSocketMessage extends ContestSocketMessage {

    private String submissionId;
    private String participantName;
    private String contentUrl;
    private String contentType;

    public SubmissionPresentedSocketMessage(String submissionId, String participantName, String contentUrl, String contentType) {
        super("SUBMISSION_PRESENTED");
        this.submissionId = submissionId;
        this.participantName = participantName;
        this.contentUrl = contentUrl;
        this.contentType = contentType;
    }
}
