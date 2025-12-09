import React, { useEffect } from 'react';
import { Container, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { LoginForm } from '@/features/auth/components/LoginForm'; 
import { useAuth } from '@/features/auth/AuthContext';

const LoginPage = () => {
    const { isAuthenticated, isInitializing } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isInitializing && isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, isInitializing, navigate]);

    if (isInitializing) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Checking session...</Typography>
            </Container>
        );
    }
    
    return (
        <Container
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
            }}
        >
            <LoginForm />
        </Container>
    );
};

export default LoginPage;