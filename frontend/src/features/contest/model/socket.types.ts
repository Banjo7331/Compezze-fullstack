// features/contest/model/contestSocket.types.ts

export type ContestSocketEventType = 
    | 'STAGE_CHANGED' 
    | 'PARTICIPANT_JOINED' 
    | 'VOTE_RECORDED' 
    | 'SUBMISSION_PRESENTED' 
    | 'CONTEST_FINISHED';

export interface BaseContestSocketMessage {
    event: ContestSocketEventType;
}

// Odpowiednik: ContestStageChangedSocketMessage
export interface StageChangedMessage extends BaseContestSocketMessage {
    event: 'STAGE_CHANGED';
    stageId: number;
    stageName: string;
    stageType: string;
}

// Odpowiednik: ParticipantJoinedSocketMessage
export interface ParticipantJoinedMessage extends BaseContestSocketMessage {
    event: 'PARTICIPANT_JOINED';
    userId: string;
    displayName: string;
}

// Odpowiednik: VoteUpdateSocketMessage
export interface VoteUpdateMessage extends BaseContestSocketMessage {
    event: 'VOTE_RECORDED';
    submissionId: string;
    newTotalScore: number;
}

// Odpowiednik: SubmissionPresentedSocketMessage
export interface SubmissionPresentedMessage extends BaseContestSocketMessage {
    event: 'SUBMISSION_PRESENTED';
    submissionId: string;
    participantName: string;
    contentUrl: string;
    contentType: 'IMAGE' | 'VIDEO' | 'AUDIO';
}

// Odpowiednik: ContestFinishedSocketMessage
export interface ContestFinishedMessage extends BaseContestSocketMessage {
    event: 'CONTEST_FINISHED';
    contestId: string;
}

export type ContestSocketMessage = 
    | StageChangedMessage 
    | ParticipantJoinedMessage 
    | VoteUpdateMessage 
    | SubmissionPresentedMessage 
    | ContestFinishedMessage;