import type { QuestionType } from './types';

export interface QuestionResultDto {
    questionId: number; 
    title: string;
    type: QuestionType;
    answerCounts: Record<string, number>;
    openAnswers: string[];
}

export interface FinalRoomResultDto {
    totalParticipants: number;
    totalSubmissions: number;
    results: QuestionResultDto[];
}

export interface UserJoinedSocketMessage {
    event: 'USER_JOINED';
    participantId: number; 
    userId: string;
    newParticipantCount: number;
}

export interface LiveResultUpdateSocketMessage {
    event: 'LIVE_RESULTS_UPDATE';
    currentResults: FinalRoomResultDto;
}

export interface RoomClosedSocketMessage {
    event: 'ROOM_CLOSED';
    finalResults: FinalRoomResultDto;
}

export type SurveySocketMessage = 
    | UserJoinedSocketMessage 
    | LiveResultUpdateSocketMessage 
    | RoomClosedSocketMessage;