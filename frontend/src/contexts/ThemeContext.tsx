import React, { createContext, useContext } from 'react';
import { ThemeContext as ThemeProviderContext } from '../themes/ThemeProvider';

// Re-export des Theme-Kontexts zur zentralen Verwendung
export const ThemeContext = createContext(null);

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Wir verwenden den eigentlichen ThemeContext aus dem ThemeProvider
  const themeContext = useContext(ThemeProviderContext);
  
  if (!themeContext) {
    throw new Error('ThemeContextProvider muss innerhalb eines ThemeProviders verwendet werden');
  }

  return (
    <ThemeContext.Provider value={themeContext}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook für einfachen Zugriff auf den Theme-Kontext
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext muss innerhalb eines ThemeContextProviders verwendet werden');
  }
  return context;
};

export default ThemeContextProvider; 