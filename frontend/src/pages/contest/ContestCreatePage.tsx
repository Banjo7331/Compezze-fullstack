import React from 'react';
import { Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { ContestCreateForm } from '@/features/contest/components/ContestCreateForm';

const ContestCreatePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <ContestCreateForm 
                    onCancel={() => navigate('/contest')} 
                    onSuccess={() => navigate('/profile')}
                />
            </Box>
        </Container>
    );
};

export default ContestCreatePage;