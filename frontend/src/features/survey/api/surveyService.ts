import { apiClient } from '@/shared/api/apiClient';
import type { CreateSurveyFormRequest, CreateRoomRequest, SurveyFormResponse, RoomResponse, JoinSurveyRoomResponse, SubmitParticipantAnswerRequest, SubmitSurveyAttemptRequest, SurveyRoomDetailsResponse, ActiveRoomResponse, MySurveyFormDto, MySurveyRoomDto } from '../model/types';

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface PageableParams {
    page?: number;
    size?: number;
    sort?: string;
}


export const surveyService = {
  createSurveyForm: async (data: CreateSurveyFormRequest) => {
    const response = await apiClient.post<SurveyFormResponse>('/survey/form', data);
    return response.data;
  },
  getSurveyFormByRoomId: async (roomId: string) => {
    const response = await apiClient.get<SurveyFormResponse>(`/survey/room/${roomId}/form`);
    return response.data;
  },
  getAllForms: async (params?: PageableParams) => {
    const response = await apiClient.get<Page<SurveyFormResponse>>('/survey/form', { params });
    return response.data;
  },
  searchForms: async (query: string) => {
    const response = await apiClient.get<Page<SurveyFormResponse>>(`/survey/form`, { 
        params: { search: query, page: 0, size: 5 }
    });
    return response.data.content;
  },
  getMyForms: async (params: PageableParams) => {
    const response = await apiClient.get<Page<MySurveyFormDto>>('/survey/form/my', { params });
    return response.data;
  },
  getMyRoomsHistory: async (params: PageableParams) => {
    const response = await apiClient.get<Page<MySurveyRoomDto>>('/survey/room/my', { params });
    return response.data;
  },
  deleteForm: async (formId: number) => {
    const response = await apiClient.delete(`/survey/form/${formId}`);
    return response.data;
  },
  createRoom: async (data: CreateRoomRequest) => {
    const response = await apiClient.post<RoomResponse>('/survey/room', data);
    return response.data;
  },
  getActiveRooms: async (params?: PageableParams) => {
    const response = await apiClient.get<Page<ActiveRoomResponse>>('/survey/room/active', { params });
    return response.data;
  },
  getRoomDetails: async (roomId: string) => {
    const response = await apiClient.get<SurveyRoomDetailsResponse>(`/survey/room/${roomId}`);
    return response.data;
  },
  joinRoom: async (roomId: string, invitationToken?: string | null) => {
    const payload = { invitationToken: invitationToken || null };
    
    const response = await apiClient.post<JoinSurveyRoomResponse>(
        `/survey/room/${roomId}/join`, 
        payload
    );
    return response.data;
  },
  submitAnswers: async (roomId: string, request: SubmitSurveyAttemptRequest) => {
    const response = await apiClient.post(`/survey/room/${roomId}/submit`, request);
    return response.data;
  },
  closeRoom: async (roomId: string) => {
    const response = await apiClient.post(`/survey/room/${roomId}/close`);
    return response.data;
  },
  generateInvites: async (roomId: string, userIds: string[]) => {
    const payload = { userIds }; 
    
    const response = await apiClient.post<Record<string, string>>(
        `/survey/room/${roomId}/invites`, 
        payload
    );
    return response.data;
  },
};