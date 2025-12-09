import { apiClient } from '@/shared/api/apiClient';
import type { 
    LoginRequest, 
    AuthResponse, 
    RegisterRequest,
    UserDto
} from '../model/types'; 

export const authApi = {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },
    register: async (data: RegisterRequest): Promise<string> => {
        const response = await apiClient.post<string>('/auth/register', data);
        return response.data;
    },
    refresh: async (): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/refresh', {});
        return response.data;
    },
    getMe: async (): Promise<UserDto> => {
        const response = await apiClient.get<UserDto>('/users/me');
        return response.data;
    },
    logout: async (): Promise<string> => {
        const response = await apiClient.post<string>('/auth/logout', {});
        return response.data;
    },
};