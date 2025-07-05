import axios from 'axios';
import { chargenService, ChargeDetails } from './chargenService';

// Typdefinitionen für die Chargenverwaltung
export interface Charge {
  id: number;
  artikel_id: number;
  artikel_name?: string;
  chargennummer: string;
  herstelldatum?: string;
  mindesthaltbarkeitsdatum?: string;
  lieferant_id?: number;
  lieferant_name?: string;
  lieferanten_chargennummer?: string;
  eingang_datum?: string;
  qr_code?: string;
  rfid_tag?: string;
  status: string;
  charge_typ: string;
  ursprungs_land?: string;
  zertifikate?: any;
  produktions_datum?: string;
  verbrauchsdatum?: string;
  qualitaetsstatus?: string;
  pruefung_datum?: string;
  pruefung_ergebnis?: string;
  menge?: number;
  einheit_id?: number;
  einheit_name?: string;
  erstellt_am: string;
  geaendert_am?: string;
}

export interface LagerPosition {
  lager_id: number;
  lager_name: string;
  lagerort_id?: number;
  lagerort_name?: string;
  position?: string;
  menge: number;
  einheit?: string;
}

export interface ChargenVerfolgung {
  id: number;
  quell_charge_id: number;
  quell_charge_nummer: string;
  ziel_charge_id: number;
  ziel_charge_nummer: string;
  menge: number;
  einheit_name: string;
  prozess_typ: string;
  prozess_id?: number;
  erstellt_am: string;
  erstellt_von?: number;
  ersteller_name?: string;
}

export interface ChargeQualitaet {
  id: number;
  charge_id: number;
  pruefung_datum: string;
  ergebnis: 'bestanden' | 'nicht_bestanden';
  pruefer: string;
  parameter: string;
  wert: string;
  einheit: string;
  bemerkung?: string;
}

export interface ChargeDokument {
  id: number;
  charge_id: number;
  dokument_typ: string;
  dateiname: string;
  dateipfad: string;
  upload_datum: string;
  benutzer_id: number;
  bemerkung?: string;
}

export interface ChargeVorwaerts {
  charge: {
    id: number;
    chargennummer: string;
    artikel_name: string;
  };
  verwendungen: {
    id: number;
    prozess_typ: string;
    prozess_name: string;
    datum: string;
    menge: number;
    einheit: string;
    ziel_charge: {
      id: number;
      chargennummer: string;
      artikel_name: string;
      weitere_verwendungen: boolean;
    };
  }[];
}

export interface ChargeRueckwaerts {
  charge: {
    id: number;
    chargennummer: string;
    artikel_name: string;
  };
  bestandteile: {
    id: number;
    prozess_typ: string;
    prozess_name: string;
    datum: string;
    menge: number;
    einheit: string;
    quell_charge: {
      id: number;
      chargennummer: string;
      artikel_name: string;
      weitere_bestandteile: boolean;
    };
  }[];
}

// Typdefinitionen für die Scan-Ergebnisse
export interface ScanResult {
  type: 'charge' | 'lagerplatz' | 'artikel' | 'mitarbeiter' | 'inventur' | 'pickliste';
  id: string;
  label: string;
  data: any;
}

export interface InventurErfassung {
  id?: string;
  artikel_id: string;
  lagerplatz_id: string;
  erfasste_menge: number;
  system_menge?: number;
  differenz?: number;
  erfasst_von: string;
  erfasst_am: string;
  chargen?: {
    charge_id: string;
    chargennummer: string;
    menge: number;
  }[];
  status: 'offen' | 'abgeschlossen' | 'freigegeben';
  bemerkung?: string;
}

// Chargen-Funktionen
export const getChargen = async (filter?: {
  artikel_id?: number;
  status?: string;
  charge_typ?: string;
  search?: string;
}): Promise<Charge[]> => {
  try {
    let url = '/api/v1/charge';
    const params = new URLSearchParams();
    
    if (filter) {
      if (filter.artikel_id) params.append('artikel_id', filter.artikel_id.toString());
      if (filter.status) params.append('status', filter.status);
      if (filter.charge_typ) params.append('charge_typ', filter.charge_typ);
      if (filter.search) params.append('search', filter.search);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Abrufen der Chargen:", error);
    // Testdaten zurückgeben, wenn API-Aufruf fehlschlägt
    return TEST_CHARGEN;
  }
};

// Mock-Testdaten für Chargen
const TEST_CHARGEN: Charge[] = [
  {
    id: 1,
    artikel_id: 101,
    artikel_name: "Weizenschrot",
    chargennummer: "WS-2025-001",
    herstelldatum: "2025-04-15",
    mindesthaltbarkeitsdatum: "2025-10-15",
    lieferant_id: 201,
    lieferant_name: "Mühle Müller GmbH",
    lieferanten_chargennummer: "MM-25041501",
    eingang_datum: "2025-04-18",
    qr_code: "qr-ws-2025-001",
    rfid_tag: "rfid-ws-2025-001",
    status: "freigegeben",
    charge_typ: "rohstoff",
    ursprungs_land: "Deutschland",
    zertifikate: { "bio": true, "gmo_frei": true },
    produktions_datum: "2025-04-14",
    verbrauchsdatum: null,
    qualitaetsstatus: "bestanden",
    pruefung_datum: "2025-04-16",
    pruefung_ergebnis: "konform",
    menge: 5000,
    einheit_id: 1,
    einheit_name: "kg",
    erstellt_am: "2025-04-18T10:15:00Z",
    geaendert_am: "2025-04-18T14:30:00Z"
  },
  {
    id: 2,
    artikel_id: 102,
    artikel_name: "Maismehl",
    chargennummer: "MM-2025-002",
    herstelldatum: "2025-04-10",
    mindesthaltbarkeitsdatum: "2025-10-10",
    lieferant_id: 202,
    lieferant_name: "Agrar Handel Schmidt",
    lieferanten_chargennummer: "AHS-25041001",
    eingang_datum: "2025-04-12",
    qr_code: "qr-mm-2025-002",
    rfid_tag: "rfid-mm-2025-002",
    status: "freigegeben",
    charge_typ: "rohstoff",
    ursprungs_land: "Frankreich",
    zertifikate: { "bio": false, "gmo_frei": true },
    produktions_datum: "2025-04-09",
    verbrauchsdatum: null,
    qualitaetsstatus: "bestanden",
    pruefung_datum: "2025-04-11",
    pruefung_ergebnis: "konform",
    menge: 3000,
    einheit_id: 1,
    einheit_name: "kg",
    erstellt_am: "2025-04-12T09:45:00Z",
    geaendert_am: "2025-04-12T11:30:00Z"
  },
  {
    id: 3,
    artikel_id: 103,
    artikel_name: "Schweinefutter Premium",
    chargennummer: "SF-2025-001",
    herstelldatum: "2025-04-20",
    mindesthaltbarkeitsdatum: "2025-07-20",
    lieferant_id: null,
    lieferant_name: null,
    lieferanten_chargennummer: null,
    eingang_datum: null,
    qr_code: "qr-sf-2025-001",
    rfid_tag: "rfid-sf-2025-001",
    status: "in_verwendung",
    charge_typ: "fertigprodukt",
    ursprungs_land: "Deutschland",
    zertifikate: { "premium_qualität": true },
    produktions_datum: "2025-04-20",
    verbrauchsdatum: null,
    qualitaetsstatus: "bestanden",
    pruefung_datum: "2025-04-20",
    pruefung_ergebnis: "konform",
    menge: 2500,
    einheit_id: 1,
    einheit_name: "kg",
    erstellt_am: "2025-04-20T15:30:00Z",
    geaendert_am: "2025-04-21T08:15:00Z"
  },
  {
    id: 4,
    artikel_id: 104,
    artikel_name: "Mineralfutter Rind",
    chargennummer: "MR-2025-001",
    herstelldatum: "2025-04-05",
    mindesthaltbarkeitsdatum: "2026-04-05",
    lieferant_id: 203,
    lieferant_name: "Mineral Plus GmbH",
    lieferanten_chargennummer: "MP-25040501",
    eingang_datum: "2025-04-08",
    qr_code: "qr-mr-2025-001",
    rfid_tag: "rfid-mr-2025-001",
    status: "gesperrt",
    charge_typ: "rohstoff",
    ursprungs_land: "Deutschland",
    zertifikate: { "premium_qualität": true },
    produktions_datum: "2025-04-04",
    verbrauchsdatum: null,
    qualitaetsstatus: "in_pruefung",
    pruefung_datum: "2025-04-08",
    pruefung_ergebnis: "nachkontrolle",
    menge: 1000,
    einheit_id: 1,
    einheit_name: "kg",
    erstellt_am: "2025-04-08T10:00:00Z",
    geaendert_am: "2025-04-08T14:45:00Z"
  },
  {
    id: 5,
    artikel_id: 105,
    artikel_name: "Geflügelfutter Standard",
    chargennummer: "GF-2025-001",
    herstelldatum: "2025-04-22",
    mindesthaltbarkeitsdatum: "2025-07-22",
    lieferant_id: null,
    lieferant_name: null,
    lieferanten_chargennummer: null,
    eingang_datum: null,
    qr_code: "qr-gf-2025-001",
    rfid_tag: "rfid-gf-2025-001",
    status: "neu",
    charge_typ: "fertigprodukt",
    ursprungs_land: "Deutschland",
    zertifikate: null,
    produktions_datum: "2025-04-22",
    verbrauchsdatum: null,
    qualitaetsstatus: "in_pruefung",
    pruefung_datum: null,
    pruefung_ergebnis: null,
    menge: 1800,
    einheit_id: 1,
    einheit_name: "kg",
    erstellt_am: "2025-04-22T16:20:00Z",
    geaendert_am: null
  }
];

// Neue Funktion für alle Chargen
export const getAllChargen = async (): Promise<Charge[]> => {
  try {
    const response = await axios.get('/api/v1/charge');
    return response.data;
  } catch (error) {
    console.error("Fehler beim Abrufen aller Chargen:", error);
    // Testdaten zurückgeben, wenn API-Aufruf fehlschlägt
    return TEST_CHARGEN;
  }
};

// Suchfunktion für Chargen mit erweiterten Filteroptionen
export const searchChargen = async (filterParams: Record<string, string | number>): Promise<Charge[]> => {
  try {
    let url = '/api/v1/charge/search';
    const params = new URLSearchParams();
    
    Object.entries(filterParams).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Suchen von Chargen:", error);
    // Gefilterte Testdaten zurückgeben
    return TEST_CHARGEN.filter(charge => {
      return Object.entries(filterParams).every(([key, value]) => {
        if (key === 'chargennummer' && charge.chargennummer.includes(String(value))) return true;
        if (key === 'artikel_id' && charge.artikel_id === Number(value)) return true;
        if (key === 'status' && charge.status === value) return true;
        return false;
      });
    });
  }
};

export const getChargeById = async (id: number): Promise<Charge> => {
  try {
    const response = await axios.get(`/api/v1/charge/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Abrufen der Charge mit ID ${id}:`, error);
    // Testdaten zurückgeben
    const charge = TEST_CHARGEN.find(c => c.id === id);
    if (charge) return charge;
    throw new Error(`Charge mit ID ${id} nicht gefunden`);
  }
};

export const createCharge = async (charge: Partial<Charge>): Promise<Charge> => {
  const response = await axios.post('/api/v1/charge/create', charge);
  return response.data;
};

export const updateCharge = async (id: number, charge: Partial<Charge>): Promise<Charge> => {
  const response = await axios.put(`/api/v1/charge/${id}/update`, charge);
  return response.data;
};

export const getChargeVerfolgung = async (chargeId: number): Promise<{
  vorwaerts: ChargenVerfolgung[];
  rueckwaerts: ChargenVerfolgung[];
}> => {
  const response = await axios.get(`/api/v1/charge/${chargeId}/verfolgung`);
  return response.data;
};

// QR-Code-Funktionen
export const generateQRCode = async (chargeId: number): Promise<{
  charge_id: number;
  qr_code: string;
  message: string;
}> => {
  const response = await axios.post(`/api/v1/charge/${chargeId}/generate-qrcode`);
  return response.data;
};

export const getQRCode = async (chargeId: number): Promise<{
  charge_id: number;
  qr_code: string;
}> => {
  const response = await axios.get(`/api/v1/charge/${chargeId}/qrcode`);
  return response.data;
};

// Chargen-Lager-Funktionen
export const getChargeLagerbestaende = async (chargeId: number): Promise<LagerPosition[]> => {
  const response = await axios.get(`/api/v1/charge/${chargeId}/lagerbestaende`);
  return response.data;
};

// Scannerfunktionen für mobile Anwendung
export const verarbeiteQRCodeScan = async (
  qrCodeData: string,
  modus: 'wareneingang' | 'warenausgang' | 'inventur' | 'umlagerung'
): Promise<ScanResult> => {
  try {
    // In einer echten Implementierung würde hier ein API-Call stattfinden
    // POST /api/v1/scan mit qrCodeData und modus als Parameter
    
    // Für die Demo simulieren wir die Antwort basierend auf dem Präfix des QR-Codes
    
    // Simulierte Netzwerklatenz
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // QR-Code-Format-Analyse
    if (qrCodeData.startsWith('CH-')) {
      // Chargennummer - Format: CH-[ID]
      const id = qrCodeData.substring(3);
      return {
        type: 'charge',
        id,
        label: `Charge ${id}`,
        data: {}
      };
    } else if (qrCodeData.startsWith('LO-')) {
      // Lagerort - Format: LO-[ID]
      const id = qrCodeData.substring(3);
      return {
        type: 'lagerplatz',
        id,
        label: `Lagerplatz ${id}`,
        data: {
          lagerplatz_name: `Halle ${Math.floor(Math.random() * 3) + 1} / Regal ${String.fromCharCode(65 + Math.floor(Math.random() * 6))} / Fach ${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}`
        }
      };
    } else if (qrCodeData.startsWith('ART-')) {
      // Artikel - Format: ART-[ID]
      const id = qrCodeData.substring(4);
      return {
        type: 'artikel',
        id,
        label: `Artikel ${id}`,
        data: {
          artikel_name: id === '1' ? 'Weizenschrot Premium' : id === '2' ? 'Maismehl' : `Artikel ${id}`
        }
      };
    } else if (qrCodeData.startsWith('INV-')) {
      // Inventurauftrag - Format: INV-[ID]
      const id = qrCodeData.substring(4);
      return {
        type: 'inventur',
        id,
        label: `Inventurauftrag ${id}`,
        data: {}
      };
    } else if (qrCodeData.startsWith('PL-')) {
      // Pickliste - Format: PL-[ID]
      const id = qrCodeData.substring(3);
      return {
        type: 'pickliste',
        id,
        label: `Pickliste ${id}`,
        data: {}
      };
    } else if (qrCodeData.startsWith('MA-')) {
      // Mitarbeiter - Format: MA-[ID]
      const id = qrCodeData.substring(3);
      return {
        type: 'mitarbeiter',
        id,
        label: `Mitarbeiter ${id}`,
        data: {
          name: id === '1' ? 'Max Mustermann' : id === '2' ? 'Erika Musterfrau' : `Mitarbeiter ${id}`
        }
      };
    } else {
      // Unbekanntes Format
      throw new Error('Unbekanntes QR-Code-Format');
    }
  } catch (error) {
    console.error('Fehler bei der QR-Code-Verarbeitung:', error);
    throw error;
  }
};

// Testdaten für Chargen-Verfolgung: Vorwärts
const TEST_CHARGE_VORWAERTS: ChargeVorwaerts = {
  charge: {
    id: 1,
    chargennummer: "WS-2025-001",
    artikel_name: "Weizenschrot"
  },
  verwendungen: [
    {
      id: 101,
      prozess_typ: "mischen",
      prozess_name: "Mischvorgang #M-25042001",
      datum: "2025-04-20",
      menge: 1200,
      einheit: "kg",
      ziel_charge: {
        id: 3,
        chargennummer: "SF-2025-001",
        artikel_name: "Schweinefutter Premium",
        weitere_verwendungen: false
      }
    },
    {
      id: 102,
      prozess_typ: "mischen",
      prozess_name: "Mischvorgang #M-25042201",
      datum: "2025-04-22",
      menge: 800,
      einheit: "kg",
      ziel_charge: {
        id: 5,
        chargennummer: "GF-2025-001",
        artikel_name: "Geflügelfutter Standard",
        weitere_verwendungen: false
      }
    }
  ]
};

// Testdaten für Chargen-Verfolgung: Rückwärts
const TEST_CHARGE_RUECKWAERTS: ChargeRueckwaerts = {
  charge: {
    id: 3,
    chargennummer: "SF-2025-001",
    artikel_name: "Schweinefutter Premium"
  },
  bestandteile: [
    {
      id: 201,
      prozess_typ: "mischen",
      prozess_name: "Mischvorgang #M-25042001",
      datum: "2025-04-20",
      menge: 1200,
      einheit: "kg",
      quell_charge: {
        id: 1,
        chargennummer: "WS-2025-001",
        artikel_name: "Weizenschrot",
        weitere_bestandteile: false
      }
    },
    {
      id: 202,
      prozess_typ: "mischen",
      prozess_name: "Mischvorgang #M-25042001",
      datum: "2025-04-20",
      menge: 800,
      einheit: "kg",
      quell_charge: {
        id: 2,
        chargennummer: "MM-2025-002",
        artikel_name: "Maismehl",
        weitere_bestandteile: false
      }
    }
  ]
};

// Chargen-Verfolgung: Vorwärts (von Rohstoff zu Produkt)
export const getChargeVorwaerts = async (chargeId: number): Promise<ChargeVorwaerts> => {
  try {
    const response = await axios.get(`/api/v1/charge/${chargeId}/verfolgung/vorwaerts`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Abrufen der Vorwärts-Verfolgung für Charge ${chargeId}:`, error);
    // Testdaten zurückgeben
    if (chargeId === 1) return TEST_CHARGE_VORWAERTS;
    // Für andere IDs leere Struktur zurückgeben
    return {
      charge: {
        id: chargeId,
        chargennummer: `Charge-${chargeId}`,
        artikel_name: "Unbekannter Artikel"
      },
      verwendungen: []
    };
  }
};

// Chargen-Verfolgung: Rückwärts (von Produkt zu Rohstoffen)
export const getChargeRueckwaerts = async (chargeId: number): Promise<ChargeRueckwaerts> => {
  try {
    const response = await axios.get(`/api/v1/charge/${chargeId}/verfolgung/rueckwaerts`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Abrufen der Rückwärts-Verfolgung für Charge ${chargeId}:`, error);
    // Testdaten zurückgeben
    if (chargeId === 3) return TEST_CHARGE_RUECKWAERTS;
    // Für andere IDs leere Struktur zurückgeben
    return {
      charge: {
        id: chargeId,
        chargennummer: `Charge-${chargeId}`,
        artikel_name: "Unbekannter Artikel"
      },
      bestandteile: []
    };
  }
};

export const getPicklistenAuftraege = async (mitarbeiterId: number): Promise<any[]> => {
  const response = await axios.get(`/api/v1/picklisten/mitarbeiter/${mitarbeiterId}`);
  return response.data;
};

export const getInventurAuftraege = async (mitarbeiterId: number): Promise<any[]> => {
  const response = await axios.get(`/api/v1/inventur/auftraege/mitarbeiter/${mitarbeiterId}`);
  return response.data;
};

export const submitInventurErgebnis = async (
  inventurId: number, 
  lagerortId: number, 
  artikelId: number, 
  chargeId: number | null, 
  gezaehlteMenge: number
): Promise<any> => {
  const response = await axios.post(`/api/v1/inventur/${inventurId}/ergebnis`, {
    lagerort_id: lagerortId,
    artikel_id: artikelId,
    charge_id: chargeId,
    gezaehlte_menge: gezaehlteMenge,
    zeitstempel: new Date().toISOString(),
    mitarbeiter_id: localStorage.getItem('user_id') || null
  });
  return response.data;
};

// Erfasst einen Artikel für die Inventur
export const erfasseInventurPosition = async (erfassung: InventurErfassung): Promise<InventurErfassung> => {
  try {
    // POST /api/v1/inventur/erfassung
    const response = await axios.post('/api/v1/inventur/erfassung', erfassung);
    return response.data;
  } catch (error) {
    console.error('Fehler bei der Inventurerfassung:', error);
    
    // Fallback für Entwicklung/Demo
    return {
      ...erfassung,
      id: erfassung.id || `INV-${Date.now()}`,
      system_menge: erfassung.system_menge || Math.round(erfassung.erfasste_menge * (0.9 + Math.random() * 0.2)),
      differenz: erfassung.system_menge 
        ? erfassung.erfasste_menge - erfassung.system_menge 
        : Math.round(erfassung.erfasste_menge * (Math.random() * 0.2 - 0.1))
    };
  }
};

// Holt alle offenen Inventuraufgaben für einen Mitarbeiter
export const getOffeneInventurAufgaben = async (mitarbeiterId: string): Promise<{
  id: string;
  bezeichnung: string;
  lagerbereich: string;
  anzahl_artikel: number;
  frist?: string;
  prioritaet: 'niedrig' | 'mittel' | 'hoch';
}[]> => {
  try {
    // GET /api/v1/inventur/aufgaben/offen?mitarbeiter_id=XXX
    const response = await axios.get(`/api/v1/inventur/aufgaben/offen`, {
      params: { mitarbeiter_id: mitarbeiterId }
    });
    return response.data;
  } catch (error) {
    console.error('Fehler beim Abrufen der offenen Inventuraufgaben:', error);
    
    // Fallback für Entwicklung/Demo
    return [
      {
        id: 'INV-001',
        bezeichnung: 'Jahresinventur Lager Ost',
        lagerbereich: 'Lager Ost',
        anzahl_artikel: 42,
        frist: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
        prioritaet: 'hoch'
      },
      {
        id: 'INV-002',
        bezeichnung: 'Stichprobeninventur Futtermittel',
        lagerbereich: 'Futtermittellager',
        anzahl_artikel: 15,
        frist: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
        prioritaet: 'mittel'
      }
    ];
  }
};

// Bucht eine Warenbewegung (Wareneingang, Warenausgang, Umlagerung)
export const bucheWarenbewegung = async (bewegung: {
  typ: 'eingang' | 'ausgang' | 'umlagerung';
  artikel_id: string;
  menge: number;
  chargen?: {
    charge_id: string;
    menge: number;
  }[];
  von_lagerplatz_id?: string;
  nach_lagerplatz_id?: string;
  belegnummer?: string;
  mitarbeiter_id: string;
  bemerkung?: string;
}): Promise<{
  id: string;
  erfolg: boolean;
  datum: string;
  neue_chargen?: ChargeDetails[];
  fehlermeldung?: string;
}> => {
  try {
    // POST /api/v1/lager/bewegung
    const response = await axios.post('/api/v1/lager/bewegung', bewegung);
    return response.data;
  } catch (error) {
    console.error('Fehler bei der Warenbewegung:', error);
    
    // Fallback für Entwicklung/Demo
    return {
      id: `BEW-${Date.now()}`,
      erfolg: true,
      datum: new Date().toISOString(),
      neue_chargen: bewegung.typ === 'eingang' ? [
        {
          id: `${Date.now()}`,
          artikel_id: bewegung.artikel_id,
          artikel_name: bewegung.artikel_id === '1' ? 'Weizenschrot Premium' : bewegung.artikel_id === '2' ? 'Maismehl' : `Artikel ${bewegung.artikel_id}`,
          chargennummer: `${bewegung.artikel_id === '1' ? 'WS' : bewegung.artikel_id === '2' ? 'MM' : 'CH'}-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          menge: bewegung.menge,
          einheit: 'kg',
          mindesthaltbarkeitsdatum: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
          herstelldatum: new Date().toISOString().split('T')[0],
          lagerort_id: bewegung.nach_lagerplatz_id || '1',
          lagerort_name: 'Hauptlager',
          qualitaetsstatus: 'freigegeben',
          lagerplatz: `Halle ${Math.floor(Math.random() * 3) + 1} / Regal ${String.fromCharCode(65 + Math.floor(Math.random() * 6))} / Fach ${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}`,
          lieferant_name: 'Agrar GmbH',
          eingang_datum: new Date().toISOString().split('T')[0]
        }
      ] : undefined
    };
  }
};

// Holt alle für einen Mitarbeiter verfügbaren Scanner-Aufgaben
export const getScannerAufgaben = async (
  mitarbeiterId: string,
  modus: 'wareneingang' | 'warenausgang' | 'inventur' | 'umlagerung'
): Promise<{
  id: string;
  bezeichnung: string;
  typ: string;
  menge?: number;
  einheit?: string;
  artikel_id?: string;
  artikel_name?: string;
  lagerort?: string;
  prioritaet: 'niedrig' | 'mittel' | 'hoch';
  frist?: string;
}[]> => {
  try {
    // GET /api/v1/scanner/aufgaben?mitarbeiter_id=XXX&modus=YYY
    const response = await axios.get('/api/v1/scanner/aufgaben', {
      params: { mitarbeiter_id: mitarbeiterId, modus }
    });
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Abrufen der Scanner-Aufgaben (${modus}):`, error);
    
    // Fallback für Entwicklung/Demo
    switch (modus) {
      case 'wareneingang':
        return [
          {
            id: 'WE-001',
            bezeichnung: 'Wareneingang Lieferung #L2025-0042',
            typ: 'wareneingang',
            menge: 1500,
            einheit: 'kg',
            artikel_name: 'Weizenschrot Premium',
            lagerort: 'Hauptlager',
            prioritaet: 'hoch',
            frist: new Date().toISOString().split('T')[0]
          },
          {
            id: 'WE-002',
            bezeichnung: 'Wareneingang Lieferung #L2025-0043',
            typ: 'wareneingang',
            menge: 2000,
            einheit: 'kg',
            artikel_name: 'Maismehl',
            lagerort: 'Hauptlager',
            prioritaet: 'mittel',
            frist: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
          }
        ];
      case 'warenausgang':
        return [
          {
            id: 'WA-001',
            bezeichnung: 'Kommissionierung Auftrag #A2025-0123',
            typ: 'warenausgang',
            menge: 800,
            einheit: 'kg',
            artikel_name: 'Weizenschrot Premium',
            lagerort: 'Hauptlager',
            prioritaet: 'niedrig',
            frist: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
          }
        ];
      case 'inventur':
        return [
          {
            id: 'INV-001',
            bezeichnung: 'Jahresinventur Lager Ost',
            typ: 'inventur',
            lagerort: 'Lager Ost',
            prioritaet: 'hoch',
            frist: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0]
          }
        ];
      case 'umlagerung':
        return [
          {
            id: 'UML-001',
            bezeichnung: 'Umlagerung Weizenschrot',
            typ: 'umlagerung',
            menge: 500,
            einheit: 'kg',
            artikel_name: 'Weizenschrot Premium',
            lagerort: 'Hauptlager',
            prioritaet: 'mittel'
          }
        ];
      default:
        return [];
    }
  }
};

// Export der API-Funktionen
const inventoryApi = {
  verarbeiteQRCodeScan,
  erfasseInventurPosition,
  getOffeneInventurAufgaben,
  bucheWarenbewegung,
  getScannerAufgaben
};

export default inventoryApi; 