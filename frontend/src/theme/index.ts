import { createTheme, ThemeOptions } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
    success: Palette['primary'];
    warning: Palette['primary'];
    error: Palette['primary'];
    info: Palette['primary'];
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
    success?: PaletteOptions['primary'];
    warning?: PaletteOptions['primary'];
    error?: PaletteOptions['primary'];
    info?: PaletteOptions['primary'];
  }
}

const baseTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
      contrastText: '#ffffff',
    },
    neutral: {
      main: '#64748B',
      light: '#94A3B8',
      dark: '#475569',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#ffffff',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          height: '100%',
          width: '100%',
        },
        body: {
          height: '100%',
          width: '100%',
          margin: 0,
          padding: 0,
        },
        '#root': {
          height: '100%',
          width: '100%',
        },
        'input:-webkit-autofill': {
          WebkitBoxShadow: '0 0 0 1000px white inset',
        },
        'input:-webkit-autofill:focus': {
          WebkitBoxShadow: '0 0 0 1000px white inset',
        },
        'input:-webkit-autofill:hover': {
          WebkitBoxShadow: '0 0 0 1000px white inset',
        },
        'input:-webkit-autofill:active': {
          WebkitBoxShadow: '0 0 0 1000px white inset',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            backgroundColor: '#F8FAFC',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: '#E2E8F0',
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#1976d2',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiAlert-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(25, 118, 210, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.16)',
            },
          },
        },
      },
    },
  },
};

const darkTheme: ThemeOptions = {
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#90CAF9',
      light: '#BBDEFB',
      dark: '#64B5F6',
      contrastText: '#000000',
    },
    secondary: {
      main: '#F48FB1',
      light: '#F8BBD9',
      dark: '#F06292',
      contrastText: '#000000',
    },
    neutral: {
      main: '#94A3B8',
      light: '#CBD5E1',
      dark: '#64748B',
      contrastText: '#000000',
    },
    success: {
      main: '#34D399',
      light: '#6EE7B7',
      dark: '#10B981',
      contrastText: '#000000',
    },
    warning: {
      main: '#FBBF24',
      light: '#FCD34D',
      dark: '#F59E0B',
      contrastText: '#000000',
    },
    error: {
      main: '#F87171',
      light: '#FCA5A5',
      dark: '#EF4444',
      contrastText: '#000000',
    },
    info: {
      main: '#60A5FA',
      light: '#93C5FD',
      dark: '#3B82F6',
      contrastText: '#000000',
    },
    background: {
      default: '#0F172A',
      paper: '#1E293B',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#CBD5E1',
    },
    divider: '#334155',
  },
  components: {
    ...baseTheme.components,
    MuiCssBaseline: {
      styleOverrides: {
        ...baseTheme.components?.MuiCssBaseline?.styleOverrides,
        'input:-webkit-autofill': {
          WebkitBoxShadow: '0 0 0 1000px #1E293B inset',
          WebkitTextFillColor: '#F1F5F9',
        },
        'input:-webkit-autofill:focus': {
          WebkitBoxShadow: '0 0 0 1000px #1E293B inset',
          WebkitTextFillColor: '#F1F5F9',
        },
        'input:-webkit-autofill:hover': {
          WebkitBoxShadow: '0 0 0 1000px #1E293B inset',
          WebkitTextFillColor: '#F1F5F9',
        },
        'input:-webkit-autofill:active': {
          WebkitBoxShadow: '0 0 0 1000px #1E293B inset',
          WebkitTextFillColor: '#F1F5F9',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            backgroundColor: '#334155',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #334155',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: '#334155',
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&:hover': {
            backgroundColor: 'rgba(144, 202, 249, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(144, 202, 249, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(144, 202, 249, 0.16)',
            },
          },
        },
      },
    },
  },
};

export const lightTheme = createTheme(baseTheme, ptBR);
export const darkTheme = createTheme(darkTheme, ptBR);

export default lightTheme; 