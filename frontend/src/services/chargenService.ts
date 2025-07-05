import axios from 'axios';
import { Charge } from '../types/articleTypes';

// Typ-Definitionen für den Chargen-Service
export interface ChargeDetails {
  id: string;
  artikel_id: string;
  artikel_name: string;
  chargennummer: string;
  menge: number;
  einheit?: string;
  mindesthaltbarkeitsdatum?: string;
  herstelldatum?: string;
  lagerort_id?: string;
  lagerort_name?: string;
  qualitaetsstatus?: 'freigegeben' | 'gesperrt' | 'quarantaene';
  lagerplatz?: string;
  lieferant_name?: string;
  eingang_datum?: string;
  bemerkung?: string;
}

// Service-Funktionen
const getChargeById = async (id: string): Promise<ChargeDetails> => {
  try {
    const response = await axios.get(`/api/v1/charge/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Abrufen der Charge ${id}:`, error);
    
    // Fallback für Entwicklung/Demo
    return {
      id,
      artikel_id: '1',
      artikel_name: 'Weizenschrot Premium',
      chargennummer: `WS-${new Date().getFullYear()}-${id.padStart(3, '0')}`,
      menge: 1000,
      einheit: 'kg',
      mindesthaltbarkeitsdatum: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
      herstelldatum: new Date().toISOString().split('T')[0],
      lagerort_id: '1',
      lagerort_name: 'Hauptlager',
      qualitaetsstatus: 'freigegeben',
      lagerplatz: 'Halle 2 / Regal B / Fach 04',
      lieferant_name: 'Agrar GmbH',
      eingang_datum: new Date().toISOString().split('T')[0]
    };
  }
};

const searchChargen = async (
  filter: {
    artikel_id?: string;
    lagerort_id?: string;
    status?: string;
    mhd_von?: string;
    mhd_bis?: string;
    suchbegriff?: string;
  }
): Promise<ChargeDetails[]> => {
  try {
    const response = await axios.get('/api/v1/charge/search', { params: filter });
    return response.data;
  } catch (error) {
    console.error('Fehler bei der Chargensuche:', error);
    
    // Fallback für Entwicklung/Demo
    return [
      {
        id: '1',
        artikel_id: '1',
        artikel_name: 'Weizenschrot Premium',
        chargennummer: `WS-${new Date().getFullYear()}-001`,
        menge: 1000,
        einheit: 'kg',
        mindesthaltbarkeitsdatum: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        herstelldatum: new Date().toISOString().split('T')[0],
        lagerort_id: '1',
        lagerort_name: 'Hauptlager',
        qualitaetsstatus: 'freigegeben',
        lagerplatz: 'Halle 2 / Regal B / Fach 04',
        lieferant_name: 'Agrar GmbH',
        eingang_datum: new Date().toISOString().split('T')[0]
      },
      {
        id: '2',
        artikel_id: '1',
        artikel_name: 'Weizenschrot Premium',
        chargennummer: `WS-${new Date().getFullYear()}-002`,
        menge: 800,
        einheit: 'kg',
        mindesthaltbarkeitsdatum: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
        herstelldatum: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        lagerort_id: '1',
        lagerort_name: 'Hauptlager',
        qualitaetsstatus: 'freigegeben',
        lagerplatz: 'Halle 2 / Regal B / Fach 05',
        lieferant_name: 'Agrar GmbH',
        eingang_datum: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
      },
      {
        id: '3',
        artikel_id: '2',
        artikel_name: 'Maismehl',
        chargennummer: `MM-${new Date().getFullYear()}-001`,
        menge: 1500,
        einheit: 'kg',
        mindesthaltbarkeitsdatum: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0],
        herstelldatum: new Date(new Date().setDate(new Date().getDate() - 60)).toISOString().split('T')[0],
        lagerort_id: '1',
        lagerort_name: 'Hauptlager',
        qualitaetsstatus: 'quarantaene',
        lagerplatz: 'Halle 1 / Regal A / Fach 02',
        lieferant_name: 'Landwirtschaft Schmidt',
        eingang_datum: new Date(new Date().setDate(new Date().getDate() - 60)).toISOString().split('T')[0]
      }
    ].filter(charge => {
      if (filter.artikel_id && charge.artikel_id !== filter.artikel_id) return false;
      if (filter.lagerort_id && charge.lagerort_id !== filter.lagerort_id) return false;
      if (filter.status && charge.qualitaetsstatus !== filter.status) return false;
      
      if (filter.suchbegriff) {
        const searchLower = filter.suchbegriff.toLowerCase();
        return charge.chargennummer.toLowerCase().includes(searchLower) ||
               charge.artikel_name.toLowerCase().includes(searchLower) ||
               (charge.lagerplatz && charge.lagerplatz.toLowerCase().includes(searchLower)) ||
               (charge.lieferant_name && charge.lieferant_name.toLowerCase().includes(searchLower));
      }
      
      return true;
    });
  }
};

const createCharge = async (chargeData: Partial<ChargeDetails>): Promise<ChargeDetails> => {
  try {
    const response = await axios.post('/api/v1/charge', chargeData);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Erstellen der Charge:', error);
    throw error;
  }
};

const updateCharge = async (id: string, chargeData: Partial<ChargeDetails>): Promise<ChargeDetails> => {
  try {
    const response = await axios.put(`/api/v1/charge/${id}`, chargeData);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Aktualisieren der Charge ${id}:`, error);
    throw error;
  }
};

const generateQRCode = async (chargeId: string): Promise<{url: string, blob: Blob}> => {
  try {
    const response = await axios.get(`/api/v1/charge/${chargeId}/qrcode`, { responseType: 'blob' });
    return {
      url: URL.createObjectURL(response.data),
      blob: response.data
    };
  } catch (error) {
    console.error(`Fehler beim Generieren des QR-Codes für Charge ${chargeId}:`, error);
    throw error;
  }
};

const getChargenBestand = async (artikelId: string, lagerortId?: string): Promise<ChargeDetails[]> => {
  try {
    const params: any = { artikel_id: artikelId };
    if (lagerortId) params.lagerort_id = lagerortId;
    
    const response = await axios.get('/api/v1/chargen/bestand', { params });
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Abrufen des Chargenbestands für Artikel ${artikelId}:`, error);
    
    // Fallback für Entwicklung/Demo
    return searchChargen({ artikel_id: artikelId, lagerort_id: lagerortId });
  }
};

const getBuchungsregelnForLagerplatz = async (lagerplatzId: string): Promise<{
  regel: 'FIFO' | 'LIFO' | 'MIX';
  lagerplatz_typ: string;
}> => {
  try {
    const response = await axios.get(`/api/v1/lagerplatz/${lagerplatzId}/buchungsregeln`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Abrufen der Buchungsregeln für Lagerplatz ${lagerplatzId}:`, error);
    
    // Fallback für Entwicklung/Demo
    return {
      regel: 'FIFO',
      lagerplatz_typ: 'STANDARD'
    };
  }
};

// Service-Objekt
export const chargenService = {
  getChargeById,
  searchChargen,
  createCharge,
  updateCharge,
  generateQRCode,
  getChargenBestand,
  getBuchungsregelnForLagerplatz
}; 