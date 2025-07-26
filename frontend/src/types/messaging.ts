// Nachrichtensystem TypeScript-Interfaces für VALEO NeuroERP
// Basierend auf zvoove Handel Struktur mit KI-Erweiterungen

export interface NachrichtEntwurf {
  id?: string;
  empfaengerGruppe: EmpfaengerGruppe;
  betreff: string;
  inhalt: string;
  leseBestaetigungErforderlich: boolean;
  archivierungErzwingen: boolean;
  autoProtokollAnhaengen: boolean;
  kiGeneriert?: boolean;
  kontext?: NachrichtenKontext;
  erstelltAm?: Date;
  erstelltVon?: string;
  status: NachrichtenStatus;
}

export interface Nachricht extends NachrichtEntwurf {
  id: string;
  empfaenger: Empfaenger[];
  gelesenVon: string[];
  bestaetigtVon: string[];
  erstelltAm: Date;
  erstelltVon: string;
  gesendetAm?: Date;
  archiviertAm?: Date;
  prioritaet: NachrichtenPrioritaet;
  kategorie: NachrichtenKategorie;
  tags: string[];
  attachments?: Attachment[];
}

export interface Empfaenger {
  id: string;
  name: string;
  email?: string;
  gruppe: EmpfaengerGruppe;
  rolle: BenutzerRolle;
  gelesenAm?: Date;
  bestaetigtAm?: Date;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface NachrichtenKontext {
  modul?: string; // 'neuroflow', 'streckengeschaeft', 'pos', etc.
  prozess?: string; // 'bestellung', 'lieferung', 'rechnung', etc.
  referenzId?: string; // Bestell-ID, Rechnungs-ID, etc.
  metadata?: Record<string, any>;
}

export interface Tagesprotokoll {
  id: string;
  datum: Date;
  zusammenfassung: string;
  bestellungen: number;
  lieferungen: number;
  rechnungen: number;
  warnungen: string[];
  details: ProtokollDetail[];
}

export interface ProtokollDetail {
  typ: 'bestellung' | 'lieferung' | 'rechnung' | 'warnung' | 'info';
  beschreibung: string;
  zeitpunkt: Date;
  betrag?: number;
  status?: string;
}

// Enums
export type EmpfaengerGruppe = 
  | 'allgemein'
  | 'ao'
  | 'cmk'
  | 'cim'
  | 'neuroflow'
  | 'streckengeschaeft'
  | 'pos'
  | 'e-invoicing'
  | 'crm'
  | 'admin'
  | 'ki-agenten';

export type NachrichtenStatus = 
  | 'entwurf'
  | 'gesendet'
  | 'gelesen'
  | 'bestaetigt'
  | 'archiviert'
  | 'geloescht';

export type NachrichtenPrioritaet = 
  | 'niedrig'
  | 'normal'
  | 'hoch'
  | 'kritisch';

export type NachrichtenKategorie = 
  | 'allgemein'
  | 'bestellung'
  | 'lieferung'
  | 'rechnung'
  | 'warnung'
  | 'protokoll'
  | 'ki-nachricht'
  | 'system';

export type BenutzerRolle = 
  | 'admin'
  | 'manager'
  | 'mitarbeiter'
  | 'ki-agent'
  | 'system';

// KI-spezifische Interfaces
export interface KINachrichtenKonfiguration {
  autoProtokollGenerierung: boolean;
  intelligenteEmpfaengerAuswahl: boolean;
  kontextbasierteVorschlaege: boolean;
  sprachverarbeitung: boolean;
  sentimentAnalyse: boolean;
}

export interface KINachrichtenVorschlag {
  betreff: string;
  inhalt: string;
  empfaengerGruppe: EmpfaengerGruppe;
  prioritaet: NachrichtenPrioritaet;
  konfidenz: number;
  begruendung: string;
}

export interface NachrichtenStatistik {
  gesendet: number;
  gelesen: number;
  bestaetigt: number;
  archiviert: number;
  durchschnittlicheLesezeit: number;
  beliebtesteEmpfaengerGruppe: EmpfaengerGruppe;
  kiGenerierteNachrichten: number;
}

// Form-Validation
export interface NachrichtenFormData {
  empfaengerGruppe: EmpfaengerGruppe;
  betreff: string;
  inhalt: string;
  leseBestaetigungErforderlich: boolean;
  archivierungErzwingen: boolean;
  autoProtokollAnhaengen: boolean;
  prioritaet: NachrichtenPrioritaet;
  kategorie: NachrichtenKategorie;
  tags: string[];
}

export interface NachrichtenFormErrors {
  empfaengerGruppe?: string;
  betreff?: string;
  inhalt?: string;
  tags?: string;
} 