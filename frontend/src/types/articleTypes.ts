/**
 * Definiert die Typen von Artikeln, die im System verfügbar sind.
 * Bestimmte Artikeltypen erfordern eine spezielle Behandlung, wie z.B. Chargenverfolgung.
 */

export type ArticleType = 
  | 'FUTTERMITTEL'    // Chargenpflichtig mit MHD
  | 'SAATGUT'         // Chargenpflichtig mit MHD
  | 'DÜNGEMITTEL'     // Chargenpflichtig
  | 'PFLANZENSCHUTZ'  // Chargenpflichtig mit MHD und besonderen Dokumentationsanforderungen
  | 'STANDARD'        // Keine spezielle Behandlung erforderlich
  | 'DIENSTLEISTUNG'; // Keine physische Ware, keine Chargenverfolgung

/**
 * Buchungsregeln für Lagerplätze und Chargen
 */
export type BuchungsregelType = 
  | 'FIFO' // First In First Out - älteste Ware zuerst verwenden
  | 'LIFO' // Last In First Out - neueste Ware zuerst verwenden
  | 'MIX'; // Chargen vermischen sich (z.B. bei Flüssigkeiten in Tanks)

/**
 * Lagerplatzeigenschaften, die die Buchungsregel beeinflussen
 */
export interface LagerplatzEigenschaften {
  buchungsregel: BuchungsregelType;
  istSilo?: boolean;        // Silo-Eigenschaften können die Buchungsregel beeinflussen
  istTank?: boolean;        // Tanks führen typischerweise zu einer Vermischung der Chargen
  isBulkStorage?: boolean;  // Schüttgut-Lager haben spezielle Anforderungen
  temperaturKontrolliert?: boolean; // Beeinflusst das MHD
  kapazität?: number;       // Maximale Kapazität des Lagerplatzes
}

/**
 * Chargeneigenschaften für die Chargenverwaltung
 */
export interface ChargeProperties {
  chargennummer: string;
  artikelId: string;
  menge: number;
  mhd?: string;              // Mindesthaltbarkeitsdatum
  herstellungsdatum?: string; // Produktionsdatum
  lagerplatz?: string;       // Aktueller Lagerplatz
  einlagerungsdatum: string; // Wann die Charge eingelagert wurde
  qualitaetsfreigabe?: boolean; // Ob die Charge für die Verwendung freigegeben wurde
  gesperrt?: boolean;        // Ob die Charge gesperrt ist (z.B. bei Qualitätsproblemen)
  sperrgründe?: string[];    // Gründe für eine etwaige Sperrung
  zertifikate?: string[];    // Verknüpfte Zertifikate oder Dokumente
  herkunft?: string;         // Herkunftsland oder -region
  lieferant?: string;        // Lieferant der Charge
  belegnummer?: string;      // Belegnummer der Einlagerung (z.B. Lieferscheinnummer)
}

/**
 * Interface für Artikel, die in der Anwendung verwendet werden
 */
export interface Artikel {
  id: string;
  artikelnummer: string;
  bezeichnung: string;
  beschreibung?: string;
  artikelTyp: ArticleType;
  standardpreis: number;
  einheit: string;
  istChargenpflichtig: boolean;
  mhdPflichtig: boolean;
  standardBuchungsregel: BuchungsregelType;
  standardLagerplatz?: string;
  herstellerartikelnummer?: string;
  alternativeArtikel?: string[]; // IDs von alternativen Artikeln
  eanCodes?: string[];
  aktiv: boolean;
  erstelltAm: string;
  letztesUpdate?: string;
} 