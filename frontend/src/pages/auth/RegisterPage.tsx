import React from 'react';
import { Container, Paper, Box } from '@mui/material';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <Container 
      maxWidth="xs"
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
        <RegisterForm />
      </Paper>
    </Container>
  );
};

export default RegisterPage;