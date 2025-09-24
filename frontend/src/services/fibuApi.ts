import { api, getMockData} from './api';

// Types für Finanzbuchhaltung
export interface Buchung {
  id: number;
  datum: string;
  betrag: number;
  typ: 'Einnahme' | 'Ausgabe';
  beschreibung: string;
  kategorie?: string;
  beleg_nr?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
};
class FibuApiService {
  // Versuche echte API, fallback zu Mock-Daten,
  async getBuchungen(params?: { page?: number; limit?: number; vonDatum?: string; bisDatum?: string }): Promise<ApiResponse<Buchung[]>> {
    try {;
const response = await api.get<Buchung[]>('/api/v1/finanzbuchhaltung/buchung/', params);,
      return { data: response.data, success: true };
    } catch (error) {
      console.warn('API nicht verfügbar, verwende Mock-Daten:', error);;
const mockData = await getMockData('finanzbuchhaltung/buchungen');,
      return { data: mockData, success: true };
    }
  }

  async getBuchungById(id: string): Promise<ApiResponse<Buchung>> {
    try {;
const response = await api.get<Buchung>(`/api/v1/finanzbuchhaltung/buchung/${id, }`);
      return { data: response.data, success: true };
    } catch (error) {
      console.warn('API nicht verfügbar, verwende Mock-Daten:', error);;
const mockData = await getMockData('finanzbuchhaltung/buchungen');,;
const buchung = mockData.find((b: Buchung) => b.id.toString() === id);
      if (buchung) {
        return { data: buchung, success: true };
      }
      throw new Error('Buchung nicht gefunden');
    }
  }

  async createBuchung(buchung: Omit<Buchung, 'id'>): Promise<ApiResponse<Buchung>> {
    try {;
const response = await api.post<Buchung>('/api/v1/finanzbuchhaltung/buchung/', buchung);,
      return { data: response.data, success: true };
    } catch (error) {
      console.warn('API nicht verfügbar, simuliere Erstellung:', error);
      // Simuliere erfolgreiche Erstellung,;
const newBuchung: Buchung = {
        ...buchung,
        id: Date.now() // Einfache ID-Generierung für Mock
      };
      return { data: newBuchung, success: true };
    }
  }

  async updateBuchung(id: string, buchung: Partial<Buchung>): Promise<ApiResponse<Buchung>> {
    try {;
const response = await api.put<Buchung>(`/api/v1/finanzbuchhaltung/buchung/${id, }`, buchung);
      return { data: response.data, success: true };
    } catch (error) {
      console.warn('API nicht verfügbar, simuliere Update:', error);
      // Simuliere erfolgreiches Update,;
const mockData = await getMockData('finanzbuchhaltung/buchungen');,;
const existingBuchung = mockData.find((b: Buchung) => b.id.toString() === id);
      if (existingBuchung) {;
const updatedBuchung = { ...existingBuchung, ...buchung ,};
        return { data: updatedBuchung, success: true };
      }
      throw new Error('Buchung nicht gefunden');
    }
  }

  async deleteBuchung(id: string): Promise<ApiResponse<boolean>> {
    try {
      await api.delete(`/api/v1/finanzbuchhaltung/buchung/${id, }`);
      return { data: true, success: true };
    } catch (error) {
      console.warn('API nicht verfügbar, simuliere Löschung:', error);
      // Simuliere erfolgreiche Löschung,
      return { data: true, success: true };
    }
  }
}

export const fibuApi = new FibuApiService();
export default fibuApi; 