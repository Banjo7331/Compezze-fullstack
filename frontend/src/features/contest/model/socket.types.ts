export type ContestSocketEventType = 
    | 'STAGE_CHANGED' 
    | 'PARTICIPANT_JOINED' 
    | 'VOTE_RECORDED' 
    | 'SUBMISSION_PRESENTED' 
    | 'CONTEST_FINISHED'
    | 'CHAT_MESSAGE';

export interface BaseContestSocketMessage {
    event: ContestSocketEventType;
}

export interface StageChangedMessage extends BaseContestSocketMessage {
    event: 'STAGE_CHANGED';
    stageId: number;
    stageName: string;
    stageType: string;
}

export interface ParticipantJoinedMessage extends BaseContestSocketMessage {
    event: 'PARTICIPANT_JOINED';
    userId: string;
    displayName: string;
}

export interface VoteUpdateMessage extends BaseContestSocketMessage {
    event: 'VOTE_RECORDED';
    submissionId: string;
    newTotalScore: number;
}

export interface SubmissionPresentedMessage extends BaseContestSocketMessage {
    event: 'SUBMISSION_PRESENTED';
    submissionId: string;
    participantName: string;
    contentUrl: string;
    contentType: 'IMAGE' | 'VIDEO' | 'AUDIO';
}

export interface ContestFinishedMessage extends BaseContestSocketMessage {
    event: 'CONTEST_FINISHED';
    contestId: string;
}

export interface ChatSocketMessage extends BaseContestSocketMessage {
    event: 'CHAT_MESSAGE';
    userId: string;
    userDisplayName: string;
    content: string;
    timestamp: string;
}

export type ContestSocketMessage = 
    | StageChangedMessage 
    | ParticipantJoinedMessage 
    | VoteUpdateMessage 
    | SubmissionPresentedMessage 
    | ContestFinishedMessage
    | ChatSocketMessage; 
