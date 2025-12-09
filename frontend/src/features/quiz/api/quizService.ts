import { apiClient } from '@/shared/api/apiClient';
import type { Page, PageableParams } from '@/shared/api/types';
import type { 
    CreateQuizFormRequest, 
    MyQuizFormDto, 
    GetQuizFormSummaryResponse,
    CreateQuizRoomRequest, 
    JoinQuizRoomResponse,
    MyQuizRoomDto,
    GetActiveQuizRoomResponse,
    GetQuizRoomDetailsResponse,
    SubmitAnswerResponse
} from '../model/types';

const BASE_URL = '/quiz'; 

export const quizService = {
    createForm: async (data: CreateQuizFormRequest) => {
        const response = await apiClient.post(`${BASE_URL}/form`, data);
        return response.data;
    },
    getMyForms: async (params: PageableParams) => {
        const response = await apiClient.get<Page<MyQuizFormDto>>(`${BASE_URL}/form/my`, { params });
        return response.data;
    },
    getAllForms: async (params: PageableParams) => {
        const response = await apiClient.get<Page<GetQuizFormSummaryResponse>>(`${BASE_URL}/form`, { params });
        return response.data;
    },
    searchForms: async (query: string) => {
        const response = await apiClient.get<Page<GetQuizFormSummaryResponse>>(`${BASE_URL}/form`, { 
            params: { search: query, page: 0, size: 5 }
        });
        return response.data.content;
    },
    deleteForm: async (id: number) => {
        await apiClient.delete(`${BASE_URL}/form/${id}`);
    },
    createRoom: async (data: CreateQuizRoomRequest) => {
        const response = await apiClient.post<{ roomId: string }>(`${BASE_URL}/room`, data);
        return response.data;
    },
    joinRoom: async (roomId: string, nickname: string, invitationToken?: string | null) => {
        const payload = { 
            invitationToken: invitationToken || null,
            nickname: nickname
        };
        const response = await apiClient.post<JoinQuizRoomResponse>(`${BASE_URL}/room/${roomId}/join`, payload);
        return response.data;
    },
    getRoomDetails: async (roomId: string) => {
        const response = await apiClient.get<GetQuizRoomDetailsResponse>(`${BASE_URL}/room/${roomId}`);
        return response.data;
    },
    getActiveRooms: async (params: PageableParams) => {
        const response = await apiClient.get<Page<GetActiveQuizRoomResponse>>(`${BASE_URL}/room/active`, { params });
        return response.data;
    },
    getMyRoomsHistory: async (params: PageableParams) => {
        const response = await apiClient.get<Page<MyQuizRoomDto>>(`${BASE_URL}/room/my`, { params });
        return response.data;
    },
    startQuiz: async (roomId: string) => {
        await apiClient.post(`${BASE_URL}/room/${roomId}/start`);
    },
    nextQuestion: async (roomId: string) => {
        await apiClient.post(`${BASE_URL}/room/${roomId}/question/next`);
    },
    finishQuestionManually: async (roomId: string) => {
        await apiClient.post(`${BASE_URL}/room/${roomId}/question/finish`);
    },
    closeRoom: async (roomId: string) => {
        await apiClient.post(`${BASE_URL}/room/${roomId}/close`);
    },
    submitAnswer: async (roomId: string, questionId: number, selectedOptionId: number) => {
        const response = await apiClient.post<SubmitAnswerResponse>(`${BASE_URL}/room/${roomId}/submit`, {
            questionId,
            selectedOptionId
        });
        return response.data; 
    },
    generateInvites: async (roomId: string, userIds: string[]) => {
        const payload = { userIds };
        const response = await apiClient.post<Record<string, string>>(`${BASE_URL}/room/${roomId}/invites`, payload);
        return response.data;
    }
};