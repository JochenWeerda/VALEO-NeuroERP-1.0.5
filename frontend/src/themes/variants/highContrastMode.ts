import { ThemeOptions } from '@mui/material/styles';

/**
 * Hoher Kontrast Modus
 * Modifiziert ein bestehendes Theme für maximalen Kontrast und bessere Zugänglichkeit
 */
const highContrastMode = (themeOptions: ThemeOptions): ThemeOptions => {
  // Basisfarben mit hohem Kontrast
  const highContrastPalette = {
    primary: {
      main: '#FFFFFF',
      light: '#FFFFFF',
      dark: '#CCCCCC',
      contrastText: '#000000',
    },
    secondary: {
      main: '#FFFF00',
      light: '#FFFF99',
      dark: '#CCCC00',
      contrastText: '#000000',
    },
    background: {
      default: '#000000',
      paper: '#111111',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#FFFF00',
    },
    divider: 'rgba(255, 255, 255, 0.5)',
    action: {
      active: '#FFFFFF',
      hover: 'rgba(255, 255, 255, 0.7)',
      selected: 'rgba(255, 255, 255, 0.3)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
    error: {
      main: '#FF6B6B',
      contrastText: '#000000',
    },
    warning: {
      main: '#FFC107',
      contrastText: '#000000',
    },
    info: {
      main: '#29B6F6',
      contrastText: '#000000',
    },
    success: {
      main: '#66BB6A',
      contrastText: '#000000',
    },
  };

  // Schatten entfernen für klarere Grenzen
  const noShadows = Array(25).fill('none');

  // Verstärkte Typographie für bessere Lesbarkeit
  const enhancedTypography = {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16, // Größere Basis-Schriftgröße
    fontWeightRegular: 500, // Leicht verstärktes Gewicht für bessere Lesbarkeit
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 700,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
    button: {
      fontSize: '1rem',
      fontWeight: 700,
    },
  };

  // Komponenten für besseren Kontrast anpassen
  const enhancedComponents = {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          border: '2px solid #FFFFFF',
          fontWeight: 700,
          ':hover': {
            backgroundColor: '#FFFFFF',
            color: '#000000',
          },
          ':focus': {
            outline: '3px solid #FFFF00',
            outlineOffset: '2px',
          },
        },
        contained: {
          backgroundColor: '#FFFFFF',
          color: '#000000',
          ':hover': {
            backgroundColor: '#DDDDDD',
          },
        },
        outlined: {
          borderWidth: '2px',
          ':hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #FFFFFF',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          border: '0',
          borderBottom: '2px solid #FFFFFF',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#FFFFFF',
            color: '#000000',
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            color: '#000000',
          },
          '&:focus': {
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            color: '#000000',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
          '&.Mui-checked': {
            color: '#FFFFFF',
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
          '&.Mui-checked': {
            color: '#FFFFFF',
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-thumb': {
            backgroundColor: '#FFFFFF',
          },
          '& .MuiSwitch-track': {
            backgroundColor: '#555555 !important',
            opacity: 1,
          },
          '&.Mui-checked': {
            '& .MuiSwitch-thumb': {
              backgroundColor: '#FFFF00',
            },
            '& .MuiSwitch-track': {
              backgroundColor: '#333333 !important',
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderColor: '#FFFFFF',
          color: '#FFFFFF',
          caretColor: '#FFFF00',
          '&.Mui-focused': {
            borderColor: '#FFFF00',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FFFFFF',
            borderWidth: '2px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FFFF00',
            borderWidth: '2px',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FFFF00',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #FFFFFF',
        },
        head: {
          fontWeight: 700,
          backgroundColor: '#333333',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#FFFF00',
          textDecoration: 'underline',
          ':hover': {
            textDecoration: 'none',
          },
          ':focus': {
            outline: '2px solid #FFFF00',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#000000',
          border: '2px solid #FFFFFF',
          color: '#FFFFFF',
          fontSize: '1rem',
        },
      },
    },
  };

  // Das bestehende Theme mit Hochkontrast-Optionen überschreiben
  return {
    ...themeOptions,
    palette: {
      ...themeOptions.palette,
      mode: 'dark',
      ...highContrastPalette,
    },
    typography: {
      ...themeOptions.typography,
      ...enhancedTypography,
    },
    shadows: noShadows,
    components: {
      ...themeOptions.components,
      ...enhancedComponents,
    },
  };
};

export default highContrastMode; 