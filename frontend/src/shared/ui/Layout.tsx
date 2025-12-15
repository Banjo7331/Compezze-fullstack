import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import NavBar from './Navbar'; 

import { surveySocket } from '@/features/survey/api/surveySocket';
import { useSurveyInviteListener } from '@/features/survey/hooks/useSurveyInviteListener';

import { quizSocket } from '@/features/quiz/api/quizSocket';
import { useQuizInviteListener } from '@/features/quiz/hooks/useQuizInviteListener';

import { contestSocket } from '@/features/contest/api/contestSocket';
import { useContestInviteListener } from '@/features/contest/hooks/useContestInviteListener';

import { NotificationCenter } from '@/shared/ui/NotificationCenter';
import { useAuth } from '@/features/auth/AuthContext';

export const Layout = () => {
  const { currentUserId } = useAuth();

  useEffect(() => {
    if (currentUserId) {
      
      if (!surveySocket.isActive()) {
          console.log("[Layout] Activating Survey Socket...");
          surveySocket.activate();
      }

      if (!quizSocket.isActive()) {
          console.log("[Layout] Activating Quiz Socket...");
          quizSocket.activate();
      }

      if (!contestSocket.isActive()) {
          console.log("[Layout] Activating Contest Socket...");
          quizSocket.activate();
      }

    } else {
      if (surveySocket.isActive()) surveySocket.deactivate();
      if (quizSocket.isActive()) quizSocket.deactivate();
      if (contestSocket.isActive()) contestSocket.deactivate();
    }
    
  }, [currentUserId]);

  useSurveyInviteListener({ autoRedirect: false });
  useQuizInviteListener({ autoRedirect: false });
  useContestInviteListener({ autoRedirect: false });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      <NavBar /> 
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
      <Box component="footer" sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center', mt: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
            © 2025 Compezze App
        </Typography>
      </Box>
      <NotificationCenter />
      
    </Box>
  );
};