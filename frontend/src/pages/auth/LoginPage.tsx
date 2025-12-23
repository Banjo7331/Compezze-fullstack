import React, { useEffect } from 'react';
import { Spin, Typography } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { LoginForm } from '@/features/auth/components/LoginForm'; 
import { useAuth } from '@/features/auth/AuthContext';

const { Text } = Typography;

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
            backgroundColor: '#f0f2f5',
            padding: '20px'
        }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                
                <LoginForm />

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Text type="secondary">Don't have an account? </Text>
                    <Link to="/register" style={{ fontWeight: 500 }}>
                        Register now
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;