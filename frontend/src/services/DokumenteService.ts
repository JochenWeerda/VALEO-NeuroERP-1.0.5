/**
 * Dokumente Service - Frontend API-Integration
 * Service für alle VALERO-Module und Dokumente-Funktionen
 */

import { api } from './api';

// TypeScript Interfaces
export interface LieferscheinHeader {
  lieferschein_nr: string;
  lieferschein_datum: string;
  niederlassung: string;
  lieferant: string;
  zahlungsbedingung?: string;
  texte?: string;
  zwischenhaendler?: boolean;
  liefer_termin?: string;
  lieferdatum?: string;
  liefer_nr?: string;
  bediener?: string;
  erledigt?: boolean;
}

export interface LieferscheinPosition {
  pos_nr: number;
  artikel_nr: string;
  lieferant_artikel_nr?: string;
  bezeichnung: string;
  gebinde_nr?: string;
  gebinde?: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  nettobetrag: number;
  lagerhalle?: string;
  lagerfach?: string;
  chargen?: string;
  serien_nr?: string;
  kontakt?: string;
  prozent?: number;
  master_nr?: string;
}

export interface Lieferschein {
  header: LieferscheinHeader;
  positionen: LieferscheinPosition[];
  verfuegbarer_bestand?: number;
  summe_gewicht?: number;
}

export interface Frachtausgang {
  frachtauftrag_erzeugt: boolean;
  niederlassung: string;
  liefertermin: string;
  spediteur_nr: string;
  email?: string;
  telefon?: string;
  spediteur_name: string;
  belegnummer: string;
  lade_datum?: string;
  kundenauswahl?: string;
}

export interface Bestellung {
  niederlassung: string;
  artikelgruppe?: string;
  artikelnummer: string;
  lagerhalle?: string;
  lagerfach?: string;
  bezeichnung: string;
  bestand: number;
  mindestbestand: number;
  vorschlag?: number;
  matchcode?: string;
  lieferant: string;
  restmenge?: number;
  einheitspreis: number;
  nettobetrag: number;
  datum: string;
  bestellwert: number;
}

export interface Druckauftrag {
  lieferschein_nr: string;
  kundenname: string;
  formular?: string;
  druckanzahl?: number;
  druckdatum?: string;
  dokumentart?: string;
}

export interface DruckResponse {
  success: boolean;
  message: string;
  druck_id?: string;
  pdf_url?: string;
}

export interface DokumenteFilter {
  niederlassung?: string;
  lieferant?: string;
  erledigt?: boolean;
  artikelgruppe?: string;
}

/**
 * Dokumente Service Klasse
 */
export class DokumenteService {
  private static instance: DokumenteService;
  private baseUrl = '/api/dokumente';

  private constructor() {}

  public static getInstance(): DokumenteService {
    if (!DokumenteService.instance) {
      DokumenteService.instance = new DokumenteService();
    }
    return DokumenteService.instance;
  }

  /**
   * Lieferscheine abrufen
   */
  async getLieferscheine(filter?: DokumenteFilter): Promise<Lieferschein[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.niederlassung) params.append('niederlassung', filter.niederlassung);
      if (filter?.lieferant) params.append('lieferant', filter.lieferant);
      if (filter?.erledigt !== undefined) params.append('erledigt', filter.erledigt.toString());

      const response = await api.get(`${this.baseUrl}/lieferscheine?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Lieferscheine:', error);
      throw error;
    }
  }

  /**
   * Einen spezifischen Lieferschein abrufen
   */
  async getLieferschein(lieferscheinNr: string): Promise<Lieferschein> {
    try {
      const response = await api.get(`${this.baseUrl}/lieferscheine/${lieferscheinNr}`);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Abrufen des Lieferscheins ${lieferscheinNr}:`, error);
      throw error;
    }
  }

  /**
   * Neuen Lieferschein erstellen
   */
  async createLieferschein(lieferschein: Lieferschein): Promise<Lieferschein> {
    try {
      const response = await api.post(`${this.baseUrl}/lieferscheine`, lieferschein);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Erstellen des Lieferscheins:', error);
      throw error;
    }
  }

  /**
   * Lieferschein aktualisieren
   */
  async updateLieferschein(lieferscheinNr: string, lieferschein: Lieferschein): Promise<Lieferschein> {
    try {
      const response = await api.put(`${this.baseUrl}/lieferscheine/${lieferscheinNr}`, lieferschein);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Aktualisieren des Lieferscheins ${lieferscheinNr}:`, error);
      throw error;
    }
  }

  /**
   * Lieferschein löschen
   */
  async deleteLieferschein(lieferscheinNr: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/lieferscheine/${lieferscheinNr}`);
    } catch (error) {
      console.error(`Fehler beim Löschen des Lieferscheins ${lieferscheinNr}:`, error);
      throw error;
    }
  }

  /**
   * Frachtausgänge abrufen
   */
  async getFrachtausgaenge(niederlassung?: string): Promise<Frachtausgang[]> {
    try {
      const params = new URLSearchParams();
      if (niederlassung) params.append('niederlassung', niederlassung);

      const response = await api.get(`${this.baseUrl}/frachtausgaenge?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Frachtausgänge:', error);
      throw error;
    }
  }

  /**
   * Bestellungen abrufen
   */
  async getBestellungen(filter?: DokumenteFilter): Promise<Bestellung[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.niederlassung) params.append('niederlassung', filter.niederlassung);
      if (filter?.artikelgruppe) params.append('artikelgruppe', filter.artikelgruppe);

      const response = await api.get(`${this.baseUrl}/bestellungen?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Bestellungen:', error);
      throw error;
    }
  }

  /**
   * Lieferschein drucken
   */
  async druckeLieferschein(druckauftrag: Druckauftrag): Promise<DruckResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/drucken/lieferschein`, druckauftrag);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Drucken des Lieferscheins:', error);
      throw error;
    }
  }

  /**
   * Kommissionsauftrag drucken
   */
  async druckeKommissionsauftrag(druckauftrag: Druckauftrag): Promise<DruckResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/drucken/kommissionsauftrag`, druckauftrag);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Drucken des Kommissionsauftrags:', error);
      throw error;
    }
  }

  /**
   * Betriebsauftrag drucken
   */
  async druckeBetriebsauftrag(druckauftrag: Druckauftrag): Promise<DruckResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/drucken/betriebsauftrag`, druckauftrag);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Drucken des Betriebsauftrags:', error);
      throw error;
    }
  }

  /**
   * Versandavis drucken
   */
  async druckeVersandavis(druckauftrag: Druckauftrag): Promise<DruckResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/drucken/versandavis`, druckauftrag);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Drucken des Versandavis:', error);
      throw error;
    }
  }

  /**
   * Paketetiketten drucken
   */
  async druckePaketetiketten(druckauftrag: Druckauftrag): Promise<DruckResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/drucken/paketetiketten`, druckauftrag);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Drucken der Paketetiketten:', error);
      throw error;
    }
  }

  /**
   * Frachtpapier drucken
   */
  async druckeFrachtpapier(druckauftrag: Druckauftrag): Promise<DruckResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/drucken/frachtpapier`, druckauftrag);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Drucken des Frachtpapiers:', error);
      throw error;
    }
  }

  /**
   * Produktionsdokumente drucken
   */
  async druckeProduktionsdokumente(druckauftrag: Druckauftrag): Promise<DruckResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/drucken/produktionsdokumente`, druckauftrag);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Drucken der Produktionsdokumente:', error);
      throw error;
    }
  }

  /**
   * PDF abrufen
   */
  async getPdf(druckId: string): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/pdf/${druckId}`);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Abrufen der PDF ${druckId}:`, error);
      throw error;
    }
  }

  /**
   * Health Check
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/health`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Health Check:', error);
      throw error;
    }
  }

  /**
   * Mock-Daten für Entwicklung
   */
  getMockLieferscheine(): Lieferschein[] {
    return [
      {
        header: {
          lieferschein_nr: "LS-2024-001",
          lieferschein_datum: "2024-01-15",
          niederlassung: "Hamburg",
          lieferant: "Gartenbau GmbH",
          zahlungsbedingung: "30 Tage netto",
          liefer_termin: "2024-01-20",
          lieferdatum: "2024-01-18",
          liefer_nr: "L-001",
          bediener: "Max Mustermann",
          erledigt: true
        },
        positionen: [
          {
            pos_nr: 1,
            artikel_nr: "ART001",
            bezeichnung: "Gartenerde Kompost",
            menge: 100,
            einheit: "kg",
            einzelpreis: 2.50,
            nettobetrag: 250.00,
            lagerhalle: "HALLE1",
            lagerfach: "A-01-01"
          }
        ],
        verfuegbarer_bestand: 500,
        summe_gewicht: 100
      }
    ];
  }

  getMockFrachtausgaenge(): Frachtausgang[] {
    return [
      {
        frachtauftrag_erzeugt: true,
        niederlassung: "Hamburg",
        liefertermin: "2024-01-20",
        spediteur_nr: "SP001",
        email: "info@spediteur.de",
        telefon: "040-123456",
        spediteur_name: "Express Logistik GmbH",
        belegnummer: "FA-2024-001",
        lade_datum: "2024-01-19",
        kundenauswahl: "Kunde A"
      }
    ];
  }

  getMockBestellungen(): Bestellung[] {
    return [
      {
        niederlassung: "Hamburg",
        artikelgruppe: "Garten",
        artikelnummer: "ART001",
        lagerhalle: "HALLE1",
        lagerfach: "A-01-01",
        bezeichnung: "Gartenerde Kompost",
        bestand: 500,
        mindestbestand: 100,
        vorschlag: 200,
        lieferant: "Gartenbau GmbH",
        einheitspreis: 2.50,
        nettobetrag: 500.00,
        datum: "2024-01-15",
        bestellwert: 500.00
      }
    ];
  }
}

// Singleton-Instanz exportieren
export const dokumenteService = DokumenteService.getInstance(); 