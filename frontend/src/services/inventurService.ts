import axios from 'axios';
import { InventurErfassung } from './inventoryApi';

export interface InventurFilter {
  niederlassung?: string;
  vonLagerhalle?: string;
  bisLagerhalle?: string;
  vonArtikelgruppe?: string;
  bisArtikelgruppe?: string;
  nullBestaendeUnterdruecken?: boolean;
  auchGesperrteArtikel?: boolean;
  auchChargenNummern?: boolean;
}

export interface InventurKopf {
  id: string;
  bezeichnung: string;
  status: 'vorbereitet' | 'in_bearbeitung' | 'abgeschlossen' | 'freigegeben';
  stichtag: string;
  erstellt_von: string;
  erstellt_am: string;
  letztes_update: string;
  letztes_update_von?: string;
  niederlassung?: string;
  lager_bereiche: string[];
  anzahl_artikel: number;
  anzahl_erfasst: number;
  gesamtwert_soll?: number;
  gesamtwert_ist?: number;
  differenz_wert?: number;
}

export interface InventurZaehlliste {
  id: string;
  inventur_id: string;
  lagerhalle: string;
  artikel_id: string;
  artikel_nr: string;
  artikel_bezeichnung: string;
  artikel_gruppe: string;
  einheit: string;
  soll_menge: number;
  bemerkung?: string;
  chargen?: {
    charge_id: string;
    chargennummer: string;
    menge: number;
    mhd?: string;
  }[];
}

export interface InventurKontrolle {
  artikel_id: string;
  artikel_nr: string;
  artikel_bezeichnung: string;
  lagerhalle: string;
  soll_menge: number;
  ist_menge?: number;
  differenz?: number;
  status: 'nicht_erfasst' | 'erfasst' | 'freigegeben';
  chargen_info?: string;
}

export interface InventurBewertung {
  artikel_id: string;
  artikel_nr: string;
  artikel_bezeichnung: string;
  lagerhalle: string;
  chargen_nr?: string;
  menge: number;
  einzelpreis: number;
  gesamtbetrag: number;
}

export interface InventurWarenauswertung {
  artikel_id: string;
  artikel_nr: string;
  artikel_bezeichnung: string;
  lagerhalle: string;
  chargen_nr?: string;
  ist_menge: number;
  soll_menge: number;
  bewerteter_preis: number;
  ist_betrag: number;
  soll_betrag: number;
  differenz: number;
}

export interface BestandsVortrag {
  id: string;
  beleg_nr: string;
  vortrag_datum: string;
  buchungsdatum: string;
  bilanz_konto: string;
  artikel_id: string;
  artikel_nr: string;
  artikel_bezeichnung?: string;
  lagerhalle: string;
  menge: number;
  bewerteter_preis: number;
  differenzbetrag: number;
  status: 'offen' | 'gebucht';
}

const inventurService = {
  // Inventur-Kopfdaten
  getInventuren: async (): Promise<InventurKopf[]> => {
    try {
      const response = await axios.get('/api/v1/inventur');
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Inventuren:', error);
      // Demo-Daten für Entwicklung
      return [
        {
          id: 'INV-2025-001',
          bezeichnung: 'Jahresinventur 2025',
          status: 'in_bearbeitung',
          stichtag: '2025-12-31',
          erstellt_von: 'Max Mustermann',
          erstellt_am: '2025-12-15',
          letztes_update: '2025-12-20',
          niederlassung: 'Hauptniederlassung',
          lager_bereiche: ['Hauptlager', 'Futtermittellager'],
          anzahl_artikel: 250,
          anzahl_erfasst: 120,
          gesamtwert_soll: 352480.50,
          gesamtwert_ist: 350120.75,
          differenz_wert: -2359.75
        },
        {
          id: 'INV-2025-002',
          bezeichnung: 'Zwischeninventur Q2/2025',
          status: 'abgeschlossen',
          stichtag: '2025-06-30',
          erstellt_von: 'Maria Musterfrau',
          erstellt_am: '2025-06-25',
          letztes_update: '2025-07-05',
          letztes_update_von: 'Max Mustermann',
          niederlassung: 'Hauptniederlassung',
          lager_bereiche: ['Hauptlager'],
          anzahl_artikel: 150,
          anzahl_erfasst: 150,
          gesamtwert_soll: 180250.00,
          gesamtwert_ist: 179980.25,
          differenz_wert: -269.75
        }
      ];
    }
  },

  createInventur: async (inventur: Partial<InventurKopf>): Promise<InventurKopf> => {
    try {
      const response = await axios.post('/api/v1/inventur', inventur);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Erstellen der Inventur:', error);
      // Demo-Rückgabe für Entwicklung
      return {
        id: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        bezeichnung: inventur.bezeichnung || 'Neue Inventur',
        status: 'vorbereitet',
        stichtag: inventur.stichtag || new Date().toISOString().split('T')[0],
        erstellt_von: 'Aktueller Benutzer',
        erstellt_am: new Date().toISOString(),
        letztes_update: new Date().toISOString(),
        niederlassung: inventur.niederlassung || 'Hauptniederlassung',
        lager_bereiche: inventur.lager_bereiche || ['Hauptlager'],
        anzahl_artikel: 0,
        anzahl_erfasst: 0
      };
    }
  },

  getInventur: async (id: string): Promise<InventurKopf> => {
    try {
      const response = await axios.get(`/api/v1/inventur/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Abrufen der Inventur ${id}:`, error);
      throw error;
    }
  },

  updateInventur: async (id: string, inventur: Partial<InventurKopf>): Promise<InventurKopf> => {
    try {
      const response = await axios.put(`/api/v1/inventur/${id}`, inventur);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Aktualisieren der Inventur ${id}:`, error);
      throw error;
    }
  },

  // Zähllisten
  generateZaehlliste: async (inventurId: string, filter: InventurFilter): Promise<InventurZaehlliste[]> => {
    try {
      const response = await axios.post(`/api/v1/inventur/${inventurId}/zaehliste`, filter);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Generieren der Zählliste:', error);
      // Demo-Daten für Entwicklung
      return [
        {
          id: 'ZL-001',
          inventur_id: inventurId,
          lagerhalle: 'Hauptlager',
          artikel_id: '1',
          artikel_nr: 'WS-001',
          artikel_bezeichnung: 'Weizenschrot Premium',
          artikel_gruppe: 'Futtermittel',
          einheit: 'kg',
          soll_menge: 2500,
          chargen: [
            {
              charge_id: 'CH-001',
              chargennummer: 'WS-2025-001',
              menge: 1500,
              mhd: '2025-10-15'
            },
            {
              charge_id: 'CH-002',
              chargennummer: 'WS-2025-002',
              menge: 1000,
              mhd: '2025-11-30'
            }
          ]
        },
        {
          id: 'ZL-002',
          inventur_id: inventurId,
          lagerhalle: 'Hauptlager',
          artikel_id: '2',
          artikel_nr: 'MM-001',
          artikel_bezeichnung: 'Maismehl',
          artikel_gruppe: 'Futtermittel',
          einheit: 'kg',
          soll_menge: 1800
        }
      ];
    }
  },

  exportZaehlliste: async (inventurId: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> => {
    try {
      const response = await axios.get(`/api/v1/inventur/${inventurId}/zaehliste/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Exportieren der Zählliste:', error);
      throw error;
    }
  },

  // Erfassung
  saveErfassung: async (erfassung: InventurErfassung): Promise<InventurErfassung> => {
    try {
      const response = await axios.post('/api/v1/inventur/erfassung', erfassung);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Speichern der Erfassung:', error);
      throw error;
    }
  },

  getErfassungen: async (inventurId: string): Promise<InventurErfassung[]> => {
    try {
      const response = await axios.get(`/api/v1/inventur/${inventurId}/erfassungen`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Erfassungen:', error);
      // Demo-Daten für Entwicklung
      return [
        {
          id: 'ERF-001',
          inventurId,
          artikel_id: '1',
          lagerplatz_id: 'LP-001',
          erfasste_menge: 2450,
          system_menge: 2500,
          differenz: -50,
          erfasst_von: 'Max Mustermann',
          erfasst_am: new Date().toISOString(),
          status: 'abgeschlossen',
          chargen: [
            {
              charge_id: 'CH-001',
              chargennummer: 'WS-2025-001',
              menge: 1480
            },
            {
              charge_id: 'CH-002',
              chargennummer: 'WS-2025-002',
              menge: 970
            }
          ]
        }
      ];
    }
  },

  // Inventur-Export/Import
  exportInventur: async (inventurId: string): Promise<Blob> => {
    try {
      const response = await axios.get(`/api/v1/inventur/${inventurId}/export`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Exportieren der Inventur:', error);
      throw error;
    }
  },

  importInventur: async (file: File): Promise<{ message: string; inventurId: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/api/v1/inventur/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Importieren der Inventur:', error);
      throw error;
    }
  },

  // Kontrolle
  getInventurKontrolle: async (inventurId: string): Promise<InventurKontrolle[]> => {
    try {
      const response = await axios.get(`/api/v1/inventur/${inventurId}/kontrolle`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Inventurkontrolle:', error);
      // Demo-Daten für Entwicklung
      return [
        {
          artikel_id: '1',
          artikel_nr: 'WS-001',
          artikel_bezeichnung: 'Weizenschrot Premium',
          lagerhalle: 'Hauptlager',
          soll_menge: 2500,
          ist_menge: 2450,
          differenz: -50,
          status: 'erfasst',
          chargen_info: 'WS-2025-001, WS-2025-002'
        },
        {
          artikel_id: '2',
          artikel_nr: 'MM-001',
          artikel_bezeichnung: 'Maismehl',
          lagerhalle: 'Hauptlager',
          soll_menge: 1800,
          status: 'nicht_erfasst'
        }
      ];
    }
  },

  automatischeInventurerfassung: async (inventurId: string, artikelIds: string[]): Promise<{ erfolg: boolean; message: string }> => {
    try {
      const response = await axios.post(`/api/v1/inventur/${inventurId}/auto-erfassung`, { artikelIds });
      return response.data;
    } catch (error) {
      console.error('Fehler bei der automatischen Inventurerfassung:', error);
      throw error;
    }
  },

  // Vorläufige Bewertung
  getVorlaeufigeBewertung: async (inventurId: string): Promise<InventurBewertung[]> => {
    try {
      const response = await axios.get(`/api/v1/inventur/${inventurId}/bewertung`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der vorläufigen Bewertung:', error);
      // Demo-Daten für Entwicklung
      return [
        {
          artikel_id: '1',
          artikel_nr: 'WS-001',
          artikel_bezeichnung: 'Weizenschrot Premium',
          lagerhalle: 'Hauptlager',
          chargen_nr: 'WS-2025-001',
          menge: 1480,
          einzelpreis: 0.85,
          gesamtbetrag: 1258.00
        },
        {
          artikel_id: '1',
          artikel_nr: 'WS-001',
          artikel_bezeichnung: 'Weizenschrot Premium',
          lagerhalle: 'Hauptlager',
          chargen_nr: 'WS-2025-002',
          menge: 970,
          einzelpreis: 0.85,
          gesamtbetrag: 824.50
        }
      ];
    }
  },

  // Inventur-Warenauswertung
  getInventurWarenauswertung: async (inventurId: string): Promise<InventurWarenauswertung[]> => {
    try {
      const response = await axios.get(`/api/v1/inventur/${inventurId}/warenauswertung`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Inventur-Warenauswertung:', error);
      // Demo-Daten für Entwicklung
      return [
        {
          artikel_id: '1',
          artikel_nr: 'WS-001',
          artikel_bezeichnung: 'Weizenschrot Premium',
          lagerhalle: 'Hauptlager',
          chargen_nr: 'WS-2025-001, WS-2025-002',
          ist_menge: 2450,
          soll_menge: 2500,
          bewerteter_preis: 0.85,
          ist_betrag: 2082.50,
          soll_betrag: 2125.00,
          differenz: -42.50
        },
        {
          artikel_id: '2',
          artikel_nr: 'MM-001',
          artikel_bezeichnung: 'Maismehl',
          lagerhalle: 'Hauptlager',
          ist_menge: 1750,
          soll_menge: 1800,
          bewerteter_preis: 0.75,
          ist_betrag: 1312.50,
          soll_betrag: 1350.00,
          differenz: -37.50
        }
      ];
    }
  },

  // Bestands-Vorträge
  getBestandsVortraege: async (inventurId: string): Promise<BestandsVortrag[]> => {
    try {
      const response = await axios.get(`/api/v1/inventur/${inventurId}/bestandsvortraege`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Bestandsvorträge:', error);
      // Demo-Daten für Entwicklung
      return [
        {
          id: 'BV-001',
          beleg_nr: 'BV2025001',
          vortrag_datum: '2025-01-01',
          buchungsdatum: '2025-01-02',
          bilanz_konto: '1400',
          artikel_id: '1',
          artikel_nr: 'WS-001',
          artikel_bezeichnung: 'Weizenschrot Premium',
          lagerhalle: 'Hauptlager',
          menge: 2450,
          bewerteter_preis: 0.85,
          differenzbetrag: -42.50,
          status: 'gebucht'
        },
        {
          id: 'BV-002',
          beleg_nr: 'BV2025002',
          vortrag_datum: '2025-01-01',
          buchungsdatum: '2025-01-02',
          bilanz_konto: '1400',
          artikel_id: '2',
          artikel_nr: 'MM-001',
          artikel_bezeichnung: 'Maismehl',
          lagerhalle: 'Hauptlager',
          menge: 1750,
          bewerteter_preis: 0.75,
          differenzbetrag: -37.50,
          status: 'gebucht'
        }
      ];
    }
  },

  erstelleBestandsVortraege: async (inventurId: string, bilanzKonto: string, buchungsdatum: string): Promise<{ erfolg: boolean; message: string }> => {
    try {
      const response = await axios.post(`/api/v1/inventur/${inventurId}/bestandsvortraege`, {
        bilanzKonto,
        buchungsdatum
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Erstellen der Bestandsvorträge:', error);
      throw error;
    }
  },

  // Inventur-Erfassungen löschen
  loescheErfassungen: async (inventurId: string): Promise<{ erfolg: boolean; message: string }> => {
    try {
      const response = await axios.delete(`/api/v1/inventur/${inventurId}/erfassungen`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Löschen der Erfassungen:', error);
      throw error;
    }
  }
};

export default inventurService; 