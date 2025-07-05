// API-Basiskonfiguration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Konfiguration für Anfragen
export const API_TIMEOUT = 30000; // 30 Sekunden Timeout für API-Anfragen

// Systemkonfiguration
export const SYSTEM_NAME = 'VALEO-NeuroERP';
export const SYSTEM_VERSION = '1.01';

// Feature-Flags
export const FEATURES = {
  REPORTS_MODULE: true,
  SYSTEM_MONITORING: true,
  RAG_INTEGRATION: true,
  MONGODB_INTEGRATION: true
}; 