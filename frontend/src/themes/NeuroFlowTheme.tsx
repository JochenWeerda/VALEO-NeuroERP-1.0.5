import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

// VALEO-spezifische Farbpalette für NeuroFlow Design-System
const neuroFlowTypography = {
  fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { 
    fontSize: '2.5rem', 
    fontWeight: 300, 
    lineHeight: 1.2,
    letterSpacing: '-0.02em'
  },
  h2: { 
    fontSize: '2rem', 
    fontWeight: 400, 
    lineHeight: 1.3,
    letterSpacing: '-0.01em'
  },
  h3: { 
    fontSize: '1.5rem', 
    fontWeight: 500, 
    lineHeight: 1.4
  },
  h4: { 
    fontSize: '1.25rem', 
    fontWeight: 500, 
    lineHeight: 1.4
  },
  h5: { 
    fontSize: '1.125rem', 
    fontWeight: 500, 
    lineHeight: 1.4
  },
  h6: { 
    fontSize: '1rem', 
    fontWeight: 500, 
    lineHeight: 1.4
  },
  body1: { 
    fontSize: '1rem', 
    lineHeight: 1.5,
    fontWeight: 400
  },
  body2: { 
    fontSize: '0.875rem', 
    lineHeight: 1.5,
    fontWeight: 400
  },
  button: { 
    fontSize: '0.875rem', 
    fontWeight: 500,
    textTransform: 'none' as const
  }
};

// Neural (Standard) Theme
export const neuralTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0A6ED1', // VALEO Blue
      light: '#4A90E2',
      dark: '#0854A6',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#354A5F', // VALEO Dark Blue
      light: '#5A6B7A',
      dark: '#2A3A4A',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#F5F6F7', // NeuroFlow Background
      paper: '#FFFFFF'
    },
    text: {
      primary: '#354A5F',
      secondary: '#515559',
      disabled: '#6A6D70'
    },
    divider: '#E5E5E5',
    action: {
      hover: '#F0F3F5',
      selected: '#E5F1FF',
      disabled: '#F5F6F7'
    }
  },
  typography: neuroFlowTypography,
  shape: {
    borderRadius: 8
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #E5E5E5',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            transition: 'box-shadow 0.2s ease-in-out'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }
        },
        contained: {
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0A6ED1'
            }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500
        }
      }
    }
  }
});

// Neural Light Theme
export const neuralLightTheme = createTheme({
  ...neuralTheme,
  palette: {
    ...neuralTheme.palette,
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF'
    },
    divider: '#F0F0F0'
  },
  components: {
    ...neuralTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #F0F0F0',
          '&:hover': {
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            transition: 'box-shadow 0.2s ease-in-out'
          }
        }
      }
    }
  }
});

// Neural Dark Theme
export const neuralDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4A90E2', // Lighter blue for dark mode
      light: '#6BA3E8',
      dark: '#357ABD',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#7A8A9A', // Lighter secondary for dark mode
      light: '#9BA8B5',
      dark: '#5A6B7A',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#1A1A1A',
      paper: '#2D2D2D'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      disabled: '#666666'
    },
    divider: '#404040',
    action: {
      hover: '#404040',
      selected: '#2A4A6A',
      disabled: '#2D2D2D'
    }
  },
  typography: neuroFlowTypography,
  shape: {
    borderRadius: 8
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          border: '1px solid #404040',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            transition: 'box-shadow 0.2s ease-in-out'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }
        }
      }
    }
  }
});

// Theme-Hook für einfache Verwendung
export const useNeuroFlowTheme = (mode: 'neural' | 'neural-light' | 'neural-dark'): Theme => {
  switch (mode) {
    case 'neural-light':
      return neuralLightTheme;
    case 'neural-dark':
      return neuralDarkTheme;
    default:
      return neuralTheme;
  }
};

export default neuralTheme; 