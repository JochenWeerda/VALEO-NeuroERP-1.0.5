import api from './api';
import { AxiosRequestConfig } from 'axios';

// Enums
export enum QSStatus {
  NEU = 'neu',
  IN_PRUEFUNG = 'in_pruefung',
  FREIGEGEBEN = 'freigegeben',
  GESPERRT = 'gesperrt',
  VERWENDUNG = 'in_verwendung',
  ARCHIVIERT = 'archiviert'
}

export enum KontaminationsRisiko {
  NIEDRIG = 'niedrig',
  MITTEL = 'mittel',
  HOCH = 'hoch'
}

export enum QSRohstoffTyp {
  GETREIDE = 'getreide',
  ZUSATZSTOFF = 'zusatzstoff',
  MINERALSTOFF = 'mineralstoff',
  PROTEIN = 'protein',
  EIWEISS = 'eiweiss',
  FETT = 'fett',
  ANDERE = 'andere'
}

export enum MonitoringStatus {
  GEPLANT = 'geplant',
  ENTNOMMEN = 'entnommen',
  LABOR_EINGANG = 'labor_eingang',
  IN_ANALYSE = 'in_analyse',
  ABGESCHLOSSEN = 'abgeschlossen',
  ABGEBROCHEN = 'abgebrochen'
}

export enum EreignisTyp {
  QUALITAET = 'qualitaet',
  PROZESS = 'prozess',
  LIEFERANT = 'lieferant',
  KUNDE = 'kunde',
  HACCP = 'haccp',
  REKLAMATION = 'reklamation',
  ANDERE = 'andere'
}

export enum EreignisPrioritaet {
  NIEDRIG = 'niedrig',
  MITTEL = 'mittel',
  HOCH = 'hoch',
  KRITISCH = 'kritisch'
}

// Typdefinitionen für QS-Futtermittel
export interface Rohstoff {
  id?: number;
  charge_id?: number;
  rohstoff_charge_id: number;
  rohstoff_typ: QSRohstoffTyp;
  menge: number;
  einheit_id: number;
  anteil?: number;
  lieferant_id?: number;
  lieferant_chargen_nr?: string;
  kontaminationsrisiko: KontaminationsRisiko;
  qs_zertifiziert: boolean;
  zertifikat_nr?: string;
  mischposition?: number;
  erstellt_am?: string;
}

export interface Monitoring {
  id?: number;
  charge_id?: number;
  proben_id: string;
  status: MonitoringStatus;
  probentyp: string;
  entnahme_datum?: string;
  entnommen_durch_id?: number;
  labor_id?: number;
  labor_eingang_datum?: string;
  ergebnis_datum?: string;
  ergebnis_werte?: Record<string, any>;
  grenzwert_eingehalten?: boolean;
  bemerkung?: string;
  erstellt_am?: string;
  geaendert_am?: string;
}

export interface Ereignis {
  id?: number;
  charge_id?: number;
  ereignis_typ: EreignisTyp;
  titel: string;
  beschreibung?: string;
  prioritaet: EreignisPrioritaet;
  ereignis_datum: string;
  faellig_bis?: string;
  ist_abgeschlossen: boolean;
  ist_bearbeitet: boolean;
  erstellt_von_id?: number;
  zugewiesen_an_id?: number;
  massnahmen?: string;
  nachfolgemassnahmen?: string;
  abgeschlossen_am?: string;
  abgeschlossen_von_id?: number;
  erstellt_am?: string;
  geaendert_am?: string;
}

export interface Benachrichtigung {
  id?: number;
  ereignis_id?: number;
  empfaenger_id?: number;
  empfaenger_email?: string;
  betreff: string;
  inhalt: string;
  gesendet?: boolean;
  gesendet_am?: string;
  gelesen?: boolean;
  gelesen_am?: string;
  erstellt_am?: string;
}

export interface Dokument {
  id?: number;
  charge_id?: number;
  ereignis_id?: number;
  monitoring_id?: number;
  titel: string;
  beschreibung?: string;
  dokument_typ: string;
  dateiname: string;
  dateipfad?: string;
  mime_type?: string;
  erstellt_von_id?: number;
  erstellt_am?: string;
}

export interface QSFuttermittelCharge {
  id?: number;
  charge_id: number;
  produktbezeichnung: string;
  herstellungsdatum: string;
  mindesthaltbarkeitsdatum?: string;
  qs_status: QSStatus;
  mischzeit?: number;
  mahlzeit?: number;
  mischtemperatur?: number;
  feuchtigkeit?: number;
  bediener_id?: number;
  qualitaetsverantwortlicher_id?: number;
  kunde_id?: number;
  ist_spuelcharge: boolean;
  nach_kritischem_material: boolean;
  qs_freigabe_datum?: string;
  qs_freigabe_durch_id?: number;
  qs_kennzeichnung_vollstaendig: boolean;
  qs_dokumentation_vollstaendig: boolean;
  monitoringpflicht: boolean;
  monitoringintervall_tage?: number;
  haccp_ccp_temperatur: boolean;
  haccp_ccp_magnetabscheider: boolean;
  haccp_ccp_siebung: boolean;
  ccp_messwerte?: Record<string, any>;
  vorgaenger_chargen?: number[];
  rohstoffe: Rohstoff[];
  monitoring: Monitoring[];
  ereignisse: Ereignis[];
  erstellt_am?: string;
  geaendert_am?: string;
}

export interface QSFuttermittelChargeCreate {
  charge_id: number;
  produktbezeichnung: string;
  herstellungsdatum: string;
  mindesthaltbarkeitsdatum?: string;
  qs_status?: QSStatus;
  mischzeit?: number;
  mahlzeit?: number;
  mischtemperatur?: number;
  feuchtigkeit?: number;
  bediener_id?: number;
  qualitaetsverantwortlicher_id?: number;
  kunde_id?: number;
  ist_spuelcharge?: boolean;
  nach_kritischem_material?: boolean;
  qs_kennzeichnung_vollstaendig?: boolean;
  qs_dokumentation_vollstaendig?: boolean;
  monitoringpflicht?: boolean;
  monitoringintervall_tage?: number;
  haccp_ccp_temperatur?: boolean;
  haccp_ccp_magnetabscheider?: boolean;
  haccp_ccp_siebung?: boolean;
  ccp_messwerte?: Record<string, any>;
  vorgaenger_chargen?: number[];
  rohstoffe: Rohstoff[];
}

export interface QSFuttermittelChargeFilter {
  qs_status?: QSStatus;
  herstellungsdatum_von?: string;
  herstellungsdatum_bis?: string;
  ist_spuelcharge?: boolean;
  monitoringpflicht?: boolean;
  kunde_id?: number;
  produktbezeichnung?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// API-Funktionen für QS-Futtermittel
export const getQSFuttermittelChargen = async (
  page: number = 1,
  page_size: number = 20,
  filter?: QSFuttermittelChargeFilter
): Promise<PaginatedResponse<QSFuttermittelCharge>> => {
  const params: Record<string, any> = { page, page_size, ...filter };
  const response = await api.get<PaginatedResponse<QSFuttermittelCharge>>('/qs/futtermittel/chargen', { params });
  return response.data;
};

export const getQSFuttermittelChargeById = async (id: number): Promise<QSFuttermittelCharge> => {
  const response = await api.get<QSFuttermittelCharge>(`/qs/futtermittel/charge/${id}`);
  return response.data;
};

export const createQSFuttermittelCharge = async (data: QSFuttermittelChargeCreate): Promise<QSFuttermittelCharge> => {
  const response = await api.post<QSFuttermittelCharge>('/qs/futtermittel/charge/create', data);
  return response.data;
};

export const updateQSFuttermittelCharge = async (id: number, data: Partial<QSFuttermittelCharge>): Promise<QSFuttermittelCharge> => {
  const response = await api.put<QSFuttermittelCharge>(`/qs/futtermittel/charge/${id}/update`, data);
  return response.data;
};

export const deleteQSFuttermittelCharge = async (id: number): Promise<void> => {
  await api.delete(`/qs/futtermittel/charge/${id}/delete`);
};

export const addMonitoring = async (chargeId: number, data: Omit<Monitoring, 'id' | 'charge_id'>): Promise<Monitoring> => {
  const response = await api.post<Monitoring>(`/qs/futtermittel/charge/${chargeId}/monitoring`, data);
  return response.data;
};

export const addEreignis = async (chargeId: number, data: Omit<Ereignis, 'id' | 'charge_id'>): Promise<Ereignis> => {
  const response = await api.post<Ereignis>(`/qs/futtermittel/charge/${chargeId}/ereignis`, data);
  return response.data;
};

export const addBenachrichtigung = async (ereignisId: number, data: Omit<Benachrichtigung, 'id' | 'ereignis_id'>): Promise<Benachrichtigung> => {
  const response = await api.post<Benachrichtigung>(`/qs/futtermittel/ereignis/${ereignisId}/benachrichtigung`, data);
  return response.data;
};

export const addDokument = async (
  data: Omit<Dokument, 'id'>,
  config?: {
    charge_id?: number;
    ereignis_id?: number;
    monitoring_id?: number;
  }
): Promise<Dokument> => {
  const params = new URLSearchParams();
  if (config?.charge_id) params.append('charge_id', config.charge_id.toString());
  if (config?.ereignis_id) params.append('ereignis_id', config.ereignis_id.toString());
  if (config?.monitoring_id) params.append('monitoring_id', config.monitoring_id.toString());
  
  const response = await api.post<Dokument>(`/qs/futtermittel/dokument?${params.toString()}`, data);
  return response.data;
};

export const generatePDFProtokoll = async (chargeId: number): Promise<Blob> => {
  const response = await api.get(`/qs/futtermittel/charge/${chargeId}/protokoll`, {
    responseType: 'blob'
  } as AxiosRequestConfig);
  return response.data;
};

export const exportCSV = async (
  filter?: QSFuttermittelChargeFilter
): Promise<Blob> => {
  const params = new URLSearchParams();
  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await api.get(`/qs/futtermittel/chargen/export-csv?${params.toString()}`, {
    responseType: 'blob'
  } as AxiosRequestConfig);
  return response.data;
};

export const analyzeChargeAnomalies = async (chargeId: number): Promise<any> => {
  const response = await api.get(`/qs/futtermittel/charge/${chargeId}/anomalien`);
  return response.data;
};

export const simulateQSApiLieferantenstatus = async (lieferantId: number): Promise<any> => {
  const response = await api.get(`/qs/futtermittel/lieferant/${lieferantId}/status`);
  return response.data;
};

export const simulateQSApiProbenupload = async (monitoringId: number): Promise<any> => {
  const response = await api.post(`/qs/futtermittel/monitoring/${monitoringId}/upload`);
  return response.data;
}; 