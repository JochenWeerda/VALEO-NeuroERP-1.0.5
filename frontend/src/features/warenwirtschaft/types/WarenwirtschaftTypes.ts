import type { TrustLevel } from '../../../lib/schemas';

// Warenwirtschafts-Module
export interface WarenwirtschaftModule {
  id: string;
  name: string;
  description: string;
  category: 'ein-belege' | 'aus-belege' | 'crm' | 'streckenhandel' | 'schnittstellen' | 'kasse' | 'app' | 'auswertungen';
  trustLevel: TrustLevel;
  confidence?: number;
  features: WarenwirtschaftFeature[];
  icon: string;
  color: string;
}

// Warenwirtschafts-Features
export interface WarenwirtschaftFeature {
  id: string;
  name: string;
  description: string;
  available: boolean;
  trustLevel: TrustLevel;
  confidence?: number;
}

// Eingehende Belege
export interface Wareneingang {
  id: string;
  lieferantId: string;
  lieferantName: string;
  lieferdatum: Date;
  artikel: WareneingangArtikel[];
  status: 'eingetroffen' | 'geprüft' | 'abgelehnt' | 'eingelagert';
  trustLevel: TrustLevel;
  confidence?: number;
}

export interface WareneingangArtikel {
  artikelId: string;
  artikelName: string;
  menge: number;
  einheit: string;
  chargennummer?: string;
  mindesthaltbarkeitsdatum?: Date;
  qualitaetsstatus: 'ok' | 'mangelhaft' | 'zurückgewiesen';
}

export interface Eingangsrechnung {
  id: string;
  rechnungsnummer: string;
  lieferantId: string;
  lieferantName: string;
  rechnungsdatum: Date;
  faelligkeitsdatum: Date;
  betrag: number;
  waehrung: string;
  status: 'eingegangen' | 'geprüft' | 'freigegeben' | 'bezahlt';
  ocrErkannt: boolean;
  trustLevel: TrustLevel;
  confidence?: number;
}

export interface Lieferant {
  id: string;
  name: string;
  anschrift: string;
  telefon: string;
  email: string;
  kundennummer: string;
  zahlungsbedingungen: string;
  bewertung: number; // 1-5 Sterne
  status: 'aktiv' | 'inaktiv' | 'gesperrt';
  trustLevel: TrustLevel;
  confidence?: number;
}

// Ausgehende Belege
export interface Angebot {
  id: string;
  angebotsnummer: string;
  kundeId: string;
  kundeName: string;
  erstellungsdatum: Date;
  gueltigBis: Date;
  positionen: Angebotsposition[];
  gesamtbetrag: number;
  waehrung: string;
  status: 'erstellt' | 'versendet' | 'angenommen' | 'abgelehnt' | 'abgelaufen';
  layout: string;
  trustLevel: TrustLevel;
  confidence?: number;
}

export interface Angebotsposition {
  artikelId: string;
  artikelName: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
  rabatt?: number;
}

export interface Auftrag {
  id: string;
  auftragsnummer: string;
  kundeId: string;
  kundeName: string;
  erstellungsdatum: Date;
  lieferdatum: Date;
  positionen: Auftragsposition[];
  gesamtbetrag: number;
  waehrung: string;
  status: 'erstellt' | 'bestätigt' | 'in_bearbeitung' | 'versandbereit' | 'versendet' | 'abgeschlossen';
  saldoPruefung: boolean;
  dropshipping: boolean;
  trustLevel: TrustLevel;
  confidence?: number;
}

export interface Auftragsposition {
  artikelId: string;
  artikelName: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
  verfuegbar: boolean;
}

export interface Lieferschein {
  id: string;
  lieferscheinnummer: string;
  auftragId: string;
  kundeId: string;
  kundeName: string;
  erstellungsdatum: Date;
  lieferdatum: Date;
  positionen: LieferscheinPosition[];
  status: 'erstellt' | 'versandbereit' | 'versendet' | 'zugestellt';
  trackingNummer?: string;
  versanddienstleister?: string;
  trustLevel: TrustLevel;
  confidence?: number;
}

export interface LieferscheinPosition {
  artikelId: string;
  artikelName: string;
  menge: number;
  einheit: string;
  geliefert: boolean;
}

// CRM für Handel
export interface CrmKontakt {
  id: string;
  name: string;
  typ: 'kunde' | 'lieferant' | 'interessent' | 'partner';
  anschrift: string;
  telefon: string;
  email: string;
  kundennummer?: string;
  status: 'aktiv' | 'inaktiv' | 'gesperrt';
  bewertung: number; // 1-5 Sterne
  letzterKontakt: Date;
  wiedervorlage?: Date;
  notizen: string[];
  trustLevel: TrustLevel;
  confidence?: number;
}

export interface CrmProjekt {
  id: string;
  name: string;
  kundeId: string;
  kundeName: string;
  startdatum: Date;
  enddatum?: Date;
  status: 'aktiv' | 'abgeschlossen' | 'pausiert' | 'storniert';
  beschreibung: string;
  dokumente: CrmDokument[];
  wiedervorlage?: Date;
  trustLevel: TrustLevel;
  confidence?: number;
}

export interface CrmDokument {
  id: string;
  name: string;
  typ: 'pdf' | 'doc' | 'xls' | 'email' | 'notiz';
  groesse: number;
  erstellungsdatum: Date;
  kategorie: string;
  tags: string[];
  url: string;
  trustLevel: TrustLevel;
  confidence?: number;
}

// Streckenhandel
export interface Strecke {
  id: string;
  name: string;
  beschreibung: string;
  rohstoffId: string;
  rohstoffName: string;
  fertigwareId: string;
  fertigwareName: string;
  lieferantId: string;
  lieferantName: string;
  kundeId: string;
  kundeName: string;
  kontraktId: string;
  startdatum: Date;
  enddatum: Date;
  status: 'aktiv' | 'abgeschlossen' | 'pausiert';
  farbmarkierung: string;
  trustLevel: TrustLevel;
  confidence?: number;
}

export interface Kontrakt {
  id: string;
  kontraktnummer: string;
  lieferantId: string;
  lieferantName: string;
  kundeId: string;
  kundeName: string;
  startdatum: Date;
  enddatum: Date;
  bedingungen: string;
  status: 'aktiv' | 'abgelaufen' | 'gekuendigt';
  trustLevel: TrustLevel;
  confidence?: number;
}

// EDI-Schnittstellen
export interface EdiNachricht {
  id: string;
  typ: 'ORDERS' | 'DESADV' | 'INVOIC' | 'IFTMIN' | 'IFCSUM';
  partnerId: string;
  partnerName: string;
  erstellungsdatum: Date;
  status: 'erstellt' | 'gesendet' | 'empfangen' | 'verarbeitet' | 'fehler';
  inhalt: string;
  trustLevel: TrustLevel;
  confidence?: number;
}

// Logistik-Schnittstellen
export interface LogistikSchnittstelle {
  id: string;
  name: string;
  typ: 'UPS' | 'DHL' | 'DPD' | 'GLS' | 'custom';
  aktiv: boolean;
  apiKey?: string;
  endpoint?: string;
  letzterTest: Date;
  status: 'online' | 'offline' | 'fehler';
  trustLevel: TrustLevel;
  confidence?: number;
}

// Kassensystem
export interface Kassensystem {
  id: string;
  kassenId: string;
  name: string;
  status: 'aktiv' | 'inaktiv' | 'wartung';
  tseAktiv: boolean;
  letzterTest: Date;
  tagesumsatz: number;
  transaktionen: number;
  fehler: number;
  compliance: 'konform' | 'warnung' | 'nicht_konform';
}

export interface Kassenbeleg {
  id: string;
  belegnummer: string;
  datum: Date;
  betrag: number;
  zahlungsart: string;
  tseSignatur: string;
  status: 'erfolgreich' | 'fehler' | 'storniert';
}

export interface Kassenposition {
  artikelId: string;
  artikelName: string;
  menge: number;
  einzelpreis: number;
  gesamtpreis: number;
  mwst: number;
}

// L3-App
export interface MobileTour {
  id: string;
  tournummer: string;
  kommissioniererId: string;
  kommissioniererName: string;
  startdatum: Date;
  enddatum?: Date;
  positionen: TourPosition[];
  status: 'geplant' | 'aktiv' | 'abgeschlossen' | 'storniert';
  geraetId: string;
  trustLevel: TrustLevel;
  confidence?: number;
}

export interface TourPosition {
  artikelId: string;
  artikelName: string;
  menge: number;
  lagerplatz: string;
  gescannt: boolean;
  scanDatum?: Date;
}

// Betriebsauswertungen
export interface Betriebsauswertung {
  id: string;
  name: string;
  typ: 'umsatz' | 'bestand' | 'lieferanten' | 'kunden' | 'artikel';
  zeitraum: 'tag' | 'woche' | 'monat' | 'quartal' | 'jahr';
  startdatum: Date;
  enddatum: Date;
  daten: AuswertungsDaten[];
  trustLevel: TrustLevel;
  confidence?: number;
}

export interface AuswertungsDaten {
  kategorie: string;
  wert: number;
  einheit: string;
  trend: 'up' | 'down' | 'neutral';
  aenderung: number;
}

export interface Lieferantenbewertung {
  id: string;
  lieferantId: string;
  lieferantName: string;
  bewertungsdatum: Date;
  kriterien: Bewertungskriterium[];
  gesamtbewertung: number;
  status: 'gut' | 'mittel' | 'schlecht';
  trustLevel: TrustLevel;
  confidence?: number;
}

export interface Bewertungskriterium {
  name: string;
  gewichtung: number;
  bewertung: number;
  kommentar?: string;
}

export interface Bestandsauswertung {
  id: string;
  artikelId: string;
  artikelName: string;
  aktuellerBestand: number;
  mindestbestand: number;
  maximalbestand: number;
  durchschnittsverbrauch: number;
  lieferzeit: number;
  bewertung: 'normal' | 'niedrig' | 'kritisch' | 'ueberbestand';
  trustLevel: TrustLevel;
  confidence?: number;
} 