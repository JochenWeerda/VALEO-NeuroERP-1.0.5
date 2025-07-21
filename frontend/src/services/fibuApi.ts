import { api, type ApiResponse } from './api';

export interface Buchung {
  id: string;
  datum: string;
  buchungstext: string;
  sollKonto: string;
  habenKonto: string;
  betrag: number;
  belegnummer: string;
  buchungstyp: 'einnahme' | 'ausgabe' | 'transfer';
  status: 'entwurf' | 'gebucht' | 'storniert';
  steuersatz?: number;
  kostentraeger?: string;
  notizen?: string;
}

export interface Konto {
  id: string;
  kontonummer: string;
  name: string;
  typ: 'aktiv' | 'passiv' | 'ertrag' | 'aufwand';
  kategorie: string;
  saldo: number;
  status: 'aktiv' | 'inaktiv';
  beschreibung?: string;
}

export interface Rechnung {
  id: string;
  rechnungsnummer: string;
  kundeId: string;
  kundeName: string;
  datum: string;
  faelligkeitsdatum: string;
  betrag: number;
  mwst: number;
  gesamtbetrag: number;
  status: 'entwurf' | 'versendet' | 'bezahlt' | 'ueberfaellig';
  zahlungsart?: string;
  zahlungsdatum?: string;
  notizen?: string;
}

export interface Beleg {
  id: string;
  belegnummer: string;
  datum: string;
  typ: 'rechnung' | 'gutschrift' | 'zahlung' | 'buchung';
  betrag: number;
  status: 'entwurf' | 'gebucht' | 'storniert';
  beschreibung: string;
  anhang?: string;
}

class FibuApiService {
  // Buchungen
  async getBuchungen(params?: { page?: number; limit?: number; vonDatum?: string; bisDatum?: string }): Promise<ApiResponse<Buchung[]>> {
    return api.get<Buchung[]>('/fibu/buchungen', params);
  }

  async getBuchungById(id: string): Promise<ApiResponse<Buchung>> {
    return api.get<Buchung>(`/fibu/buchungen/${id}`);
  }

  async createBuchung(buchung: Omit<Buchung, 'id'>): Promise<ApiResponse<Buchung>> {
    return api.post<Buchung>('/fibu/buchungen', buchung);
  }

  async updateBuchung(id: string, buchung: Partial<Buchung>): Promise<ApiResponse<Buchung>> {
    return api.put<Buchung>(`/fibu/buchungen/${id}`, buchung);
  }

  async deleteBuchung(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/fibu/buchungen/${id}`);
  }

  async buchen(id: string): Promise<ApiResponse<void>> {
    return api.post<void>(`/fibu/buchungen/${id}/buchen`);
  }

  // Konten
  async getKonten(params?: { page?: number; limit?: number; typ?: string }): Promise<ApiResponse<Konto[]>> {
    return api.get<Konto[]>('/fibu/konten', params);
  }

  async getKontoById(id: string): Promise<ApiResponse<Konto>> {
    return api.get<Konto>(`/fibu/konten/${id}`);
  }

  async createKonto(konto: Omit<Konto, 'id'>): Promise<ApiResponse<Konto>> {
    return api.post<Konto>('/fibu/konten', konto);
  }

  async updateKonto(id: string, konto: Partial<Konto>): Promise<ApiResponse<Konto>> {
    return api.put<Konto>(`/fibu/konten/${id}`, konto);
  }

  async deleteKonto(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/fibu/konten/${id}`);
  }

  // Rechnungen
  async getRechnungen(params?: { page?: number; limit?: number; status?: string; kundeId?: string }): Promise<ApiResponse<Rechnung[]>> {
    return api.get<Rechnung[]>('/fibu/rechnungen', params);
  }

  async getRechnungById(id: string): Promise<ApiResponse<Rechnung>> {
    return api.get<Rechnung>(`/fibu/rechnungen/${id}`);
  }

  async createRechnung(rechnung: Omit<Rechnung, 'id'>): Promise<ApiResponse<Rechnung>> {
    return api.post<Rechnung>('/fibu/rechnungen', rechnung);
  }

  async updateRechnung(id: string, rechnung: Partial<Rechnung>): Promise<ApiResponse<Rechnung>> {
    return api.put<Rechnung>(`/fibu/rechnungen/${id}`, rechnung);
  }

  async deleteRechnung(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/fibu/rechnungen/${id}`);
  }

  async versenden(id: string): Promise<ApiResponse<void>> {
    return api.post<void>(`/fibu/rechnungen/${id}/versenden`);
  }

  async alsBezahltMarkieren(id: string, zahlungsdatum: string): Promise<ApiResponse<void>> {
    return api.post<void>(`/fibu/rechnungen/${id}/bezahlt`, { zahlungsdatum });
  }

  // Belege
  async getBelege(params?: { page?: number; limit?: number; typ?: string }): Promise<ApiResponse<Beleg[]>> {
    return api.get<Beleg[]>('/fibu/belege', params);
  }

  async getBelegById(id: string): Promise<ApiResponse<Beleg>> {
    return api.get<Beleg>(`/fibu/belege/${id}`);
  }

  async createBeleg(beleg: Omit<Beleg, 'id'>): Promise<ApiResponse<Beleg>> {
    return api.post<Beleg>('/fibu/belege', beleg);
  }

  async updateBeleg(id: string, beleg: Partial<Beleg>): Promise<ApiResponse<Beleg>> {
    return api.put<Beleg>(`/fibu/belege/${id}`, beleg);
  }

  async deleteBeleg(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/fibu/belege/${id}`);
  }

  // Berichte
  async getBilanz(datum: string): Promise<ApiResponse<any>> {
    return api.get<any>('/fibu/berichte/bilanz', { datum });
  }

  async getGuV(vonDatum: string, bisDatum: string): Promise<ApiResponse<any>> {
    return api.get<any>('/fibu/berichte/guv', { vonDatum, bisDatum });
  }

  async getKontenauszug(kontoId: string, vonDatum: string, bisDatum: string): Promise<ApiResponse<any>> {
    return api.get<any>('/fibu/berichte/kontenauszug', { kontoId, vonDatum, bisDatum });
  }

  async getUmsatzsteuer(vonDatum: string, bisDatum: string): Promise<ApiResponse<any>> {
    return api.get<any>('/fibu/berichte/umsatzsteuer', { vonDatum, bisDatum });
  }
}

export const fibuApi = new FibuApiService();
export default fibuApi; 