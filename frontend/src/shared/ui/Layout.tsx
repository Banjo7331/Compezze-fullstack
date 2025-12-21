import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout as AntLayout } from 'antd';
import NavBar from './Navbar'; 
import { NotificationCenter } from '@/shared/ui/NotificationCenter';
import { useAuth } from '@/features/auth/AuthContext';

import { surveySocket } from '@/features/survey/api/surveySocket';
import { useSurveyInviteListener } from '@/features/survey/hooks/useSurveyInviteListener';

import { quizSocket } from '@/features/quiz/api/quizSocket';
import { useQuizInviteListener } from '@/features/quiz/hooks/useQuizInviteListener';

import { contestSocket } from '@/features/contest/api/contestSocket';
import { useContestInviteListener } from '@/features/contest/hooks/useContestInviteListener';

const { Content, Footer } = AntLayout;

export const Layout = () => {
  const { currentUserId } = useAuth();

  useEffect(() => {
    if (currentUserId) {
      if (!surveySocket.isActive()) {
        surveySocket.activate();
      }

      if (!quizSocket.isActive()) {
        quizSocket.activate();
      }

      if (!contestSocket.isActive()) {
        contestSocket.activate();
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
    <AntLayout style={{ minHeight: '100vh' }}>
      <NavBar />
      
      <Content style={{ padding: '24px 50px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', color: '#8c8c8c' }}>
        © 2025 Compezze App
      </Footer>

      <NotificationCenter />
    </AntLayout>
  );
};