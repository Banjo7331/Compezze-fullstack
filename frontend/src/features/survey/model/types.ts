import type { FinalRoomResultDto } from 'src/features/survey/model/socket.types';

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'OPEN_TEXT';

export const QuestionTypeValues: Record<QuestionType, QuestionType> = {
    SINGLE_CHOICE: 'SINGLE_CHOICE',
    MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
    OPEN_TEXT: 'OPEN_TEXT',
};

export interface CreateQuestionRequest {
    title: string;
    type: QuestionType;
    possibleChoices: string[];
}

export interface CreateSurveyFormRequest {
    title: string;
    isPrivate: boolean;
    questions: CreateQuestionRequest[];
}

export interface CreateRoomRequest {
    surveyFormId: number; 
    maxParticipants?: number;
    durationMinutes?: number;
}

export interface SurveyFormResponse {
    surveyFormId: number;
    title: string;
    isPrivate: boolean; 
    creatorId: string; 
}

export interface JoinSurveyRoomResponse {
    participantId: number;
    survey: SurveyFormStructure;
    hasSubmitted: boolean;
    host: boolean;
}

export interface SurveyFormStructure {
    id: number;
    title: string;
    questions: GetQuestionResponse[];
}

export interface GetQuestionResponse {
    id: number;
    title: string;
    type: QuestionType;
    possibleChoices: string[];
}

export interface RoomResponse {
    roomId: string;
}

export interface ActiveRoomResponse {
    roomId: string;
    surveyTitle: string;
    hostId: string;
    currentParticipants: number;
    maxParticipants: number;
}

export interface SurveyRoomDetailsResponse {
    roomId: string;
    surveyTitle: string;
    hostId: string;
    open: boolean;
    isPrivate: boolean;
    currentParticipants: number;
    currentResults: FinalRoomResultDto;
}

export interface SubmitParticipantAnswerRequest {
    questionId: number;
    answers: string[];
}

export interface MySurveyFormDto {
    id: number;
    title: string;
    isPrivate: boolean;
    createdAt: string; 
    questionsCount: number;
}

export interface MySurveyRoomDto {
    roomId: string;
    surveyTitle: string;
    isOpen: boolean;
    isPrivate: boolean;
    createdAt: string;
    validUntil?: string;
    totalParticipants: number;
    totalSubmissions: number;
}

export interface SubmitSurveyAttemptRequest {
    surveyId: number;
    participantAnswers: SubmitParticipantAnswerRequest[];
}

export interface WSMessage {
    event?: string;
    newParticipantCount?: number;
    participantUserId?: string;
    currentResults?: {
        totalSubmissions: number;
    };
}