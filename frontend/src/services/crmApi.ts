import { api, type ApiResponse } from './api';

export interface Kunde {
  id: string;
  name: string;
  email: string;
  telefon: string;
  adresse: string;
  kategorie: 'A' | 'B' | 'C';
  status: 'aktiv' | 'inaktiv' | 'prospekt';
  kundennummer: string;
  ansprechpartner: string;
  umsatz: number;
  letzterKontakt: string;
  notizen?: string;
}

export interface Kontakt {
  id: string;
  kundeId: string;
  kundeName: string;
  typ: 'telefon' | 'email' | 'meeting' | 'anruf';
  datum: string;
  beschreibung: string;
  ergebnis: string;
  naechsterKontakt?: string;
  status: 'offen' | 'abgeschlossen' | 'verschoben';
}

export interface Projekt {
  id: string;
  kundeId: string;
  kundeName: string;
  name: string;
  beschreibung: string;
  startdatum: string;
  enddatum?: string;
  status: 'planung' | 'aktiv' | 'abgeschlossen' | 'storniert';
  budget: number;
  verantwortlicher: string;
  prioritaet: 'niedrig' | 'mittel' | 'hoch';
}

class CrmApiService {
  // Kunden-Verwaltung
  async getKunden(params?: { page?: number; limit?: number; search?: string; kategorie?: string }): Promise<ApiResponse<Kunde[]>> {
    return api.get<Kunde[]>('/crm/kunden', params);
  }

  async getKundeById(id: string): Promise<ApiResponse<Kunde>> {
    return api.get<Kunde>(`/crm/kunden/${id}`);
  }

  async createKunde(kunde: Omit<Kunde, 'id'>): Promise<ApiResponse<Kunde>> {
    return api.post<Kunde>('/crm/kunden', kunde);
  }

  async updateKunde(id: string, kunde: Partial<Kunde>): Promise<ApiResponse<Kunde>> {
    return api.put<Kunde>(`/crm/kunden/${id}`, kunde);
  }

  async deleteKunde(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/crm/kunden/${id}`);
  }

  // Kontakte
  async getKontakte(params?: { page?: number; limit?: number; kundeId?: string }): Promise<ApiResponse<Kontakt[]>> {
    return api.get<Kontakt[]>('/crm/kontakte', params);
  }

  async getKontaktById(id: string): Promise<ApiResponse<Kontakt>> {
    return api.get<Kontakt>(`/crm/kontakte/${id}`);
  }

  async createKontakt(kontakt: Omit<Kontakt, 'id'>): Promise<ApiResponse<Kontakt>> {
    return api.post<Kontakt>('/crm/kontakte', kontakt);
  }

  async updateKontakt(id: string, kontakt: Partial<Kontakt>): Promise<ApiResponse<Kontakt>> {
    return api.put<Kontakt>(`/crm/kontakte/${id}`, kontakt);
  }

  async deleteKontakt(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/crm/kontakte/${id}`);
  }

  // Projekte
  async getProjekte(params?: { page?: number; limit?: number; kundeId?: string; status?: string }): Promise<ApiResponse<Projekt[]>> {
    return api.get<Projekt[]>('/crm/projekte', params);
  }

  async getProjektById(id: string): Promise<ApiResponse<Projekt>> {
    return api.get<Projekt>(`/crm/projekte/${id}`);
  }

  async createProjekt(projekt: Omit<Projekt, 'id'>): Promise<ApiResponse<Projekt>> {
    return api.post<Projekt>('/crm/projekte', projekt);
  }

  async updateProjekt(id: string, projekt: Partial<Projekt>): Promise<ApiResponse<Projekt>> {
    return api.put<Projekt>(`/crm/projekte/${id}`, projekt);
  }

  async deleteProjekt(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/crm/projekte/${id}`);
  }

  // Berichte
  async getKundenbericht(): Promise<ApiResponse<any>> {
    return api.get<any>('/crm/berichte/kunden');
  }

  async getUmsatzbericht(): Promise<ApiResponse<any>> {
    return api.get<any>('/crm/berichte/umsatz');
  }

  async getAktivitaetsbericht(): Promise<ApiResponse<any>> {
    return api.get<any>('/crm/berichte/aktivitaet');
  }
}

export const crmApi = new CrmApiService();
export default crmApi; 