import { createTheme, ThemeOptions } from '@mui/material/styles';
import { ThemeMode, ThemeParameters } from '../themeTypes';

/**
 * Modern Theme Variante
 * Ein flaches, modernes Design mit klaren Linien und weniger Schatten
 */
const modernTheme = (mode: ThemeMode, parameters: ThemeParameters) => {
  // Basis-Farbschema entsprechend des ausgewählten Modus
  const isDark = mode === 'dark';
  const isHighContrast = mode === 'highContrast';
  
  // Visuelle Dichte für Abstände
  const density = parameters.visualDensity || 'medium';
  const spacing = parameters.spacing || 'normal';
  
  // Basis-Abstände
  const spacingUnit = spacing === 'compact' ? 4 : (spacing === 'comfortable' ? 12 : 8);
  
  // Radius für Ecken
  const borderRadiusValue = parameters.borderRadius === 'none' ? 0 : 
                           parameters.borderRadius === 'small' ? 4 : 
                           parameters.borderRadius === 'medium' ? 8 : 
                           parameters.borderRadius === 'large' ? 16 : 4;
  
  // Modernen Farbpalette mit flachen Farben
  const modernPalette = {
    // Hellmodus
    light: {
      primary: {
        main: '#2196F3',
        light: '#64B5F6',
        dark: '#1976D2',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#FF4081',
        light: '#FF80AB',
        dark: '#F50057',
        contrastText: '#FFFFFF',
      },
      background: {
        default: '#FAFAFA',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#212121',
        secondary: '#757575',
      },
    },
    // Dunkelmodus
    dark: {
      primary: {
        main: '#90CAF9',
        light: '#BBDEFB',
        dark: '#42A5F5',
        contrastText: '#000000',
      },
      secondary: {
        main: '#FF80AB',
        light: '#FF4081',
        dark: '#F50057',
        contrastText: '#000000',
      },
      background: {
        default: '#121212',
        paper: '#1E1E1E',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#B0B0B0',
      },
    },
    // Hoher Kontrast
    highContrast: {
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
    },
  };

  // Ausgewählte Farbpalette je nach Modus
  const selectedPalette = isHighContrast ? modernPalette.highContrast : 
                          isDark ? modernPalette.dark : 
                          modernPalette.light;

  // Schatten für das flache Design reduzieren
  const shadows = isDark ? [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.15)',
    '0px 1px 3px rgba(0, 0, 0, 0.2)',
    '0px 1px 4px rgba(0, 0, 0, 0.25)',
    '0px 2px 4px rgba(0, 0, 0, 0.25)',
    '0px 3px 5px rgba(0, 0, 0, 0.25)',
    '0px 3px 6px rgba(0, 0, 0, 0.25)',
    '0px 4px 6px rgba(0, 0, 0, 0.25)',
    '0px 5px 7px rgba(0, 0, 0, 0.25)',
    '0px 5px 8px rgba(0, 0, 0, 0.25)',
    '0px 6px 9px rgba(0, 0, 0, 0.25)',
    '0px 7px 10px rgba(0, 0, 0, 0.25)',
    '0px 8px 12px rgba(0, 0, 0, 0.25)',
    '0px 9px 14px rgba(0, 0, 0, 0.25)',
    '0px 10px 16px rgba(0, 0, 0, 0.25)',
    '0px 11px 18px rgba(0, 0, 0, 0.25)',
    '0px 12px 20px rgba(0, 0, 0, 0.25)',
    '0px 13px 22px rgba(0, 0, 0, 0.25)',
    '0px 14px 24px rgba(0, 0, 0, 0.25)',
    '0px 15px 26px rgba(0, 0, 0, 0.25)',
    '0px 16px 28px rgba(0, 0, 0, 0.25)',
    '0px 17px 30px rgba(0, 0, 0, 0.25)',
    '0px 18px 32px rgba(0, 0, 0, 0.25)',
    '0px 19px 34px rgba(0, 0, 0, 0.25)',
  ] : [
    'none',
    '0px 1px 1px rgba(0, 0, 0, 0.05)',
    '0px 1px 2px rgba(0, 0, 0, 0.07)',
    '0px 1px 3px rgba(0, 0, 0, 0.1)',
    '0px 2px 3px rgba(0, 0, 0, 0.1)',
    '0px 2px 4px rgba(0, 0, 0, 0.1)',
    '0px 3px 5px rgba(0, 0, 0, 0.1)',
    '0px 3px 6px rgba(0, 0, 0, 0.1)',
    '0px 4px 7px rgba(0, 0, 0, 0.1)',
    '0px 4px 8px rgba(0, 0, 0, 0.1)',
    '0px 5px 9px rgba(0, 0, 0, 0.1)',
    '0px 5px 10px rgba(0, 0, 0, 0.1)',
    '0px 6px 11px rgba(0, 0, 0, 0.1)',
    '0px 6px 12px rgba(0, 0, 0, 0.1)',
    '0px 7px 13px rgba(0, 0, 0, 0.1)',
    '0px 7px 14px rgba(0, 0, 0, 0.1)',
    '0px 8px 15px rgba(0, 0, 0, 0.1)',
    '0px 8px 16px rgba(0, 0, 0, 0.1)',
    '0px 9px 17px rgba(0, 0, 0, 0.1)',
    '0px 9px 18px rgba(0, 0, 0, 0.1)',
    '0px 10px 19px rgba(0, 0, 0, 0.1)',
    '0px 10px 20px rgba(0, 0, 0, 0.1)',
    '0px 11px 21px rgba(0, 0, 0, 0.1)',
    '0px 11px 22px rgba(0, 0, 0, 0.1)',
  ];

  // Theme-Optionen
  const themeOptions: ThemeOptions = {
    palette: {
      mode: isDark || isHighContrast ? 'dark' : 'light',
      ...selectedPalette,
    },
    typography: {
      fontFamily: parameters.fontFamily || '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: parameters.fontSize === 'small' ? 13 : 
               parameters.fontSize === 'large' ? 16 : 14,
      h1: {
        fontSize: parameters.fontSize === 'small' ? '2rem' : 
                 parameters.fontSize === 'large' ? '2.8rem' : '2.4rem',
        fontWeight: 300,
      },
      h2: {
        fontSize: parameters.fontSize === 'small' ? '1.8rem' : 
                 parameters.fontSize === 'large' ? '2.4rem' : '2rem',
        fontWeight: 400,
      },
      h3: {
        fontSize: parameters.fontSize === 'small' ? '1.5rem' : 
                 parameters.fontSize === 'large' ? '2rem' : '1.8rem',
        fontWeight: 400,
      },
      button: {
        textTransform: 'none', // Modern: keine Großbuchstaben für Buttons
        fontWeight: 500,
      },
    },
    spacing: spacingUnit,
    shape: {
      borderRadius: borderRadiusValue,
    },
    shadows: isHighContrast ? Array(25).fill('none') : shadows,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: borderRadiusValue,
            padding: `${spacingUnit/2}px ${spacingUnit}px`,
            textTransform: 'none',
            boxShadow: isHighContrast ? 'none' : undefined,
            ':hover': {
              boxShadow: isHighContrast ? 'none' : undefined,
            },
          },
          contained: {
            boxShadow: isHighContrast ? 'none' : '0 1px 2px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isHighContrast ? 'none' : undefined,
          },
          elevation1: {
            boxShadow: isHighContrast ? 'none' : '0 1px 2px rgba(0,0,0,0.07)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: isHighContrast ? 'none' : '0 1px 2px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: borderRadiusValue * 1.5,
            overflow: 'hidden',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};

export const getModernTheme = (mode: ThemeMode): ExtendedThemeOptions => {
  // ... existing code ...
};

export default getModernTheme; 