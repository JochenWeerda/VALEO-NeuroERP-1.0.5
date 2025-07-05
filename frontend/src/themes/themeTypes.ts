/**
 * Theme-System Typdefinitionen
 * Zentrale Definitionen für das Theme-System
 */

// Verfügbare Theme-Modi
export type ThemeMode = 'light' | 'dark' | 'highContrast';

// Verfügbare Theme-Varianten
export type ThemeVariant = 'default' | 'odoo' | 'modern' | 'classic';

// Spezifische Theme-Parameter zur Anpassung
export interface ThemeParameters {
  // Allgemeine Einstellungen
  fontFamily?: string;
  fontSize?: 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'normal' | 'comfortable';
  visualDensity?: 'compact' | 'medium' | 'comfortable';
  
  // Barrierefreiheit
  highContrastEnabled?: boolean;
  motionReduced?: boolean;
  enhancedFocus?: boolean;
  
  // Farbeinstellungen
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  
  // UI-Einstellungen
  elevationLevel?: 'flat' | 'subtle' | 'normal' | 'prominent';
  buttonStyle?: 'text' | 'outlined' | 'contained';
  
  // Erweiterte Einstellungen
  customCSS?: string;
  rtl?: boolean;
}

// Vollständige Theme-Konfiguration
export interface ThemeConfig {
  mode: ThemeMode;
  variant: ThemeVariant;
  parameters: ThemeParameters;
}

// Standard-Theme-Konfiguration
export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: 'light',
  variant: 'default',
  parameters: {
    fontSize: 'medium',
    borderRadius: 'medium',
    spacing: 'normal',
    visualDensity: 'medium',
    highContrastEnabled: false,
    motionReduced: false,
    enhancedFocus: false,
    elevationLevel: 'normal',
    buttonStyle: 'contained',
    rtl: false,
  },
};

// Theme-Context-Typ-Definition
export interface ThemeContextType {
  currentThemeConfig: ThemeConfig;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeVariant: (variant: ThemeVariant) => void;
  updateThemeParameters: (params: Partial<ThemeParameters>) => void;
  resetTheme: () => void;
}

// Theme-KI-Befehle
export interface ThemeCommand {
  type: 'mode' | 'variant' | 'parameter' | 'reset';
  mode?: ThemeMode;
  variant?: ThemeVariant;
  parameter?: keyof ThemeParameters;
  value?: any;
}

// Theme-Service Typdefinitionen
export interface ThemeStorage {
  getStoredTheme: () => ThemeConfig | null;
  storeTheme: (config: ThemeConfig) => void;
  clearStoredTheme: () => void;
}

// Benutzertyp für Theme-Einstellungen
export interface ThemePreferences {
  userId: string;
  themeConfig: ThemeConfig;
  lastUpdated: Date;
}

// Barrierefreiheit
export interface AccessibilityOptions {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReaderOptimized: boolean;
}

// Export der Standard-Theme-Varianten
export const THEME_VARIANTS: ThemeVariant[] = ['default', 'odoo', 'modern', 'classic'];

// Export der Standard-Theme-Modi
export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'highContrast']; 