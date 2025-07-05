import { processLLMThemeRequest, getThemeDescriptionForLLM } from '../themes/llmInterface';
import { ThemeUpdateRequest } from '../themes/llmInterface';

// Temporärer Ersatz für tatsächlichen LLM-Service
// Später durch echte API-Aufrufe ersetzbar
export class LLMService {
  // Methode zur Kommunikation mit dem LLM
  static async sendQuery(query: string): Promise<string> {
    // Hier würde später der tatsächliche API-Aufruf erfolgen
    console.log('LLM-Anfrage gesendet:', query);
    
    // Wenn die Anfrage Theme-bezogen ist, verarbeiten
    if (this.isThemeRelatedQuery(query)) {
      processLLMThemeRequest(query);
      return `Theme-Einstellungen wurden gemäß Ihrer Anfrage aktualisiert.
${getThemeDescriptionForLLM()}`;
    }
    
    // Mock-Antwort für andere Anfragen
    return 'Ich habe Ihre Anfrage verstanden. Wie kann ich Ihnen weiterhelfen?';
  }
  
  // Methode zur direkten Anpassung des Themes
  static async updateTheme(themeRequest: ThemeUpdateRequest): Promise<void> {
    processLLMThemeRequest(themeRequest);
  }
  
  // Hilfsmethode zur Erkennung von Theme-bezogenen Anfragen
  private static isThemeRelatedQuery(query: string): boolean {
    const themeKeywords = [
      'theme', 'design', 'dark mode', 'light mode', 'kontrast', 'contrast',
      'farbe', 'color', 'schrift', 'font', 'größe', 'size', 'aussehen',
      'look', 'feel', 'style', 'dunkelmodus', 'hellmodus', 'ansicht', 'view',
      'odoo', 'standard', 'modern', 'klassisch', 'classic'
    ];
    
    return themeKeywords.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  
  // Methode zur Abfrage von Theme-Informationen
  static getThemeInfo(): string {
    return getThemeDescriptionForLLM();
  }
} 