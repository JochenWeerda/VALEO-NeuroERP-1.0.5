import { ThemeOptions } from '@mui/material/styles';

/**
 * Accessibility Utils
 * Hilfsfunktionen für bessere Barrierefreiheit im Theme-System
 */

/**
 * Prüft, ob ein Farbkontrast den WCAG-Anforderungen entspricht
 * @param foreground Vordergrundfarbe (Hex-Format)
 * @param background Hintergrundfarbe (Hex-Format)
 * @param level WCAG-Level (AA oder AAA)
 * @param fontSize Größe des Textes (normal oder large)
 * @returns Boolean, ob der Kontrast ausreichend ist
 */
export const hasAdequateContrast = (
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA', 
  fontSize: 'normal' | 'large' = 'normal'
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  
  if (fontSize === 'large') {
    return level === 'AA' ? ratio >= 3 : ratio >= 4.5;
  } else {
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }
};

/**
 * Berechnet das Kontrastverhältnis zwischen zwei Farben nach WCAG-Formel
 * @param foreground Vordergrundfarbe (Hex-Format)
 * @param background Hintergrundfarbe (Hex-Format) 
 * @returns Kontrastverhältnis (1-21)
 */
export const getContrastRatio = (foreground: string, background: string): number => {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  
  const lighterLuminance = Math.max(l1, l2);
  const darkerLuminance = Math.min(l1, l2);
  
  return (lighterLuminance + 0.05) / (darkerLuminance + 0.05);
};

/**
 * Konvertiert eine Hex-Farbe in RGB
 * @param hex Farbe im Hex-Format (#RRGGBB)
 * @returns RGB-Objekt {r, g, b}
 */
export const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Verstärkt den Kontrast in einem Theme für bessere Barrierefreiheit
 * @param themeOptions Bestehende Theme-Optionen
 * @returns Modifizierte Theme-Optionen mit erhöhtem Kontrast
 */
export const enhanceContrast = (themeOptions: ThemeOptions): ThemeOptions => {
  const { palette } = themeOptions;
  const isDark = palette?.mode === 'dark';
  
  // Verstärkte Kontrastfarben
  const enhancedPalette = {
    ...palette,
    text: {
      ...palette?.text,
      primary: isDark ? '#FFFFFF' : '#000000',
      secondary: isDark ? '#EEEEEE' : '#222222',
    },
    background: {
      ...palette?.background,
      default: isDark ? '#000000' : '#FFFFFF',
      paper: isDark ? '#111111' : '#F8F8F8',
    },
  };
  
  // Verstärkte Komponenten-Styles
  const enhancedComponents = {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          textDecoration: 'underline',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderWidth: 2,
          },
        },
      },
    },
  };
  
  // Verstärkte Typographie
  const enhancedTypography = {
    ...themeOptions.typography,
    fontWeightRegular: 500, // Verstärktes Gewicht für bessere Lesbarkeit
  };
  
  return {
    ...themeOptions,
    palette: enhancedPalette,
    typography: enhancedTypography,
    components: {
      ...themeOptions.components,
      ...enhancedComponents,
    },
  };
};

/**
 * Optimiert ein Theme für Nutzer mit eingeschränkter Motorik
 * @param themeOptions Bestehende Theme-Optionen
 * @returns Modifizierte Theme-Optionen für bessere motorische Zugänglichkeit
 */
export const enhanceMotorAccessibility = (themeOptions: ThemeOptions): ThemeOptions => {
  // Komponenten-Styles für größere Klickbereiche und klarere Fokus-Zustände
  const enhancedComponents = {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
          minHeight: '44px',
          ':focus-visible': {
            outline: '3px solid',
            outlineColor: themeOptions.palette?.primary?.main || '#1976d2',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: '12px',
          ':focus-visible': {
            outline: '3px solid',
            outlineColor: themeOptions.palette?.primary?.main || '#1976d2',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: '12px',
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          padding: '12px',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: '58px',
          height: '38px',
        },
        thumb: {
          width: '20px',
          height: '20px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: '44px',
          padding: '8px 16px',
        },
      },
    },
  };
  
  return {
    ...themeOptions,
    components: {
      ...themeOptions.components,
      ...enhancedComponents,
    },
  };
};

const accessibilityUtils = {
  hasAdequateContrast,
  getContrastRatio,
  hexToRgb,
  enhanceContrast,
  enhanceMotorAccessibility,
};

export default accessibilityUtils; 