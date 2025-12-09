import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { RegisterRequest } from '../model/types';

export const useRegister = () => {
    const { mutate, isPending, isSuccess, error } = useMutation<string, Error, RegisterRequest>({
        mutationFn: (data) => authApi.register(data),
    });

    return {
        register: (data: RegisterRequest) => mutate(data),
        isLoading: isPending,
        isSuccess,
        error: error ? error.message : null,
    };
};