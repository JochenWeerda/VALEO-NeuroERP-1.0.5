// API-Konfiguration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Allgemeine Konfiguration
export const APP_NAME = 'ERP für Futtermittelherstellung';
export const APP_VERSION = '0.1.0';

// Seiten-Konfiguration
export const ITEMS_PER_PAGE = 10;
export const MAX_PAGINATION_LINKS = 5;

// Benachrichtigungs-Konfiguration
export const NOTIFICATION_POLL_INTERVAL = 30000; // 30 Sekunden 