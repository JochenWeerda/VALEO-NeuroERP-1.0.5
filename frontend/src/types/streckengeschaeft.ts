import { z } from 'zod';

/**
 * Streckengeschäft - Hauptinterface basierend auf zvoove Handel
 * 
 * Repräsentiert eine Handelsstrecke zwischen Lieferant und Kunde
 * mit Artikel, Mengen, Preisen und Frachtkosten
 */
export interface Streckengeschaeft {
  // Identifikation
  streckeNr: string;
  vorgangsTyp: VorgangsTyp;
  datum: string;
  vorgangPosition: string;
  positionsNr: string;
  
  // Artikel-Referenzen
  artikelVon: string;
  artikelBis: string;
  artikelBezeichnung: string;
  artikelNr: string;
  sortenNr?: string;
  
  // Verträge und Lieferscheine
  vertrag: string;
  lieferschein: string;
  kennzeichen: string;
  lkwKennzeichen?: string;
  
  // Mengen und Preise
  menge: number;
  einheit: string;
  ekPreis: number; // Einkaufspreis
  vkPreis: number; // Verkaufspreis
  frachtkosten: number;
  preisProEinheit: number;
  
  // EK-Details
  ekMenge: number;
  ekNetto: number;
  ekLieferkosten: number;
  ekRechnung: string;
  ekKontakt: string;
  ekKontaktNr: string;
  
  // VK-Details
  vkMenge: number;
  vkNetto: number;
  vkLieferkosten: number;
  vkRechnung: string;
  vkKontakt: string;
  vkKontaktNr: string;
  
  // Partner
  lieferant: string;
  lieferantName: string;
  lieferantNr: string;
  kunde: string;
  kundeName: string;
  kundeNr: string;
  
  // Spedition
  spediteurNr: string;
  spediteurName: string;
  frachtart: string;
  
  // Be-/Entladestelle
  beEntladestelle: string;
  beEntladestellePLZ: string;
  land: string;
  
  // Partie/NLS
  partienNr?: string;
  nlsNr?: string;
  
  // Sonstige
  bereich: string;
  spediteur?: string;
  start?: string;
  ursprung?: string;
  lagerhalle?: string;
  fahrzeugKennzeichen?: string;
  kostenstelle?: string;
  bedarfsnummer?: string;
  
  // Berechnungen
  summeVk: number;
  summeEk: number;
  restwert: number;
  geplanteMengeVk: number;
  geplanteMengeEk?: number;
  
  // Status und Metadaten
  status: StreckenStatus;
  erstelltAm: string;
  geaendertAm: string;
  erstelltVon: string;
  
  // Optionale Felder
  bemerkung?: string;
  referenzNr?: string;
  waehrung?: string;
  skonto?: number;
  rabatt?: number;
  
  // Biomasse-Flag
  istBiomasse?: boolean;
  
  // Rechnungs-Flags
  hatEingangsrechnung?: boolean;
  hatSpeditionsrechnung?: boolean;
  hatFrachtabrechnung?: boolean;
  
  // Deckungsbeitrag
  deckungsbeitrag?: number;
}

/**
 * Vorgangstypen für Streckengeschäfte
 */
export enum VorgangsTyp {
  KAUF = 'kauf',
  VERKAUF = 'verkauf',
  UMTASCH = 'umtausch',
  RÜCKGABE = 'rueckgabe'
}

/**
 * Status einer Strecke
 */
export enum StreckenStatus {
  ENTWURF = 'entwurf',
  BESTÄTIGT = 'bestaetigt',
  IN_BEARBEITUNG = 'in_bearbeitung',
  ABGESCHLOSSEN = 'abgeschlossen',
  STORNIERT = 'storniert',
  ERLEDIGT = 'erledigt',
  UNERLEDIGT = 'unerledigt'
}

/**
 * Biomasse-Optionen
 */
export enum BiomasseOption {
  ALLE = 'alle',
  NUR_BIOMASSE = 'nur_biomasse'
}

/**
 * Erweiterte Filter-Interface für die Streckengeschäft-Suche
 */
export interface StreckengeschaeftFilter {
  // STRECKE
  streckeNrVon?: string;
  streckeNrBis?: string;
  artikelNrVon?: string;
  artikelNrBis?: string;
  nurErledigte?: boolean;
  nurUnerledigte?: boolean;
  vorgaengeGetrennt?: boolean;
  
  // LIEFERANTEN/KUNDEN
  lieferantNrVon?: string;
  lieferantNrBis?: string;
  kundeNrVon?: string;
  kundeNrBis?: string;
  nurOhneLieferant?: boolean;
  nurOhneKunde?: boolean;
  
  // KONTRAKTE
  ekKontaktNrVon?: string;
  ekKontaktNrBis?: string;
  vkKontaktNrVon?: string;
  vkKontaktNrBis?: string;
  biomasseOption?: BiomasseOption;
  
  // LIEFERRECHNUNG
  lieferRechnungsdatumVon?: string;
  lieferRechnungsdatumBis?: string;
  lkwKennzeichenVon?: string;
  lkwKennzeichenBis?: string;
  keineEingangsrechnung?: boolean;
  keineSpeditionsrechnung?: boolean;
  keineFrachtabrechnung?: boolean;
  deckungsbeitragAusStreckendaten?: boolean;
  
  // BE-/ENTLADESTELLE
  land?: string;
  beEntladestellePLZVon?: string;
  beEntladestellePLZBis?: string;
  
  // PARTIE/NLS
  partienNrVon?: string;
  partienNrBis?: string;
  nlsNrVon?: string;
  nlsNrBis?: string;
  
  // SONSTIGE SELEKTIONEN
  spediteur?: string;
  start?: string;
  ursprung?: string;
  lagerhalle?: string;
  fahrzeugKennzeichen?: string;
  sortenNr?: string;
  kostenstelle?: string;
  bedarfsnummer?: string;
  
  // Allgemeine Filter
  vorgangsTyp?: VorgangsTyp;
  datumVon?: string;
  datumBis?: string;
  status?: StreckenStatus;
  minMenge?: number;
  maxMenge?: number;
  minEkPreis?: number;
  maxEkPreis?: number;
  minVkPreis?: number;
  maxVkPreis?: number;
}

/**
 * Formular-Daten für neue/zu bearbeitende Strecken
 */
export interface StreckengeschaeftFormData {
  streckeNr: string;
  vorgangsTyp: VorgangsTyp;
  datum: string;
  vorgangPosition: string;
  positionsNr: string;
  artikelVon: string;
  artikelBis: string;
  artikelBezeichnung: string;
  artikelNr: string;
  sortenNr?: string;
  vertrag: string;
  lieferschein: string;
  kennzeichen: string;
  lkwKennzeichen?: string;
  menge: number;
  einheit: string;
  ekPreis: number;
  vkPreis: number;
  frachtkosten: number;
  preisProEinheit: number;
  ekMenge: number;
  ekNetto: number;
  ekLieferkosten: number;
  ekRechnung: string;
  ekKontakt: string;
  ekKontaktNr: string;
  vkMenge: number;
  vkNetto: number;
  vkLieferkosten: number;
  vkRechnung: string;
  vkKontakt: string;
  vkKontaktNr: string;
  lieferant: string;
  lieferantName: string;
  lieferantNr: string;
  kunde: string;
  kundeName: string;
  kundeNr: string;
  spediteurNr: string;
  spediteurName: string;
  frachtart: string;
  beEntladestelle: string;
  beEntladestellePLZ: string;
  land: string;
  partienNr?: string;
  nlsNr?: string;
  bereich: string;
  spediteur?: string;
  start?: string;
  ursprung?: string;
  lagerhalle?: string;
  fahrzeugKennzeichen?: string;
  kostenstelle?: string;
  bedarfsnummer?: string;
  summeVk: number;
  summeEk: number;
  restwert: number;
  geplanteMengeVk: number;
  geplanteMengeEk?: number;
  bemerkung?: string;
  referenzNr?: string;
  waehrung?: string;
  skonto?: number;
  rabatt?: number;
  istBiomasse?: boolean;
  hatEingangsrechnung?: boolean;
  hatSpeditionsrechnung?: boolean;
  hatFrachtabrechnung?: boolean;
  deckungsbeitrag?: number;
}

/**
 * Summen-Interface für Berechnungen
 */
export interface StreckengeschaeftSummen {
  ekBetragInklMwSt: number;
  vkBetragInklMwSt: number;
  frachtkosten: number;
  sollDifferenz: number;
  istDifferenz: number;
  mwst: number;
  deckungsbeitrag: number;
  differenzSollIst: number;
  restMenge: number;
  restWert: number;
  geplanteMengenEk: number;
  geplanteMengenVk: number;
}

/**
 * Zod-Schema für Validierung
 */
export const StreckengeschaeftSchema = z.object({
  streckeNr: z.string().min(1, 'Strecken-Nr. ist erforderlich'),
  vorgangsTyp: z.nativeEnum(VorgangsTyp),
  datum: z.string().min(1, 'Datum ist erforderlich'),
  vorgangPosition: z.string().min(1, 'Vorgangsposition ist erforderlich'),
  positionsNr: z.string().min(1, 'Positions-Nr. ist erforderlich'),
  artikelVon: z.string().min(1, 'Artikel von ist erforderlich'),
  artikelBis: z.string().min(1, 'Artikel bis ist erforderlich'),
  artikelBezeichnung: z.string().min(1, 'Artikelbezeichnung ist erforderlich'),
  artikelNr: z.string().min(1, 'Artikel-Nr. ist erforderlich'),
  sortenNr: z.string().optional(),
  vertrag: z.string().min(1, 'Vertrag ist erforderlich'),
  lieferschein: z.string().min(1, 'Lieferschein ist erforderlich'),
  kennzeichen: z.string().min(1, 'Kennzeichen ist erforderlich'),
  lkwKennzeichen: z.string().optional(),
  menge: z.number().positive('Menge muss positiv sein'),
  einheit: z.string().min(1, 'Einheit ist erforderlich'),
  ekPreis: z.number().min(0, 'EK-Preis darf nicht negativ sein'),
  vkPreis: z.number().min(0, 'VK-Preis darf nicht negativ sein'),
  frachtkosten: z.number().min(0, 'Frachtkosten dürfen nicht negativ sein'),
  preisProEinheit: z.number().min(0, 'Preis pro Einheit darf nicht negativ sein'),
  ekMenge: z.number().positive('EK-Menge muss positiv sein'),
  ekNetto: z.number().min(0, 'EK-Netto darf nicht negativ sein'),
  ekLieferkosten: z.number().min(0, 'EK-Lieferkosten dürfen nicht negativ sein'),
  ekRechnung: z.string().min(1, 'EK-Rechnung ist erforderlich'),
  ekKontakt: z.string().min(1, 'EK-Kontakt ist erforderlich'),
  ekKontaktNr: z.string().min(1, 'EK-Kontakt-Nr. ist erforderlich'),
  vkMenge: z.number().positive('VK-Menge muss positiv sein'),
  vkNetto: z.number().min(0, 'VK-Netto darf nicht negativ sein'),
  vkLieferkosten: z.number().min(0, 'VK-Lieferkosten dürfen nicht negativ sein'),
  vkRechnung: z.string().min(1, 'VK-Rechnung ist erforderlich'),
  vkKontakt: z.string().min(1, 'VK-Kontakt ist erforderlich'),
  vkKontaktNr: z.string().min(1, 'VK-Kontakt-Nr. ist erforderlich'),
  lieferant: z.string().min(1, 'Lieferant ist erforderlich'),
  lieferantName: z.string().min(1, 'Lieferantname ist erforderlich'),
  lieferantNr: z.string().min(1, 'Lieferant-Nr. ist erforderlich'),
  kunde: z.string().min(1, 'Kunde ist erforderlich'),
  kundeName: z.string().min(1, 'Kundenname ist erforderlich'),
  kundeNr: z.string().min(1, 'Kunde-Nr. ist erforderlich'),
  spediteurNr: z.string().min(1, 'Spediteur-Nr. ist erforderlich'),
  spediteurName: z.string().min(1, 'Spediteurname ist erforderlich'),
  frachtart: z.string().min(1, 'Frachtart ist erforderlich'),
  beEntladestelle: z.string().min(1, 'Be-/Entladestelle ist erforderlich'),
  beEntladestellePLZ: z.string().min(1, 'PLZ Be-/Entladestelle ist erforderlich'),
  land: z.string().min(1, 'Land ist erforderlich'),
  partienNr: z.string().optional(),
  nlsNr: z.string().optional(),
  bereich: z.string().min(1, 'Bereich ist erforderlich'),
  spediteur: z.string().optional(),
  start: z.string().optional(),
  ursprung: z.string().optional(),
  lagerhalle: z.string().optional(),
  fahrzeugKennzeichen: z.string().optional(),
  kostenstelle: z.string().optional(),
  bedarfsnummer: z.string().optional(),
  summeVk: z.number().min(0, 'Summe VK darf nicht negativ sein'),
  summeEk: z.number().min(0, 'Summe EK darf nicht negativ sein'),
  restwert: z.number().min(0, 'Restwert darf nicht negativ sein'),
  geplanteMengeVk: z.number().min(0, 'Geplante Menge VK darf nicht negativ sein'),
  geplanteMengeEk: z.number().min(0).optional(),
  bemerkung: z.string().optional(),
  referenzNr: z.string().optional(),
  waehrung: z.string().default('EUR'),
  skonto: z.number().min(0).max(100).optional(),
  rabatt: z.number().min(0).max(100).optional(),
  istBiomasse: z.boolean().optional(),
  hatEingangsrechnung: z.boolean().optional(),
  hatSpeditionsrechnung: z.boolean().optional(),
  hatFrachtabrechnung: z.boolean().optional(),
  deckungsbeitrag: z.number().optional(),
});

/**
 * Zod-Schema für erweiterte Filter
 */
export const StreckengeschaeftFilterSchema = z.object({
  // STRECKE
  streckeNrVon: z.string().optional(),
  streckeNrBis: z.string().optional(),
  artikelNrVon: z.string().optional(),
  artikelNrBis: z.string().optional(),
  nurErledigte: z.boolean().optional(),
  nurUnerledigte: z.boolean().optional(),
  vorgaengeGetrennt: z.boolean().optional(),
  
  // LIEFERANTEN/KUNDEN
  lieferantNrVon: z.string().optional(),
  lieferantNrBis: z.string().optional(),
  kundeNrVon: z.string().optional(),
  kundeNrBis: z.string().optional(),
  nurOhneLieferant: z.boolean().optional(),
  nurOhneKunde: z.boolean().optional(),
  
  // KONTRAKTE
  ekKontaktNrVon: z.string().optional(),
  ekKontaktNrBis: z.string().optional(),
  vkKontaktNrVon: z.string().optional(),
  vkKontaktNrBis: z.string().optional(),
  biomasseOption: z.nativeEnum(BiomasseOption).optional(),
  
  // LIEFERRECHNUNG
  lieferRechnungsdatumVon: z.string().optional(),
  lieferRechnungsdatumBis: z.string().optional(),
  lkwKennzeichenVon: z.string().optional(),
  lkwKennzeichenBis: z.string().optional(),
  keineEingangsrechnung: z.boolean().optional(),
  keineSpeditionsrechnung: z.boolean().optional(),
  keineFrachtabrechnung: z.boolean().optional(),
  deckungsbeitragAusStreckendaten: z.boolean().optional(),
  
  // BE-/ENTLADESTELLE
  land: z.string().optional(),
  beEntladestellePLZVon: z.string().optional(),
  beEntladestellePLZBis: z.string().optional(),
  
  // PARTIE/NLS
  partienNrVon: z.string().optional(),
  partienNrBis: z.string().optional(),
  nlsNrVon: z.string().optional(),
  nlsNrBis: z.string().optional(),
  
  // SONSTIGE SELEKTIONEN
  spediteur: z.string().optional(),
  start: z.string().optional(),
  ursprung: z.string().optional(),
  lagerhalle: z.string().optional(),
  fahrzeugKennzeichen: z.string().optional(),
  sortenNr: z.string().optional(),
  kostenstelle: z.string().optional(),
  bedarfsnummer: z.string().optional(),
  
  // Allgemeine Filter
  vorgangsTyp: z.nativeEnum(VorgangsTyp).optional(),
  datumVon: z.string().optional(),
  datumBis: z.string().optional(),
  status: z.nativeEnum(StreckenStatus).optional(),
  minMenge: z.number().optional(),
  maxMenge: z.number().optional(),
  minEkPreis: z.number().optional(),
  maxEkPreis: z.number().optional(),
  minVkPreis: z.number().optional(),
  maxVkPreis: z.number().optional(),
});

/**
 * Tabellen-Spalten-Definition
 */
export interface StreckengeschaeftColumn {
  key: string;
  title: string;
  dataIndex: keyof Streckengeschaeft;
  width?: number;
  fixed?: 'left' | 'right';
  sorter?: boolean;
  filters?: { text: string; value: string }[];
  render?: (value: any, record: Streckengeschaeft) => React.ReactNode;
}

/**
 * Export-Typen
 */
export type StreckengeschaeftFormDataFromSchema = z.infer<typeof StreckengeschaeftSchema>;
export type StreckengeschaeftFilterFromSchema = z.infer<typeof StreckengeschaeftFilterSchema>;

/**
 * Utility-Funktionen
 */
export const getVorgangsTypLabel = (typ: VorgangsTyp): string => {
  const labels = {
    [VorgangsTyp.KAUF]: 'Kauf',
    [VorgangsTyp.VERKAUF]: 'Verkauf',
    [VorgangsTyp.UMTASCH]: 'Umtausch',
    [VorgangsTyp.RÜCKGABE]: 'Rückgabe'
  };
  return labels[typ] || typ;
};

export const getStatusLabel = (status: StreckenStatus): string => {
  const labels = {
    [StreckenStatus.ENTWURF]: 'Entwurf',
    [StreckenStatus.BESTÄTIGT]: 'Bestätigt',
    [StreckenStatus.IN_BEARBEITUNG]: 'In Bearbeitung',
    [StreckenStatus.ABGESCHLOSSEN]: 'Abgeschlossen',
    [StreckenStatus.STORNIERT]: 'Storniert',
    [StreckenStatus.ERLEDIGT]: 'Erledigt',
    [StreckenStatus.UNERLEDIGT]: 'Unerledigt'
  };
  return labels[status] || status;
};

export const getStatusColor = (status: StreckenStatus): string => {
  const colors = {
    [StreckenStatus.ENTWURF]: 'default',
    [StreckenStatus.BESTÄTIGT]: 'processing',
    [StreckenStatus.IN_BEARBEITUNG]: 'warning',
    [StreckenStatus.ABGESCHLOSSEN]: 'success',
    [StreckenStatus.STORNIERT]: 'error',
    [StreckenStatus.ERLEDIGT]: 'success',
    [StreckenStatus.UNERLEDIGT]: 'warning'
  };
  return colors[status] || 'default';
};

export const getBiomasseOptionLabel = (option: BiomasseOption): string => {
  const labels = {
    [BiomasseOption.ALLE]: 'Alle',
    [BiomasseOption.NUR_BIOMASSE]: 'Nur Biomasse'
  };
  return labels[option] || option;
};

/**
 * Berechnungsfunktionen
 */
export const calculateGewinn = (vkPreis: number, ekPreis: number, menge: number, frachtkosten: number = 0): number => {
  return (vkPreis - ekPreis) * menge - frachtkosten;
};

export const calculateGewinnmarge = (vkPreis: number, ekPreis: number): number => {
  if (ekPreis === 0) return 0;
  return ((vkPreis - ekPreis) / ekPreis) * 100;
};

export const calculateDeckungsbeitrag = (vkBetrag: number, ekBetrag: number, frachtkosten: number): number => {
  return vkBetrag - ekBetrag - frachtkosten;
};

export const calculateMwSt = (betrag: number, mwstSatz: number = 19): number => {
  return betrag * (mwstSatz / 100);
};

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('de-DE').format(num);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('de-DE');
}; 