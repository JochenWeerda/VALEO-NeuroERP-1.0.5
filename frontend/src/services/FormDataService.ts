/**
 * VALEO NeuroERP 2.0 - Form Data Service
 * Echte Datenbank-Integration für alle Formulare
 * Serena Quality: Vollständige CRUD-Operationen mit Type Safety
 */

import { apiService } from './ApiService';
import { StandardizedFormConfig } from '../types/forms';

export interface FormDataResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FormListResponse<T = unknown> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

class FormDataService {
  /**
   * Generische CRUD-Operationen für alle Formulare
   */
  
  // Create Operation
  async createFormData<T>(
    formConfig: StandardizedFormConfig,
    data: Record<string, unknown>
  ): Promise<FormDataResponse<T>> {
    try {
      const endpoint = this.getEndpointForForm(formConfig);
      const response = await apiService.post<T>(endpoint, data);
      
      return {
        success: true,
        data: response,
        message: 'Daten erfolgreich erstellt'
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Erstellen der Daten';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Read Operation - Single Item
  async getFormDataById<T>(
    formConfig: StandardizedFormConfig,
    id: string
  ): Promise<FormDataResponse<T>> {
    try {
      const endpoint = this.getEndpointForForm(formConfig);
      const response = await apiService.get<T>(`${endpoint}/${id}`);
      
      return {
        success: true,
        data: response
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Laden der Daten';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Read Operation - List
  async getFormDataList<T>(
    formConfig: StandardizedFormConfig,
    params?: Record<string, unknown>
  ): Promise<FormListResponse<T>> {
    try {
      const endpoint = this.getEndpointForForm(formConfig);
      const response = await apiService.get<{items: T[], total: number, page: number, size: number, pages: number}>(endpoint, params);
      
      // Handle different response formats
      let items: T[];
      let total: number;
      let page: number;
      let size: number;
      let pages: number;

      if (Array.isArray(response)) {
        items = response;
        total = response.length;
        page = 1;
        size = response.length;
        pages = 1;
      } else if (response && typeof response === 'object' && 'items' in response) {
        items = response.items || [];
        total = response.total || 0;
        page = response.page || 1;
        size = response.size || 0;
        pages = response.pages || 1;
      } else {
        items = [];
        total = 0;
        page = 1;
        size = 0;
        pages = 1;
      }
      
      return {
        success: true,
        data: items,
        total,
        page,
        size,
        pages
      };
    } catch (error: unknown) {
      return {
        success: false,
        data: [],
        total: 0,
        page: 1,
        size: 0,
        pages: 0
      };
    }
  }

  // Update Operation
  async updateFormData<T>(
    formConfig: StandardizedFormConfig,
    id: string,
    data: Record<string, unknown>
  ): Promise<FormDataResponse<T>> {
    try {
      const endpoint = this.getEndpointForForm(formConfig);
      const response = await apiService.put<T>(`${endpoint}/${id}`, data);
      
      return {
        success: true,
        data: response,
        message: 'Daten erfolgreich aktualisiert'
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Aktualisieren der Daten';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Delete Operation
  async deleteFormData(
    formConfig: StandardizedFormConfig,
    id: string
  ): Promise<FormDataResponse> {
    try {
      const endpoint = this.getEndpointForForm(formConfig);
      await apiService.delete(`${endpoint}/${id}`);
      
      return {
        success: true,
        message: 'Daten erfolgreich gelöscht'
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Löschen der Daten';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Bulk Operations
  async bulkImportFormData(
    formConfig: StandardizedFormConfig,
    file: File
  ): Promise<FormDataResponse> {
    try {
      const entityType = this.getEntityTypeFromForm(formConfig);
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiService.bulkImport(entityType, formData);
      
      return {
        success: true,
        data: response,
        message: 'Bulk-Import erfolgreich abgeschlossen'
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Bulk-Import';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async bulkExportFormData(
    formConfig: StandardizedFormConfig,
    filters?: Record<string, unknown>
  ): Promise<Blob | null> {
    try {
      const entityType = this.getEntityTypeFromForm(formConfig);
      const response = await apiService.bulkExport(entityType, filters);
      
      // Konvertiere Response zu Blob
      const blob = new Blob([JSON.stringify(response)], { type: 'application/json' });
      return blob;
    } catch (error: unknown) {
      console.error('Fehler beim Bulk-Export:', error);
      return null;
    }
  }

  // Warenwirtschaft API Methods - Echte Datenbankzugriffe
  async getArtikelStammdaten(params?: Record<string, unknown>) {
    return apiService.getArtikelStammdaten(params);
  }

  async getArtikelStammdatenById(id: string) {
    return apiService.getArtikelStammdatenById(id);
  }

  async createArtikelStammdaten(data: Record<string, unknown>) {
    return apiService.createArtikelStammdaten(data);
  }

  async updateArtikelStammdaten(id: string, data: Record<string, unknown>) {
    return apiService.updateArtikelStammdaten(id, data);
  }

  async deleteArtikelStammdaten(id: string) {
    return apiService.deleteArtikelStammdaten(id);
  }

  async getLager(params?: Record<string, unknown>) {
    return apiService.getLager(params);
  }

  async getLagerById(id: string) {
    return apiService.getLagerById(id);
  }

  async createLager(data: Record<string, unknown>) {
    return apiService.createLager(data);
  }

  async updateLager(id: string, data: Record<string, unknown>) {
    return apiService.updateLager(id, data);
  }

  async deleteLager(id: string) {
    return apiService.deleteLager(id);
  }

  async getEinlagerung(params?: Record<string, unknown>) {
    return apiService.getEinlagerung(params);
  }

  async getEinlagerungById(id: string) {
    return apiService.getEinlagerungById(id);
  }

  async createEinlagerung(data: Record<string, unknown>) {
    return apiService.createEinlagerung(data);
  }

  async updateEinlagerung(id: string, data: Record<string, unknown>) {
    return apiService.updateEinlagerung(id, data);
  }

  async deleteEinlagerung(id: string) {
    return apiService.deleteEinlagerung(id);
  }

  async getBestellung(params?: Record<string, unknown>) {
    return apiService.getBestellung(params);
  }

  async getBestellungById(id: string) {
    return apiService.getBestellungById(id);
  }

  async createBestellung(data: Record<string, unknown>) {
    return apiService.createBestellung(data);
  }

  async updateBestellung(id: string, data: Record<string, unknown>) {
    return apiService.updateBestellung(id, data);
  }

  async deleteBestellung(id: string) {
    return apiService.deleteBestellung(id);
  }

  async getLieferant(params?: Record<string, unknown>) {
    return apiService.getLieferant(params);
  }

  async getLieferantById(id: string) {
    return apiService.getLieferantById(id);
  }

  async createLieferant(data: Record<string, unknown>) {
    return apiService.createLieferant(data);
  }

  async updateLieferant(id: string, data: Record<string, unknown>) {
    return apiService.updateLieferant(id, data);
  }

  async deleteLieferant(id: string) {
    return apiService.deleteLieferant(id);
  }

  async getInventur(params?: Record<string, unknown>) {
    return apiService.getInventur(params);
  }

  async getInventurById(id: string) {
    return apiService.getInventurById(id);
  }

  async createInventur(data: Record<string, unknown>) {
    return apiService.createInventur(data);
  }

  async updateInventur(id: string, data: Record<string, unknown>) {
    return apiService.updateInventur(id, data);
  }

  async deleteInventur(id: string) {
    return apiService.deleteInventur(id);
  }

  // Finanzbuchhaltung API Methods - Echte Datenbankzugriffe
  async getKonto(params?: Record<string, unknown>) {
    return apiService.getKonto(params);
  }

  async getKontoById(id: string) {
    return apiService.getKontoById(id);
  }

  async createKonto(data: Record<string, unknown>) {
    return apiService.createKonto(data);
  }

  async updateKonto(id: string, data: Record<string, unknown>) {
    return apiService.updateKonto(id, data);
  }

  async deleteKonto(id: string) {
    return apiService.deleteKonto(id);
  }

  async getBuchung(params?: Record<string, unknown>) {
    return apiService.getBuchung(params);
  }

  async getBuchungById(id: string) {
    return apiService.getBuchungById(id);
  }

  async createBuchung(data: Record<string, unknown>) {
    return apiService.createBuchung(data);
  }

  async updateBuchung(id: string, data: Record<string, unknown>) {
    return apiService.updateBuchung(id, data);
  }

  async deleteBuchung(id: string) {
    return apiService.deleteBuchung(id);
  }

  async getRechnung(params?: Record<string, unknown>) {
    return apiService.getRechnung(params);
  }

  async getRechnungById(id: string) {
    return apiService.getRechnungById(id);
  }

  async createRechnung(data: Record<string, unknown>) {
    return apiService.createRechnung(data);
  }

  async updateRechnung(id: string, data: Record<string, unknown>) {
    return apiService.updateRechnung(id, data);
  }

  async deleteRechnung(id: string) {
    return apiService.deleteRechnung(id);
  }

  async getZahlung(params?: Record<string, unknown>) {
    return apiService.getZahlung(params);
  }

  async getZahlungById(id: string) {
    return apiService.getZahlungById(id);
  }

  async createZahlung(data: Record<string, unknown>) {
    return apiService.createZahlung(data);
  }

  async updateZahlung(id: string, data: Record<string, unknown>) {
    return apiService.updateZahlung(id, data);
  }

  async deleteZahlung(id: string) {
    return apiService.deleteZahlung(id);
  }

  async getKostenstelle(params?: Record<string, unknown>) {
    return apiService.getKostenstelle(params);
  }

  async getKostenstelleById(id: string) {
    return apiService.getKostenstelleById(id);
  }

  async createKostenstelle(data: Record<string, unknown>) {
    return apiService.createKostenstelle(data);
  }

  async updateKostenstelle(id: string, data: Record<string, unknown>) {
    return apiService.updateKostenstelle(id, data);
  }

  async deleteKostenstelle(id: string) {
    return apiService.deleteKostenstelle(id);
  }

  async getBudget(params?: Record<string, unknown>) {
    return apiService.getBudget(params);
  }

  async getBudgetById(id: string) {
    return apiService.getBudgetById(id);
  }

  async createBudget(data: Record<string, unknown>) {
    return apiService.createBudget(data);
  }

  async updateBudget(id: string, data: Record<string, unknown>) {
    return apiService.updateBudget(id, data);
  }

  async deleteBudget(id: string) {
    return apiService.deleteBudget(id);
  }

  // CRM API Methods - Echte Datenbankzugriffe
  async getKunde(params?: Record<string, unknown>) {
    return apiService.getKunde(params);
  }

  async getKundeById(id: string) {
    return apiService.getKundeById(id);
  }

  async createKunde(data: Record<string, unknown>) {
    return apiService.createKunde(data);
  }

  async updateKunde(id: string, data: Record<string, unknown>) {
    return apiService.updateKunde(id, data);
  }

  async deleteKunde(id: string) {
    return apiService.deleteKunde(id);
  }

  async getKontakt(params?: Record<string, unknown>) {
    return apiService.getKontakt(params);
  }

  async getKontaktById(id: string) {
    return apiService.getKontaktById(id);
  }

  async createKontakt(data: Record<string, unknown>) {
    return apiService.createKontakt(data);
  }

  async updateKontakt(id: string, data: Record<string, unknown>) {
    return apiService.updateKontakt(id, data);
  }

  async deleteKontakt(id: string) {
    return apiService.deleteKontakt(id);
  }

  async getAngebot(params?: Record<string, unknown>) {
    return apiService.getAngebot(params);
  }

  async getAngebotById(id: string) {
    return apiService.getAngebotById(id);
  }

  async createAngebot(data: Record<string, unknown>) {
    return apiService.createAngebot(data);
  }

  async updateAngebot(id: string, data: Record<string, unknown>) {
    return apiService.updateAngebot(id, data);
  }

  async deleteAngebot(id: string) {
    return apiService.deleteAngebot(id);
  }

  async getAuftrag(params?: Record<string, unknown>) {
    return apiService.getAuftrag(params);
  }

  async getAuftragById(id: string) {
    return apiService.getAuftragById(id);
  }

  async createAuftrag(data: Record<string, unknown>) {
    return apiService.createAuftrag(data);
  }

  async updateAuftrag(id: string, data: Record<string, unknown>) {
    return apiService.updateAuftrag(id, data);
  }

  async deleteAuftrag(id: string) {
    return apiService.deleteAuftrag(id);
  }

  async getVerkaufschance(params?: Record<string, unknown>) {
    return apiService.getVerkaufschance(params);
  }

  async getVerkaufschanceById(id: string) {
    return apiService.getVerkaufschanceById(id);
  }

  async createVerkaufschance(data: Record<string, unknown>) {
    return apiService.createVerkaufschance(data);
  }

  async updateVerkaufschance(id: string, data: Record<string, unknown>) {
    return apiService.updateVerkaufschance(id, data);
  }

  async deleteVerkaufschance(id: string) {
    return apiService.deleteVerkaufschance(id);
  }

  async getMarketingKampagne(params?: Record<string, unknown>) {
    return apiService.getMarketingKampagne(params);
  }

  async getMarketingKampagneById(id: string) {
    return apiService.getMarketingKampagneById(id);
  }

  async createMarketingKampagne(data: Record<string, unknown>) {
    return apiService.createMarketingKampagne(data);
  }

  async updateMarketingKampagne(id: string, data: Record<string, unknown>) {
    return apiService.updateMarketingKampagne(id, data);
  }

  async deleteMarketingKampagne(id: string) {
    return apiService.deleteMarketingKampagne(id);
  }

  async getKundenservice(params?: Record<string, unknown>) {
    return apiService.getKundenservice(params);
  }

  async getKundenserviceById(id: string) {
    return apiService.getKundenserviceById(id);
  }

  async createKundenservice(data: Record<string, unknown>) {
    return apiService.createKundenservice(data);
  }

  async updateKundenservice(id: string, data: Record<string, unknown>) {
    return apiService.updateKundenservice(id, data);
  }

  async deleteKundenservice(id: string) {
    return apiService.deleteKundenservice(id);
  }

  // Übergreifende Services API Methods - Echte Datenbankzugriffe
  async getBenutzer(params?: Record<string, unknown>) {
    return apiService.getBenutzer(params);
  }

  async getBenutzerById(id: string) {
    return apiService.getBenutzerById(id);
  }

  async createBenutzer(data: Record<string, unknown>) {
    return apiService.createBenutzer(data);
  }

  async updateBenutzer(id: string, data: Record<string, unknown>) {
    return apiService.updateBenutzer(id, data);
  }

  async deleteBenutzer(id: string) {
    return apiService.deleteBenutzer(id);
  }

  async getRolle(params?: Record<string, unknown>) {
    return apiService.getRolle(params);
  }

  async getRolleById(id: string) {
    return apiService.getRolleById(id);
  }

  async createRolle(data: Record<string, unknown>) {
    return apiService.createRolle(data);
  }

  async updateRolle(id: string, data: Record<string, unknown>) {
    return apiService.updateRolle(id, data);
  }

  async deleteRolle(id: string) {
    return apiService.deleteRolle(id);
  }

  async getPermission(params?: Record<string, unknown>) {
    return apiService.getPermission(params);
  }

  async getPermissionById(id: string) {
    return apiService.getPermissionById(id);
  }

  async createPermission(data: Record<string, unknown>) {
    return apiService.createPermission(data);
  }

  async updatePermission(id: string, data: Record<string, unknown>) {
    return apiService.updatePermission(id, data);
  }

  async deletePermission(id: string) {
    return apiService.deletePermission(id);
  }

  async getSystemEinstellung(params?: Record<string, unknown>) {
    return apiService.getSystemEinstellung(params);
  }

  async getSystemEinstellungById(id: string) {
    return apiService.getSystemEinstellungById(id);
  }

  async createSystemEinstellung(data: Record<string, unknown>) {
    return apiService.createSystemEinstellung(data);
  }

  async updateSystemEinstellung(id: string, data: Record<string, unknown>) {
    return apiService.updateSystemEinstellung(id, data);
  }

  async deleteSystemEinstellung(id: string) {
    return apiService.deleteSystemEinstellung(id);
  }

  async getWorkflowDefinition(params?: Record<string, unknown>) {
    return apiService.getWorkflowDefinition(params);
  }

  async getWorkflowDefinitionById(id: string) {
    return apiService.getWorkflowDefinitionById(id);
  }

  async createWorkflowDefinition(data: Record<string, unknown>) {
    return apiService.createWorkflowDefinition(data);
  }

  async updateWorkflowDefinition(id: string, data: Record<string, unknown>) {
    return apiService.updateWorkflowDefinition(id, data);
  }

  async deleteWorkflowDefinition(id: string) {
    return apiService.deleteWorkflowDefinition(id);
  }

  async getDokument(params?: Record<string, unknown>) {
    return apiService.getDokument(params);
  }

  async getDokumentById(id: string) {
    return apiService.getDokumentById(id);
  }

  async createDokument(data: Record<string, unknown>) {
    return apiService.createDokument(data);
  }

  async updateDokument(id: string, data: Record<string, unknown>) {
    return apiService.updateDokument(id, data);
  }

  async deleteDokument(id: string) {
    return apiService.deleteDokument(id);
  }

  async getMonitoringAlert(params?: Record<string, unknown>) {
    return apiService.getMonitoringAlert(params);
  }

  async getMonitoringAlertById(id: string) {
    return apiService.getMonitoringAlertById(id);
  }

  async createMonitoringAlert(data: Record<string, unknown>) {
    return apiService.createMonitoringAlert(data);
  }

  async updateMonitoringAlert(id: string, data: Record<string, unknown>) {
    return apiService.updateMonitoringAlert(id, data);
  }

  async deleteMonitoringAlert(id: string) {
    return apiService.deleteMonitoringAlert(id);
  }

  // Helper Methods
  private getEndpointForForm(formConfig: StandardizedFormConfig): string {
    const module = formConfig.module;
    const entityType = this.getEntityTypeFromForm(formConfig);
    
    switch (module) {
      case 'warenwirtschaft':
        return `/api/v1/warenwirtschaft/${entityType}`;
      case 'finanzbuchhaltung':
        return `/api/v1/finanzbuchhaltung/${entityType}`;
      case 'crm':
        return `/api/v1/crm/${entityType}`;
      case 'crosscutting':
        return `/api/v1/uebergreifende_services/${entityType}`;
      default:
        return `/api/v1/${module}/${entityType}`;
    }
  }

  private getEntityTypeFromForm(formConfig: StandardizedFormConfig): string {
    // Konvertiere Formular-ID zu Entity-Typ
    const formId = formConfig.id.toLowerCase();
    
    // Mapping von Formular-IDs zu Entity-Typen
    const entityMapping: { [key: string]: string } = {
      'artikelstammdaten': 'artikelstammdaten',
      'lager': 'lager',
      'einlagerung': 'einlagerung',
      'auslagerung': 'auslagerung',
      'bestellung': 'bestellung',
      'lieferant': 'lieferant',
      'inventur': 'inventur',
      'wareneingang': 'wareneingang',
      'warenausgang': 'warenausgang',
      'kommissionierung': 'kommissionierung',
      'produktion': 'produktion',
      'rezeptur': 'rezeptur',
      'konto': 'konto',
      'buchung': 'buchung',
      'rechnung': 'rechnung',
      'zahlung': 'zahlung',
      'kostenstelle': 'kostenstelle',
      'budget': 'budget',
      'kunde': 'kunde',
      'kontakt': 'kontakt',
      'angebot': 'angebot',
      'auftrag': 'auftrag',
      'verkaufschance': 'verkaufschance',
      'marketingkampagne': 'marketingkampagne',
      'kundenservice': 'kundenservice',
      'benutzer': 'benutzer',
      'rolle': 'rolle',
      'permission': 'permission',
      'systemeinstellung': 'systemeinstellung',
      'workflowdefinition': 'workflowdefinition',
      'dokument': 'dokument',
      'monitoringalert': 'monitoringalert'
    };
    
    return entityMapping[formId] || formId;
  }
}

// Singleton Instance
export const formDataService = new FormDataService();
export default formDataService; 