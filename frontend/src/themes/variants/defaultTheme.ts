import { ThemeMode, ExtendedThemeOptions } from '../themeTypes';

// Standard-Theme
export const getDefaultTheme = (mode: ThemeMode): ExtendedThemeOptions => {
  // Basis-Farben für Standard-Theme
  const primaryMain = mode === 'dark' ? '#90caf9' : '#1976d2';
  const primaryLight = mode === 'dark' ? '#e3f2fd' : '#42a5f5';
  const primaryDark = mode === 'dark' ? '#42a5f5' : '#1565c0';
  
  const secondaryMain = mode === 'dark' ? '#f48fb1' : '#dc004e';
  const secondaryLight = mode === 'dark' ? '#fce4ec' : '#ff4081';
  const secondaryDark = mode === 'dark' ? '#ff4081' : '#c51162';

  // Anpassung für Hochkontrast-Modus
  if (mode === 'high-contrast') {
    return {
      palette: {
        mode: 'dark',
        primary: {
          main: '#FFFFFF',
          light: '#FFFFFF',
          dark: '#CCCCCC',
          contrastText: '#000000',
        },
        secondary: {
          main: '#FFFF00',
          light: '#FFFF33',
          dark: '#CCCC00',
          contrastText: '#000000',
        },
        background: {
          default: '#000000',
          paper: '#333333',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#FFFF00',
        },
        divider: '#FFFFFF',
      },
      typography: {
        fontFamily: [
          'Roboto',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Arial',
          'sans-serif',
        ].join(','),
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 3,
              padding: '8px 16px',
              fontWeight: 500,
              border: '2px solid white',
            },
            contained: {
              boxShadow: 'none',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 4,
              border: '2px solid white',
            },
          },
        },
      },
    };
  }

  // Light und Dark Mode für Standard-Theme
  return {
    palette: {
      mode: mode === 'dark' ? 'dark' : 'light',
      primary: {
        main: primaryMain,
        light: primaryLight,
        dark: primaryDark,
      },
      secondary: {
        main: secondaryMain,
        light: secondaryLight,
        dark: secondaryDark,
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#e0e0e0' : '#212529',
        secondary: mode === 'dark' ? '#aaaaaa' : '#6c757d',
      },
      customBackground: {
        header: mode === 'dark' ? '#1a1a1a' : '#ffffff',
        sidebar: mode === 'dark' ? '#2c2c2c' : '#f5f5f5',
        card: mode === 'dark' ? '#2c2c2c' : '#ffffff',
        hover: mode === 'dark' ? '#3c3c3c' : '#f0f0f0',
      },
    },
    typography: {
      fontFamily: [
        'Roboto',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 400,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 400,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 400,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 400,
        color: mode === 'dark' ? '#aaaaaa' : '#6c757d',
      },
      body1: {
        fontSize: '0.9rem',
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 4,
            padding: '6px 16px',
            fontWeight: 500,
          },
          contained: {
            boxShadow: mode === 'dark' ? '0 1px 2px rgba(255,255,255,0.05)' : '0 1px 2px rgba(0,0,0,0.05)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            boxShadow: mode === 'dark' 
              ? '0 1px 3px rgba(255,255,255,0.1)' 
              : '0 1px 3px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'dark' 
              ? '0 1px 3px rgba(255,255,255,0.1)' 
              : '0 1px 3px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
    },
  };
};

export default getDefaultTheme; 