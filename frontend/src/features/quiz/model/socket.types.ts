import type { QuizRoomStatus } from './types';

export interface LeaderboardEntryDto {
    userId: string;
    nickname: string;
    score: number;
    rank: number;
}

export interface FinalRoomResultDto {
    totalParticipants: number;
    leaderboard: LeaderboardEntryDto[];
}

export interface QuizUserJoinedMessage {
    event: 'USER_JOINED';
    participantId: number;
    userId: string;
    username: string;
    newParticipantCount: number;
}

export interface QuizStartedMessage {
    event: 'QUIZ_STARTED';
}

export interface QuizNewQuestionMessage {
    event: 'NEW_QUESTION';
    questionId: number;
    questionIndex: number;
    title: string;
    options: string[];
    timeLimitSeconds: number;
    startTime: string;
}

export interface QuizQuestionFinishedMessage {
    event: 'QUESTION_FINISHED';
    correctOptionId: number | null;
}

export interface QuizLeaderboardMessage {
    event: 'LEADERBOARD_UPDATE';
    topPlayers: LeaderboardEntryDto[];
}

export interface QuizRoomClosedMessage {
    event: 'ROOM_CLOSED';
    finalResults: FinalRoomResultDto;
}

export type QuizSocketMessage = 
    | QuizUserJoinedMessage
    | QuizStartedMessage
    | QuizNewQuestionMessage
    | QuizQuestionFinishedMessage
    | QuizLeaderboardMessage
    | QuizRoomClosedMessage;

export interface WSMessage {
    event: string;
    [key: string]: any;
}