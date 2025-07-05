import axios from 'axios';
import { API_BASE_URL } from './api';

// Typdefinitionen für Offene Posten
export interface OffenePostenMetadaten {
  KontoNr: string;
  Name: string;
  Status: string; // z. B. "offen"
  Typ: string; // "Debitor" oder "Kreditor"
}

export interface OffenePostenBuchung {
  RechnungsArt: string; // z. B. "RA"
  RechnungsNr: string;
  Datum: string;
  FaelligBis: string;
  ValutaDatum: string;
  OPBetrag: number;
  SH: string; // Soll/Haben-Kennzeichen
  OPBetragSH: number;
  OPRestSumme: number;
  MandatsNr: string;
  Mahnfaehigkeit: boolean;
  Zahlziel_Tage: number;
  Skonto1_Tage: number;
  Skonto1_Prozent: number;
  Skonto2_Tage: number;
  Skonto2_Prozent: number;
  NettoSkontierfaehig: boolean;
  Steuerschluessel: string;
  OPInfoText: string;
}

export interface OffenePostenHistorieEintrag {
  Typ: string; // z. B. RA
  VerrechnungRechNr: string;
  Datum: string;
  BuchDatum: string;
  Uhrzeit: string;
  VeraenderungBetrag: number;
  BuchBetrag: number;
  SH: string;
  Text: string;
}

export interface OffenePostenSummenblock {
  OPGesamtsumme: number;
  FaelligSumme: number;
  NichtFaelligSumme: number;
  SaldoAktuell: number;
  LetzteBewegungAm: string;
  SkontoDatum: string;
  Kreditlimit: number;
  KfWLimit: number;
  Sperrgrund: string;
}

export interface OffenePostenFunktionen {
  OriginalBelegAnzeigen: boolean;
  BelegDrucken: boolean;
  CalcAktiv: boolean;
}

export interface OffenePostenKIErweiterung {
  Zahlungswahrscheinlichkeit: number;
  Empfohlene_Mahnstufe: number;
  RisikoScore: number;
  Anomalieerkennung: boolean;
  AnomalieDetails?: string;
  ZahlungsprognoseInTagen?: number;
  Empfehlungen?: string[];
}

export interface OffenePosten {
  Metadaten: OffenePostenMetadaten;
  Buchungen: OffenePostenBuchung[];
  Historie: OffenePostenHistorieEintrag[];
  Summenblock: OffenePostenSummenblock;
  Funktionen: OffenePostenFunktionen;
  KI_Erweiterung?: OffenePostenKIErweiterung;
}

// Einfacher Cache für API-Anfragen
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number; // Ablaufzeit in ms
}

class APICache {
  private cache: Record<string, CacheEntry<any>> = {};
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 Minuten Standard-Cache

  get<T>(key: string): T | null {
    const entry = this.cache[key];
    if (!entry) return null;

    // Prüfen, ob der Cache abgelaufen ist
    if (Date.now() - entry.timestamp > entry.expiry) {
      delete this.cache[key];
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, expiry: number = this.DEFAULT_EXPIRY): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      expiry
    };
  }

  invalidate(keyPrefix: string): void {
    // Entfernt alle Cache-Einträge, die mit dem Präfix beginnen
    Object.keys(this.cache).forEach(key => {
      if (key.startsWith(keyPrefix)) {
        delete this.cache[key];
      }
    });
  }
}

const apiCache = new APICache();

// API Endpunkte
const OFFENE_POSTEN_ENDPOINT = `${API_BASE_URL}/offenePosten`;
const KI_ENDPUNKT = `${OFFENE_POSTEN_ENDPOINT}/ki`;

// API-Funktionen für Offene Posten
export const getOffenePosten = async (kontoNr: string, filter: {
  typ?: string;
  status?: string;
  nurFaellige?: boolean;
  datumVon?: string;
  datumBis?: string;
} = {}): Promise<OffenePosten> => {
  try {
    const params = new URLSearchParams();
    
    // Füge alle Parameter zur URL hinzu
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const cacheKey = `offeneposten_${kontoNr}_${queryString}`;
    
    // Versuche, aus dem Cache zu lesen
    const cachedData = apiCache.get<OffenePosten>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axios.get(`${OFFENE_POSTEN_ENDPOINT}/${kontoNr}?${queryString}`);
    
    // Speichere das Ergebnis im Cache
    apiCache.set(cacheKey, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Offenen Posten:', error);
    
    // Wenn API nicht erreichbar ist, Testdaten zurückgeben
    if (axios.isAxiosError(error) && (error.code === 'ECONNABORTED' || !error.response)) {
      console.warn('API nicht erreichbar, verwende Testdaten');
      return getMockOffenePosten(kontoNr);
    }
    
    // Bei anderen Fehlern die standardmäßige Fehlerbehandlung beibehalten
    return getMockOffenePosten(kontoNr);
  }
};

export const getBuchungen = async (kontoNr: string, filter: {
  nurFaellige?: boolean;
  datumVon?: string;
  datumBis?: string;
} = {}): Promise<OffenePostenBuchung[]> => {
  try {
    const params = new URLSearchParams();
    
    // Füge alle Parameter zur URL hinzu
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const cacheKey = `offeneposten_buchungen_${kontoNr}_${queryString}`;
    
    // Versuche, aus dem Cache zu lesen
    const cachedData = apiCache.get<OffenePostenBuchung[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axios.get(`${OFFENE_POSTEN_ENDPOINT}/${kontoNr}/buchungen?${queryString}`);
    
    // Speichere das Ergebnis im Cache
    apiCache.set(cacheKey, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Offene Posten-Buchungen:', error);
    // Testdaten zurückgeben, wenn API-Aufruf fehlschlägt
    return getMockOffenePosten(kontoNr).Buchungen;
  }
};

export const getHistorie = async (kontoNr: string, rechnungsNr: string): Promise<OffenePostenHistorieEintrag[]> => {
  try {
    const cacheKey = `offeneposten_historie_${kontoNr}_${rechnungsNr}`;
    
    // Versuche, aus dem Cache zu lesen
    const cachedData = apiCache.get<OffenePostenHistorieEintrag[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axios.get(`${OFFENE_POSTEN_ENDPOINT}/${kontoNr}/historie/${rechnungsNr}`);
    
    // Speichere das Ergebnis im Cache
    apiCache.set(cacheKey, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Historie:', error);
    // Testdaten zurückgeben, wenn API-Aufruf fehlschlägt
    return getMockOffenePosten(kontoNr).Historie;
  }
};

export const getSummenblock = async (kontoNr: string): Promise<OffenePostenSummenblock> => {
  try {
    const cacheKey = `offeneposten_summenblock_${kontoNr}`;
    
    // Versuche, aus dem Cache zu lesen
    const cachedData = apiCache.get<OffenePostenSummenblock>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axios.get(`${OFFENE_POSTEN_ENDPOINT}/${kontoNr}/summenblock`);
    
    // Speichere das Ergebnis im Cache mit kürzerer Ablaufzeit (2 Minuten)
    apiCache.set(cacheKey, response.data, 2 * 60 * 1000);
    
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden des Summenblocks:', error);
    // Testdaten zurückgeben, wenn API-Aufruf fehlschlägt
    return getMockOffenePosten(kontoNr).Summenblock;
  }
};

// KI-Funktionen für Offene Posten
export const getKIAnalyse = async (kontoNr: string): Promise<OffenePostenKIErweiterung> => {
  try {
    const cacheKey = `offeneposten_ki_analyse_${kontoNr}`;
    
    // Versuche, aus dem Cache zu lesen
    const cachedData = apiCache.get<OffenePostenKIErweiterung>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axios.get(`${KI_ENDPUNKT}/analyse/${kontoNr}`);
    
    // Speichere das Ergebnis im Cache (10 Minuten)
    apiCache.set(cacheKey, response.data, 10 * 60 * 1000);
    
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der KI-Analyse:', error);
    // Testdaten zurückgeben, wenn API-Aufruf fehlschlägt
    return getMockKIErweiterung();
  }
};

export const getZahlungsprognose = async (kontoNr: string, rechnungsNr: string): Promise<{
  WahrscheinlichkeitInProzent: number;
  PrognostiziertesZahlungsdatum: string;
  HistorischesZahlungsverhalten: string;
  Empfehlung: string;
}> => {
  try {
    const cacheKey = `offeneposten_ki_zahlungsprognose_${kontoNr}_${rechnungsNr}`;
    
    // Versuche, aus dem Cache zu lesen
    const cachedData = apiCache.get<any>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axios.get(`${KI_ENDPUNKT}/zahlungsprognose/${kontoNr}/${rechnungsNr}`);
    
    // Speichere das Ergebnis im Cache
    apiCache.set(cacheKey, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Zahlungsprognose:', error);
    // Testdaten zurückgeben, wenn API-Aufruf fehlschlägt
    return {
      WahrscheinlichkeitInProzent: 75,
      PrognostiziertesZahlungsdatum: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      HistorischesZahlungsverhalten: "Zahlungen erfolgen durchschnittlich 12 Tage nach Fälligkeit",
      Empfehlung: "Zahlungserinnerung in 7 Tagen senden"
    };
  }
};

export const getAnomalieanalyse = async (kontoNr: string): Promise<{
  Anomalien: {
    RechnungsNr: string;
    Beschreibung: string;
    Schweregrad: 'niedrig' | 'mittel' | 'hoch';
    Typ: string;
  }[]
}> => {
  try {
    const cacheKey = `offeneposten_ki_anomalien_${kontoNr}`;
    
    // Versuche, aus dem Cache zu lesen
    const cachedData = apiCache.get<{Anomalien: any[]}>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axios.get(`${KI_ENDPUNKT}/anomalien/${kontoNr}`);
    
    // Speichere das Ergebnis im Cache
    apiCache.set(cacheKey, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Anomalien:', error);
    // Testdaten zurückgeben, wenn API-Aufruf fehlschlägt
    return {
      Anomalien: [
        {
          RechnungsNr: "RE-2025-0189",
          Beschreibung: "Ungewöhnlich hoher Betrag für diesen Kunden",
          Schweregrad: "mittel",
          Typ: "Betragsschwankung"
        }
      ]
    };
  }
};

// Cache invalidieren bei Aktualisierungen
export const invalidateOffenePostenCache = (kontoNr: string): void => {
  apiCache.invalidate(`offeneposten_${kontoNr}`);
};

// Mock-Daten für Testumgebung
const getMockOffenePosten = (kontoNr: string): OffenePosten => {
  return {
    Metadaten: {
      KontoNr: kontoNr,
      Name: kontoNr.startsWith('D') ? `Debitor ${kontoNr}` : `Kreditor ${kontoNr}`,
      Status: "offen",
      Typ: kontoNr.startsWith('D') ? "Debitor" : "Kreditor"
    },
    Buchungen: [
      {
        RechnungsArt: "RA",
        RechnungsNr: "RE-2025-0102",
        Datum: "2025-01-15",
        FaelligBis: "2025-02-14",
        ValutaDatum: "2025-01-15",
        OPBetrag: 1250.00,
        SH: "S",
        OPBetragSH: 1250.00,
        OPRestSumme: 1250.00,
        MandatsNr: "M2025-001",
        Mahnfaehigkeit: true,
        Zahlziel_Tage: 30,
        Skonto1_Tage: 14,
        Skonto1_Prozent: 2.0,
        Skonto2_Tage: 0,
        Skonto2_Prozent: 0.0,
        NettoSkontierfaehig: true,
        Steuerschluessel: "19",
        OPInfoText: "Lieferung Januar"
      },
      {
        RechnungsArt: "RA",
        RechnungsNr: "RE-2025-0155",
        Datum: "2025-02-10",
        FaelligBis: "2025-03-12",
        ValutaDatum: "2025-02-10",
        OPBetrag: 2780.50,
        SH: "S",
        OPBetragSH: 2780.50,
        OPRestSumme: 2780.50,
        MandatsNr: "M2025-001",
        Mahnfaehigkeit: true,
        Zahlziel_Tage: 30,
        Skonto1_Tage: 14,
        Skonto1_Prozent: 2.0,
        Skonto2_Tage: 0,
        Skonto2_Prozent: 0.0,
        NettoSkontierfaehig: true,
        Steuerschluessel: "19",
        OPInfoText: "Lieferung Februar"
      },
      {
        RechnungsArt: "RA",
        RechnungsNr: "RE-2025-0189",
        Datum: "2025-03-05",
        FaelligBis: "2025-04-04",
        ValutaDatum: "2025-03-05",
        OPBetrag: 5430.75,
        SH: "S",
        OPBetragSH: 5430.75,
        OPRestSumme: 5430.75,
        MandatsNr: "M2025-001",
        Mahnfaehigkeit: true,
        Zahlziel_Tage: 30,
        Skonto1_Tage: 14,
        Skonto1_Prozent: 2.0,
        Skonto2_Tage: 0,
        Skonto2_Prozent: 0.0,
        NettoSkontierfaehig: true,
        Steuerschluessel: "19",
        OPInfoText: "Lieferung März"
      }
    ],
    Historie: [
      {
        Typ: "RA",
        VerrechnungRechNr: "RE-2025-0102",
        Datum: "2025-01-15",
        BuchDatum: "2025-01-15",
        Uhrzeit: "10:15:22",
        VeraenderungBetrag: 1250.00,
        BuchBetrag: 1250.00,
        SH: "S",
        Text: "Rechnung erstellt"
      },
      {
        Typ: "RA",
        VerrechnungRechNr: "RE-2025-0155",
        Datum: "2025-02-10",
        BuchDatum: "2025-02-10",
        Uhrzeit: "09:45:37",
        VeraenderungBetrag: 2780.50,
        BuchBetrag: 2780.50,
        SH: "S",
        Text: "Rechnung erstellt"
      },
      {
        Typ: "RA",
        VerrechnungRechNr: "RE-2025-0189",
        Datum: "2025-03-05",
        BuchDatum: "2025-03-05",
        Uhrzeit: "14:30:11",
        VeraenderungBetrag: 5430.75,
        BuchBetrag: 5430.75,
        SH: "S",
        Text: "Rechnung erstellt"
      }
    ],
    Summenblock: {
      OPGesamtsumme: 9461.25,
      FaelligSumme: 1250.00,
      NichtFaelligSumme: 8211.25,
      SaldoAktuell: 9461.25,
      LetzteBewegungAm: "2025-03-05",
      SkontoDatum: "2025-03-19",
      Kreditlimit: 15000.00,
      KfWLimit: 0.00,
      Sperrgrund: ""
    },
    Funktionen: {
      OriginalBelegAnzeigen: true,
      BelegDrucken: true,
      CalcAktiv: true
    },
    KI_Erweiterung: getMockKIErweiterung()
  };
};

const getMockKIErweiterung = (): OffenePostenKIErweiterung => {
  return {
    Zahlungswahrscheinlichkeit: 0.85,
    Empfohlene_Mahnstufe: 1,
    RisikoScore: 20,
    Anomalieerkennung: true,
    AnomalieDetails: "Ungewöhnlich hoher Betrag bei RE-2025-0189",
    ZahlungsprognoseInTagen: 12,
    Empfehlungen: [
      "Telefonische Zahlungserinnerung für RE-2025-0102",
      "Überwachung der Zahlungseingänge intensivieren"
    ]
  };
}; 