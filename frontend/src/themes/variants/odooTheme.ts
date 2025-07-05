import { ThemeMode, ExtendedThemeOptions } from '../themeTypes';

// Odoo-inspiriertes Theme
export const getOdooTheme = (mode: ThemeMode): ExtendedThemeOptions => {
  // Basis-Farben für Odoo-Theme
  const primaryMain = mode === 'dark' ? '#9D9BC5' : '#7C7BAD';
  const primaryLight = mode === 'dark' ? '#B5B3D8' : '#9D9BC5';
  const primaryDark = mode === 'dark' ? '#5D5A8D' : '#5D5A8D';
  
  const secondaryMain = mode === 'dark' ? '#F8C885' : '#F0AD4E';
  const secondaryLight = mode === 'dark' ? '#FADAA8' : '#F8C885';
  const secondaryDark = mode === 'dark' ? '#D08E29' : '#D08E29';

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
          'Lato',
          'Open Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Arial',
          'sans-serif',
        ].join(','),
        h1: {
          fontSize: '2.5rem',
          fontWeight: 400,
          marginBottom: '1rem',
        },
        h2: {
          fontSize: '2rem',
          fontWeight: 400,
          marginBottom: '0.75rem',
        },
        h3: {
          fontSize: '1.75rem',
          fontWeight: 400,
          marginBottom: '0.5rem',
        },
        h4: {
          fontSize: '1.5rem',
          fontWeight: 500,
          marginBottom: '0.5rem',
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
          color: '#FFFF00',
        },
        body1: {
          fontSize: '1rem',
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

  // Light und Dark Mode für Odoo-Theme
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
      success: {
        main: mode === 'dark' ? '#48c765' : '#28a745',
        light: mode === 'dark' ? '#64d47f' : '#48c765',
        dark: mode === 'dark' ? '#1e7e34' : '#1e7e34',
      },
      info: {
        main: mode === 'dark' ? '#7dcde8' : '#5bc0de',
        light: mode === 'dark' ? '#99d8ee' : '#7dcde8',
        dark: mode === 'dark' ? '#31b0d5' : '#31b0d5',
      },
      warning: {
        main: mode === 'dark' ? '#f4c37d' : '#f0ad4e',
        light: mode === 'dark' ? '#f7d29b' : '#f4c37d',
        dark: mode === 'dark' ? '#ec971f' : '#ec971f',
      },
      error: {
        main: mode === 'dark' ? '#e35d6a' : '#dc3545',
        light: mode === 'dark' ? '#e97984' : '#e35d6a',
        dark: mode === 'dark' ? '#bd2130' : '#bd2130',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f9f9f9',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#e0e0e0' : '#212529',
        secondary: mode === 'dark' ? '#aaaaaa' : '#6c757d',
      },
      divider: mode === 'dark' ? '#424242' : '#e9ecef',
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
        'Lato',
        'Open Sans',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 400,
        marginBottom: '1rem',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 400,
        marginBottom: '0.75rem',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 400,
        marginBottom: '0.5rem',
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
        marginBottom: '0.5rem',
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
            borderRadius: 3,
            padding: '8px 16px',
            boxShadow: 'none',
            fontWeight: 500,
            '&:hover': {
              boxShadow: mode === 'dark' 
                ? '0 1px 3px rgba(255,255,255,0.12), 0 1px 2px rgba(255,255,255,0.24)' 
                : '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
            },
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
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: mode === 'dark' 
                ? '0 3px 6px rgba(255,255,255,0.15)' 
                : '0 3px 6px rgba(0,0,0,0.15)',
            },
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
      MuiTable: {
        styleOverrides: {
          root: {
            borderCollapse: 'separate',
            borderSpacing: 0,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: mode === 'dark' ? '#2c2c2c' : '#f8f9fa',
            fontWeight: 500,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 3,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.9rem',
          },
        },
      },
    },
    shape: {
      borderRadius: 4,
    },
    spacing: 8,
    visualDensity: 0, // Standard-Dichte
  };
};

export default getOdooTheme; 