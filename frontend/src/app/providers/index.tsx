import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ThemeProvider } from './ThemeProvider';
import { SnackbarProvider } from './SnackbarProvider';
import { NotificationProvider } from './NotificationProvider';
import { RouterProvider } from './RouterProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/features/auth/AuthContext'; 

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const ErrorFallback = () => <div>Wystąpił błąd aplikacji</div>;

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <React.Suspense fallback={<div>Ładowanie...</div>}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider>
            <NotificationProvider>
              <AuthProvider> 
                <ThemeProvider>
                  <RouterProvider>{children}</RouterProvider>
                </ThemeProvider>
              </AuthProvider>
            </NotificationProvider>
          </SnackbarProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};