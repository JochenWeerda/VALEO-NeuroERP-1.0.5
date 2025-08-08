/**
 * VALEO NeuroERP 2.0 - API Service
 * Echte Datenbank-Integration für alle 150+ Formulare
 * Serena Quality: Vollständige API-Integration mit Error Handling und Type Safety
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';

// API Response Types
export interface APIResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T = unknown> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface APIError {
  code: string;
  message: string;
  details?: unknown;
}

// Base API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_TIMEOUT = 30000; // 30 seconds

class APIService {
  private api: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Request Interceptor für Auth Token
    this.api.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response Interceptor für Error Handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        this.handleAPIError(error);
        return Promise.reject(error);
      }
    );
  }

  // Auth Token Management
  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  getAuthToken(): string | null {
    if (!this.authToken) {
      this.authToken = localStorage.getItem('auth_token');
    }
    return this.authToken;
  }

  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }

  // Error Handling
  private handleAPIError(error: AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data as APIError;

    switch (status) {
      case 401:
        message.error('Sitzung abgelaufen. Bitte melden Sie sich erneut an.');
        this.clearAuthToken();
        break;
      case 403:
        message.error('Zugriff verweigert. Sie haben keine Berechtigung für diese Aktion.');
        break;
      case 404:
        message.error('Ressource nicht gefunden.');
        break;
      case 422:
        message.error('Validierungsfehler: ' + (data?.message || 'Ungültige Daten'));
        break;
      case 500:
        message.error('Serverfehler. Bitte versuchen Sie es später erneut.');
        break;
      default:
        message.error('Ein unerwarteter Fehler ist aufgetreten.');
    }
  }

  // Generic API Methods
  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.api.get<T>(endpoint, { params });
    return response.data;
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.api.post<T>(endpoint, data);
    return response.data;
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.api.put<T>(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.api.delete<T>(endpoint);
    return response.data;
  }

  // Warenwirtschaft API Methods - Echte Datenbankzugriffe
  async getArtikelStammdaten(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/warenwirtschaft/artikelstammdaten', params);
  }

  async getArtikelStammdatenById(id: string) {
    return this.get<unknown>(`/api/v1/warenwirtschaft/artikelstammdaten/${id}`);
  }

  async createArtikelStammdaten(data: unknown) {
    return this.post<unknown>('/api/v1/warenwirtschaft/artikelstammdaten', data);
  }

  async updateArtikelStammdaten(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/warenwirtschaft/artikelstammdaten/${id}`, data);
  }

  async deleteArtikelStammdaten(id: string) {
    return this.delete<unknown>(`/api/v1/warenwirtschaft/artikelstammdaten/${id}`);
  }

  async getLager(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/warenwirtschaft/lager', params);
  }

  async getLagerById(id: string) {
    return this.get<unknown>(`/api/v1/warenwirtschaft/lager/${id}`);
  }

  async createLager(data: unknown) {
    return this.post<unknown>('/api/v1/warenwirtschaft/lager', data);
  }

  async updateLager(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/warenwirtschaft/lager/${id}`, data);
  }

  async deleteLager(id: string) {
    return this.delete<unknown>(`/api/v1/warenwirtschaft/lager/${id}`);
  }

  async getEinlagerung(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/warenwirtschaft/einlagerung', params);
  }

  async getEinlagerungById(id: string) {
    return this.get<unknown>(`/api/v1/warenwirtschaft/einlagerung/${id}`);
  }

  async createEinlagerung(data: unknown) {
    return this.post<unknown>('/api/v1/warenwirtschaft/einlagerung', data);
  }

  async updateEinlagerung(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/warenwirtschaft/einlagerung/${id}`, data);
  }

  async deleteEinlagerung(id: string) {
    return this.delete<unknown>(`/api/v1/warenwirtschaft/einlagerung/${id}`);
  }

  async getBestellung(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/warenwirtschaft/bestellung', params);
  }

  async getBestellungById(id: string) {
    return this.get<unknown>(`/api/v1/warenwirtschaft/bestellung/${id}`);
  }

  async createBestellung(data: unknown) {
    return this.post<unknown>('/api/v1/warenwirtschaft/bestellung', data);
  }

  async updateBestellung(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/warenwirtschaft/bestellung/${id}`, data);
  }

  async deleteBestellung(id: string) {
    return this.delete<unknown>(`/api/v1/warenwirtschaft/bestellung/${id}`);
  }

  async getLieferant(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/warenwirtschaft/lieferant', params);
  }

  async getLieferantById(id: string) {
    return this.get<unknown>(`/api/v1/warenwirtschaft/lieferant/${id}`);
  }

  async createLieferant(data: unknown) {
    return this.post<unknown>('/api/v1/warenwirtschaft/lieferant', data);
  }

  async updateLieferant(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/warenwirtschaft/lieferant/${id}`, data);
  }

  async deleteLieferant(id: string) {
    return this.delete<unknown>(`/api/v1/warenwirtschaft/lieferant/${id}`);
  }

  async getInventur(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/warenwirtschaft/inventur', params);
  }

  async getInventurById(id: string) {
    return this.get<unknown>(`/api/v1/warenwirtschaft/inventur/${id}`);
  }

  async createInventur(data: unknown) {
    return this.post<unknown>('/api/v1/warenwirtschaft/inventur', data);
  }

  async updateInventur(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/warenwirtschaft/inventur/${id}`, data);
  }

  async deleteInventur(id: string) {
    return this.delete<unknown>(`/api/v1/warenwirtschaft/inventur/${id}`);
  }

  // Finanzbuchhaltung API Methods - Echte Datenbankzugriffe
  async getKonto(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/finanzbuchhaltung/konto', params);
  }

  async getKontoById(id: string) {
    return this.get<unknown>(`/api/v1/finanzbuchhaltung/konto/${id}`);
  }

  async createKonto(data: unknown) {
    return this.post<unknown>('/api/v1/finanzbuchhaltung/konto', data);
  }

  async updateKonto(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/finanzbuchhaltung/konto/${id}`, data);
  }

  async deleteKonto(id: string) {
    return this.delete<unknown>(`/api/v1/finanzbuchhaltung/konto/${id}`);
  }

  async getBuchung(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/finanzbuchhaltung/buchung', params);
  }

  async getBuchungById(id: string) {
    return this.get<unknown>(`/api/v1/finanzbuchhaltung/buchung/${id}`);
  }

  async createBuchung(data: unknown) {
    return this.post<unknown>('/api/v1/finanzbuchhaltung/buchung', data);
  }

  async updateBuchung(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/finanzbuchhaltung/buchung/${id}`, data);
  }

  async deleteBuchung(id: string) {
    return this.delete<unknown>(`/api/v1/finanzbuchhaltung/buchung/${id}`);
  }

  async getRechnung(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/finanzbuchhaltung/rechnung', params);
  }

  async getRechnungById(id: string) {
    return this.get<unknown>(`/api/v1/finanzbuchhaltung/rechnung/${id}`);
  }

  async createRechnung(data: unknown) {
    return this.post<unknown>('/api/v1/finanzbuchhaltung/rechnung', data);
  }

  async updateRechnung(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/finanzbuchhaltung/rechnung/${id}`, data);
  }

  async deleteRechnung(id: string) {
    return this.delete<unknown>(`/api/v1/finanzbuchhaltung/rechnung/${id}`);
  }

  async getZahlung(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/finanzbuchhaltung/zahlung', params);
  }

  async getZahlungById(id: string) {
    return this.get<unknown>(`/api/v1/finanzbuchhaltung/zahlung/${id}`);
  }

  async createZahlung(data: unknown) {
    return this.post<unknown>('/api/v1/finanzbuchhaltung/zahlung', data);
  }

  async updateZahlung(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/finanzbuchhaltung/zahlung/${id}`, data);
  }

  async deleteZahlung(id: string) {
    return this.delete<unknown>(`/api/v1/finanzbuchhaltung/zahlung/${id}`);
  }

  async getKostenstelle(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/finanzbuchhaltung/kostenstelle', params);
  }

  async getKostenstelleById(id: string) {
    return this.get<unknown>(`/api/v1/finanzbuchhaltung/kostenstelle/${id}`);
  }

  async createKostenstelle(data: unknown) {
    return this.post<unknown>('/api/v1/finanzbuchhaltung/kostenstelle', data);
  }

  async updateKostenstelle(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/finanzbuchhaltung/kostenstelle/${id}`, data);
  }

  async deleteKostenstelle(id: string) {
    return this.delete<unknown>(`/api/v1/finanzbuchhaltung/kostenstelle/${id}`);
  }

  async getBudget(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/finanzbuchhaltung/budget', params);
  }

  async getBudgetById(id: string) {
    return this.get<unknown>(`/api/v1/finanzbuchhaltung/budget/${id}`);
  }

  async createBudget(data: unknown) {
    return this.post<unknown>('/api/v1/finanzbuchhaltung/budget', data);
  }

  async updateBudget(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/finanzbuchhaltung/budget/${id}`, data);
  }

  async deleteBudget(id: string) {
    return this.delete<unknown>(`/api/v1/finanzbuchhaltung/budget/${id}`);
  }

  // CRM API Methods - Echte Datenbankzugriffe
  async getKunde(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/crm/kunde', params);
  }

  async getKundeById(id: string) {
    return this.get<unknown>(`/api/v1/crm/kunde/${id}`);
  }

  async createKunde(data: unknown) {
    return this.post<unknown>('/api/v1/crm/kunde', data);
  }

  async updateKunde(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/crm/kunde/${id}`, data);
  }

  async deleteKunde(id: string) {
    return this.delete<unknown>(`/api/v1/crm/kunde/${id}`);
  }

  async getKontakt(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/crm/kontakt', params);
  }

  async getKontaktById(id: string) {
    return this.get<unknown>(`/api/v1/crm/kontakt/${id}`);
  }

  async createKontakt(data: unknown) {
    return this.post<unknown>('/api/v1/crm/kontakt', data);
  }

  async updateKontakt(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/crm/kontakt/${id}`, data);
  }

  async deleteKontakt(id: string) {
    return this.delete<unknown>(`/api/v1/crm/kontakt/${id}`);
  }

  async getAngebot(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/crm/angebot', params);
  }

  async getAngebotById(id: string) {
    return this.get<unknown>(`/api/v1/crm/angebot/${id}`);
  }

  async createAngebot(data: unknown) {
    return this.post<unknown>('/api/v1/crm/angebot', data);
  }

  async updateAngebot(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/crm/angebot/${id}`, data);
  }

  async deleteAngebot(id: string) {
    return this.delete<unknown>(`/api/v1/crm/angebot/${id}`);
  }

  async getAuftrag(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/crm/auftrag', params);
  }

  async getAuftragById(id: string) {
    return this.get<unknown>(`/api/v1/crm/auftrag/${id}`);
  }

  async createAuftrag(data: unknown) {
    return this.post<unknown>('/api/v1/crm/auftrag', data);
  }

  async updateAuftrag(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/crm/auftrag/${id}`, data);
  }

  async deleteAuftrag(id: string) {
    return this.delete<unknown>(`/api/v1/crm/auftrag/${id}`);
  }

  async getVerkaufschance(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/crm/verkaufschance', params);
  }

  async getVerkaufschanceById(id: string) {
    return this.get<unknown>(`/api/v1/crm/verkaufschance/${id}`);
  }

  async createVerkaufschance(data: unknown) {
    return this.post<unknown>('/api/v1/crm/verkaufschance', data);
  }

  async updateVerkaufschance(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/crm/verkaufschance/${id}`, data);
  }

  async deleteVerkaufschance(id: string) {
    return this.delete<unknown>(`/api/v1/crm/verkaufschance/${id}`);
  }

  async getMarketingKampagne(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/crm/marketingkampagne', params);
  }

  async getMarketingKampagneById(id: string) {
    return this.get<unknown>(`/api/v1/crm/marketingkampagne/${id}`);
  }

  async createMarketingKampagne(data: unknown) {
    return this.post<unknown>('/api/v1/crm/marketingkampagne', data);
  }

  async updateMarketingKampagne(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/crm/marketingkampagne/${id}`, data);
  }

  async deleteMarketingKampagne(id: string) {
    return this.delete<unknown>(`/api/v1/crm/marketingkampagne/${id}`);
  }

  async getKundenservice(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/crm/kundenservice', params);
  }

  async getKundenserviceById(id: string) {
    return this.get<unknown>(`/api/v1/crm/kundenservice/${id}`);
  }

  async createKundenservice(data: unknown) {
    return this.post<unknown>('/api/v1/crm/kundenservice', data);
  }

  async updateKundenservice(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/crm/kundenservice/${id}`, data);
  }

  async deleteKundenservice(id: string) {
    return this.delete<unknown>(`/api/v1/crm/kundenservice/${id}`);
  }

  // Übergreifende Services API Methods - Echte Datenbankzugriffe
  async getBenutzer(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/uebergreifende_services/benutzer', params);
  }

  async getBenutzerById(id: string) {
    return this.get<unknown>(`/api/v1/uebergreifende_services/benutzer/${id}`);
  }

  async createBenutzer(data: unknown) {
    return this.post<unknown>('/api/v1/uebergreifende_services/benutzer', data);
  }

  async updateBenutzer(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/uebergreifende_services/benutzer/${id}`, data);
  }

  async deleteBenutzer(id: string) {
    return this.delete<unknown>(`/api/v1/uebergreifende_services/benutzer/${id}`);
  }

  async getRolle(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/uebergreifende_services/rolle', params);
  }

  async getRolleById(id: string) {
    return this.get<unknown>(`/api/v1/uebergreifende_services/rolle/${id}`);
  }

  async createRolle(data: unknown) {
    return this.post<unknown>('/api/v1/uebergreifende_services/rolle', data);
  }

  async updateRolle(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/uebergreifende_services/rolle/${id}`, data);
  }

  async deleteRolle(id: string) {
    return this.delete<unknown>(`/api/v1/uebergreifende_services/rolle/${id}`);
  }

  async getPermission(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/uebergreifende_services/permission', params);
  }

  async getPermissionById(id: string) {
    return this.get<unknown>(`/api/v1/uebergreifende_services/permission/${id}`);
  }

  async createPermission(data: unknown) {
    return this.post<unknown>('/api/v1/uebergreifende_services/permission', data);
  }

  async updatePermission(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/uebergreifende_services/permission/${id}`, data);
  }

  async deletePermission(id: string) {
    return this.delete<unknown>(`/api/v1/uebergreifende_services/permission/${id}`);
  }

  async getSystemEinstellung(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/uebergreifende_services/systemeinstellung', params);
  }

  async getSystemEinstellungById(id: string) {
    return this.get<unknown>(`/api/v1/uebergreifende_services/systemeinstellung/${id}`);
  }

  async createSystemEinstellung(data: unknown) {
    return this.post<unknown>('/api/v1/uebergreifende_services/systemeinstellung', data);
  }

  async updateSystemEinstellung(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/uebergreifende_services/systemeinstellung/${id}`, data);
  }

  async deleteSystemEinstellung(id: string) {
    return this.delete<unknown>(`/api/v1/uebergreifende_services/systemeinstellung/${id}`);
  }

  async getWorkflowDefinition(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/uebergreifende_services/workflowdefinition', params);
  }

  async getWorkflowDefinitionById(id: string) {
    return this.get<unknown>(`/api/v1/uebergreifende_services/workflowdefinition/${id}`);
  }

  async createWorkflowDefinition(data: unknown) {
    return this.post<unknown>('/api/v1/uebergreifende_services/workflowdefinition', data);
  }

  async updateWorkflowDefinition(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/uebergreifende_services/workflowdefinition/${id}`, data);
  }

  async deleteWorkflowDefinition(id: string) {
    return this.delete<unknown>(`/api/v1/uebergreifende_services/workflowdefinition/${id}`);
  }

  async getDokument(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/uebergreifende_services/dokument', params);
  }

  async getDokumentById(id: string) {
    return this.get<unknown>(`/api/v1/uebergreifende_services/dokument/${id}`);
  }

  async createDokument(data: unknown) {
    return this.post<unknown>('/api/v1/uebergreifende_services/dokument', data);
  }

  async updateDokument(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/uebergreifende_services/dokument/${id}`, data);
  }

  async deleteDokument(id: string) {
    return this.delete<unknown>(`/api/v1/uebergreifende_services/dokument/${id}`);
  }

  async getMonitoringAlert(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<unknown>>('/api/v1/uebergreifende_services/monitoringalert', params);
  }

  async getMonitoringAlertById(id: string) {
    return this.get<unknown>(`/api/v1/uebergreifende_services/monitoringalert/${id}`);
  }

  async createMonitoringAlert(data: unknown) {
    return this.post<unknown>('/api/v1/uebergreifende_services/monitoringalert', data);
  }

  async updateMonitoringAlert(id: string, data: unknown) {
    return this.put<unknown>(`/api/v1/uebergreifende_services/monitoringalert/${id}`, data);
  }

  async deleteMonitoringAlert(id: string) {
    return this.delete<unknown>(`/api/v1/uebergreifende_services/monitoringalert/${id}`);
  }

  // Bulk Operations - Echte Datenbankzugriffe
  async bulkImport(entityType: string, formData: FormData): Promise<unknown> {
    return this.post<unknown>(`/api/v1/bulk/import/${entityType}`, formData);
  }

  async bulkExport(entityType: string, filters?: Record<string, unknown>) {
    return this.get<unknown>(`/api/v1/bulk/export/${entityType}`, filters);
  }

  async bulkValidate(entityType: string, data: unknown[]) {
    return this.post<unknown>(`/api/v1/bulk/validate/${entityType}`, { data });
  }

  // System Health & Monitoring - Echte Datenbankzugriffe
  async getHealth() {
    return this.get<unknown>('/api/v1/health');
  }

  async getSystemInfo() {
    return this.get<unknown>('/api/v1/system/info');
  }

  async getMetrics() {
    return this.get<unknown>('/api/v1/metrics');
  }

  // AI Integration - Echte Datenbankzugriffe
  async sendAIMessage(message: string, context?: Record<string, unknown>) {
    return this.post<unknown>('/api/v1/ai/chat', { message, context });
  }

  async sendHorizonMessage(message: string, context?: Record<string, unknown>) {
    return this.post<unknown>('/api/v1/ai/horizon', { message, context });
  }

  async optimizeForm(formData: Record<string, unknown>) {
    return this.post<unknown>('/api/v1/ai/optimize-form', formData);
  }
}

// Singleton Instance
export const apiService = new APIService();
export default apiService; 