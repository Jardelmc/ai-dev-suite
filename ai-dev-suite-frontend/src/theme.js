import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#CC092F',
            light: '#E53350',
            dark: '#8E0720',
          },
          secondary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          grey: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
            400: '#bdbdbd',
            500: '#9e9e9e',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
          },
        }
      : {
          primary: {
            main: '#E53350',
            light: '#FF5C79',
            dark: '#CC092F',
          },
          secondary: {
            main: '#42a5f5',
            light: '#64b5f6',
            dark: '#1976d2',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#fff',
            secondary: 'rgba(255, 255, 255, 0.7)',
          },
          grey: {
            50: '#2a2a2a',
            100: '#333333',
            200: '#424242',
            300: '#616161',
            400: '#757575',
            500: '#9e9e9e',
            600: '#bdbdbd',
            700: '#e0e0e0',
            800: '#eeeeee',
            900: '#f5f5f5',
          },
        }),
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          boxShadow: theme.palette.mode === 'light' 
            ? '0 2px 4px rgba(0,0,0,0.1)' 
            : '0 2px 4px rgba(0,0,0,0.3)',
          '&:hover': {
            boxShadow: theme.palette.mode === 'light' 
              ? '0 4px 8px rgba(0,0,0,0.15)'
              : '0 4px 8px rgba(0,0,0,0.4)',
          },
        }),
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
  },
});

const theme = (mode) => createTheme(getDesignTokens(mode));

export default theme;