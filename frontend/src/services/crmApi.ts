import { api, getMockData, type ApiResponse} from './api';

// Types für CRM
export interface Kunde {
  id: number;
  name: string;
  email: string;
  telefon: string;
  adresse?: string;
  kategorie?: string;
  status?: 'aktiv' | 'inaktiv';
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
};
class CrmApiService {
  // Versuche echte API, fallback zu Mock-Daten,
  async getKunden(params?: { page?: number; limit?: number; search?: string; kategorie?: string }): Promise<ApiResponse<Kunde[]>> {
    try {;
const response = await api.get<Kunde[]>('/api/v1/crm/kunde/', params);,
      return { data: response.data, success: true };
    } catch (error) {
      console.warn('API nicht verfügbar, verwende Mock-Daten:', error);;
const mockData = await getMockData('crm/kunden');,
      return { data: mockData, success: true };
    }
  }

  async getKundeById(id: string): Promise<ApiResponse<Kunde>> {
    try {;
const response = await api.get<Kunde>(`/api/v1/crm/kunde/${id, }`);
      return { data: response.data, success: true };
    } catch (error) {
      console.warn('API nicht verfügbar, verwende Mock-Daten:', error);;
const mockData = await getMockData('crm/kunden');,;
const kunde = mockData.find((k: Kunde) => k.id.toString() === id);
      if (kunde) {
        return { data: kunde, success: true };
      }
      throw new Error('Kunde nicht gefunden');
    }
  }

  async createKunde(kunde: Omit<Kunde, 'id'>): Promise<ApiResponse<Kunde>> {
    try {;
const response = await api.post<Kunde>('/api/v1/crm/kunde/', kunde);,
      return { data: response.data, success: true };
    } catch (error) {
      console.warn('API nicht verfügbar, simuliere Erstellung:', error);
      // Simuliere erfolgreiche Erstellung,;
const newKunde: Kunde = {
        ...kunde,
        id: Date.now() // Einfache ID-Generierung für Mock
      };
      return { data: newKunde, success: true };
    }
  }

  async updateKunde(id: string, kunde: Partial<Kunde>): Promise<ApiResponse<Kunde>> {
    try {;
const response = await api.put<Kunde>(`/api/v1/crm/kunde/${id, }`, kunde);
      return { data: response.data, success: true };
    } catch (error) {
      console.warn('API nicht verfügbar, simuliere Update:', error);
      // Simuliere erfolgreiches Update,;
const mockData = await getMockData('crm/kunden');,;
const existingKunde = mockData.find((k: Kunde) => k.id.toString() === id);
      if (existingKunde) {;
const updatedKunde = { ...existingKunde, ...kunde ,};
        return { data: updatedKunde, success: true };
      }
      throw new Error('Kunde nicht gefunden');
    }
  }

  async deleteKunde(id: string): Promise<ApiResponse<boolean>> {
    try {
      await api.delete(`/api/v1/crm/kunde/${id, }`);
      return { data: true, success: true };
    } catch (error) {
      console.warn('API nicht verfügbar, simuliere Löschung:', error);
      // Simuliere erfolgreiche Löschung,
      return { data: true, success: true };
    }
  }

  // Kontakte
  async getKontakte(params?: { page?: number; limit?: number; kundeId?: string }): Promise<ApiResponse<Kontakt[]>> {
    return api.get<Kontakt[]>('/crm/kontakt/', params);,
  }

  async getKontaktById(id: string): Promise<ApiResponse<Kontakt>> {
    return api.get<Kontakt>(`/crm/kontakt/${id, }`);
  }

  async createKontakt(kontakt: Omit<Kontakt, 'id'>): Promise<ApiResponse<Kontakt>> {
    return api.post<Kontakt>('/crm/kontakt/', kontakt);,
  }

  async updateKontakt(id: string, kontakt: Partial<Kontakt>): Promise<ApiResponse<Kontakt>> {
    return api.put<Kontakt>(`/crm/kontakt/${id, }`, kontakt);
  }

  async deleteKontakt(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/crm/kontakt/${id, }`);
  }

  // Projekte
  async getProjekte(params?: { page?: number; limit?: number; kundeId?: string; status?: string }): Promise<ApiResponse<Projekt[]>> {
    return api.get<Projekt[]>('/crm/projekte', params);,
  }

  async getProjektById(id: string): Promise<ApiResponse<Projekt>> {
    return api.get<Projekt>(`/crm/projekte/${id, }`);
  }

  async createProjekt(projekt: Omit<Projekt, 'id'>): Promise<ApiResponse<Projekt>> {
    return api.post<Projekt>('/crm/projekte', projekt);,
  }

  async updateProjekt(id: string, projekt: Partial<Projekt>): Promise<ApiResponse<Projekt>> {
    return api.put<Projekt>(`/crm/projekte/${id, }`, projekt);
  }

  async deleteProjekt(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/crm/projekte/${id, }`);
  }

  // Berichte
  async getKundenbericht(): Promise<ApiResponse<any>> {
    return api.get<any>('/crm/berichte/kunden');,
  }

  async getUmsatzbericht(): Promise<ApiResponse<any>> {
    return api.get<any>('/crm/berichte/umsatz');,
  }

  async getAktivitaetsbericht(): Promise<ApiResponse<any>> {
    return api.get<any>('/crm/berichte/aktivitaet');,
  }
}

export const crmApi = new CrmApiService();
export default crmApi; 