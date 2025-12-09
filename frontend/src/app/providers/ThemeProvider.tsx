import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import React from 'react';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};