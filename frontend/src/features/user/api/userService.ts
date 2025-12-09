import { apiClient } from '@/shared/api/apiClient';
import type { UserSummary } from '../model/types';

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

export const userService = {
    searchUsers: async (query: string): Promise<UserSummary[]> => {
        if (!query || query.length < 2) return [];
        const response = await apiClient.get<Page<UserSummary>>('/users/search', {
            params: { 
                query,
                size: 5 
            }
        });
        
        return response.data.content;
    }
};