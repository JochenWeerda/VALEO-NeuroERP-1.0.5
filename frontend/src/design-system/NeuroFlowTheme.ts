/**
 * 🧠 NeuroFlow Design System
 * KI-first, responsive-first Design System für VALEO NeuroERP
 * Inspiriert von SAP Fiori 4/HANA und OpenUI5, aber moderner und KI-optimiert
 */

import { createTheme } from '@mui/material/styles';

// NeuroFlow Color Palette
export const neuroFlowColors = {
  // Primary Colors - KI-Blau
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main Primary
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  
  // Secondary Colors - Neuro-Grün
  secondary: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main Secondary
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  
  // Success Colors - KI-Erfolg
  success: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  
  // Warning Colors - KI-Warnung
  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107',
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },
  
  // Error Colors - KI-Fehler
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },
  
  // Info Colors - KI-Info
  info: {
    50: '#E1F5FE',
    100: '#B3E5FC',
    200: '#81D4FA',
    300: '#4FC3F7',
    400: '#29B6F6',
    500: '#03A9F4',
    600: '#039BE5',
    700: '#0288D1',
    800: '#0277BD',
    900: '#01579B',
  },
  
  // Neutral Colors - KI-Neutral
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Background Colors
  background: {
    default: '#F8FAFC',
    paper: '#FFFFFF',
    secondary: '#F1F5F9',
    tertiary: '#E2E8F0',
  },
  
  // Surface Colors
  surface: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    elevated: '#FFFFFF',
    outlined: '#E2E8F0',
  },
};

// NeuroFlow Typography
export const neuroFlowTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  
  // Display Typography
  h1: {
    fontSize: '3rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2.5rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  h5: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  h6: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  
  // Body Typography
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0.01em',
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0.01em',
  },
  
  // UI Typography
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.01em',
    textTransform: 'none' as const,
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: '0.02em',
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  },
};

// NeuroFlow Spacing
export const neuroFlowSpacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  xxl: '3rem',     // 48px
  xxxl: '4rem',    // 64px
};

// NeuroFlow Border Radius
export const neuroFlowBorderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  xxl: '1.5rem',   // 24px
  full: '9999px',
};

// NeuroFlow Shadows
export const neuroFlowShadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xxl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

// NeuroFlow Transitions
export const neuroFlowTransitions = {
  fast: '150ms ease-in-out',
  normal: '250ms ease-in-out',
  slow: '350ms ease-in-out',
  verySlow: '500ms ease-in-out',
};

// NeuroFlow Breakpoints
export const neuroFlowBreakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

// NeuroFlow Theme
export const neuroFlowTheme = createTheme({
  palette: {
    primary: {
      main: neuroFlowColors.primary[500],
      light: neuroFlowColors.primary[300],
      dark: neuroFlowColors.primary[700],
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: neuroFlowColors.secondary[500],
      light: neuroFlowColors.secondary[300],
      dark: neuroFlowColors.secondary[700],
      contrastText: '#FFFFFF',
    },
    success: {
      main: neuroFlowColors.success[500],
      light: neuroFlowColors.success[300],
      dark: neuroFlowColors.success[700],
      contrastText: '#FFFFFF',
    },
    warning: {
      main: neuroFlowColors.warning[500],
      light: neuroFlowColors.warning[300],
      dark: neuroFlowColors.warning[700],
      contrastText: '#000000',
    },
    error: {
      main: neuroFlowColors.error[500],
      light: neuroFlowColors.error[300],
      dark: neuroFlowColors.error[700],
      contrastText: '#FFFFFF',
    },
    info: {
      main: neuroFlowColors.info[500],
      light: neuroFlowColors.info[300],
      dark: neuroFlowColors.info[700],
      contrastText: '#FFFFFF',
    },
    background: {
      default: neuroFlowColors.background.default,
      paper: neuroFlowColors.background.paper,
    },
    text: {
      primary: neuroFlowColors.neutral[900],
      secondary: neuroFlowColors.neutral[700],
      disabled: neuroFlowColors.neutral[400],
    },
    divider: neuroFlowColors.neutral[200],
  },
  
  typography: neuroFlowTypography,
  
  shape: {
    borderRadius: parseInt(neuroFlowBorderRadius.md),
  },
  
  spacing: (factor: number) => `${factor * 0.25}rem`,
  
  components: {
    // Button Component
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: neuroFlowBorderRadius.md,
          textTransform: 'none',
          fontWeight: 600,
          padding: '0.75rem 1.5rem',
          transition: neuroFlowTransitions.normal,
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: neuroFlowShadows.lg,
          },
        },
        contained: {
          boxShadow: neuroFlowShadows.sm,
          '&:hover': {
            boxShadow: neuroFlowShadows.lg,
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    
    // Card Component
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: neuroFlowBorderRadius.lg,
          boxShadow: neuroFlowShadows.sm,
          border: `1px solid ${neuroFlowColors.neutral[200]}`,
          transition: neuroFlowTransitions.normal,
          '&:hover': {
            boxShadow: neuroFlowShadows.md,
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    
    // TextField Component
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: neuroFlowBorderRadius.md,
            transition: neuroFlowTransitions.normal,
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: neuroFlowColors.primary[300],
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: neuroFlowColors.primary[500],
                borderWidth: '2px',
              },
            },
          },
        },
      },
    },
    
    // Paper Component
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: neuroFlowBorderRadius.lg,
          boxShadow: neuroFlowShadows.sm,
        },
        elevation1: {
          boxShadow: neuroFlowShadows.sm,
        },
        elevation2: {
          boxShadow: neuroFlowShadows.md,
        },
        elevation3: {
          boxShadow: neuroFlowShadows.lg,
        },
      },
    },
    
    // AppBar Component
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: neuroFlowShadows.sm,
          backgroundColor: neuroFlowColors.background.paper,
          color: neuroFlowColors.neutral[900],
        },
      },
    },
    
    // Drawer Component
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: neuroFlowColors.background.paper,
          borderRight: `1px solid ${neuroFlowColors.neutral[200]}`,
        },
      },
    },
    
    // Table Component
    MuiTable: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            borderBottom: `1px solid ${neuroFlowColors.neutral[200]}`,
            padding: '1rem',
          },
          '& .MuiTableHead-root .MuiTableCell-root': {
            backgroundColor: neuroFlowColors.background.secondary,
            fontWeight: 600,
            color: neuroFlowColors.neutral[700],
          },
        },
      },
    },
    
    // Chip Component
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: neuroFlowBorderRadius.full,
          fontWeight: 500,
        },
      },
    },
    
    // Dialog Component
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: neuroFlowBorderRadius.xl,
          boxShadow: neuroFlowShadows.xxl,
        },
      },
    },
    
    // Menu Component
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: neuroFlowBorderRadius.lg,
          boxShadow: neuroFlowShadows.lg,
          border: `1px solid ${neuroFlowColors.neutral[200]}`,
        },
      },
    },
  },
});

// NeuroFlow Design Tokens
export const neuroFlowTokens = {
  colors: neuroFlowColors,
  typography: neuroFlowTypography,
  spacing: neuroFlowSpacing,
  borderRadius: neuroFlowBorderRadius,
  shadows: neuroFlowShadows,
  transitions: neuroFlowTransitions,
  breakpoints: neuroFlowBreakpoints,
};

export default neuroFlowTheme; 