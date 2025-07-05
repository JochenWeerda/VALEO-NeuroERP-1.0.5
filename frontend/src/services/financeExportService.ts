import api from './api';

/**
 * Service für die Übertragung von Daten in externe Finanzbuchhaltungssysteme
 * und die interne Finanzbuchhaltung
 */
class FinanceExportService {
  /**
   * Übernahme von Daten in die interne Finanzbuchhaltung
   * @param options Übernahmeoptionen für die interne Finanzbuchhaltung
   * @returns Übernahme-Ergebnis
   */
  async transferToInternalAccounting(options: InternalAccountingOptions) {
    try {
      const response = await api.post('/api/v1/finance/internal/transfer', options);
      return response.data;
    } catch (error) {
      console.error('Fehler bei der Übernahme in die interne Finanzbuchhaltung:', error);
      throw error;
    }
  }

  /**
   * Prüft, ob Daten für die Übernahme in die interne Finanzbuchhaltung bereit sind
   * @param periodId Perioden-ID oder Datum
   * @returns Status der Übernahmebereitschaft mit Datenübersicht
   */
  async checkInternalTransferReadiness(periodId: string) {
    try {
      const response = await api.get(`/api/v1/finance/internal/check-readiness/${periodId}`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Prüfen der Übernahmebereitschaft:', error);
      throw error;
    }
  }

  /**
   * Exportiert Daten im DATEV-Format
   * @param options Exportoptionen für DATEV
   * @returns Download-URL oder Blob
   */
  async exportDatev(options: DatevExportOptions) {
    try {
      const response = await api.post('/api/v1/finance/export/datev', options);
      return response.data;
    } catch (error) {
      console.error('Fehler beim DATEV-Export:', error);
      throw error;
    }
  }

  /**
   * Exportiert Daten im SAP-Format
   * @param options Exportoptionen für SAP
   * @returns Export-Ergebnis
   */
  async exportSap(options: SapExportOptions) {
    try {
      const response = await api.post('/api/v1/finance/export/sap', options);
      return response.data;
    } catch (error) {
      console.error('Fehler beim SAP-Export:', error);
      throw error;
    }
  }

  /**
   * Exportiert Daten im Lexware-Format
   * @param options Exportoptionen für Lexware
   * @returns Export-Ergebnis
   */
  async exportLexware(options: LexwareExportOptions) {
    try {
      const response = await api.post('/api/v1/finance/export/lexware', options);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Lexware-Export:', error);
      throw error;
    }
  }

  /**
   * Überprüft den Status eines laufenden Exports
   * @param exportId ID des Exports
   * @returns Status des Exports
   */
  async checkExportStatus(exportId: string) {
    try {
      const response = await api.get(`/api/v1/finance/export/status/${exportId}`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen des Export-Status:', error);
      throw error;
    }
  }

  /**
   * Holt Konfigurationsvorlagen für verschiedene Finanzbuchhaltungssysteme
   * @returns Verfügbare Vorlagen
   */
  async getExportTemplates() {
    try {
      const response = await api.get('/api/v1/finance/export/templates');
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Export-Vorlagen:', error);
      throw error;
    }
  }
}

// Typdefinitionen für die interne Finanzbuchhaltung
export interface InternalAccountingOptions {
  periodId: string;
  startDate: string;
  endDate: string;
  transactionTypes: ('sales' | 'purchases' | 'payments' | 'all')[];
  autoPostJournalEntries: boolean;
  createDraftEntries: boolean;
  accountingRules?: string;
  notes?: string;
}

export interface InternalTransferReadiness {
  ready: boolean;
  periodClosed: boolean;
  hasUnpostedTransactions: boolean;
  transactionCounts: {
    sales: number;
    purchases: number;
    payments: number;
    other: number;
  };
  warnings: string[];
  errors: string[];
}

// Typdefinitionen für Export-Optionen
export interface DatevExportOptions {
  startDate: string;
  endDate: string;
  exportType: 'buchungen' | 'stammdaten' | 'zahlungen';
  berater?: string;
  mandant?: string;
  wirtschaftsjahr?: string;
  includeSteuerkonten?: boolean;
  exportFormat?: 'csv' | 'xml';
}

export interface SapExportOptions {
  startDate: string;
  endDate: string;
  exportType: 'fi' | 'co' | 'mm' | 'sd';
  companyCode?: string;
  costCenter?: string;
  exportFormat?: 'csv' | 'xml' | 'idoc';
}

export interface LexwareExportOptions {
  startDate: string;
  endDate: string;
  exportType: 'buchungen' | 'stammdaten';
  firma?: string;
  exportFormat?: 'csv' | 'xml';
}

export default new FinanceExportService(); 