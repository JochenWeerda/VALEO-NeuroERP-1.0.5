// UI Labels für VALEO NeuroERP - Deutsche Lokalisierung

export const UI_LABELS = {
  // App
  APP: {
    TITLE: 'VALEO NeuroERP',
    SUBTITLE: 'Intelligentes ERP-System',
    VERSION: '2.0',
  },

  // Navigation
  NAVIGATION: {
    DASHBOARD: 'Dashboard',
    AI_DASHBOARD: 'KI-Dashboard',
    USERS: 'Benutzer',
    USER: 'Benutzer',
    USER_MENU: 'Benutzermenü',
    LOGOUT: 'Abmelden',
    OPEN_MENU: 'Menü öffnen',
    CLOSE_MENU: 'Menü schließen',
    DOCUMENTS: 'Dokumente',
    POS: 'Kassensystem',
    INVENTORY: 'Lager',
    SALES: 'Verkauf',
    PURCHASE: 'Einkauf',
    FINANCE: 'Finanzen',
    REPORTS: 'Berichte',
    SETTINGS: 'Einstellungen',
    HELP: 'Hilfe',
    PAYROLL: 'Lohnabrechnung',
    CUSTOMERS: 'Kunden',
    ORDERS: 'Aufträge',
    INVOICES: 'Rechnungen',
    STOCK: 'Bestand',
    MOVEMENTS: 'Bewegungen',
    PRODUCTION: 'Produktion',
    PRODUCTION_ORDERS: 'Produktionsaufträge',
    PLANNING: 'Planung',
    QUALITY: 'Qualität',
    INSPECTIONS: 'Prüfungen',
    PROJECTS: 'Projekte',
    PROFILE: 'Profil',
  },

  // Notifications
  NOTIFICATIONS: {
    TITLE: 'Benachrichtigungen',
    EMPTY: 'Keine Benachrichtigungen',
    NO_NOTIFICATIONS: 'Keine Benachrichtigungen',
    MARK_ALL_READ: 'Alle als gelesen markieren',
    MARK_READ: 'Als gelesen markieren',
    DELETE: 'Löschen',
    NEW: 'Neu',
    UNREAD: 'Ungelesen',
    ALL: 'Alle',
    VIEW_ALL: 'Alle anzeigen',
  },

  // Forms
  FORMS: {
    SAVE: 'Speichern',
    CANCEL: 'Abbrechen',
    DELETE: 'Löschen',
    EDIT: 'Bearbeiten',
    ADD: 'Hinzufügen',
    SEARCH: 'Suchen',
    FILTER: 'Filtern',
    RESET: 'Zurücksetzen',
    SUBMIT: 'Absenden',
    CONFIRM: 'Bestätigen',
    BACK: 'Zurück',
    NEXT: 'Weiter',
    PREVIOUS: 'Zurück',
    CLOSE: 'Schließen',
    OPEN: 'Öffnen',
    EXPORT: 'Exportieren',
    IMPORT: 'Importieren',
    REFRESH: 'Aktualisieren',
    LOADING: 'Lädt...',
    SAVING: 'Speichert...',
    DELETING: 'Löscht...',
    UPLOADING: 'Lädt hoch...',
    DOWNLOADING: 'Lädt herunter...',
    SALUTATION: 'Anrede',
    NAME: 'Name',
    STEP: 'Schritt',
    OF: 'von',
  },

  // Tables
  TABLES: {
    NO_DATA_AVAILABLE: 'Keine Daten verfügbar',
    LOADING: 'Lädt Daten...',
    ERROR: 'Fehler beim Laden der Daten',
    ROWS_PER_PAGE: 'Zeilen pro Seite',
    OF: 'von',
    SHOWING: 'Zeige',
    TO: 'bis',
    ENTRIES: 'Einträge',
    SEARCH_PLACEHOLDER: 'Suchen...',
    FILTER_PLACEHOLDER: 'Filtern...',
    SORT_ASC: 'Aufsteigend sortieren',
    SORT_DESC: 'Absteigend sortieren',
    CLEAR_FILTERS: 'Filter löschen',
    SELECT_ALL: 'Alle auswählen',
    SELECT_NONE: 'Keine auswählen',
    SELECTED: 'ausgewählt',
  },

  // Status
  STATUS: {
    ACTIVE: 'Aktiv',
    INACTIVE: 'Inaktiv',
    PENDING: 'Ausstehend',
    COMPLETED: 'Abgeschlossen',
    CANCELLED: 'Storniert',
    DRAFT: 'Entwurf',
    PUBLISHED: 'Veröffentlicht',
    ARCHIVED: 'Archiviert',
    DELETED: 'Gelöscht',
    SUCCESS: 'Erfolgreich',
    ERROR: 'Fehler',
    WARNING: 'Warnung',
    INFO: 'Information',
    SUSPENDED: 'Gesperrt',
    UNKNOWN: 'Unbekannt',
    OFFLINE: 'Offline',
    MAINTENANCE: 'Wartung',
    EXPIRED: 'Abgelaufen',
    OVERDUE: 'Überfällig',
    PROCESSING: 'In Bearbeitung',
    APPROVED: 'Genehmigt',
    REJECTED: 'Abgelehnt',
    SCHEDULED: 'Geplant',
    READY: 'Bereit',
    DELIVERED: 'Geliefert',
    SHIPPED: 'Versendet',
    RECEIVED: 'Erhalten',
    CONFIRMED: 'Bestätigt',
    PAID: 'Bezahlt',
    UNPAID: 'Unbezahlt',
    PARTIAL: 'Teilweise',
    BLOCKED: 'Blockiert',
    LIVE: 'Live',
  },

  // Messages
  MESSAGES: {
    SUCCESS: {
      SAVED: 'Erfolgreich gespeichert',
      DELETED: 'Erfolgreich gelöscht',
      UPDATED: 'Erfolgreich aktualisiert',
      CREATED: 'Erfolgreich erstellt',
      IMPORTED: 'Erfolgreich importiert',
      EXPORTED: 'Erfolgreich exportiert',
    },
    ERROR: {
      SAVE_FAILED: 'Speichern fehlgeschlagen',
      DELETE_FAILED: 'Löschen fehlgeschlagen',
      UPDATE_FAILED: 'Aktualisierung fehlgeschlagen',
      CREATE_FAILED: 'Erstellung fehlgeschlagen',
      IMPORT_FAILED: 'Import fehlgeschlagen',
      EXPORT_FAILED: 'Export fehlgeschlagen',
      NETWORK_ERROR: 'Netzwerkfehler',
      UNAUTHORIZED: 'Nicht autorisiert',
      FORBIDDEN: 'Zugriff verweigert',
      NOT_FOUND: 'Nicht gefunden',
      SERVER_ERROR: 'Serverfehler',
      VALIDATION_ERROR: 'Validierungsfehler',
    },
    CONFIRM: {
      DELETE: 'Möchten Sie diesen Eintrag wirklich löschen?',
      DELETE_MULTIPLE: 'Möchten Sie die ausgewählten Einträge wirklich löschen?',
      UNSAVED_CHANGES: 'Sie haben ungespeicherte Änderungen. Möchten Sie fortfahren?',
      LOGOUT: 'Möchten Sie sich wirklich abmelden?',
      RESET_FORM: 'Möchten Sie das Formular zurücksetzen?',
    },
    LAST_UPDATE: 'Letzte Aktualisierung',
  },

  // Dates
  DATES: {
    TODAY: 'Heute',
    YESTERDAY: 'Gestern',
    TOMORROW: 'Morgen',
    THIS_WEEK: 'Diese Woche',
    LAST_WEEK: 'Letzte Woche',
    NEXT_WEEK: 'Nächste Woche',
    THIS_MONTH: 'Diesen Monat',
    LAST_MONTH: 'Letzten Monat',
    NEXT_MONTH: 'Nächsten Monat',
    THIS_YEAR: 'Dieses Jahr',
    LAST_YEAR: 'Letztes Jahr',
    NEXT_YEAR: 'Nächstes Jahr',
    CUSTOM: 'Benutzerdefiniert',
    FROM: 'Von',
    TO: 'Bis',
    DATE_RANGE: 'Zeitraum',
  },

  // Time
  TIME: {
    NOW: 'Jetzt',
    MINUTES_AGO: 'vor {count} Minuten',
    HOURS_AGO: 'vor {count} Stunden',
    DAYS_AGO: 'vor {count} Tagen',
    WEEKS_AGO: 'vor {count} Wochen',
    MONTHS_AGO: 'vor {count} Monaten',
    YEARS_AGO: 'vor {count} Jahren',
    JUST_NOW: 'Gerade eben',
    LAST_UPDATE: 'Letzte Aktualisierung',
  },

  // ERP Modules
  ERP: {
    CUSTOMER: 'Kunde',
    CUSTOMERS: 'Kunden',
    SUPPLIER: 'Lieferant',
    SUPPLIERS: 'Lieferanten',
    PRODUCT: 'Produkt',
    PRODUCTS: 'Produkte',
    ORDER: 'Auftrag',
    ORDERS: 'Aufträge',
    INVOICE: 'Rechnung',
    INVOICES: 'Rechnungen',
    QUOTE: 'Angebot',
    QUOTES: 'Angebote',
    PURCHASE_ORDER: 'Bestellung',
    PURCHASE_ORDERS: 'Bestellungen',
    SUPPLIER_OFFER: 'Lieferantenangebot',
    SUPPLIER_OFFERS: 'Lieferantenangebote',
    WAREHOUSE: 'Lager',
    WAREHOUSES: 'Lager',
    INVENTORY: 'Inventar',
    STOCK: 'Bestand',
    STOCK_LEVEL: 'Bestandsniveau',
    STOCK_MOVEMENT: 'Bestandsbewegung',
    STOCK_MOVEMENTS: 'Bestandsbewegungen',
    PRODUCTION: 'Produktion',
    PRODUCTION_ORDER: 'Produktionsauftrag',
    PRODUCTION_ORDERS: 'Produktionsaufträge',
    QUALITY: 'Qualität',
    QUALITY_CHECK: 'Qualitätsprüfung',
    QUALITY_CHECKS: 'Qualitätsprüfungen',
    FINANCE: 'Finanzen',
    ACCOUNTING: 'Buchhaltung',
    COST_CENTER: 'Kostenstelle',
    COST_CENTERS: 'Kostenstellen',
    PROJECT: 'Projekt',
    PROJECTS: 'Projekte',
    TASK: 'Aufgabe',
    TASKS: 'Aufgaben',
    EMPLOYEE: 'Mitarbeiter',
    EMPLOYEES: 'Mitarbeiter',
    DEPARTMENT: 'Abteilung',
    DEPARTMENTS: 'Abteilungen',
    POSITION: 'Position',
    POSITIONS: 'Positionen',
    INQUIRY_NUMBER: 'Anfragenummer',
    OPERATOR: 'Sachbearbeiter',
    SUPPLIER_OFFER_NUMBER: 'Lieferantengebotsnummer',
  },

  // Actions
  ACTIONS: {
    SAVE: 'Speichern',
    CANCEL: 'Abbrechen',
    DELETE: 'Löschen',
    EDIT: 'Bearbeiten',
    VIEW: 'Anzeigen',
    EXPORT: 'Exportieren',
    IMPORT: 'Importieren',
    NEXT: 'Weiter',
    BACK: 'Zurück',
  },

  // Validation
  VALIDATION: {
    REQUIRED: 'Dieses Feld ist erforderlich',
    EMAIL: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
    PHONE: 'Bitte geben Sie eine gültige Telefonnummer ein',
    MIN_LENGTH: 'Mindestens {min} Zeichen erforderlich',
    MAX_LENGTH: 'Maximal {max} Zeichen erlaubt',
    MIN_VALUE: 'Mindestwert: {min}',
    MAX_VALUE: 'Maximalwert: {max}',
    NUMERIC: 'Bitte geben Sie eine gültige Zahl ein',
    INTEGER: 'Bitte geben Sie eine ganze Zahl ein',
    DECIMAL: 'Bitte geben Sie eine Dezimalzahl ein',
    DATE: 'Bitte geben Sie ein gültiges Datum ein',
    TIME: 'Bitte geben Sie eine gültige Uhrzeit ein',
    URL: 'Bitte geben Sie eine gültige URL ein',
    PASSWORD: 'Passwort muss mindestens 8 Zeichen lang sein',
    PASSWORD_MATCH: 'Passwörter stimmen nicht überein',
    UNIQUE: 'Dieser Wert ist bereits vergeben',
    INVALID_FORMAT: 'Ungültiges Format',
    OUT_OF_RANGE: 'Wert außerhalb des erlaubten Bereichs',
  },

  // File Operations
  FILES: {
    UPLOAD: 'Datei hochladen',
    DOWNLOAD: 'Datei herunterladen',
    DELETE: 'Datei löschen',
    RENAME: 'Datei umbenennen',
    MOVE: 'Datei verschieben',
    COPY: 'Datei kopieren',
    SELECT_FILE: 'Datei auswählen',
    SELECT_FILES: 'Dateien auswählen',
    DRAG_DROP: 'Dateien hier ablegen oder klicken zum Auswählen',
    FILE_TOO_LARGE: 'Datei ist zu groß',
    INVALID_FILE_TYPE: 'Ungültiger Dateityp',
    UPLOAD_SUCCESS: 'Datei erfolgreich hochgeladen',
    UPLOAD_ERROR: 'Fehler beim Hochladen der Datei',
    NO_FILES_SELECTED: 'Keine Dateien ausgewählt',
    PROCESSING: 'Datei wird verarbeitet...',
    PROCESSED: 'Datei verarbeitet',
    PROCESSING_ERROR: 'Fehler bei der Verarbeitung',
  },

  // Search
  SEARCH: {
    PLACEHOLDER: 'Suchen...',
    NO_RESULTS: 'Keine Ergebnisse gefunden',
    SEARCHING: 'Suche...',
    SEARCH_RESULTS: 'Suchergebnisse',
    FILTER_RESULTS: 'Ergebnisse filtern',
    CLEAR_SEARCH: 'Suche löschen',
    ADVANCED_SEARCH: 'Erweiterte Suche',
    SEARCH_IN: 'Suchen in',
    ALL_FIELDS: 'Alle Felder',
    TITLE: 'Titel',
    DESCRIPTION: 'Beschreibung',
    CONTENT: 'Inhalt',
    TAGS: 'Tags',
    CATEGORY: 'Kategorie',
    DATE_RANGE: 'Zeitraum',
    SORT_BY: 'Sortieren nach',
    RELEVANCE: 'Relevanz',
    DATE: 'Datum',
    NAME: 'Name',
    TYPE: 'Typ',
  },
} as const

// Type für UI_LABELS
export type UILabels = typeof UI_LABELS

// Helper-Funktionen für dynamische Labels
export const getLabel = (path: string, fallback?: string): string => {
  const keys = path.split('.')
  let current = UI_LABELS

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return fallback || path
    }
  }

  return typeof current === 'string' ? current : fallback || path
}

export const formatLabel = (label: string, params: Record<string, unknown>): string => {
  return label.replace(/\{(\w+)\}/g, (_match, key) => {
    return params[key] !== undefined ? String(params[key]) : match
  })
}
