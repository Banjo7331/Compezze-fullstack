import { apiClient } from '@/shared/api/apiClient';
import type { Page, PageableParams } from '@/shared/api/types';
import type { 
    CreateContestRequest, 
    CreateContestResponse,
    StageRequest,
    UpcomingContestDto,
    ContestDetailsDto,
    SubmissionStatus,
    ContestParticipantDto,
    SubmissionDto,
    ReviewAction
} from '../model/types';

import type { PublicContestParams } from '../model/specification';

const BASE_URL = '/contest'; 

interface ReorderStagesRequest {
    stageIds: number[];
}

export const contestService = {

    createContest: async (data: CreateContestRequest) => {
        const response = await apiClient.post<CreateContestResponse>(BASE_URL, data);
        return response.data;
    },
    getPublicContests: async (params: PublicContestParams) => {
        const response = await apiClient.get(`${BASE_URL}/public`, { params });
        return response.data; 
    },
    updateStage: async (contestId: string, stageId: number, data: any) => {
        await apiClient.put(`${BASE_URL}/${contestId}/stage/${stageId}`, data);
    },
    reorderStages: async (contestId: string, stageIds: number[]) => {
        const payload: ReorderStagesRequest = { stageIds };
        await apiClient.patch(`${BASE_URL}/${contestId}/stage/reorder`, payload);
    },
    getUpcomingContest: async () => {
        const response = await apiClient.get<UpcomingContestDto | null>(`${BASE_URL}/upcoming`);
        return response.data;
    },

    getMyParticipatedContests: async (params: PageableParams) => {
        const response = await apiClient.get<Page<UpcomingContestDto>>(`${BASE_URL}/my/participated`, { params });
        return response.data;
    },

    getMyContests: async (params: PageableParams) => {
        const response = await apiClient.get<Page<UpcomingContestDto>>(`${BASE_URL}/my/organized`, { params });
        return response.data;
    },
    getStageAccessUrl: async (stageId: number) => {
        const response = await apiClient.get<{ url: string }>(`${BASE_URL}/stage/${stageId}/access-url`);
        return response.data.url;
    },

    closeSubmissions: async (contestId: string) => {
        await apiClient.post(`${BASE_URL}/${contestId}/close-submissions`);
    },

    reviewSubmission: async (contestId: string, submissionId: string, status: ReviewAction, comment?: string) => {
        await apiClient.put(`${BASE_URL}/${contestId}/submission/${submissionId}/review`, {
            status,
            comment
        });
    },
    getContestDetails: async (id: string) => {
        const response = await apiClient.get<ContestDetailsDto>(`${BASE_URL}/${id}`);
        return response.data;
    },
    joinContest: async (id: string) => {
        await apiClient.post(`${BASE_URL}/${id}/join`);
    },
    getParticipants: async (contestId: string, query?: string) => {
        const response = await apiClient.get<ContestParticipantDto[]>(`${BASE_URL}/${contestId}/participant`, {
            params: { search: query }
        });
        return response.data;
    },
    submitEntry: async (contestId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        await apiClient.post(`${BASE_URL}/${contestId}/submission`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    withdrawMySubmission: async (contestId: string) => {
        await apiClient.delete(`${BASE_URL}/${contestId}/submission/my`);
    },
    manageRole: async (contestId: string, targetUserId: string, role: string, assign: boolean) => {
        await apiClient.put(`${BASE_URL}/${contestId}/roles`, {
            targetUserId,
            role,
            assign
        });
    },
    getSubmissionsForReview: async (contestId: string, status: string = 'PENDING') => {
        const response = await apiClient.get<SubmissionDto[]>(`${BASE_URL}/${contestId}/submission`, {
            params: { status }
        });
        return response.data;
    },
    getSubmissionMediaUrl: async (contestId: string, submissionId: string) => {
        const response = await apiClient.get<{ url: string }>(`${BASE_URL}/${contestId}/submission/${submissionId}/url`);
        return response.data.url;
    },
    deleteSubmission: async (contestId: string, submissionId: string) => {
        await apiClient.delete(`${BASE_URL}/${contestId}/submission/${submissionId}`);
    },

    createRoom: async (contestId: string) => {
        await apiClient.post(`${BASE_URL}/${contestId}/room`);
    },

    getRoomDetails: async (contestId: string) => {
        const response = await apiClient.get<any>(`${BASE_URL}/${contestId}/room`);
        return response.data;
    },
    startContest: async (contestId: string, roomId: string) => {
        await apiClient.post(`${BASE_URL}/${contestId}/room/${roomId}/start`);
    },

    nextStage: async (contestId: string, roomId: string) => {
        await apiClient.post(`${BASE_URL}/${contestId}/room/${roomId}/next-stage`);
    },
    finishStage: async (contestId: string, roomId: string) => {
        await apiClient.post(`${BASE_URL}/${contestId}/room/${roomId}/finish-stage`);
    },

    closeContest: async (contestId: string, roomId: string) => {
        await apiClient.post(`${BASE_URL}/${contestId}/room/${roomId}/close`);
    },

    getStageAccessToken: async (contestId: string, roomId: string) => {
        const response = await apiClient.get<{ token: string }>(`${BASE_URL}/${contestId}/room/${roomId}/token`);
        return response.data;
    },
    vote: async (contestId: string, roomId: string, stageId: number, submissionId: string, score: number) => {
        await apiClient.post(`${BASE_URL}/${contestId}/room/${roomId}/vote`, {
            stageId,
            submissionId,
            score
        });
    },

    getAvatars: async (): Promise<string[]> => {
        const response = await apiClient.get<string[]>('/contest/resources/avatars');
        return response.data; 
    },
    getTemplates: async (): Promise<TemplateDto[]> => {
        const response = await apiClient.get<TemplateDto[]>('/contest/resources/templates');
        return response.data;
    }
};