import { api, type ApiResponse } from '../../../services/api';

export interface Artikel {
  id: string;
  name: string;
  bestand: number;
  kategorie: string;
  preis: number;
  lagerplatz: string;
  lieferant: string;
  mindestbestand: number;
  maxbestand: number;
  einheit: string;
  status: 'aktiv' | 'inaktiv';
}

export interface Lieferant {
  id: string;
  name: string;
  status: 'aktiv' | 'inaktiv';
  email: string;
  telefon: string;
  adresse: string;
  kategorie: string;
  bewertung: number;
}

export interface Wareneingang {
  id: string;
  lieferantId: string;
  lieferantName: string;
  datum: string;
  status: 'eingetroffen' | 'in_bearbeitung' | 'abgeschlossen';
  positionen: WareneingangPosition[];
  bemerkungen?: string;
}

export interface WareneingangPosition {
  artikelId: string;
  artikelName: string;
  bestellt: number;
  geliefert: number;
  preis: number;
  lagerplatz: string;
}

class WarenwirtschaftService {
  // Artikel-Verwaltung
  async getArtikel(params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<Artikel[]>> {
    return api.get<Artikel[]>('/warenwirtschaft/artikel', params);
  }

  async getArtikelById(id: string): Promise<ApiResponse<Artikel>> {
    return api.get<Artikel>(`/warenwirtschaft/artikel/${id}`);
  }

  async createArtikel(artikel: Omit<Artikel, 'id'>): Promise<ApiResponse<Artikel>> {
    return api.post<Artikel>('/warenwirtschaft/artikel', artikel);
  }

  async updateArtikel(id: string, artikel: Partial<Artikel>): Promise<ApiResponse<Artikel>> {
    return api.put<Artikel>(`/warenwirtschaft/artikel/${id}`, artikel);
  }

  async deleteArtikel(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/warenwirtschaft/artikel/${id}`);
  }

  // Lieferanten-Verwaltung
  async getLieferanten(params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<Lieferant[]>> {
    return api.get<Lieferant[]>('/warenwirtschaft/lieferanten', params);
  }

  async getLieferantById(id: string): Promise<ApiResponse<Lieferant>> {
    return api.get<Lieferant>(`/warenwirtschaft/lieferanten/${id}`);
  }

  async createLieferant(lieferant: Omit<Lieferant, 'id'>): Promise<ApiResponse<Lieferant>> {
    return api.post<Lieferant>('/warenwirtschaft/lieferanten', lieferant);
  }

  async updateLieferant(id: string, lieferant: Partial<Lieferant>): Promise<ApiResponse<Lieferant>> {
    return api.put<Lieferant>(`/warenwirtschaft/lieferanten/${id}`, lieferant);
  }

  async deleteLieferant(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/warenwirtschaft/lieferanten/${id}`);
  }

  // Wareneingang
  async getWareneingang(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<Wareneingang[]>> {
    return api.get<Wareneingang[]>('/warenwirtschaft/wareneingang', params);
  }

  async getWareneingangById(id: string): Promise<ApiResponse<Wareneingang>> {
    return api.get<Wareneingang>(`/warenwirtschaft/wareneingang/${id}`);
  }

  async createWareneingang(wareneingang: Omit<Wareneingang, 'id'>): Promise<ApiResponse<Wareneingang>> {
    return api.post<Wareneingang>('/warenwirtschaft/wareneingang', wareneingang);
  }

  async updateWareneingang(id: string, wareneingang: Partial<Wareneingang>): Promise<ApiResponse<Wareneingang>> {
    return api.put<Wareneingang>(`/warenwirtschaft/wareneingang/${id}`, wareneingang);
  }

  async deleteWareneingang(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/warenwirtschaft/wareneingang/${id}`);
  }

  // Bestandsverwaltung
  async getBestand(artikelId: string): Promise<ApiResponse<{ bestand: number; mindestbestand: number; maxbestand: number }>> {
    return api.get<{ bestand: number; mindestbestand: number; maxbestand: number }>(`/warenwirtschaft/bestand/${artikelId}`);
  }

  async updateBestand(artikelId: string, menge: number, typ: 'zugang' | 'abgang'): Promise<ApiResponse<void>> {
    return api.post<void>(`/warenwirtschaft/bestand/${artikelId}`, { menge, typ });
  }

  // Berichte
  async getBestandsbericht(): Promise<ApiResponse<any>> {
    return api.get<any>('/warenwirtschaft/berichte/bestand');
  }

  async getLieferantenbericht(): Promise<ApiResponse<any>> {
    return api.get<any>('/warenwirtschaft/berichte/lieferanten');
  }

  async getWareneingangBericht(): Promise<ApiResponse<any>> {
    return api.get<any>('/warenwirtschaft/berichte/wareneingang');
  }
}

export default WarenwirtschaftService; 