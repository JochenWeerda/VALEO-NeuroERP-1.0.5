export interface MobileTour {
  id: string;
  tournummer: string;
  kommissioniererId: string;
  kommissioniererName: string;
  status: 'geplant' | 'aktiv' | 'abgeschlossen' | 'storniert';
  startdatum?: Date;
  enddatum?: Date;
  positionen: TourPosition[];
  fortschritt: number;
  bemerkungen?: string;
}

export interface TourPosition {
  id: string;
  artikelId: string;
  artikelName: string;
  menge: number;
  lagerplatz: string;
  gescannt: boolean;
  scanDatum?: Date;
  status: 'offen' | 'gescannt' | 'fehler';
  bemerkungen?: string;
}

export interface Kommissionierer {
  id: string;
  name: string;
  status: 'verfuegbar' | 'beschaeftigt' | 'offline';
  aktuelleTour?: string;
  letzteAktivitaet: Date;
  performance: number;
}

export interface Artikel {
  id: string;
  name: string;
  bestand: number;
  kategorie: string;
  preis: number;
  lagerplatz: string;
  lieferant: string;
  mindestbestand: number;
  maxbestand: number;
  einheit: string;
  status: 'aktiv' | 'inaktiv';
}

export interface Lieferant {
  id: string;
  name: string;
  status: 'aktiv' | 'inaktiv';
  email: string;
  telefon: string;
  adresse: string;
  kategorie: string;
  bewertung: number;
}

export interface Wareneingang {
  id: string;
  lieferantId: string;
  lieferantName: string;
  datum: string;
  status: 'eingetroffen' | 'in_bearbeitung' | 'abgeschlossen';
  positionen: WareneingangPosition[];
  bemerkungen?: string;
}

export interface WareneingangPosition {
  artikelId: string;
  artikelName: string;
  bestellt: number;
  geliefert: number;
  preis: number;
  lagerplatz: string;
} 