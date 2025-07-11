import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 관리자 테마 설정
const adminTheme = createTheme({
  palette: {
    primary: {
      main: '#FF7F50',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

interface AdminThemeProviderProps {
  children: React.ReactNode;
}

export const AdminThemeProvider: React.FC<AdminThemeProviderProps> = ({
  children,
}) => {
  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
