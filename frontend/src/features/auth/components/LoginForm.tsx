import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, TextField, Typography, Alert } from '@mui/material';
import { Button } from '@/shared/ui/Button';
import { loginSchema } from '../model/validation';
import type { LoginRequest } from '../model/types'; 
import { useLogin } from '../hooks/useLogin';

export const LoginForm = () => {
    const { 
        login, 
        isLoading, 
        error
    } = useLogin(); 

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginRequest>({ 
        resolver: yupResolver(loginSchema),
        defaultValues: { usernameOrEmail: '', password: '' }, 
    });

    const onSubmit = (data: LoginRequest) => {
        login(data); 
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 300 }}
        >
            <Typography variant="h5">Zaloguj się</Typography>
            {error && (
                <Alert severity="error">{error}</Alert> 
            )}

            <Controller
                name="usernameOrEmail"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Nazwa użytkownika / Email"
                        variant="outlined"
                        error={!!errors.usernameOrEmail}
                        helperText={errors.usernameOrEmail?.message}
                    />
                )}
            />

            <Controller
                name="password"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Hasło"
                        type="password"
                        variant="outlined"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />
                )}
            />

            <Button
                type="submit"
                disabled={isLoading} 
            >
                {isLoading ? 'Logowanie...' : 'Zaloguj'}
            </Button>
        </Box>
    );
};