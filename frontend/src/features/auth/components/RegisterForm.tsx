import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, TextField, Typography, Alert, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/shared/ui/Button'; 
import { registerSchema } from '../model/validation';
import type { RegisterRequest } from '../model/types';
import { useRegister } from '../hooks/useRegister';

type RegisterFormInput = RegisterRequest & { confirmPassword: string };

export const RegisterForm = () => {
    const { register, isLoading, isSuccess, error } = useRegister();
    const navigate = useNavigate();

    const { 
        control, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<RegisterFormInput>({ 
        resolver: yupResolver(registerSchema),
        defaultValues: { 
            username: '', 
            email: '', 
            password: '', 
            confirmPassword: '' 
        }, 
    });

    const onSubmit = (data: RegisterFormInput) => {
        const { confirmPassword, ...req } = data;
        register(req); 
    };

    useEffect(() => {
        if (isSuccess) {
            alert('Konto utworzone pomyślnie! Możesz się teraz zalogować.');
            navigate('/login');
        }
    }, [isSuccess, navigate]);

    return (
        <Box 
            component="form" 
            onSubmit={handleSubmit(onSubmit)} 
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 320 }}
        >
            <Typography variant="h5" align="center" gutterBottom>
                Utwórz Konto
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <Controller 
                name="username" 
                control={control} 
                render={({ field }) => (
                    <TextField 
                        {...field} 
                        label="Nazwa użytkownika" 
                        variant="outlined"
                        error={!!errors.username} 
                        helperText={errors.username?.message} 
                    />
                )} 
            />

            <Controller 
                name="email" 
                control={control} 
                render={({ field }) => (
                    <TextField 
                        {...field} 
                        label="Email" 
                        type="email"
                        variant="outlined"
                        error={!!errors.email} 
                        helperText={errors.email?.message} 
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

            <Controller 
                name="confirmPassword" 
                control={control} 
                render={({ field }) => (
                    <TextField 
                        {...field} 
                        label="Potwierdź hasło" 
                        type="password" 
                        variant="outlined"
                        error={!!errors.confirmPassword} 
                        helperText={errors.confirmPassword?.message} 
                    />
                )} 
            />

            <Button type="submit" disabled={isLoading} size="large">
                {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
            </Button>
            
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                Masz już konto?{' '}
                <MuiLink component={Link} to="/login" underline="hover">
                    Zaloguj się
                </MuiLink>
            </Typography>
        </Box>
    );
};