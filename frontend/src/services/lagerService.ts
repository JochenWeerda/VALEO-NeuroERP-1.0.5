import axios from 'axios';

export interface Lagerort {
  id: string;
  bezeichnung: string;
  lager_id: string;
  lager_bezeichnung: string;
  typ: 'standard' | 'sperrbestand' | 'wareneingang' | 'warenausgang' | 'produktion';
  adresse?: string;
  ist_aktiv: boolean;
}

export interface Lagerbestand {
  artikel_id: string;
  artikel_nr: string;
  bezeichnung: string;
  lagerhalle: string;
  min_bestand?: number;
  max_bestand?: number;
  buch_bestand: number;
  verfuegbarer_bestand: number;
  phys_bestand?: number;
  avg_ek_preis?: number;
  letzter_ek_preis?: number;
  bewerteter_preis: number;
  bestandswert: number;
  letztes_datum?: string;
  artikelgruppe: string;
  einheit: string;
}

export interface LagerFilterOptions {
  niederlassung?: string;
  lagerhalle?: string;
  artikelgruppe?: string;
  artikelnummer?: string;
  nullBestaendeVerbergen?: boolean;
}

export interface Lagerbewegung {
  id: string;
  bewegungstyp: 'eingang' | 'ausgang' | 'umlagerung' | 'korrektur';
  beleg_nr?: string;
  artikel_id: string;
  artikel_nr: string;
  artikel_bezeichnung: string;
  menge: number;
  einheit: string;
  von_lagerort_id?: string;
  von_lagerort?: string;
  nach_lagerort_id?: string;
  nach_lagerort?: string;
  chargen_nr?: string;
  buchungsdatum: string;
  erfassungsdatum: string;
  erfasst_von: string;
  bemerkung?: string;
  storno_von_id?: string;
  status: 'aktiv' | 'storniert';
}

const lagerService = {
  // Lagerorte
  getLagerorte: async (): Promise<Lagerort[]> => {
    try {
      const response = await axios.get('/api/v1/lager/lagerorte');
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Lagerorte:', error);
      // Demo-Daten für Entwicklung
      return [
        {
          id: 'L1',
          bezeichnung: 'Hauptlager',
          lager_id: 'HQ',
          lager_bezeichnung: 'Hauptniederlassung',
          typ: 'standard',
          ist_aktiv: true
        },
        {
          id: 'L2',
          bezeichnung: 'Futtermittellager',
          lager_id: 'HQ',
          lager_bezeichnung: 'Hauptniederlassung',
          typ: 'standard',
          ist_aktiv: true
        },
        {
          id: 'L3',
          bezeichnung: 'Wareneingang',
          lager_id: 'HQ',
          lager_bezeichnung: 'Hauptniederlassung',
          typ: 'wareneingang',
          ist_aktiv: true
        }
      ];
    }
  },

  searchLagerorte: async (suchbegriff: string): Promise<Lagerort[]> => {
    try {
      const response = await axios.get('/api/v1/lager/lagerorte/search', {
        params: { q: suchbegriff }
      });
      return response.data;
    } catch (error) {
      console.error('Fehler bei der Lagerortsuche:', error);
      // Demo-Daten für Entwicklung
      return [
        {
          id: 'L1',
          bezeichnung: 'Hauptlager',
          lager_id: 'HQ',
          lager_bezeichnung: 'Hauptniederlassung',
          typ: 'standard',
          ist_aktiv: true
        },
        {
          id: 'L2',
          bezeichnung: 'Futtermittellager',
          lager_id: 'HQ',
          lager_bezeichnung: 'Hauptniederlassung',
          typ: 'standard',
          ist_aktiv: true
        }
      ];
    }
  },

  getLagerort: async (id: string): Promise<Lagerort> => {
    try {
      const response = await axios.get(`/api/v1/lager/lagerorte/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Abrufen des Lagerorts ${id}:`, error);
      throw error;
    }
  },

  // Lagerbestand
  getLagerbestand: async (filter?: LagerFilterOptions): Promise<Lagerbestand[]> => {
    try {
      const response = await axios.get('/api/v1/lager/bestand', {
        params: filter
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Lagerbestände:', error);
      // Demo-Daten für Entwicklung
      return [
        {
          artikel_id: '1',
          artikel_nr: 'WS-001',
          bezeichnung: 'Weizenschrot Premium',
          lagerhalle: 'Hauptlager',
          min_bestand: 1000,
          max_bestand: 5000,
          buch_bestand: 2500,
          verfuegbarer_bestand: 2450,
          phys_bestand: 2450,
          avg_ek_preis: 0.83,
          letzter_ek_preis: 0.85,
          bewerteter_preis: 0.85,
          bestandswert: 2082.50,
          letztes_datum: '2025-01-15',
          artikelgruppe: 'Futtermittel',
          einheit: 'kg'
        },
        {
          artikel_id: '2',
          artikel_nr: 'MM-001',
          bezeichnung: 'Maismehl',
          lagerhalle: 'Hauptlager',
          min_bestand: 1000,
          max_bestand: 4000,
          buch_bestand: 1800,
          verfuegbarer_bestand: 1750,
          phys_bestand: 1750,
          avg_ek_preis: 0.74,
          letzter_ek_preis: 0.75,
          bewerteter_preis: 0.75,
          bestandswert: 1312.50,
          letztes_datum: '2025-01-10',
          artikelgruppe: 'Futtermittel',
          einheit: 'kg'
        }
      ];
    }
  },

  getArtikelBestand: async (artikelId: string, lagerortId?: string): Promise<{
    artikel_id: string;
    lagerort_id?: string;
    menge: number;
    verfuegbar: number;
    reserviert: number;
    einheit: string;
    letztes_update: string;
  }> => {
    try {
      const response = await axios.get(`/api/v1/lager/artikel/${artikelId}/bestand`, {
        params: { lagerort_id: lagerortId }
      });
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Abrufen des Artikelbestands ${artikelId}:`, error);
      // Demo-Daten für Entwicklung
      return {
        artikel_id: artikelId,
        lagerort_id: lagerortId,
        menge: 2500,
        verfuegbar: 2450,
        reserviert: 50,
        einheit: 'kg',
        letztes_update: new Date().toISOString()
      };
    }
  },

  // Lagerbewegungen
  getLagerbewegungen: async (filter?: {
    von_datum?: string;
    bis_datum?: string;
    bewegungstyp?: 'eingang' | 'ausgang' | 'umlagerung' | 'korrektur';
    artikel_id?: string;
    lagerort_id?: string;
  }): Promise<Lagerbewegung[]> => {
    try {
      const response = await axios.get('/api/v1/lager/bewegungen', {
        params: filter
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Lagerbewegungen:', error);
      // Demo-Daten für Entwicklung
      return [
        {
          id: 'LB-001',
          bewegungstyp: 'eingang',
          beleg_nr: 'WE-2025-001',
          artikel_id: '1',
          artikel_nr: 'WS-001',
          artikel_bezeichnung: 'Weizenschrot Premium',
          menge: 1500,
          einheit: 'kg',
          nach_lagerort_id: 'L1',
          nach_lagerort: 'Hauptlager',
          chargen_nr: 'WS-2025-001',
          buchungsdatum: '2025-01-05',
          erfassungsdatum: '2025-01-05',
          erfasst_von: 'Max Mustermann',
          status: 'aktiv'
        },
        {
          id: 'LB-002',
          bewegungstyp: 'eingang',
          beleg_nr: 'WE-2025-002',
          artikel_id: '1',
          artikel_nr: 'WS-001',
          artikel_bezeichnung: 'Weizenschrot Premium',
          menge: 1000,
          einheit: 'kg',
          nach_lagerort_id: 'L1',
          nach_lagerort: 'Hauptlager',
          chargen_nr: 'WS-2025-002',
          buchungsdatum: '2025-01-10',
          erfassungsdatum: '2025-01-10',
          erfasst_von: 'Max Mustermann',
          status: 'aktiv'
        }
      ];
    }
  },

  bucheWarenbewegung: async (bewegung: {
    bewegungstyp: 'eingang' | 'ausgang' | 'umlagerung' | 'korrektur';
    beleg_nr?: string;
    artikel_id: string;
    menge: number;
    einheit: string;
    von_lagerort_id?: string;
    nach_lagerort_id?: string;
    chargen_nr?: string;
    buchungsdatum?: string;
    bemerkung?: string;
  }): Promise<Lagerbewegung> => {
    try {
      const response = await axios.post('/api/v1/lager/bewegung', {
        ...bewegung,
        buchungsdatum: bewegung.buchungsdatum || new Date().toISOString().split('T')[0],
        erfassungsdatum: new Date().toISOString().split('T')[0],
        erfasst_von: 'Aktueller Benutzer'
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Buchen der Warenbewegung:', error);
      throw error;
    }
  },

  // Umlagerung (Lager zu Lager Bewegung)
  erstelleUmlagerung: async (umlagerung: {
    artikel_id: string;
    menge: number;
    einheit: string;
    von_lagerort_id: string;
    nach_lagerort_id: string;
    chargen_nr?: string;
    buchungsdatum?: string;
    bemerkung?: string;
  }): Promise<Lagerbewegung> => {
    return lagerService.bucheWarenbewegung({
      ...umlagerung,
      bewegungstyp: 'umlagerung'
    });
  },

  // Lagerkorrektur
  erstelleLagerkorrektur: async (korrektur: {
    artikel_id: string;
    lagerort_id: string;
    menge: number; // Kann positiv oder negativ sein
    einheit: string;
    buchungsdatum?: string;
    bemerkung: string; // Bei Korrekturen sollte ein Grund angegeben werden
  }): Promise<Lagerbewegung> => {
    return lagerService.bucheWarenbewegung({
      bewegungstyp: 'korrektur',
      artikel_id: korrektur.artikel_id,
      menge: korrektur.menge,
      einheit: korrektur.einheit,
      nach_lagerort_id: korrektur.menge > 0 ? korrektur.lagerort_id : undefined,
      von_lagerort_id: korrektur.menge < 0 ? korrektur.lagerort_id : undefined,
      buchungsdatum: korrektur.buchungsdatum,
      bemerkung: korrektur.bemerkung
    });
  },

  // Bestandsübersicht exportieren
  exportBestandsUebersicht: async (format: 'pdf' | 'excel' | 'csv', filter?: LagerFilterOptions): Promise<Blob> => {
    try {
      const response = await axios.get('/api/v1/lager/bestand/export', {
        params: { format, ...filter },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Exportieren der Bestandsübersicht:', error);
      throw error;
    }
  },

  // Artikel Stammdaten mit Lagerbeständen
  getArtikelMitBestaenden: async (artikelId: string): Promise<{
    artikel_id: string;
    artikel_nr: string;
    bezeichnung: string;
    artikelgruppe: string;
    einheit: string;
    bestände: {
      lagerort_id: string;
      lagerort: string;
      bestand: number;
      verfuegbar: number;
      reserviert: number;
    }[];
  }> => {
    try {
      const response = await axios.get(`/api/v1/artikel/${artikelId}/bestaende`);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Abrufen der Artikelbestände für ${artikelId}:`, error);
      throw error;
    }
  }
};

export default lagerService; 