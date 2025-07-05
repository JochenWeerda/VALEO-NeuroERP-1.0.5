import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Erstelle einen Theme-Context
const ThemeContext = createContext();

// Hook zum Verwenden des Themes
export const useTheme = () => useContext(ThemeContext);

// ThemeSystem Context für erweiterte Theme-Funktionalität
const ThemeSystemContext = createContext();

// Hook zum Verwenden des erweiterten ThemeSystems
export const useThemeSystem = () => {
  const context = useContext(ThemeSystemContext);
  if (!context) {
    throw new Error('useThemeSystem muss innerhalb eines ThemeSystemProvider verwendet werden');
  }
  return context;
};

// Vordefinierte Themes
const themes = {
  // Odoo-Theme (Standard)
  odoo: {
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: '#7C7BAD', // Odoo lila
          light: '#9D9BC5',
          dark: '#5C5B8D',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#F0AD4E', // Odoo orange
          light: '#F8C885',
          dark: '#D49032',
          contrastText: '#ffffff',
        },
        background: {
          default: '#f9f9f9',
          paper: '#ffffff',
        },
        text: {
          primary: '#212121',
          secondary: '#757575',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      shape: {
        borderRadius: 4,
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: {
          main: '#9D9BC5', // Hellere Version von Odoo lila
          light: '#BDB9E3',
          dark: '#6C6A9F',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#F8C885', // Hellere Version von Odoo orange
          light: '#FFDEA8',
          dark: '#D49032',
          contrastText: '#000000',
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b0b0b0',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      shape: {
        borderRadius: 4,
      },
    },
  },
  
  // Modernes Theme
  modern: {
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: '#2196F3', // Blau
          light: '#64B5F6',
          dark: '#1976D2',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#FF4081', // Pink
          light: '#FF80AB',
          dark: '#C51162',
          contrastText: '#ffffff',
        },
        background: {
          default: '#f5f5f5',
          paper: '#ffffff',
        },
        text: {
          primary: '#212121',
          secondary: '#757575',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
          fontWeight: 300,
        },
        h2: {
          fontWeight: 400,
        },
      },
      shape: {
        borderRadius: 8,
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: {
          main: '#64B5F6', // Helleres Blau
          light: '#90CAF9',
          dark: '#1976D2',
          contrastText: '#000000',
        },
        secondary: {
          main: '#FF80AB', // Helleres Pink
          light: '#FF99BC',
          dark: '#C51162',
          contrastText: '#000000',
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b0b0b0',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
          fontWeight: 300,
        },
        h2: {
          fontWeight: 400,
        },
      },
      shape: {
        borderRadius: 8,
      },
    },
  },
  
  // Standard Material-UI Theme
  standard: {
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: '#1976d2', // Standard Material UI Blau
          light: '#42a5f5',
          dark: '#1565c0',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#dc004e', // Standard Material UI Rot
          light: '#ff4081',
          dark: '#9a0036',
          contrastText: '#ffffff',
        },
        background: {
          default: '#fafafa',
          paper: '#ffffff',
        },
        text: {
          primary: '#212121',
          secondary: '#757575',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      shape: {
        borderRadius: 4,
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: {
          main: '#42a5f5', // Helleres Blau
          light: '#80d6ff',
          dark: '#0077c2',
          contrastText: '#000000',
        },
        secondary: {
          main: '#ff4081', // Helleres Rot
          light: '#ff79b0',
          dark: '#c60055',
          contrastText: '#000000',
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b0b0b0',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      shape: {
        borderRadius: 4,
      },
    },
  },
  
  // Kontrastreiche Variante
  kontrast: {
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: '#000000', // Schwarz
          light: '#444444',
          dark: '#000000',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#FFD700', // Gold
          light: '#FFEB3B',
          dark: '#FBC02D',
          contrastText: '#000000',
        },
        background: {
          default: '#ffffff',
          paper: '#f5f5f5',
        },
        text: {
          primary: '#000000',
          secondary: '#444444',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeightBold: 700,
        fontSize: 16,
      },
      shape: {
        borderRadius: 0,
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: {
          main: '#ffffff', // Weiß
          light: '#ffffff',
          dark: '#e0e0e0',
          contrastText: '#000000',
        },
        secondary: {
          main: '#FFD700', // Gold
          light: '#FFEB3B',
          dark: '#FBC02D',
          contrastText: '#000000',
        },
        background: {
          default: '#000000',
          paper: '#121212',
        },
        text: {
          primary: '#ffffff',
          secondary: '#e0e0e0',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeightBold: 700,
        fontSize: 16,
      },
      shape: {
        borderRadius: 0,
      },
    },
  },
};

// ThemeProvider Komponente
const CustomThemeProvider = ({ children }) => {
  // Theme-State mit Default-Werten
  const [mode, setMode] = useState(() => {
    // Versuche Theme aus localStorage zu laden
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });
  
  const [themeType, setThemeType] = useState(() => {
    // Versuche Theme-Typ aus localStorage zu laden
    const savedThemeType = localStorage.getItem('themeType');
    return savedThemeType || 'odoo';
  });

  // Erweitertes Theme-System mit zusätzlichen Parametern
  const [themeParameters, setThemeParameters] = useState({
    fontSize: 'medium',
    spacing: 'standard',
    borderRadius: 'medium'
  });

  // Toggle-Funktion für den Dunkel/Hell-Modus
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };
  
  // Funktion zum Ändern des Theme-Typs
  const changeThemeType = (newThemeType) => {
    if (themes[newThemeType]) {
      setThemeType(newThemeType);
      localStorage.setItem('themeType', newThemeType);
    }
  };

  // Funktion zum Aktualisieren des erweiterten Theme-Systems
  const updateTheme = ({ mode: newMode, variant: newVariant, parameters: newParameters }) => {
    if (newMode) {
      setMode(newMode);
      localStorage.setItem('themeMode', newMode);
    }
    
    if (newVariant) {
      changeThemeType(newVariant);
    }
    
    if (newParameters) {
      setThemeParameters(prev => ({ ...prev, ...newParameters }));
    }
  };

  // Aktuelles Theme basierend auf dem Mode und Typ
  const themeConfig = themes[themeType]?.[mode] || themes.odoo[mode];
  const theme = createTheme(themeConfig);

  // Context-Wert für normales Theme
  const themeContextValue = {
    mode,
    toggleTheme,
    themeType,
    changeThemeType,
    availableThemes: Object.keys(themes),
  };

  // Context-Wert für erweitertes ThemeSystem
  const themeSystemValue = {
    currentThemeConfig: {
      mode,
      variant: themeType,
      parameters: themeParameters
    },
    updateTheme,
    availableThemes: Object.keys(themes)
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeSystemContext.Provider value={themeSystemValue}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </ThemeSystemContext.Provider>
    </ThemeContext.Provider>
  );
};

export default CustomThemeProvider;
export { CustomThemeProvider as ThemeProvider }; 