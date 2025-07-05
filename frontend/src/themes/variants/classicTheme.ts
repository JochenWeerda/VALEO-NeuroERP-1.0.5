import { createTheme, ThemeOptions } from '@mui/material/styles';
import { ThemeMode, ThemeParameters } from '../themeTypes';

/**
 * Classic Theme Variante
 * Ein klassisches Design mit stärkeren Schatten, Rändern und traditionelleren Komponenten
 */
const classicTheme = (mode: ThemeMode, parameters: ThemeParameters) => {
  // Basis-Farbschema entsprechend des ausgewählten Modus
  const isDark = mode === 'dark';
  const isHighContrast = mode === 'highContrast';
  
  // Visuelle Dichte für Abstände
  const density = parameters.visualDensity || 'medium';
  const spacing = parameters.spacing || 'normal';
  
  // Basis-Abstände
  const spacingUnit = spacing === 'compact' ? 4 : (spacing === 'comfortable' ? 12 : 8);
  
  // Radius für Ecken - bei Classic eher kleiner
  const borderRadiusValue = parameters.borderRadius === 'none' ? 0 : 
                           parameters.borderRadius === 'small' ? 2 : 
                           parameters.borderRadius === 'medium' ? 4 : 
                           parameters.borderRadius === 'large' ? 8 : 2;
  
  // Klassische Farbpalette mit traditionelleren Farben
  const classicPalette = {
    // Hellmodus
    light: {
      primary: {
        main: '#1976D2',
        light: '#42A5F5',
        dark: '#0D47A1',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#D32F2F',
        light: '#F44336',
        dark: '#B71C1C',
        contrastText: '#FFFFFF',
      },
      background: {
        default: '#F5F5F5',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#212121',
        secondary: '#424242',
      },
      divider: 'rgba(0, 0, 0, 0.12)',
    },
    // Dunkelmodus
    dark: {
      primary: {
        main: '#42A5F5',
        light: '#90CAF9',
        dark: '#1565C0',
        contrastText: '#000000',
      },
      secondary: {
        main: '#F44336',
        light: '#EF9A9A',
        dark: '#C62828',
        contrastText: '#000000',
      },
      background: {
        default: '#212121',
        paper: '#303030',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#E0E0E0',
      },
      divider: 'rgba(255, 255, 255, 0.12)',
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
        paper: '#121212',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#FFFF00',
      },
      divider: 'rgba(255, 255, 255, 0.5)',
    },
  };

  // Ausgewählte Farbpalette je nach Modus
  const selectedPalette = isHighContrast ? classicPalette.highContrast : 
                          isDark ? classicPalette.dark : 
                          classicPalette.light;

  // Stärkere Schatten für klassisches Design
  const shadows = isDark ? [
    'none',
    '0px 2px 3px rgba(0, 0, 0, 0.2)',
    '0px 3px 4px rgba(0, 0, 0, 0.3)',
    '0px 3px 5px rgba(0, 0, 0, 0.3)',
    '0px 4px 6px rgba(0, 0, 0, 0.35)',
    '0px 5px 8px rgba(0, 0, 0, 0.35)',
    '0px 6px 10px rgba(0, 0, 0, 0.35)',
    '0px 7px 12px rgba(0, 0, 0, 0.4)',
    '0px 8px 14px rgba(0, 0, 0, 0.4)',
    '0px 9px 16px rgba(0, 0, 0, 0.4)',
    '0px 10px 18px rgba(0, 0, 0, 0.4)',
    '0px 11px 20px rgba(0, 0, 0, 0.4)',
    '0px 12px 22px rgba(0, 0, 0, 0.45)',
    '0px 13px 24px rgba(0, 0, 0, 0.45)',
    '0px 14px 26px rgba(0, 0, 0, 0.45)',
    '0px 15px 28px rgba(0, 0, 0, 0.45)',
    '0px 16px 30px rgba(0, 0, 0, 0.5)',
    '0px 17px 32px rgba(0, 0, 0, 0.5)',
    '0px 18px 34px rgba(0, 0, 0, 0.5)',
    '0px 19px 36px rgba(0, 0, 0, 0.5)',
    '0px 20px 38px rgba(0, 0, 0, 0.5)',
    '0px 21px 40px rgba(0, 0, 0, 0.5)',
    '0px 22px 42px rgba(0, 0, 0, 0.5)',
    '0px 23px 44px rgba(0, 0, 0, 0.5)',
  ] : [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
    '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
    '0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
    '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)',
    '0px 4px 5px -2px rgba(0,0,0,0.2), 0px 7px 10px 1px rgba(0,0,0,0.14), 0px 2px 16px 1px rgba(0,0,0,0.12)',
    '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
    '0px 5px 6px -3px rgba(0,0,0,0.2), 0px 9px 12px 1px rgba(0,0,0,0.14), 0px 3px 16px 2px rgba(0,0,0,0.12)',
    '0px 6px 6px -3px rgba(0,0,0,0.2), 0px 10px 14px 1px rgba(0,0,0,0.14), 0px 4px 18px 3px rgba(0,0,0,0.12)',
    '0px 6px 7px -4px rgba(0,0,0,0.2), 0px 11px 15px 1px rgba(0,0,0,0.14), 0px 4px 20px 3px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2), 0px 12px 17px 2px rgba(0,0,0,0.14), 0px 5px 22px 4px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2), 0px 13px 19px 2px rgba(0,0,0,0.14), 0px 5px 24px 4px rgba(0,0,0,0.12)',
    '0px 7px 9px -4px rgba(0,0,0,0.2), 0px 14px 21px 2px rgba(0,0,0,0.14), 0px 5px 26px 4px rgba(0,0,0,0.12)',
    '0px 8px 9px -5px rgba(0,0,0,0.2), 0px 15px 22px 2px rgba(0,0,0,0.14), 0px 6px 28px 5px rgba(0,0,0,0.12)',
    '0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 2px rgba(0,0,0,0.14), 0px 6px 30px 5px rgba(0,0,0,0.12)',
    '0px 8px 11px -5px rgba(0,0,0,0.2), 0px 17px 26px 2px rgba(0,0,0,0.14), 0px 6px 32px 5px rgba(0,0,0,0.12)',
    '0px 9px 11px -5px rgba(0,0,0,0.2), 0px 18px 28px 2px rgba(0,0,0,0.14), 0px 7px 34px 6px rgba(0,0,0,0.12)',
    '0px 9px 12px -6px rgba(0,0,0,0.2), 0px 19px 29px 2px rgba(0,0,0,0.14), 0px 7px 36px 6px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2), 0px 20px 31px 3px rgba(0,0,0,0.14), 0px 8px 38px 7px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2), 0px 21px 33px 3px rgba(0,0,0,0.14), 0px 8px 40px 7px rgba(0,0,0,0.12)',
    '0px 10px 14px -6px rgba(0,0,0,0.2), 0px 22px 35px 3px rgba(0,0,0,0.14), 0px 8px 42px 7px rgba(0,0,0,0.12)',
    '0px 11px 14px -7px rgba(0,0,0,0.2), 0px 23px 36px 3px rgba(0,0,0,0.14), 0px 9px 44px 8px rgba(0,0,0,0.12)',
  ];

  // Theme-Optionen
  const themeOptions: ThemeOptions = {
    palette: {
      mode: isDark || isHighContrast ? 'dark' : 'light',
      ...selectedPalette,
    },
    typography: {
      fontFamily: parameters.fontFamily || '"Georgia", "Times New Roman", serif',
      fontSize: parameters.fontSize === 'small' ? 13 : 
               parameters.fontSize === 'large' ? 16 : 14,
      h1: {
        fontSize: parameters.fontSize === 'small' ? '2rem' : 
                 parameters.fontSize === 'large' ? '2.8rem' : '2.4rem',
        fontWeight: 500,
        fontFamily: '"Georgia", "Times New Roman", serif',
      },
      h2: {
        fontSize: parameters.fontSize === 'small' ? '1.8rem' : 
                 parameters.fontSize === 'large' ? '2.4rem' : '2rem',
        fontWeight: 500,
        fontFamily: '"Georgia", "Times New Roman", serif',
      },
      h3: {
        fontSize: parameters.fontSize === 'small' ? '1.5rem' : 
                 parameters.fontSize === 'large' ? '2rem' : '1.8rem',
        fontWeight: 500,
        fontFamily: '"Georgia", "Times New Roman", serif',
      },
      button: {
        textTransform: 'uppercase', // Classic: Großbuchstaben für Buttons
        fontWeight: 600,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      body1: {
        lineHeight: 1.6,
      },
      body2: {
        lineHeight: 1.6,
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
            boxShadow: isHighContrast ? 'none' : undefined,
            textTransform: 'uppercase',
            fontWeight: 600,
            // Klassischer Button mit Rand
            border: isDark ? '1px solid rgba(255, 255, 255, 0.23)' : '1px solid rgba(0, 0, 0, 0.23)',
            ':hover': {
              boxShadow: isHighContrast ? 'none' : undefined,
            },
          },
          contained: {
            boxShadow: isHighContrast ? 'none' : shadows[2],
            ':hover': {
              boxShadow: isHighContrast ? 'none' : shadows[4],
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isHighContrast ? 'none' : undefined,
            border: isDark ? 
              '1px solid rgba(255, 255, 255, 0.12)' : 
              '1px solid rgba(0, 0, 0, 0.12)',
          },
          elevation1: {
            boxShadow: isHighContrast ? 'none' : shadows[1],
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: isHighContrast ? 'none' : shadows[4],
            borderBottom: isDark ? 
              '1px solid rgba(255, 255, 255, 0.12)' : 
              '1px solid rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: borderRadiusValue,
            overflow: 'hidden',
            border: isDark ? 
              '1px solid rgba(255, 255, 255, 0.15)' : 
              '1px solid rgba(0, 0, 0, 0.15)',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            margin: `${spacingUnit}px 0`,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isDark ? 
              '1px solid rgba(255, 255, 255, 0.15)' : 
              '1px solid rgba(0, 0, 0, 0.15)',
          },
          head: {
            fontWeight: 600,
            backgroundColor: isDark ? 
              'rgba(255, 255, 255, 0.05)' : 
              'rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};

export const getClassicTheme = (mode: ThemeMode): ExtendedThemeOptions => {
  // ... existing code ...
};

export default getClassicTheme; 