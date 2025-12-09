import type { FinalRoomResultDto } from './socket.types';

export const QuestionType = {
    SINGLE_CHOICE: 'SINGLE_CHOICE',
    MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
    TRUE_FALSE: 'TRUE_FALSE'
} as const;
export type QuestionType = typeof QuestionType[keyof typeof QuestionType];

export const QuizRoomStatus = {
    LOBBY: 'LOBBY',
    QUESTION_ACTIVE: 'QUESTION_ACTIVE',
    QUESTION_FINISHED: 'QUESTION_FINISHED',
    LEADERBOARD: 'LEADERBOARD',
    FINISHED: 'FINISHED'
} as const;
export type QuizRoomStatus = typeof QuizRoomStatus[keyof typeof QuizRoomStatus];

export interface QuizOption {
    text: string;
    isCorrect: boolean;
}

export interface QuizQuestion {
    title: string;
    type: QuestionType;
    points: number;
    options: QuizOption[];
}

export interface CreateQuizFormRequest {
    title: string;
    isPrivate: boolean;
    questions: QuizQuestion[];
}

export interface MyQuizFormDto {
    id: number;
    title: string;
    isPrivate: boolean;
    createdAt: string;
    questionsCount: number;
}

export interface GetQuizFormSummaryResponse {
    id: number;
    title: string;
    isPrivate: boolean;
    creatorId: string;
}

export interface CreateQuizRoomRequest {
    quizFormId: number;
    maxParticipants?: number;
    timePerQuestion?: number;
    isPrivate: boolean;
}

export interface CreateQuizRoomResponse {
    roomId: string;
    quizFormId: number;
    quizTitle: string;
}

export interface JoinQuizRoomResponse {
    participantId: number;
    host: boolean;
    status: QuizRoomStatus;
    quizInfo: {
        id: number;
        title: string;
        totalQuestions: number;
    };
}

export interface GetQuestionOptionResponse {
    id: number;
    text: string;
}

export interface GetCurrentQuestionResponse {
    questionId: number;
    questionIndex: number;
    title: string;
    timeLimitSeconds: number;
    startTime: string; 
    options: GetQuestionOptionResponse[];
}

export interface GetQuizRoomDetailsResponse {
    roomId: string;
    quizTitle: string;
    hostId: string;
    participant: boolean;
    status: QuizRoomStatus;
    isPrivate: boolean;
    currentParticipants: number;
    currentResults: FinalRoomResultDto;
    currentQuestion?: GetCurrentQuestionResponse;
}

export interface MyQuizRoomDto {
    roomId: string;
    quizTitle: string;
    isOpen: boolean;
    status: QuizRoomStatus;
    isPrivate: boolean;
    createdAt: string;
    validUntil?: string;
    totalParticipants: number;
    totalSubmissions: number;
}

export interface GetActiveQuizRoomResponse {
    roomId: string;
    quizTitle: string;
    hostId: string;
    participantsCount: number;
    maxParticipants: number;
    status: QuizRoomStatus;
}

export interface SubmitAnswerResponse {
    correct: boolean;
    pointsAwarded: number;
    currentTotalScore: number;
    comboStreak: number;
}

export interface WSMessage {
    event: string;
    [key: string]: any;
}