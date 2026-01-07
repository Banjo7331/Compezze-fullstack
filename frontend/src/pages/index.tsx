import React, { lazy, Suspense } from 'react';
import { Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { Layout } from '@/shared/ui/Layout';
import { useAuth } from '@/features/auth/AuthContext';

const HomePage = lazy(() => import('./HomePage'));
const LoginPage = lazy(() => import('./auth/LoginPage'));
const RegisterPage = lazy(() => import('./auth/RegisterPage'));
const SurveyPage = lazy(() => import('./survey/SurveyPage'));
const SurveyCreatePage = lazy(() => import('./survey/SurveyCreatePage'));
const SurveyRoomPage = lazy(() => import('./survey/SurveyRoomPage'));

const QuizPage = lazy(() => import('./quiz/QuizPage'));
const QuizCreatePage = lazy(() => import('./quiz/QuizCreatePage'));
const QuizRoomPage = lazy(() => import('./quiz/QuizRoomPage'));

const ContestPage = lazy(() => import('./contest/ContestPage'));
const ContestCreatePage = lazy(() => import('./contest/ContestCreatePage'));
const ContestDetailsPage = lazy(() => import('./contest/ContestDetailsPage'));
const ContestJoinPage = lazy(() => import('./contest/ContestJoinPage'));
const ContestManagePage = lazy(() => import('./contest/ContestManagePage'));
const ContestReviewPage = lazy(() => import('./contest/ContestReviewPage'));
const ContestLivePage = lazy(() => import('./contest/ContestLivePage'));

const ProfilePage = lazy(() => import('./user/ProfilePage'));

const RequireAuth = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const Routing = () => {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" />
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />

          <Route element={<RequireAuth />}>
            <Route path="profile" element={<ProfilePage />} />
            
            <Route path="survey">
              <Route index element={<SurveyPage />} />
              <Route path="create" element={<SurveyCreatePage />} />
              <Route path="room/:roomId" element={<SurveyRoomPage />} />
              <Route path="join/:roomId" element={<SurveyRoomPage />} />
            </Route>

            <Route path="contest">
              <Route index element={<ContestPage />} />
              <Route path="create" element={<ContestCreatePage />} />
              <Route path=":contestId" element={<ContestDetailsPage />} />
              <Route path=":contestId/join" element={<ContestJoinPage />} />
              <Route path=":contestId/manage" element={<ContestManagePage />} />
              <Route path=":contestId/review" element={<ContestReviewPage />} />
              <Route path=":contestId/live" element={<ContestLivePage />} />
            </Route>

            <Route path="quiz">
              <Route index element={<QuizPage />} />
              <Route path="create" element={<QuizCreatePage />} />
              <Route path="room/:roomId" element={<QuizRoomPage />} />
              <Route path="join/:roomId" element={<QuizRoomPage />} />
            </Route>
          </Route>
          
        </Route>
        <Route path="*" element={<div>404 - Page not found</div>} />
      </Routes>
    </Suspense>
  );
};