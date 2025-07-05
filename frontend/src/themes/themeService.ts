import { createTheme, Theme } from '@mui/material/styles';
import {
  ThemeConfig,
  ThemeMode,
  ThemeVariant,
  ThemeParameters,
  ExtendedThemeOptions,
  ThemeProviderInterface,
  DEFAULT_THEME_CONFIG,
  ThemeStorage
} from './themeTypes';

// Theme-Varianten importieren
import getDefaultTheme from './variants/defaultTheme';
import getOdooTheme from './variants/odooTheme';
import getModernTheme from './variants/modernTheme';
import getClassicTheme from './variants/classicTheme';

// Hilfsfunktionen importieren
import highContrastMode from './variants/highContrastMode';
import accessibilityUtils from './variants/accessibilityUtils';

/**
 * Theme-Service
 * Zentraler Dienst für Theme-Management und -Anwendung
 */
export class ThemeService {
  private static instance: ThemeService;
  private currentConfig: ThemeConfig;
  private storage: ThemeStorage;
  
  private constructor() {
    this.storage = {
      getStoredTheme: () => {
        try {
          const storedTheme = localStorage.getItem('erp_theme_config');
          return storedTheme ? JSON.parse(storedTheme) : null;
        } catch (error) {
          console.error('Fehler beim Laden des gespeicherten Themes:', error);
          return null;
        }
      },
      
      storeTheme: (config: ThemeConfig) => {
        try {
          localStorage.setItem('erp_theme_config', JSON.stringify(config));
        } catch (error) {
          console.error('Fehler beim Speichern des Themes:', error);
        }
      },
      
      clearStoredTheme: () => {
        try {
          localStorage.removeItem('erp_theme_config');
        } catch (error) {
          console.error('Fehler beim Löschen des gespeicherten Themes:', error);
        }
      }
    };
    
    // Gespeichertes Theme laden oder Standardwerte verwenden
    const storedTheme = this.storage.getStoredTheme();
    this.currentConfig = storedTheme || { ...DEFAULT_THEME_CONFIG };
  }
  
  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }
  
  /**
   * Aktuelles Theme abrufen
   * @returns Aktuelle Theme-Konfiguration
   */
  public getCurrentConfig(): ThemeConfig {
    return { ...this.currentConfig };
  }
  
  /**
   * Theme-Modus ändern
   * @param mode Neuer Theme-Modus
   */
  public setThemeMode(mode: ThemeMode): void {
    this.currentConfig = {
      ...this.currentConfig,
      mode
    };
    this.storage.storeTheme(this.currentConfig);
  }
  
  /**
   * Theme-Variante ändern
   * @param variant Neue Theme-Variante
   */
  public setThemeVariant(variant: ThemeVariant): void {
    this.currentConfig = {
      ...this.currentConfig,
      variant
    };
    this.storage.storeTheme(this.currentConfig);
  }
  
  /**
   * Theme-Parameter aktualisieren
   * @param parameters Neue Theme-Parameter
   */
  public updateParameters(parameters: Partial<ThemeParameters>): void {
    this.currentConfig = {
      ...this.currentConfig,
      parameters: {
        ...this.currentConfig.parameters,
        ...parameters
      }
    };
    this.storage.storeTheme(this.currentConfig);
  }
  
  /**
   * Vollständige Theme-Konfiguration setzen
   * @param config Neue Theme-Konfiguration
   */
  public setThemeConfig(config: ThemeConfig): void {
    this.currentConfig = { ...config };
    this.storage.storeTheme(this.currentConfig);
  }
  
  /**
   * Theme zurücksetzen auf Standardwerte
   */
  public resetTheme(): void {
    this.currentConfig = { ...DEFAULT_THEME_CONFIG };
    this.storage.storeTheme(this.currentConfig);
  }
  
  /**
   * Theme-Objekt für Material-UI basierend auf der aktuellen Konfiguration erstellen
   * @returns Material-UI Theme-Objekt
   */
  public createCurrentTheme(): Theme {
    const { mode, variant, parameters } = this.currentConfig;
    
    // Theme-Variante wählen
    let themeCreator;
    switch (variant) {
      case 'odoo':
        themeCreator = getOdooTheme;
        break;
      case 'modern':
        themeCreator = getModernTheme;
        break;
      case 'classic':
        themeCreator = getClassicTheme;
        break;
      case 'default':
      default:
        themeCreator = getDefaultTheme;
    }
    
    // Basis-Theme erstellen
    let theme = themeCreator(mode, parameters);
    
    // Hohen Kontrast anwenden, wenn der Modus 'highContrast' ist
    if (mode === 'highContrast') {
      theme = createTheme(highContrastMode(theme));
    }
    
    // Zusätzliche Barrierefreiheitsanpassungen anwenden
    if (parameters.enhancedFocus) {
      theme = createTheme(accessibilityUtils.enhanceContrast(theme));
    }
    
    if (parameters.motionReduced) {
      // Animationen reduzieren für Nutzer, die Bewegung reduzieren möchten
      theme = createTheme({
        ...theme,
        transitions: {
          ...theme.transitions,
          create: () => 'none',
        },
      });
    }
    
    return theme;
  }
  
  /**
   * Prüfen, ob der aktuelle Kontrast WCAG-Richtlinien entspricht
   * @returns Boolean, ob der Kontrast ausreichend ist
   */
  public hasAdequateContrast(): boolean {
    const { mode, parameters } = this.currentConfig;
    const theme = this.createCurrentTheme();
    
    // Primärfarbe gegen Hintergrund prüfen
    const primary = theme.palette.primary.main;
    const background = theme.palette.background.default;
    
    return accessibilityUtils.hasAdequateContrast(primary, background);
  }
  
  /**
   * CSS-Variablen für globale Theme-Anpassungen generieren
   * @returns CSS-Variablen als String
   */
  public generateCSSVariables(): string {
    const theme = this.createCurrentTheme();
    
    return `
      :root {
        --primary-color: ${theme.palette.primary.main};
        --secondary-color: ${theme.palette.secondary.main};
        --background-color: ${theme.palette.background.default};
        --paper-color: ${theme.palette.background.paper};
        --text-primary: ${theme.palette.text.primary};
        --text-secondary: ${theme.palette.text.secondary};
        --border-radius: ${theme.shape.borderRadius}px;
        --spacing-unit: ${theme.spacing(1)}px;
        --font-family: ${theme.typography.fontFamily};
        --font-size: ${theme.typography.fontSize}px;
      }
    `;
  }
}

// Singleton-Instanz exportieren
const themeService = ThemeService.getInstance();

/**
 * Hilfsfunktion, um das aktuelle Theme zu erhalten
 * @returns Material-UI Theme-Objekt
 */
export const getCurrentTheme = (): Theme => {
  return themeService.createCurrentTheme();
};

/**
 * Hilfsfunktion, um die Theme-Konfiguration zu aktualisieren
 * @param config Neue Theme-Konfiguration
 */
export const updateThemeConfig = (config: Partial<ThemeConfig>): void => {
  const currentConfig = themeService.getCurrentConfig();
  
  themeService.setThemeConfig({
    ...currentConfig,
    ...config,
    parameters: {
      ...currentConfig.parameters,
      ...config.parameters || {}
    }
  });
};

export default themeService; 