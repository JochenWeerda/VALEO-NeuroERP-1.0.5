import { ThemeConfig, ThemeParameters } from './themeTypes';
import { updateThemeConfig, getCurrentTheme } from './themeService';
import { ThemeCommand, ThemeMode, ThemeVariant } from './themeTypes';
import themeService from './themeService';

// Interface für LLM-Anfragen an das Theme-System
export interface ThemeUpdateRequest {
  mode?: 'light' | 'dark' | 'high-contrast';
  variant?: 'odoo' | 'default' | 'modern' | 'classic';
  parameters?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontSize?: 'small' | 'medium' | 'large';
    spacing?: 'compact' | 'normal' | 'comfortable';
    borderRadius?: 'none' | 'small' | 'medium' | 'large';
    fontFamily?: string;
    visualDensity?: 'low' | 'medium' | 'high';
  };
}

// Funktion zum Parsen und Verarbeiten von LLM-Anfragen zur Theme-Aktualisierung
export const processLLMThemeRequest = (request: string | ThemeUpdateRequest): void => {
  let themeRequest: Partial<ThemeConfig> = {};

  // Wenn die Anfrage als String übergeben wird, versuchen, sie zu parsen
  if (typeof request === 'string') {
    try {
      // Einfaches Parsen von Schlüsselwörtern in der Anfrage
      if (request.toLowerCase().includes('dark mode') || request.toLowerCase().includes('dunkelmodus')) {
        themeRequest.mode = 'dark';
      } else if (request.toLowerCase().includes('light mode') || request.toLowerCase().includes('hellmodus')) {
        themeRequest.mode = 'light';
      } else if (request.toLowerCase().includes('high contrast') || request.toLowerCase().includes('hoher kontrast')) {
        themeRequest.mode = 'high-contrast';
      }

      // Parsen von Theme-Varianten
      if (request.toLowerCase().includes('odoo')) {
        themeRequest.variant = 'odoo';
      } else if (request.toLowerCase().includes('default') || request.toLowerCase().includes('standard')) {
        themeRequest.variant = 'default';
      } else if (request.toLowerCase().includes('modern')) {
        themeRequest.variant = 'modern';
      } else if (request.toLowerCase().includes('classic') || request.toLowerCase().includes('klassisch')) {
        themeRequest.variant = 'classic';
      }

      // Parsen von Parameter-Anfragen
      const parameters: ThemeParameters = {};

      // Schriftgröße
      if (request.toLowerCase().includes('kleine schrift') || request.toLowerCase().includes('small font')) {
        parameters.fontSize = 'small';
      } else if (request.toLowerCase().includes('große schrift') || request.toLowerCase().includes('large font')) {
        parameters.fontSize = 'large';
      }

      // Abstände
      if (request.toLowerCase().includes('kompakt') || request.toLowerCase().includes('compact')) {
        parameters.spacing = 'compact';
      } else if (request.toLowerCase().includes('komfortabel') || request.toLowerCase().includes('comfortable')) {
        parameters.spacing = 'comfortable';
      }

      // Eckenradius
      if (request.toLowerCase().includes('keine ecken') || request.toLowerCase().includes('no corners')) {
        parameters.borderRadius = 'none';
      } else if (request.toLowerCase().includes('abgerundete ecken') || request.toLowerCase().includes('rounded corners')) {
        parameters.borderRadius = 'medium';
      } else if (request.toLowerCase().includes('stark abgerundete ecken') || request.toLowerCase().includes('very rounded')) {
        parameters.borderRadius = 'large';
      }

      // Visuelle Dichte
      if (request.toLowerCase().includes('weniger elemente') || request.toLowerCase().includes('low density')) {
        parameters.visualDensity = 'low';
      } else if (request.toLowerCase().includes('mehr elemente') || request.toLowerCase().includes('high density')) {
        parameters.visualDensity = 'high';
      }

      // Parameter nur hinzufügen, wenn sie nicht leer sind
      if (Object.keys(parameters).length > 0) {
        themeRequest.parameters = parameters;
      }
    } catch (error) {
      console.error('Fehler beim Parsen der LLM-Theme-Anfrage:', error);
      return;
    }
  } else {
    // Wenn die Anfrage bereits als Objekt übergeben wird
    themeRequest = {
      mode: request.mode,
      variant: request.variant,
      parameters: request.parameters
    };
  }

  // Theme aktualisieren, wenn Änderungen vorhanden sind
  if (Object.keys(themeRequest).length > 0) {
    updateThemeConfig(themeRequest);
  }
};

// Funktion zum Generieren einer Beschreibung des aktuellen Themes für das LLM
export const getThemeDescriptionForLLM = (): string => {
  const currentTheme = getCurrentTheme();
  const { palette, typography, shape, spacing } = currentTheme;

  return `
Aktuelles Theme:
- Modus: ${palette.mode === 'dark' ? 'Dunkelmodus' : 'Hellmodus'}
- Primärfarbe: ${palette.primary.main}
- Sekundärfarbe: ${palette.secondary.main}
- Schriftart: ${typography.fontFamily}
- Randradius: ${shape.borderRadius}px
- Standardabstand: ${spacing(1)}px
`;
};

/**
 * LLM-Interface für Theme-Steuerung
 * Ermöglicht die Steuerung des Themes durch natürlichsprachliche Befehle
 */

/**
 * Verarbeitet einen natürlichsprachlichen Befehl und wandelt ihn in ein ThemeCommand-Objekt um
 * @param input Natürlichsprachlicher Befehl
 * @returns ThemeCommand-Objekt oder null, wenn kein gültiger Befehl erkannt wurde
 */
export const parseThemeCommand = (input: string): ThemeCommand | null => {
  // Text normalisieren
  const normalizedInput = input.toLowerCase().trim();
  
  // Theme-Modus-Befehle erkennen
  if (normalizedInput.includes('hell') || normalizedInput.includes('light')) {
    return { type: 'mode', mode: 'light' };
  }
  
  if (normalizedInput.includes('dunkel') || normalizedInput.includes('dark')) {
    return { type: 'mode', mode: 'dark' };
  }
  
  if (
    normalizedInput.includes('kontrast') || 
    normalizedInput.includes('contrast') || 
    normalizedInput.includes('barrierefreiheit') ||
    normalizedInput.includes('accessibility')
  ) {
    return { type: 'mode', mode: 'highContrast' };
  }
  
  // Theme-Varianten-Befehle erkennen
  if (normalizedInput.includes('odoo')) {
    return { type: 'variant', variant: 'odoo' };
  }
  
  if (normalizedInput.includes('default') || normalizedInput.includes('standard')) {
    return { type: 'variant', variant: 'default' };
  }
  
  if (normalizedInput.includes('modern')) {
    return { type: 'variant', variant: 'modern' };
  }
  
  if (normalizedInput.includes('classic') || normalizedInput.includes('klassisch')) {
    return { type: 'variant', variant: 'classic' };
  }
  
  // Parameter-Befehle erkennen
  
  // Schriftgröße
  if (normalizedInput.includes('kleine schrift') || normalizedInput.includes('small font')) {
    return { 
      type: 'parameter', 
      parameter: 'fontSize',
      value: 'small'
    };
  }
  
  if (normalizedInput.includes('große schrift') || normalizedInput.includes('large font')) {
    return { 
      type: 'parameter', 
      parameter: 'fontSize',
      value: 'large'
    };
  }
  
  // Abstände
  if (normalizedInput.includes('kompakt') || normalizedInput.includes('compact')) {
    return { 
      type: 'parameter', 
      parameter: 'spacing',
      value: 'compact'
    };
  }
  
  if (normalizedInput.includes('komfortabel') || normalizedInput.includes('comfortable')) {
    return { 
      type: 'parameter', 
      parameter: 'spacing',
      value: 'comfortable'
    };
  }
  
  // Eckenradius
  if (normalizedInput.includes('keine ecken') || normalizedInput.includes('no corners')) {
    return { 
      type: 'parameter', 
      parameter: 'borderRadius',
      value: 'none'
    };
  }
  
  if (normalizedInput.includes('runde ecken') || normalizedInput.includes('rounded corners')) {
    return { 
      type: 'parameter', 
      parameter: 'borderRadius',
      value: 'large'
    };
  }
  
  // Barrierefreiheit
  if (normalizedInput.includes('bewegung reduzieren') || normalizedInput.includes('reduce motion')) {
    return { 
      type: 'parameter', 
      parameter: 'motionReduced',
      value: true
    };
  }
  
  if (normalizedInput.includes('fokus verbessern') || normalizedInput.includes('enhance focus')) {
    return { 
      type: 'parameter', 
      parameter: 'enhancedFocus',
      value: true
    };
  }
  
  // Reset-Befehl
  if (
    normalizedInput.includes('zurücksetzen') || 
    normalizedInput.includes('reset') || 
    normalizedInput.includes('standard wiederherstellen')
  ) {
    return { type: 'reset' };
  }
  
  // Wenn kein bekannter Befehl erkannt wurde
  return null;
};

/**
 * Führt einen Theme-Befehl aus
 * @param command ThemeCommand-Objekt
 * @returns Boolean, ob der Befehl erfolgreich ausgeführt wurde
 */
export const executeThemeCommand = (command: ThemeCommand): boolean => {
  try {
    switch (command.type) {
      case 'mode':
        if (command.mode) {
          themeService.setThemeMode(command.mode);
          return true;
        }
        return false;
        
      case 'variant':
        if (command.variant) {
          themeService.setThemeVariant(command.variant);
          return true;
        }
        return false;
        
      case 'parameter':
        if (command.parameter && command.value !== undefined) {
          const params: Partial<ThemeParameters> = {
            [command.parameter]: command.value
          };
          themeService.updateParameters(params);
          return true;
        }
        return false;
        
      case 'reset':
        themeService.resetTheme();
        return true;
        
      default:
        return false;
    }
  } catch (error) {
    console.error('Fehler bei der Ausführung des Theme-Befehls:', error);
    return false;
  }
};

/**
 * Verarbeitet einen natürlichsprachlichen Befehl und führt ihn aus
 * @param input Natürlichsprachlicher Befehl
 * @returns Antwort für den Benutzer
 */
export const processNaturalLanguageCommand = (input: string): string => {
  const command = parseThemeCommand(input);
  
  if (!command) {
    return 'Entschuldigung, ich habe keinen gültigen Theme-Befehl erkannt. Sie können Befehle wie "Dunkles Theme", "Moderne Variante" oder "Große Schriftgröße" verwenden.';
  }
  
  const success = executeThemeCommand(command);
  
  if (!success) {
    return 'Bei der Ausführung des Befehls ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.';
  }
  
  // Erfolgsantwort basierend auf dem ausgeführten Befehl
  switch (command.type) {
    case 'mode':
      return `Das Theme wurde auf den Modus "${command.mode === 'light' ? 'Hell' : command.mode === 'dark' ? 'Dunkel' : 'Hoher Kontrast'}" umgestellt.`;
      
    case 'variant':
      return `Das Theme wurde auf die Variante "${command.variant}" umgestellt.`;
      
    case 'parameter':
      return `Der Theme-Parameter "${command.parameter}" wurde auf "${command.value}" gesetzt.`;
      
    case 'reset':
      return 'Das Theme wurde auf die Standardeinstellungen zurückgesetzt.';
      
    default:
      return 'Der Befehl wurde erfolgreich ausgeführt.';
  }
};

/**
 * Generiert Vorschläge für Theme-Befehle
 * @returns Array von Befehlsvorschlägen
 */
export const getThemeCommandSuggestions = (): string[] => {
  return [
    'Dunkles Theme aktivieren',
    'Helles Theme aktivieren',
    'Hohen Kontrast aktivieren',
    'Moderne Variante einstellen',
    'Klassische Variante einstellen',
    'Odoo-Variante einstellen',
    'Schriftgröße erhöhen',
    'Schriftgröße verkleinern',
    'Kompakte Abstände einstellen',
    'Komfortable Abstände einstellen',
    'Runde Ecken aktivieren',
    'Keine Eckenrundung',
    'Bewegung reduzieren',
    'Fokus verbessern',
    'Theme zurücksetzen'
  ];
};

const llmInterface = {
  parseThemeCommand,
  executeThemeCommand,
  processNaturalLanguageCommand,
  getThemeCommandSuggestions
};

export default llmInterface; 