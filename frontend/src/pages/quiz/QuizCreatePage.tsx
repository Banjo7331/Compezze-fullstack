import React from 'react';
import { Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { QuizCreateForm } from '@/features/quiz/components/QuizCreateForm';

const QuizCreatePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <QuizCreateForm 
                    onCancel={() => navigate('/quiz')} 
                    
                    onSuccess={() => navigate('/quiz')} 
                />
            </Box>
        </Container>
    );
};

export default QuizCreatePage;