import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeConfig, ThemeContextType, ThemeMode, ThemeVariant, ThemeParameters, DEFAULT_THEME_CONFIG } from './themeTypes';
import themeService from './themeService';

// Erstellen des Theme-Kontexts
export const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Partial<ThemeConfig>;
}

/**
 * Theme Provider Komponente
 * Stellt das Theme und Theme-Funktionen für die Anwendung bereit
 */
const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme }) => {
  // Initialen Theme-Zustand laden
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    const storedConfig = themeService.getCurrentConfig();
    const initialConfig = initialTheme ? {
      ...storedConfig,
      ...initialTheme,
      parameters: {
        ...storedConfig.parameters,
        ...initialTheme.parameters || {}
      }
    } : storedConfig;
    
    return initialConfig;
  });
  
  // Theme-Konfiguration im ThemeService aktualisieren, wenn sich der lokale Zustand ändert
  useEffect(() => {
    themeService.setThemeConfig(themeConfig);
  }, [themeConfig]);
  
  // Material-UI Theme basierend auf der aktuellen Konfiguration erstellen
  const theme = useMemo(() => {
    return themeService.createCurrentTheme();
  }, [themeConfig]);
  
  // CSS-Variablen in ein <style>-Element einfügen
  useEffect(() => {
    const cssVariables = themeService.generateCSSVariables();
    let styleEl = document.getElementById('theme-css-variables');
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'theme-css-variables';
      document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = cssVariables;
    
    return () => {
      if (styleEl && document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }
    };
  }, [theme]);
  
  // Theme-Modus ändern
  const setThemeMode = (mode: ThemeMode) => {
    setThemeConfig(prevConfig => ({
      ...prevConfig,
      mode
    }));
  };
  
  // Theme-Variante ändern
  const setThemeVariant = (variant: ThemeVariant) => {
    setThemeConfig(prevConfig => ({
      ...prevConfig,
      variant
    }));
  };
  
  // Theme-Parameter aktualisieren
  const updateThemeParameters = (params: Partial<ThemeParameters>) => {
    setThemeConfig(prevConfig => ({
      ...prevConfig,
      parameters: {
        ...prevConfig.parameters,
        ...params
      }
    }));
  };
  
  // Theme auf Standardwerte zurücksetzen
  const resetTheme = () => {
    setThemeConfig(DEFAULT_THEME_CONFIG);
  };
  
  // Context-Wert
  const contextValue: ThemeContextType = {
    currentThemeConfig: themeConfig,
    setThemeMode,
    setThemeVariant,
    updateThemeParameters,
    resetTheme
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

/**
 * Hook zum Zugriff auf den Theme-Kontext
 * @returns ThemeContextType Objekt mit aktueller Konfiguration und Funktionen
 */
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useThemeContext muss innerhalb eines ThemeProviders verwendet werden');
  }
  
  return context;
};

export default ThemeProvider; 