import api from './api';

/**
 * Service für die Kommunikation mit der TSE (Technische Sicherheitseinrichtung)
 * und Kassenübernahme-Funktionen
 */
class TseService {
  /**
   * Abruf des aktuellen TSE-Status
   * @returns TSE-Statusdaten
   */
  async getTseStatus() {
    try {
      const response = await api.get('/api/v1/tse/status');
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen des TSE-Status:', error);
      throw error;
    }
  }

  /**
   * Import von Kassendaten aus SQLite-Datenbanken
   * @param databases Array der zu importierenden Datenbanken (Dateinamen)
   * @returns Import-Ergebnis
   */
  async importKassenDaten(databases: string[]) {
    try {
      const response = await api.post('/api/v1/kasse/import', { databases });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Import der Kassendaten:', error);
      throw error;
    }
  }

  /**
   * Prüft die Verfügbarkeit der SQLite-Datenbanken für den Import
   * @returns Liste der verfügbaren Datenbanken mit Metadaten
   */
  async checkKassenDatenVerfuegbarkeit() {
    try {
      const response = await api.get('/api/v1/kasse/check-availability');
      return response.data;
    } catch (error) {
      console.error('Fehler beim Prüfen der Kassendaten-Verfügbarkeit:', error);
      throw error;
    }
  }

  /**
   * Erstellt einen Bericht über den letzten Kassendaten-Import
   * @returns Import-Bericht
   */
  async getKassenImportBericht() {
    try {
      const response = await api.get('/api/v1/kasse/import-report');
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen des Kassendaten-Import-Berichts:', error);
      throw error;
    }
  }
}

export default new TseService(); 