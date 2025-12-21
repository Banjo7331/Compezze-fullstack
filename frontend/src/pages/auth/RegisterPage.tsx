import React from 'react';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        padding: '20px'
    }}>
        <RegisterForm />
    </div>
  );
};

export default RegisterPage;