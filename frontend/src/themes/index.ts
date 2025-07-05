// Zentrale Export-Datei für das Theme-Modul

// Export aller Theme-Komponenten und Typen für einfache Verwendung im gesamten Projekt

export { default as ThemeProvider } from './ThemeProvider';
export { default as themeService } from './themeService';
export { default as llmInterface } from './llmInterface';
export * from './themeTypes';

// Export der Theme-Varianten
export { default as defaultTheme } from './variants/defaultTheme';
export { default as odooTheme } from './variants/odooTheme';
export { default as modernTheme } from './variants/modernTheme';
export { default as classicTheme } from './variants/classicTheme';

// Export von speziellen Modi
export { default as highContrastMode } from './variants/highContrastMode';
export { default as accessibilityUtils } from './variants/accessibilityUtils';

// Theme-Service und Hilfsfunktionen
export {
  ThemeService,
  getCurrentTheme,
  updateThemeConfig
} from './themeService';

// Standard-Theme als Default-Export
export { default } from './themeService'; 