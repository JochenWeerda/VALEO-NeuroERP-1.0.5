// ERP-Types für Einkauf, Lieferschein, Bestellung, Frachtauftrag
// -------------------------------------------------------------
// Diese Datei enthält dedizierte Interfaces für die Module:
// - Lieferanten-Lieferschein
// - Bestellvorschlag/Bestellung
// - Frachtauftrag
//
// Felder und Bezeichnungen gemäß Nutzer-Vorgabe (2024-06)
//
// Bestehende Typen aus crm.ts werden referenziert, wo sinnvoll.

import { Supplier, Customer } from './crm';

/**
 * Stammdaten für Lieferanten-Lieferschein
 */
export interface DeliveryNoteMasterData {
  lieferant: Supplier | null; // Auswahlfeld für Lieferant
  zwHaendler: string; // ZW-Händler
  lsReferenzNr: string; // LS-Referenz-Nr.
  bearbeiter: string; // Bearbeiter-Kürzel
  datum: string; // Datum (ISO)
  erledigt: boolean; // Abgeschlossen-Checkbox
  lsNr: string; // Lieferscheinnummer
}

/**
 * Position eines Lieferanten-Lieferscheins
 */
export interface DeliveryNotePosition {
  posNr: number;
  artikelNr: string;
  lieferantenArtNr: string;
  artikelbezeichnung: string;
  gebindeNr: string;
  gebinde: string;
  menge: number;
  einheit: string;
  ekPreis: number;
  niederlassung: string;
  lagerhalle: string;
  lagerfach: string;
  charge: string;
  serienNr?: string;
  kontakt?: string;
  preiscode?: string;
  masterNr?: string;
}

/**
 * Summenbereich für Lieferanten-Lieferschein
 */
export interface DeliveryNoteSummary {
  verfuegbarerBestand: number;
  summeGewicht: number;
  nettobetrag: number;
  bruttobetrag: number;
}

/**
 * Bestellvorschlag/Bestellzeile
 */
export interface OrderSuggestionLine {
  lagerNr: string;
  matchcode: string;
  artikelbezeichnung: string;
  bestand: number;
  mindestbestand: number;
  vorschlag: number;
  lieferant: Supplier | null;
  restmenge: number;
  einheit: string;
  ekPreis: number;
  bestellwert: number;
}

/**
 * Frachtauftrag-Kopfbereich
 */
export interface FreightOrderHeader {
  spediteurNr: string;
  lieferTermin: string; // Wunschlieferdatum (ISO)
  ladeDatum: string; // geplantes Verladedatum (ISO)
  kunden: Customer[]; // Auswahl Kunden
  debitorenFilter?: string;
} 