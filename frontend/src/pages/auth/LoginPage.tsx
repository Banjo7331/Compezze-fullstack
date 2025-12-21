import React, { useEffect } from 'react';
import { Spin } from 'antd';
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
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <Spin size="large" />
                <span>Checking session...</span>
            </div>
        );
    }
    
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f2f5'
        }}>
            <LoginForm />
        </div>
    );
};

export default LoginPage;