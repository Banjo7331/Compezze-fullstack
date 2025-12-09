import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { SurveyCreateForm } from '@/features/survey/components/SurveyCreateForm'; 

const SurveyCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/survey');
  };

  const handleFormCreated = () => {
    navigate('/survey'); 
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Utwórz Nową Ankietę
        </Typography>
        
        <SurveyCreateForm 
            onCancel={handleCancel} 
            onSuccess={handleFormCreated}
        />
        
      </Box>
    </Container>
  );
};

export default SurveyCreatePage;