import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Spin } from 'antd';

import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { SnackbarProvider } from '@/app/providers/SnackbarProvider';
import { NotificationProvider } from './NotificationProvider'; 
import { RouterProvider } from './RouterProvider';
import { AuthProvider } from '@/features/auth/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const ErrorFallback = () => (
  <div style={{ padding: 20, textAlign: 'center', color: '#ff4d4f' }}>
    Something went wrong
  </div>
);

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
);

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <SnackbarProvider>
              <NotificationProvider>
                <AuthProvider>
                  <RouterProvider>
                    {children}
                  </RouterProvider>
                </AuthProvider>
              </NotificationProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </Suspense>
  );
};