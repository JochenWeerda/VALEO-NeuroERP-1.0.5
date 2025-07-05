import axios from 'axios';
import { API_URL } from './api';

// Typdefinitionen
export interface QualitaetsParameter {
  id: string;
  name: string;
  einheit: string;
  minWert?: number;
  maxWert?: number;
  sollWert?: number;
  toleranz?: number;
  istPflichtfeld: boolean;
  kategorie: 'physikalisch' | 'chemisch' | 'mikrobiologisch' | 'sensorisch' | 'allgemein';
}

export interface QualitaetsVorlage {
  id: string;
  name: string;
  artikelGruppe?: string;
  parameter: QualitaetsParameter[];
  aktiv: boolean;
}

export interface QualitaetsErgebnis {
  parameterId: string;
  parameterName: string;
  wert: number | string;
  einheit: string;
  istKonform: boolean;
  bemerkung?: string;
}

// Erweiterte Typendefinitionen für landwirtschaftliche Anforderungen
export type GVO_Status_Type = 'GVO_frei_zertifiziert' | 'GVO_frei_eigene_Erklaerung' | 
                            'GVO_Spuren_unter_0_9_Prozent' | 'GVO_enthaltend_Kennzeichnungspflichtig' | 
                            'Nicht_relevant';

export type Landnutzungs_Konformitaet_Type = 'Konform_Ackerstatus_2008' | 
                                           'Konform_Kein_Hoch_Biodiverses_Gruenland_nach_2008' | 
                                           'Nicht_konform';

export type QS_Status_Type = 'In_Qualitaetspruefung' | 'Gesperrt_Qualitaet' | 'Freigegeben_QS';

export interface Dokument {
  id: string;
  dokumentTyp: string;
  dateipfad: string;
  dateiname: string;
  uploadDatum: string;
  nutzerID: string;
}

export interface ChargeErweitert {
  ChargenID: string;
  Artikelnummer: string;
  Menge: number;
  Lieferdatum: string;
  LieferantID: string;
  MHD?: string;
  Lagerort: string;
  
  // VLOG-Kennzeichnung (GVO-Status)
  GVO_Status?: GVO_Status_Type;
  GVO_Warnung?: boolean;
  GVO_Pruefungsdatum?: string;
  
  // QS-Milch Relevanz & Aflatoxin
  QS_Milch_relevant?: boolean;
  Aflatoxin_Wert?: number;
  QM_Milch_Lieferanten_QS_Status?: string;
  QS_Pruefungsdatum?: string;
  
  // EUDR-Konformität
  EUDR_Konform?: boolean;
  Entwaldungsfreiheit_Stichtag_2020?: boolean;
  Geo_Koordinaten_Anbauflaeche?: string;
  Rechtskonformitaet_Produktionsland?: boolean;
  
  // Nachhaltigkeit Raps
  Nachhaltig_Raps_relevant?: boolean;
  Landnutzungs_Konformitaet?: Landnutzungs_Konformitaet_Type;
  Zertifizierung_System?: string;
  
  // Dokumente
  Dokumente?: Dokument[];
  
  // Status
  Status: QS_Status_Type | 'offen' | 'inBearbeitung' | 'abgeschlossen' | 'freigegeben' | 'gesperrt';
  
  // Audit-Trail
  Erstellt_Von?: string;
  Erstellt_Am?: string;
  Geaendert_Von?: string;
  Geaendert_Am?: string;
  Aenderungsprotokoll?: {
    zeitstempel: string;
    nutzer: string;
    aktion: string;
    feld: string;
    alterWert: string;
    neuerWert: string;
  }[];
}

export interface LieferantStammdaten {
  id: string;
  name: string;
  vorname?: string;
  firma?: string;
  strasse: string;
  plz: string;
  ort: string;
  land: string;
  steuerNr?: string;
  ustIdNr?: string;
  landwirtTyp: 'optierend' | 'pauschalierend' | 'nicht_landwirt';
  qualitaetsvereinbarungVorhanden: boolean;
  qualitaetsvereinbarungDatum?: string;
  nachhaltigkeitsSelbsterklaerungVorhanden: boolean;
  nachhaltigkeitsSelbsterklaerungDatum?: string;
  sortenschutzerklaerungVorhanden: boolean;
  sortenschutzerklaerungDatum?: string;
  letztePruefung?: string;
  plz_region?: string;
}

export interface RapsAnlieferung {
  id: string;
  lieferantId: string;
  lieferantName: string;
  mengeNachhaltig: number;
  mengeNichtNachhaltig: number;
  letztePruefung?: string;
  plz?: string;
  erntejahr: string;
  anlieferungsDatum: string;
  nachhaltigkeitsDokumenteVollstaendig: boolean;
}

export interface QualitaetsPruefung {
  id: string;
  chargenNummer: string;
  artikelId: string;
  artikelName: string;
  pruefDatum: string;
  pruefer: string;
  vorlageId: string;
  vorlageName: string;
  status: 'offen' | 'inBearbeitung' | 'abgeschlossen' | 'freigegeben' | 'gesperrt';
  ergebnisse: QualitaetsErgebnis[];
  bemerkung?: string;
  
  // Erweiterte Attribute für landwirtschaftliche Anforderungen
  chargeErweitert?: ChargeErweitert;
  lieferant?: LieferantStammdaten;
}

// API-Endpunkte
const QUALITAET_ENDPOINT = `${API_URL}/qualitaet`;
const PRUEFUNGEN_ENDPOINT = `${QUALITAET_ENDPOINT}/pruefungen`;
const VORLAGEN_ENDPOINT = `${QUALITAET_ENDPOINT}/vorlagen`;
const PARAMETER_ENDPOINT = `${QUALITAET_ENDPOINT}/parameter`;
const CHARGEN_ENDPOINT = `${API_URL}/chargen`;
const LIEFERANTEN_ENDPOINT = `${API_URL}/lieferanten`;
const DOKUMENTE_ENDPOINT = `${API_URL}/dokumente`;
const RAPS_ANLIEFERUNGEN_ENDPOINT = `${API_URL}/raps-anlieferungen`;

// API-Funktionen für Qualitätsprüfungen
export const getAllPruefungen = async (): Promise<QualitaetsPruefung[]> => {
  try {
    const response = await axios.get(PRUEFUNGEN_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Qualitätsprüfungen:', error);
    throw error;
  }
};

export const getPruefungById = async (id: string): Promise<QualitaetsPruefung> => {
  try {
    const response = await axios.get(`${PRUEFUNGEN_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Laden der Qualitätsprüfung mit ID ${id}:`, error);
    throw error;
  }
};

export const createPruefung = async (pruefung: Omit<QualitaetsPruefung, 'id'>): Promise<QualitaetsPruefung> => {
  try {
    const response = await axios.post(PRUEFUNGEN_ENDPOINT, pruefung);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Erstellen der Qualitätsprüfung:', error);
    throw error;
  }
};

export const updatePruefung = async (id: string, pruefung: Partial<QualitaetsPruefung>): Promise<QualitaetsPruefung> => {
  try {
    const response = await axios.patch(`${PRUEFUNGEN_ENDPOINT}/${id}`, pruefung);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Aktualisieren der Qualitätsprüfung mit ID ${id}:`, error);
    throw error;
  }
};

export const deletePruefung = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${PRUEFUNGEN_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`Fehler beim Löschen der Qualitätsprüfung mit ID ${id}:`, error);
    throw error;
  }
};

export const changePruefungStatus = async (
  id: string, 
  newStatus: 'freigegeben' | 'gesperrt'
): Promise<QualitaetsPruefung> => {
  try {
    const response = await axios.patch(`${PRUEFUNGEN_ENDPOINT}/${id}/status`, { status: newStatus });
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Ändern des Status der Qualitätsprüfung mit ID ${id}:`, error);
    throw error;
  }
};

export const exportPruefungToPdf = async (id: string): Promise<Blob> => {
  try {
    const response = await axios.get(`${PRUEFUNGEN_ENDPOINT}/${id}/export/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Exportieren der Qualitätsprüfung mit ID ${id} als PDF:`, error);
    throw error;
  }
};

export const exportPruefungenToCsv = async (filterParams?: Record<string, any>): Promise<Blob> => {
  try {
    const response = await axios.get(`${PRUEFUNGEN_ENDPOINT}/export/csv`, {
      params: filterParams,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Fehler beim Exportieren der Qualitätsprüfungen als CSV:', error);
    throw error;
  }
};

// API-Funktionen für Qualitätsvorlagen
export const getAllVorlagen = async (): Promise<QualitaetsVorlage[]> => {
  try {
    const response = await axios.get(VORLAGEN_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Qualitätsvorlagen:', error);
    throw error;
  }
};

export const getVorlageById = async (id: string): Promise<QualitaetsVorlage> => {
  try {
    const response = await axios.get(`${VORLAGEN_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Laden der Qualitätsvorlage mit ID ${id}:`, error);
    throw error;
  }
};

export const createVorlage = async (vorlage: Omit<QualitaetsVorlage, 'id'>): Promise<QualitaetsVorlage> => {
  try {
    const response = await axios.post(VORLAGEN_ENDPOINT, vorlage);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Erstellen der Qualitätsvorlage:', error);
    throw error;
  }
};

export const updateVorlage = async (id: string, vorlage: Partial<QualitaetsVorlage>): Promise<QualitaetsVorlage> => {
  try {
    const response = await axios.patch(`${VORLAGEN_ENDPOINT}/${id}`, vorlage);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Aktualisieren der Qualitätsvorlage mit ID ${id}:`, error);
    throw error;
  }
};

export const toggleVorlageStatus = async (id: string, aktiv: boolean): Promise<QualitaetsVorlage> => {
  try {
    const response = await axios.patch(`${VORLAGEN_ENDPOINT}/${id}/toggle`, { aktiv });
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Umschalten des Status der Qualitätsvorlage mit ID ${id}:`, error);
    throw error;
  }
};

// API-Funktionen für Qualitätsparameter
export const getAllParameter = async (): Promise<QualitaetsParameter[]> => {
  try {
    const response = await axios.get(PARAMETER_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Qualitätsparameter:', error);
    throw error;
  }
};

export const getParameterById = async (id: string): Promise<QualitaetsParameter> => {
  try {
    const response = await axios.get(`${PARAMETER_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Laden des Qualitätsparameters mit ID ${id}:`, error);
    throw error;
  }
};

export const createParameter = async (parameter: Omit<QualitaetsParameter, 'id'>): Promise<QualitaetsParameter> => {
  try {
    const response = await axios.post(PARAMETER_ENDPOINT, parameter);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Erstellen des Qualitätsparameters:', error);
    throw error;
  }
};

export const updateParameter = async (id: string, parameter: Partial<QualitaetsParameter>): Promise<QualitaetsParameter> => {
  try {
    const response = await axios.patch(`${PARAMETER_ENDPOINT}/${id}`, parameter);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Aktualisieren des Qualitätsparameters mit ID ${id}:`, error);
    throw error;
  }
};

export const deleteParameter = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${PARAMETER_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`Fehler beim Löschen des Qualitätsparameters mit ID ${id}:`, error);
    throw error;
  }
};

// Neue API-Funktionen für erweiterte Chargen
export const getChargeErweitert = async (id: string): Promise<ChargeErweitert> => {
  try {
    const response = await axios.get(`${CHARGEN_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Laden der erweiterten Charge mit ID ${id}:`, error);
    throw error;
  }
};

export const updateChargeErweitert = async (id: string, charge: Partial<ChargeErweitert>): Promise<ChargeErweitert> => {
  try {
    const response = await axios.patch(`${CHARGEN_ENDPOINT}/${id}`, charge);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Aktualisieren der erweiterten Charge mit ID ${id}:`, error);
    throw error;
  }
};

// API-Funktionen für Dokumente
export const uploadDokument = async (chargenId: string, file: File, dokumentTyp: string): Promise<Dokument> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dokumentTyp', dokumentTyp);
    formData.append('chargenId', chargenId);
    
    const response = await axios.post(`${DOKUMENTE_ENDPOINT}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Fehler beim Hochladen des Dokuments:', error);
    throw error;
  }
};

export const getDokumente = async (chargenId: string): Promise<Dokument[]> => {
  try {
    const response = await axios.get(`${DOKUMENTE_ENDPOINT}/charge/${chargenId}`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Laden der Dokumente für Charge ${chargenId}:`, error);
    throw error;
  }
};

export const deleteDokument = async (dokumentId: string): Promise<void> => {
  try {
    await axios.delete(`${DOKUMENTE_ENDPOINT}/${dokumentId}`);
  } catch (error) {
    console.error(`Fehler beim Löschen des Dokuments mit ID ${dokumentId}:`, error);
    throw error;
  }
};

// API-Funktionen für Lieferanten
export const getLieferantStammdaten = async (id: string): Promise<LieferantStammdaten> => {
  try {
    const response = await axios.get(`${LIEFERANTEN_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Laden der Lieferantendaten mit ID ${id}:`, error);
    throw error;
  }
};

export const updateLieferantStammdaten = async (id: string, lieferant: Partial<LieferantStammdaten>): Promise<LieferantStammdaten> => {
  try {
    const response = await axios.patch(`${LIEFERANTEN_ENDPOINT}/${id}`, lieferant);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Aktualisieren der Lieferantendaten mit ID ${id}:`, error);
    throw error;
  }
};

// API-Funktionen für Raps-Anlieferungen
export const getRapsAnlieferungen = async (erntejahr?: string): Promise<RapsAnlieferung[]> => {
  try {
    const params = erntejahr ? { erntejahr } : undefined;
    const response = await axios.get(RAPS_ANLIEFERUNGEN_ENDPOINT, { params });
    return response.data;
  } catch (error) {
    console.error('Fehler beim Laden der Raps-Anlieferungen:', error);
    throw error;
  }
};

export const getRapsAnlieferungByLieferant = async (lieferantId: string, erntejahr?: string): Promise<RapsAnlieferung[]> => {
  try {
    const params = { lieferantId, ...(erntejahr ? { erntejahr } : {}) };
    const response = await axios.get(`${RAPS_ANLIEFERUNGEN_ENDPOINT}/lieferant`, { params });
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Laden der Raps-Anlieferungen für Lieferant ${lieferantId}:`, error);
    throw error;
  }
};

export const updateRapsAnlieferung = async (id: string, anlieferung: Partial<RapsAnlieferung>): Promise<RapsAnlieferung> => {
  try {
    const response = await axios.patch(`${RAPS_ANLIEFERUNGEN_ENDPOINT}/${id}`, anlieferung);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Aktualisieren der Raps-Anlieferung mit ID ${id}:`, error);
    throw error;
  }
};

export const exportRapsAnlieferungenAlsCSV = async (erntejahr?: string): Promise<Blob> => {
  try {
    const params = erntejahr ? { erntejahr } : undefined;
    const response = await axios.get(`${RAPS_ANLIEFERUNGEN_ENDPOINT}/export/csv`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Fehler beim Exportieren der Raps-Anlieferungen als CSV:', error);
    throw error;
  }
}; 