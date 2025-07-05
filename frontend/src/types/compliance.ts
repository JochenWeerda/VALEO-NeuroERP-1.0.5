// Compliance-Typen
export enum ComplianceType {
  QS = 'QS',
  GMP = 'GMP',
  EU_REG = 'EU_REG'
}

export enum ValidationStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  PARTIALLY_COMPLIANT = 'PARTIALLY_COMPLIANT'
}

// Validierungs-Modelle
export interface CheckResult {
  name: string;
  status: ValidationStatus;
  message: string;
  details?: Record<string, any>;
}

export interface ValidationResult {
  status: ValidationStatus;
  checks: CheckResult[];
  timestamp: string;
  responsible_person: string;
  digital_signature: string;
}

export interface ComplianceRecord {
  batch_id: string;
  compliance_type: ComplianceType;
  validation_result: ValidationResult;
  created_at: string;
}

// Monitoring-Modelle
export interface MonitoringParameter {
  min: number;
  max: number;
  unit: string;
  description: string;
}

export interface MonitoringConfig {
  parameters: Record<string, MonitoringParameter>;
}

export interface Measurement {
  parameter: string;
  value: number;
  timestamp: string;
  status?: 'normal' | 'alert';
}

export interface Alert {
  id: string;
  batch_id: string;
  parameter: string;
  severity: 'low' | 'high';
  message: string;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface MonitoringStatus {
  batch_id: string;
  status: 'active' | 'completed';
  start_time: string;
  end_time?: string;
  parameters: Record<string, MonitoringParameter>;
  latest_measurements: Measurement[];
  active_parameters: string[];
  active_alerts_count: number;
  total_alerts: number;
  monitoring_tasks: number;
}

// Statistik-Modelle
export interface ComplianceStatistics {
  total_validations: number;
  compliant_count: number;
  non_compliant_count: number;
  partially_compliant_count: number;
  compliance_rate: number;
  validation_history: {
    date: string;
    compliant: number;
    non_compliant: number;
    partially_compliant: number;
  }[];
  most_common_issues: {
    check_name: string;
    failure_count: number;
  }[];
  average_processing_time: number;
}

export interface AlertSettings {
  notification_threshold: {
    low: number;
    high: number;
  };
  notification_delay: number;
  auto_resolve: boolean;
  escalation_timeout?: number;
}

export interface AlertSubscription {
  user_id: string;
  batch_id: string;
  notification_types: ('low' | 'high')[];
  active: boolean;
  notification_channels: ('email' | 'sms' | 'push')[];
}

export interface AlertStatistics {
  total_alerts: number;
  resolved_alerts: number;
  active_alerts: number;
  average_resolution_time: number;
  alerts_by_severity: Record<string, number>;
  alerts_by_parameter: Record<string, number>;
  most_affected_batches: Array<{
    batch_id: string;
    count: number;
  }>;
}

export interface ComplianceParameter {
    name: string;
    wert: number;
    einheit: string;
    grenzwert_min?: number;
    grenzwert_max?: number;
    timestamp: string;
}

export interface ChargenDaten {
    chargen_nr: string;
    produkt_name: string;
    herstellungsdatum: string;
    mhd: string;
    parameter: ComplianceParameter[];
}

export interface QualitaetsDaten {
    lieferant: string;
    wareneingang_datum: string;
    transport_temperatur: number;
    hygiene_status: string;
    qualitaets_parameter: ComplianceParameter[];
}

export interface GMPDaten {
    haccp_punkt: string;
    gefahren_analyse: string;
    kontroll_massnahmen: string[];
    monitoring_parameter: ComplianceParameter[];
}

export interface EURegulatoryDaten {
    eu_norm: string;
    dokumentation_vollstaendig: boolean;
    notfall_verfahren: string;
    informationskette: string[];
}

export interface ComplianceAlert {
    alert_typ: string;
    beschreibung: string;
    schweregrad: number;
    timestamp: string;
    parameter?: ComplianceParameter;
}

export interface ComplianceReport {
    bericht_id: string;
    erstellt_am: string;
    chargen_daten?: ChargenDaten;
    qualitaets_daten?: QualitaetsDaten;
    gmp_daten?: GMPDaten;
    eu_daten?: EURegulatoryDaten;
    alerts: ComplianceAlert[];
}

export interface ParameterStatistics {
    min: number;
    max: number;
    avg: number;
    count: number;
    last_update: string;
} 