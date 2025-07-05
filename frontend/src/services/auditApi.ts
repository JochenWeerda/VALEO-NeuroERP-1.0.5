import axios from 'axios';
import { API_BASE_URL } from './api';

// Typdefinitionen für Audit-Management
export interface AuditAnforderung {
  id: string;
  titel: string;
  beschreibung: string;
  kategorie: 'QS' | 'GMP' | 'IFS' | 'BIO' | 'Nachhaltigkeit' | 'HACCP' | 'Andere';
  verantwortlicher: string;
  deadline: string;
  erstelltAm: string;
  erstelltVon: string;
  dokumentTypen: string[];
  status: 'offen' | 'inBearbeitung' | 'abgeschlossen' | 'abgelehnt' | 'verschoben';
  prioritaet: 'niedrig' | 'mittel' | 'hoch' | 'kritisch';
  erinnerungen: AuditErinnerung[];
  erledigtAm?: string;
  erledigtVon?: string;
  dokumente: AuditDokument[];
  notizen: string;
  auditDatum?: string;
  // KI-relevante Felder
  automatischeErinnerungen: boolean;
  kiOptimierteDeadline?: string;
  kiEmpfehlungen?: string;
  eskalationsLevel: number; // 0-3: 0=normal, 1=Erinnerung, 2=Ermahnung, 3=Eskalation an Vorgesetzten
  letzteEskalation?: string;
}

export interface AuditErinnerung {
  id: string;
  anforderungId: string;
  datum: string;
  typ: 'system' | 'manuell';
  status: 'geplant' | 'gesendet' | 'fehlgeschlagen';
  nachricht: string;
  eskalationsLevel: number; // 0-3
}

export interface AuditDokument {
  id: string;
  anforderungId: string;
  dokumentTyp: string;
  name: string;
  dateipfad: string;
  hochgeladenAm: string;
  hochgeladenVon: string;
  gueltigBis?: string;
  status: 'aktuell' | 'abgelaufen' | 'ausstehend';
  version: string;
  versionsverlauf: AuditDokumentVersion[];
}

export interface AuditDokumentVersion {
  version: string;
  datum: string;
  benutzer: string;
  dateipfad: string;
}

export interface AuditZyklus {
  id: string;
  jahr: number;
  startDatum: string;
  endDatum: string;
  verantwortlicher: string;
  status: 'geplant' | 'inVorbereitung' | 'abgeschlossen';
  anforderungen: string[]; // IDs der Anforderungen
  fortschritt: number; // 0-100%
  notizen: string;
  vorjahresAuditId?: string; // Referenz zum Vorjahresaudit
}

export interface AuditStatistik {
  offeneAnforderungen: number;
  abgeschlosseneAnforderungen: number;
  ueberfalligeAnforderungen: number;
  fortschrittProzent: number;
  anforderungenNachKategorie: Record<string, number>;
  anforderungenNachPrioritaet: Record<string, number>;
  dokumenteStatus: {
    aktuell: number;
    abgelaufen: number;
    ausstehend: number;
  };
  zeitbisAudit?: number; // Tage bis zum nächsten Audit
}

// API-Endpunkte
const AUDIT_ENDPOINT = `${API_BASE_URL}/audit`;
const ANFORDERUNGEN_ENDPOINT = `${AUDIT_ENDPOINT}/anforderungen`;
const ERINNERUNGEN_ENDPOINT = `${AUDIT_ENDPOINT}/erinnerungen`;
const DOKUMENTE_ENDPOINT = `${AUDIT_ENDPOINT}/dokumente`;
const ZYKLEN_ENDPOINT = `${AUDIT_ENDPOINT}/zyklen`;
const STATISTIK_ENDPOINT = `${AUDIT_ENDPOINT}/statistik`;
const KI_ENDPOINT = `${AUDIT_ENDPOINT}/ki`;

// API-Funktionen für Audit-Anforderungen
export const getAllAnforderungen = async (): Promise<AuditAnforderung[]> => {
  try {
    const response = await axios.get(ANFORDERUNGEN_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Audit-Anforderungen:', error);
    throw error;
  }
};

export const getAnforderungById = async (id: string): Promise<AuditAnforderung> => {
  try {
    const response = await axios.get(`${ANFORDERUNGEN_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Laden der Audit-Anforderung mit ID ${id}:`, error);
    throw error;
  }
};

export const createAnforderung = async (anforderung: Omit<AuditAnforderung, 'id'>): Promise<AuditAnforderung> => {
  try {
    const response = await axios.post(ANFORDERUNGEN_ENDPOINT, anforderung);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Erstellen der Audit-Anforderung:', error);
    throw error;
  }
};

export const updateAnforderung = async (id: string, anforderung: Partial<AuditAnforderung>): Promise<AuditAnforderung> => {
  try {
    const response = await axios.patch(`${ANFORDERUNGEN_ENDPOINT}/${id}`, anforderung);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Aktualisieren der Audit-Anforderung mit ID ${id}:`, error);
    throw error;
  }
};

export const deleteAnforderung = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${ANFORDERUNGEN_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`Fehler beim Löschen der Audit-Anforderung mit ID ${id}:`, error);
    throw error;
  }
};

export const changeAnforderungStatus = async (
  id: string, 
  newStatus: AuditAnforderung['status']
): Promise<AuditAnforderung> => {
  try {
    const response = await axios.patch(`${ANFORDERUNGEN_ENDPOINT}/${id}/status`, { status: newStatus });
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Ändern des Status der Audit-Anforderung mit ID ${id}:`, error);
    throw error;
  }
};

// API-Funktionen für Audit-Dokumente
export const uploadAuditDokument = async (
  anforderungId: string, 
  file: File, 
  dokumentTyp: string, 
  gueltigBis?: string
): Promise<AuditDokument> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dokumentTyp', dokumentTyp);
    formData.append('anforderungId', anforderungId);
    if (gueltigBis) {
      formData.append('gueltigBis', gueltigBis);
    }
    
    const response = await axios.post(`${DOKUMENTE_ENDPOINT}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Fehler beim Hochladen des Audit-Dokuments:', error);
    throw error;
  }
};

export const getAuditDokumente = async (anforderungId: string): Promise<AuditDokument[]> => {
  try {
    const response = await axios.get(`${DOKUMENTE_ENDPOINT}?anforderungId=${anforderungId}`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Laden der Audit-Dokumente für Anforderung ${anforderungId}:`, error);
    throw error;
  }
};

export const deleteAuditDokument = async (dokumentId: string): Promise<void> => {
  try {
    await axios.delete(`${DOKUMENTE_ENDPOINT}/${dokumentId}`);
  } catch (error) {
    console.error(`Fehler beim Löschen des Audit-Dokuments mit ID ${dokumentId}:`, error);
    throw error;
  }
};

// API-Funktionen für Audit-Zyklen
export const getAllAuditZyklen = async (): Promise<AuditZyklus[]> => {
  try {
    const response = await axios.get(ZYKLEN_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Audit-Zyklen:', error);
    throw error;
  }
};

export const createAuditZyklus = async (zyklus: Omit<AuditZyklus, 'id'>): Promise<AuditZyklus> => {
  try {
    const response = await axios.post(ZYKLEN_ENDPOINT, zyklus);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Erstellen des Audit-Zyklus:', error);
    throw error;
  }
};

export const getAuditStatistik = async (): Promise<AuditStatistik> => {
  try {
    const response = await axios.get(STATISTIK_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Audit-Statistik:', error);
    throw error;
  }
};

// KI-Funktionen für Audit-Management
export const generateKIErinnerungen = async (anforderungId: string): Promise<AuditErinnerung[]> => {
  try {
    const response = await axios.post(`${KI_ENDPOINT}/erinnerungen`, { anforderungId });
    return response.data;
  } catch (error) {
    console.error(`Fehler bei der KI-Generierung von Erinnerungen für Anforderung ${anforderungId}:`, error);
    throw error;
  }
};

export const generateKIEmpfehlungen = async (anforderungId: string): Promise<{ empfehlungen: string, optimierteDeadline?: string }> => {
  try {
    const response = await axios.post(`${KI_ENDPOINT}/empfehlungen`, { anforderungId });
    return response.data;
  } catch (error) {
    console.error(`Fehler bei der KI-Generierung von Empfehlungen für Anforderung ${anforderungId}:`, error);
    throw error;
  }
};

export const auditVollstaendigkeitsPruefung = async (): Promise<{
  vollstaendig: boolean;
  fehlendeDokumente: Array<{kategorie: string; titel: string; id: string}>;
  empfehlungen: string;
}> => {
  try {
    const response = await axios.get(`${KI_ENDPOINT}/vollstaendigkeitspruefung`);
    return response.data;
  } catch (error) {
    console.error('Fehler bei der KI-Vollständigkeitsprüfung:', error);
    throw error;
  }
};

export const sendeErinnerung = async (erinnerungId: string): Promise<AuditErinnerung> => {
  try {
    const response = await axios.post(`${ERINNERUNGEN_ENDPOINT}/${erinnerungId}/senden`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Senden der Erinnerung mit ID ${erinnerungId}:`, error);
    throw error;
  }
};

export const erstelleAuditCheckliste = async (): Promise<Blob> => {
  try {
    const response = await axios.get(`${AUDIT_ENDPOINT}/checkliste`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Fehler beim Erstellen der Audit-Checkliste:', error);
    throw error;
  }
};

export const auditMockData = {
  anforderungen: [
    {
      id: '1',
      titel: 'QS-Checklisten für Getreidelagerung aktualisieren',
      beschreibung: 'Die QS-Checklisten für die Getreidelagerung müssen gemäß den neuen Anforderungen aktualisiert werden.',
      kategorie: 'QS',
      verantwortlicher: '4', // ID des QM-Beauftragten
      deadline: '2024-08-15',
      erstelltAm: '2024-07-01',
      erstelltVon: 'System',
      dokumentTypen: ['Checkliste', 'QS-Handbuch'],
      status: 'offen',
      prioritaet: 'hoch',
      erinnerungen: [],
      dokumente: [],
      notizen: '',
      automatischeErinnerungen: true,
      eskalationsLevel: 0,
      auditDatum: '2024-10-15'
    },
    {
      id: '2',
      titel: 'Jährliche HACCP-Schulung durchführen',
      beschreibung: 'Die jährliche HACCP-Schulung für alle Mitarbeiter muss durchgeführt und dokumentiert werden.',
      kategorie: 'HACCP',
      verantwortlicher: '4', // ID des QM-Beauftragten
      deadline: '2024-09-30',
      erstelltAm: '2024-07-01',
      erstelltVon: 'System',
      dokumentTypen: ['Schulungsnachweis', 'Teilnehmerliste'],
      status: 'offen',
      prioritaet: 'mittel',
      erinnerungen: [],
      dokumente: [],
      notizen: '',
      automatischeErinnerungen: true,
      eskalationsLevel: 0,
      auditDatum: '2024-10-15'
    },
    {
      id: '3',
      titel: 'Jährliche Kalibrierung der Messgeräte',
      beschreibung: 'Alle Messgeräte müssen kalibriert und die Kalibrierungszertifikate aktualisiert werden.',
      kategorie: 'QS',
      verantwortlicher: '3', // ID des Anlagenführers
      deadline: '2024-08-31',
      erstelltAm: '2024-07-01',
      erstelltVon: 'System',
      dokumentTypen: ['Kalibrierungszertifikat', 'Prüfprotokoll'],
      status: 'inBearbeitung',
      prioritaet: 'hoch',
      erinnerungen: [],
      dokumente: [],
      notizen: 'Kontaktaufnahme mit Kalibrierdienst erfolgt.',
      automatischeErinnerungen: true,
      eskalationsLevel: 0,
      auditDatum: '2024-10-15'
    }
  ],
  zyklen: [
    {
      id: '1',
      jahr: 2024,
      startDatum: '2024-07-01',
      endDatum: '2024-10-15',
      verantwortlicher: '4', // ID des QM-Beauftragten
      status: 'inVorbereitung',
      anforderungen: ['1', '2', '3'],
      fortschritt: 15,
      notizen: 'Audit-Vorbereitung gestartet, erste Anforderungen definiert.',
      vorjahresAuditId: '0'
    }
  ],
  statistik: {
    offeneAnforderungen: 2,
    abgeschlosseneAnforderungen: 0,
    ueberfalligeAnforderungen: 0,
    fortschrittProzent: 15,
    anforderungenNachKategorie: {
      'QS': 2,
      'HACCP': 1
    },
    anforderungenNachPrioritaet: {
      'hoch': 2,
      'mittel': 1,
      'niedrig': 0,
      'kritisch': 0
    },
    dokumenteStatus: {
      aktuell: 0,
      abgelaufen: 0,
      ausstehend: 3
    },
    zeitbisAudit: 76 // Tage bis zum Audit
  }
}; 