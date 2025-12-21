import React, { createContext, useContext, useCallback } from 'react';
import { App } from 'antd';

interface SnackbarContextType {
  showNotification: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { message } = App.useApp();

  const showNotification = useCallback((content: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    message.open({
      type,
      content,
      duration: 3,
    });
  }, [message]);

  const showSuccess = useCallback((content: string) => showNotification(content, 'success'), [showNotification]);
  const showError = useCallback((content: string) => showNotification(content, 'error'), [showNotification]);

  return (
    <SnackbarContext.Provider value={{ showNotification, showSuccess, showError }}>
      {children}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};