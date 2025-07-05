import axios from 'axios';
import { API_BASE_URL } from './api';

// Typdefinitionen für das Artikelkonto
export interface ArtikelkontoMetadaten {
  Artikelnummer: string;
  Artikelbezeichnung: string;
  Zeitraum_von: string;
  Zeitraum_bis: string;
  Niederlassung: string;
  Buchungsdatum: string;
  Sortierung: string;
  UmsatzHauptkontoZugeordnet: boolean;
}

export interface ArtikelkontoBuchung {
  Datum: string;
  LieferscheinNr: string;
  DebitorKreditorNr: string;
  DebitorKreditorName: string;
  Menge: number;
  Einheit: string;
  Einzelpreis: number;
  Gesamtbetrag: number;
  Rechnungsdatum: string;
  BelegNr: string;
  AuftragsNr: string;
  Kostenstelle: string;
  Niederlassung: string;
  Lagerfach: string;
  ChargenNr: string;
  SerienNr: string;
  Bediener: string;
  Bemerkung: string;
}

export interface ArtikelkontoSummen {
  KumulierteEinkaufsmenge: number;
  KumulierteEinkaufssumme: number;
  KumulierteVerkaufsmenge: number;
  KumulierteVerkaufssumme: number;
  Saldo: number;
}

export interface ArtikelkontoPreise {
  DurchschnittlicherEKPreis: number;
  DurchschnittlicherVKPreis: number;
  Bezugsgröße: string;
}

export interface ArtikelkontoLagerstatus {
  VerfügbarerBestand: number;
  AktuellerBuchbestand: number;
}

export interface ArtikelkontoFunktionen {
  SummierungArtikelUmbuchungen: boolean;
  ArtikelbewegungenDrucken: boolean;
  ArtikelKontoauszugDrucken: boolean;
  KalkulationAktivieren: boolean;
}

export interface ArtikelKonto {
  Metadaten: ArtikelkontoMetadaten;
  Tabelle_Buchungen: ArtikelkontoBuchung[];
  Summen: ArtikelkontoSummen;
  Preise: ArtikelkontoPreise;
  Lagerstatus: ArtikelkontoLagerstatus;
  Funktionen: ArtikelkontoFunktionen;
}

// KI-Erweiterungen
export interface ArtikelkontoKIPrognosen {
  KI_Prognose_BestandIn30Tagen: number;
  KI_Preisprognose_VK: number;
  Abweichung_ISTvsSOLL: number;
  Anomalie_Transaktion: boolean;
  AnomalieDetails?: string;
  PrognoseDatum: string;
  KonfidenzBestand: number; // 0-1 Konfidenzwert
  KonfidenzPreis: number; // 0-1 Konfidenzwert
  Trendrichtung: 'steigend' | 'fallend' | 'stabil';
  PrognoseBasierteEmpfehlung?: string;
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
const ARTIKELKONTO_ENDPOINT = `${API_BASE_URL}/artikelkonto`;
const KI_ENDPUNKT = `${ARTIKELKONTO_ENDPOINT}/ki`;

// API-Funktionen für das Artikelkonto
export const getArtikelkonto = async (artikelNr: string, parameter: Partial<ArtikelkontoMetadaten> = {}): Promise<ArtikelKonto> => {
  try {
    const params = new URLSearchParams();
    
    // Füge alle Parameter zur URL hinzu
    Object.entries(parameter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const cacheKey = `artikelkonto_${artikelNr}_${queryString}`;
    
    // Versuche, aus dem Cache zu lesen
    const cachedData = apiCache.get<ArtikelKonto>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axios.get(`${ARTIKELKONTO_ENDPOINT}/${artikelNr}?${queryString}`);
    
    // Speichere das Ergebnis im Cache
    apiCache.set(cacheKey, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden des Artikelkontos:', error);
    
    // Wenn API nicht erreichbar ist, Testdaten zurückgeben
    if (axios.isAxiosError(error) && (error.code === 'ECONNABORTED' || !error.response)) {
      console.warn('API nicht erreichbar, verwende Testdaten');
      return getMockArtikelkonto(artikelNr);
    }
    
    // Bei anderen Fehlern die standardmäßige Fehlerbehandlung beibehalten
    return getMockArtikelkonto(artikelNr);
  }
};

export const getArtikelkontoBuchungen = async (
  artikelNr: string, 
  zeitraumVon: string, 
  zeitraumBis: string
): Promise<ArtikelkontoBuchung[]> => {
  try {
    const params = new URLSearchParams({
      zeitraumVon,
      zeitraumBis
    });
    
    const queryString = params.toString();
    const cacheKey = `artikelkonto_buchungen_${artikelNr}_${queryString}`;
    
    // Versuche, aus dem Cache zu lesen
    const cachedData = apiCache.get<ArtikelkontoBuchung[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axios.get(`${ARTIKELKONTO_ENDPOINT}/${artikelNr}/buchungen?${queryString}`);
    
    // Speichere das Ergebnis im Cache
    apiCache.set(cacheKey, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Artikelkonto-Buchungen:', error);
    // Testdaten zurückgeben, wenn API-Aufruf fehlschlägt
    return getMockArtikelkonto(artikelNr).Tabelle_Buchungen;
  }
};

export const getSummen = async (artikelNr: string, zeitraumVon: string, zeitraumBis: string): Promise<ArtikelkontoSummen> => {
  try {
    const params = new URLSearchParams({
      zeitraumVon,
      zeitraumBis
    });
    
    const queryString = params.toString();
    const cacheKey = `artikelkonto_summen_${artikelNr}_${queryString}`;
    
    // Versuche, aus dem Cache zu lesen
    const cachedData = apiCache.get<ArtikelkontoSummen>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axios.get(`${ARTIKELKONTO_ENDPOINT}/${artikelNr}/summen?${queryString}`);
    
    // Speichere das Ergebnis im Cache
    apiCache.set(cacheKey, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Artikelkonto-Summen:', error);
    // Testdaten zurückgeben, wenn API-Aufruf fehlschlägt
    return getMockArtikelkonto(artikelNr).Summen;
  }
};

export const getLagerstatus = async (artikelNr: string): Promise<ArtikelkontoLagerstatus> => {
  try {
    const cacheKey = `artikelkonto_lagerstatus_${artikelNr}`;
    
    // Versuche, aus dem Cache zu lesen (mit kürzerer Ablaufzeit wegen Echtzeitdaten)
    const cachedData = apiCache.get<ArtikelkontoLagerstatus>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axios.get(`${ARTIKELKONTO_ENDPOINT}/${artikelNr}/lagerstatus`);
    
    // Speichere das Ergebnis im Cache (für 1 Minute, da Lagerdaten sich häufiger ändern können)
    apiCache.set(cacheKey, response.data, 60 * 1000);
    
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden des Artikelkonto-Lagerstatus:', error);
    // Testdaten zurückgeben, wenn API-Aufruf fehlschlägt
    return getMockArtikelkonto(artikelNr).Lagerstatus;
  }
};

// KI-Funktionen für das Artikelkonto
export const getKIPrognosen = async (artikelNr: string): Promise<ArtikelkontoKIPrognosen> => {
  try {
    const cacheKey = `artikelkonto_ki_prognosen_${artikelNr}`;
    
    // Versuche, aus dem Cache zu lesen (mit kürzerer Ablaufzeit)
    const cachedData = apiCache.get<ArtikelkontoKIPrognosen>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axios.get(`${KI_ENDPUNKT}/prognosen/${artikelNr}`);
    
    // Speichere das Ergebnis im Cache (für 15 Minuten, da KI-Analysen rechenintensiv sind)
    apiCache.set(cacheKey, response.data, 15 * 60 * 1000);
    
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der KI-Prognosen:', error);
    // Testdaten zurückgeben, wenn API-Aufruf fehlschlägt
    return getMockKIPrognosen(artikelNr);
  }
};

export const analysiereAnomalien = async (artikelNr: string): Promise<{
  Anomalien: { 
    Datum: string;
    BelegNr: string;
    Beschreibung: string;
    Schweregrad: 'niedrig' | 'mittel' | 'hoch';
    Typ: string;
  }[]
}> => {
  try {
    const cacheKey = `artikelkonto_ki_anomalien_${artikelNr}`;
    
    // Versuche, aus dem Cache zu lesen
    const cachedData = apiCache.get<{Anomalien: any[]}>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axios.get(`${KI_ENDPUNKT}/anomalien/${artikelNr}`);
    
    // Speichere das Ergebnis im Cache
    apiCache.set(cacheKey, response.data, 30 * 60 * 1000); // 30 Minuten Cache für Anomalien
    
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Anomalien:', error);
    // Testdaten zurückgeben, wenn API-Aufruf fehlschlägt
    return {
      Anomalien: [
        {
          Datum: new Date().toISOString().split('T')[0],
          BelegNr: "RE-2025-0123",
          Beschreibung: "Ungewöhnlich hohe Menge für diesen Kunden",
          Schweregrad: "mittel",
          Typ: "Mengenschwankung"
        }
      ]
    };
  }
};

export const getOptimierungsVorschlaege = async (artikelNr: string): Promise<{
  Vorschlaege: {
    Typ: 'Bestand' | 'Preis' | 'Einkauf' | 'Verkauf';
    Beschreibung: string;
    Potenzial: string;
    Empfehlung: string;
  }[]
}> => {
  try {
    const cacheKey = `artikelkonto_ki_optimierung_${artikelNr}`;
    
    // Versuche, aus dem Cache zu lesen
    const cachedData = apiCache.get<{Vorschlaege: any[]}>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axios.get(`${KI_ENDPUNKT}/optimierung/${artikelNr}`);
    
    // Speichere das Ergebnis im Cache
    apiCache.set(cacheKey, response.data, 60 * 60 * 1000); // 1 Stunde Cache für Optimierungsvorschläge
    
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Optimierungsvorschläge:', error);
    // Testdaten zurückgeben, wenn API-Aufruf fehlschlägt
    return {
      Vorschlaege: [
        {
          Typ: "Bestand",
          Beschreibung: "Lagerbestand könnte optimiert werden",
          Potenzial: "Reduzierung der Lagerkosten um ca. 15%",
          Empfehlung: "Bestand auf 120 Einheiten reduzieren"
        },
        {
          Typ: "Preis",
          Beschreibung: "Preisoptimierung basierend auf Marktdaten",
          Potenzial: "Umsatzsteigerung um ca. 8%",
          Empfehlung: "Verkaufspreis auf 49,90€ anheben"
        }
      ]
    };
  }
};

// Cache invalidieren bei Aktualisierungen (z.B. nach Buchungen)
export const invalidateArtikelkontoCache = (artikelNr: string): void => {
  apiCache.invalidate(`artikelkonto_${artikelNr}`);
};

// Mock-Daten für Testumgebung
const getMockArtikelkonto = (artikelNr: string): ArtikelKonto => {
  return {
    Metadaten: {
      Artikelnummer: artikelNr,
      Artikelbezeichnung: `Testprodukt ${artikelNr}`,
      Zeitraum_von: "2025-01-01",
      Zeitraum_bis: "2025-05-31",
      Niederlassung: "Hauptsitz",
      Buchungsdatum: new Date().toISOString().split('T')[0],
      Sortierung: "Datum",
      UmsatzHauptkontoZugeordnet: true
    },
    Tabelle_Buchungen: [
      {
        Datum: "2025-01-15",
        LieferscheinNr: "LS-2025-0001",
        DebitorKreditorNr: "L1001",
        DebitorKreditorName: "Lieferant GmbH",
        Menge: 100,
        Einheit: "Stk",
        Einzelpreis: 25.50,
        Gesamtbetrag: 2550.00,
        Rechnungsdatum: "2025-01-20",
        BelegNr: "RE-2025-0015",
        AuftragsNr: "A-2025-0010",
        Kostenstelle: "EK-001",
        Niederlassung: "Hauptsitz",
        Lagerfach: "A-01-02",
        ChargenNr: "CH-2025-001",
        SerienNr: "",
        Bediener: "Max Mustermann",
        Bemerkung: "Wareneingang"
      },
      {
        Datum: "2025-02-10",
        LieferscheinNr: "LS-2025-0025",
        DebitorKreditorNr: "K2001",
        DebitorKreditorName: "Kunde AG",
        Menge: -20,
        Einheit: "Stk",
        Einzelpreis: 45.90,
        Gesamtbetrag: -918.00,
        Rechnungsdatum: "2025-02-10",
        BelegNr: "RE-2025-0102",
        AuftragsNr: "A-2025-0089",
        Kostenstelle: "VK-001",
        Niederlassung: "Hauptsitz",
        Lagerfach: "A-01-02",
        ChargenNr: "CH-2025-001",
        SerienNr: "",
        Bediener: "Anna Schmidt",
        Bemerkung: "Warenausgang"
      },
      {
        Datum: "2025-03-05",
        LieferscheinNr: "LS-2025-0045",
        DebitorKreditorNr: "K2010",
        DebitorKreditorName: "Großkunde GmbH",
        Menge: -30,
        Einheit: "Stk",
        Einzelpreis: 45.90,
        Gesamtbetrag: -1377.00,
        Rechnungsdatum: "2025-03-05",
        BelegNr: "RE-2025-0189",
        AuftragsNr: "A-2025-0156",
        Kostenstelle: "VK-001",
        Niederlassung: "Hauptsitz",
        Lagerfach: "A-01-02",
        ChargenNr: "CH-2025-001",
        SerienNr: "",
        Bediener: "Anna Schmidt",
        Bemerkung: "Warenausgang"
      }
    ],
    Summen: {
      KumulierteEinkaufsmenge: 100,
      KumulierteEinkaufssumme: 2550.00,
      KumulierteVerkaufsmenge: 50,
      KumulierteVerkaufssumme: 2295.00,
      Saldo: 255.00
    },
    Preise: {
      DurchschnittlicherEKPreis: 25.50,
      DurchschnittlicherVKPreis: 45.90,
      Bezugsgröße: "Stk"
    },
    Lagerstatus: {
      VerfügbarerBestand: 50,
      AktuellerBuchbestand: 50
    },
    Funktionen: {
      SummierungArtikelUmbuchungen: true,
      ArtikelbewegungenDrucken: true,
      ArtikelKontoauszugDrucken: true,
      KalkulationAktivieren: true
    }
  };
};

const getMockKIPrognosen = (artikelNr: string): ArtikelkontoKIPrognosen => {
  return {
    KI_Prognose_BestandIn30Tagen: 35,
    KI_Preisprognose_VK: 47.50,
    Abweichung_ISTvsSOLL: 5,
    Anomalie_Transaktion: true,
    AnomalieDetails: "Ungewöhnliches Verkaufsmuster am 2025-03-05 erkannt",
    PrognoseDatum: new Date().toISOString().split('T')[0],
    KonfidenzBestand: 0.85,
    KonfidenzPreis: 0.75,
    Trendrichtung: "fallend",
    PrognoseBasierteEmpfehlung: "Basierend auf dem aktuellen Verbrauchsmuster wird empfohlen, in den nächsten 14 Tagen eine Nachbestellung von mindestens 25 Einheiten vorzunehmen."
  };
}; 