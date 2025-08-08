import React from 'react';
import { Box, Typography, Chip, Alert, Button, IconButton, Tooltip } from '@mui/material';
import {
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Help as HelpIcon
} from '@mui/icons-material';

// =====================================================
// UI STANDARDIZATION CONSTANTS
// =====================================================

/**
 * Zentrale Label-Definitionen für das gesamte System
 */
export const UI_LABELS = {
  // Allgemeine Aktionen
  ACTIONS: {
    SAVE: 'Speichern',
    CANCEL: 'Abbrechen',
    RESET: 'Zurücksetzen',
    DELETE: 'Löschen',
    EDIT: 'Bearbeiten',
    VIEW: 'Anzeigen',
    SEARCH: 'Suchen',
    FILTER: 'Filter',
    SORT: 'Sortieren',
    EXPORT: 'Exportieren',
    IMPORT: 'Importieren',
    ADD: 'Hinzufügen',
    UPDATE: 'Aktualisieren',
    SUBMIT: 'Absenden',
    CONFIRM: 'Bestätigen',
    BACK: 'Zurück',
    NEXT: 'Weiter',
    CLOSE: 'Schließen',
    OPEN: 'Öffnen',
    DOWNLOAD: 'Herunterladen',
    UPLOAD: 'Hochladen',
    PRINT: 'Drucken',
    PREVIEW: 'Vorschau',
    REFRESH: 'Aktualisieren',
    CLEAR: 'Löschen',
    COPY: 'Kopieren',
    PASTE: 'Einfügen',
    UNDO: 'Rückgängig',
    REDO: 'Wiederholen',
    ACCEPT: 'Akzeptieren',
    REJECT: 'Ablehnen',
    RETRY: 'Erneut versuchen',
    RELOAD_PAGE: 'Seite neu laden',
    LOGOUT: 'Abmelden'
  },

  // Formular-Labels
  FORMS: {
    NAME: 'Name',
    EMAIL: 'E-Mail',
    PHONE: 'Telefon',
    ADDRESS: 'Adresse',
    CITY: 'Stadt',
    ZIP_CODE: 'PLZ',
    COUNTRY: 'Land',
    DESCRIPTION: 'Beschreibung',
    NOTES: 'Notizen',
    STATUS: 'Status',
    PRIORITY: 'Priorität',
    DATE: 'Datum',
    TIME: 'Zeit',
    AMOUNT: 'Betrag',
    QUANTITY: 'Menge',
    PRICE: 'Preis',
    CURRENCY: 'Währung',
    TAX_RATE: 'Steuersatz',
    DISCOUNT: 'Rabatt',
    TOTAL: 'Gesamt',
    SUBTOTAL: 'Zwischensumme',
    TAX_AMOUNT: 'Steuerbetrag',
    NET_AMOUNT: 'Nettobetrag',
    GROSS_AMOUNT: 'Bruttobetrag',
    SALUTATION: 'Anrede',
    STEP: 'Schritt',
    OF: 'von'
  },

  // ERP-spezifische Labels
  ERP: {
    CUSTOMER_NUMBER: 'Kundennummer',
    ORDER_NUMBER: 'Auftragsnummer',
    INVOICE_NUMBER: 'Rechnungsnummer',
    DELIVERY_NUMBER: 'Lieferscheinnummer',
    PRODUCT_NUMBER: 'Artikelnummer',
    SUPPLIER_NUMBER: 'Lieferantennummer',
    EMPLOYEE_NUMBER: 'Mitarbeiternummer',
    PROJECT_NUMBER: 'Projektnummer',
    CONTRACT_NUMBER: 'Vertragsnummer',
    QUOTE_NUMBER: 'Angebotsnummer',
    PURCHASE_ORDER_NUMBER: 'Bestellnummer',
    RECEIPT_NUMBER: 'Belegnummer',
    TRANSACTION_NUMBER: 'Transaktionsnummer',
    REFERENCE_NUMBER: 'Referenznummer',
    BATCH_NUMBER: 'Chargennummer',
    SERIAL_NUMBER: 'Seriennummer',
    BARCODE: 'Barcode',
    QR_CODE: 'QR-Code',
    SKU: 'Artikelnummer',
    EAN: 'EAN-Code',
    ISBN: 'ISBN',
    GTIN: 'GTIN',
    CREDITOR_ACCOUNT_NUMBER: 'Kreditor-Kontonummer',
    SUPPLIER: 'Lieferant',
    INQUIRY_NUMBER: 'Anfragenummer',
    OPERATOR: 'Bearbeiter',
    SUPPLIER_OFFER_NUMBER: 'Lieferanten-Angebotsnummer',
    SUPPLIER_OFFER: 'Lieferanten-Angebot'
  },

  // Status-Labels
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
    SUSPENDED: 'Ausgesetzt',
    EXPIRED: 'Abgelaufen',
    OVERDUE: 'Überfällig',
    PROCESSING: 'In Bearbeitung',
    APPROVED: 'Genehmigt',
    REJECTED: 'Abgelehnt',
    ON_HOLD: 'Pausiert',
    SCHEDULED: 'Geplant',
    IN_PROGRESS: 'In Bearbeitung',
    READY: 'Bereit',
    SHIPPED: 'Versendet',
    DELIVERED: 'Geliefert',
    RETURNED: 'Zurückgegeben',
    REFUNDED: 'Erstattet',
    AVAILABLE: 'Verfügbar',
    UNAVAILABLE: 'Nicht verfügbar',
    ONLINE: 'Online',
    OFFLINE: 'Offline',
    MAINTENANCE: 'Wartung',
    ERROR: 'Fehler',
    HIGH: 'Hoch',
    MEDIUM: 'Mittel',
    LOW: 'Niedrig',
    UNKNOWN: 'Unbekannt',
    DISABLED: 'Deaktiviert',
    LIVE: 'Live'
  },

  // Prioritäts-Labels
  PRIORITY: {
    LOW: 'Niedrig',
    MEDIUM: 'Mittel',
    HIGH: 'Hoch',
    URGENT: 'Dringend',
    CRITICAL: 'Kritisch'
  },

  // Navigation-Labels (erweitert)
  NAVIGATION: {
    DASHBOARD: 'Dashboard',
    USERS: 'Benutzer',
    CUSTOMERS: 'Kunden',
    SUPPLIERS: 'Lieferanten',
    PRODUCTS: 'Artikel',
    ORDERS: 'Aufträge',
    INVOICES: 'Rechnungen',
    DELIVERIES: 'Lieferungen',
    INVENTORY: 'Lager',
    REPORTS: 'Berichte',
    SETTINGS: 'Einstellungen',
    HELP: 'Hilfe',
    PROFILE: 'Profil',
    LOGOUT: 'Abmelden',
    LOGIN: 'Anmelden',
    REGISTER: 'Registrieren',
    FORGOT_PASSWORD: 'Passwort vergessen',
    CHANGE_PASSWORD: 'Passwort ändern',
    ACCOUNT_SETTINGS: 'Kontoeinstellungen',
    SYSTEM_SETTINGS: 'Systemeinstellungen',
    USER_MANAGEMENT: 'Benutzerverwaltung',
    ROLE_MANAGEMENT: 'Rollenverwaltung',
    PERMISSION_MANAGEMENT: 'Berechtigungsverwaltung',
    AI_DASHBOARD: 'KI-Dashboard',
    DOCUMENTS: 'Dokumente',
    POS: 'Point of Sale',
    USER_MENU: 'Benutzermenü',
    OPEN_MENU: 'Menü öffnen',
    USER: 'Benutzer',
    APP: 'Anwendung',
    NOTIFICATIONS: 'Benachrichtigungen',
    STRECKENGESCHAEFT: 'Streckengeschäft',
    DAILY_REPORT: 'Tagesbericht',
    E_INVOICING: 'E-Invoicing',
    AI_BARCODE_DASHBOARD: 'AI Barcode Dashboard',
    AI_INVENTORY_DASHBOARD: 'AI Inventory Dashboard',
    AI_VOUCHER_DASHBOARD: 'AI Voucher Dashboard',
    CRM: 'CRM',
    CRM_DESCRIPTION: 'Kundenverwaltung',
    WAREHOUSE_MANAGEMENT: 'Warenwirtschaft',
    WAREHOUSE_DESCRIPTION: 'L3 Warenwirtschaft & ERP',
    FINANCE: 'Finanzwesen',
    FINANCE_DESCRIPTION: 'Finanzbuchhaltung',
    INVENTORY_DESCRIPTION: 'Lagerverwaltung',
    BI: 'BI',
    BI_DESCRIPTION: 'Business Intelligence',
    DMS: 'DMS',
    DMS_DESCRIPTION: 'Dokumentenmanagement',
    SETTINGS_DESCRIPTION: 'Systemkonfiguration',
    HELP_DESCRIPTION: 'Support & Dokumentation',
    PAYROLL: 'Lohn & Gehalt',
    SALES: 'Vertrieb',
    STOCK: 'Bestand',
    MOVEMENTS: 'Bewegungen',
    PRODUCTION: 'Produktion',
    PRODUCTION_ORDERS: 'Produktionsaufträge',
    PLANNING: 'Planung',
    QUALITY: 'Qualitätsmanagement',
    INSPECTIONS: 'Prüfungen',
    PROJECTS: 'Projekte'
  },

  // Modul-Labels
  MODULES: {
    CRM: 'Kundenbeziehungsmanagement',
    ERP: 'Enterprise Resource Planning',
    WMS: 'Lagerverwaltungssystem',
    POS: 'Point of Sale',
    FINANCE: 'Finanzwesen',
    HR: 'Personalwesen',
    PROJECT: 'Projektmanagement',
    QUALITY: 'Qualitätsmanagement',
    MAINTENANCE: 'Instandhaltung',
    PRODUCTION: 'Produktion',
    PURCHASING: 'Einkauf',
    SALES: 'Vertrieb',
    MARKETING: 'Marketing',
    ANALYTICS: 'Analytik',
    REPORTING: 'Berichtswesen',
    DOCUMENT_MANAGEMENT: 'Dokumentenverwaltung',
    WORKFLOW: 'Workflow',
    NOTIFICATIONS: 'Benachrichtigungen',
    MESSAGING: 'Nachrichten',
    CALENDAR: 'Kalender',
    TASKS: 'Aufgaben',
    PROJECTS: 'Projekte',
    ASSETS: 'Anlagen',
    CONTRACTS: 'Verträge',
    QUOTES: 'Angebote',
    PURCHASE_ORDERS: 'Bestellungen',
    RECEIPTS: 'Belege',
    TRANSACTIONS: 'Transaktionen',
    BATCHES: 'Chargen',
    SERIALS: 'Seriennummern',
    BARCODES: 'Barcodes',
    QR_CODES: 'QR-Codes'
  },

  // Nachrichten und Status
  MESSAGES: {
    SUCCESS: 'Erfolgreich',
    ERROR: 'Fehler',
    WARNING: 'Warnung',
    INFO: 'Information',
    LOADING: 'Lädt...',
    SAVING: 'Speichere...',
    DELETING: 'Lösche...',
    UPDATING: 'Aktualisiere...',
    CREATING: 'Erstelle...',
    SEARCHING: 'Suche...',
    NO_DATA: 'Keine Daten verfügbar',
    NO_RESULTS: 'Keine Ergebnisse gefunden',
    PLEASE_WAIT: 'Bitte warten...',
    ROUTE_PREPARED: 'Route vorbereitet',
    PRELOAD_STATUS: 'Preload-Status',
    PREVIOUS_VALUE: 'Vorheriger Wert',
    DATA_SOURCE: 'Datenquelle',
    FIELD: 'Feld',
    AUTO_REFRESH: 'Auto-Refresh',
    MCP_STATUS: 'MCP-Status',
    LAST_UPDATE: 'Letzte Aktualisierung'
  },

  // Validierung
  VALIDATION: {
    REQUIRED: 'Dieses Feld ist erforderlich',
    EMAIL: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
    PHONE: 'Bitte geben Sie eine gültige Telefonnummer ein',
    URL: 'Bitte geben Sie eine gültige URL ein',
    NUMBER: 'Bitte geben Sie eine gültige Zahl ein',
    INTEGER: 'Bitte geben Sie eine ganze Zahl ein',
    POSITIVE: 'Bitte geben Sie eine positive Zahl ein',
    MIN_LENGTH: 'Mindestens {min} Zeichen erforderlich',
    MAX_LENGTH: 'Maximal {max} Zeichen erlaubt',
    MIN_VALUE: 'Mindestwert ist {min}',
    MAX_VALUE: 'Maximalwert ist {max}',
    PATTERN: 'Ungültiges Format',
    UNIQUE: 'Dieser Wert ist bereits vorhanden',
    CONFIRM_PASSWORD: 'Passwörter stimmen nicht überein',
    STRONG_PASSWORD: 'Passwort muss mindestens 8 Zeichen lang sein und Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen enthalten'
  },

  // App-spezifische Labels
  APP: {
    TITLE: 'VALEO NeuroERP',
    VERSION: 'v2.0',
    DESCRIPTION: 'Intelligentes ERP-System mit KI-Integration'
  },

  // AI-spezifische Labels
  AI: {
    SUGGESTION: 'KI-Vorschlag',
    CONFIDENCE: 'Konfidenz:',
    DETAILS: 'Details:',
    TRUST_LEVEL: 'Vertrauensstufe'
  },

  // Notifications-Labels
  NOTIFICATIONS: {
    TITLE: 'Benachrichtigungen',
    UNREAD: 'ungelesen',
    UNREAD_COUNT: 'ungelesene Benachrichtigungen',
    FILTERS: {
      ALL: 'Alle',
      UNREAD: 'Ungelesen',
      AI: 'KI',
      SYSTEM: 'System',
      BUSINESS: 'Geschäft'
    },
    NO_NOTIFICATIONS: 'Keine Benachrichtigungen',
    MARK_ALL_READ: 'Alle als gelesen markieren',
    VIEW_ALL: 'Alle Benachrichtigungen anzeigen'
  },

  // Errors-Labels
  ERRORS: {
    TITLE: 'Ein Fehler ist aufgetreten',
    DESCRIPTION: 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
    DETAILS_TITLE: 'Fehlerdetails (nur in Entwicklung):'
  }
} as const;

// =====================================================
// UI STANDARDIZATION COMPONENTS
// =====================================================

/**
 * Standardisierte Status-Chip-Komponente
 */
export const StatusChip: React.FC<{
  status: keyof typeof UI_LABELS.STATUS;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}> = ({ status, size = 'medium', variant = 'filled' }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'COMPLETED':
      case 'APPROVED':
      case 'READY':
      case 'DELIVERED':
        return 'success';
      case 'PENDING':
      case 'PROCESSING':
      case 'IN_PROGRESS':
      case 'SCHEDULED':
        return 'warning';
      case 'CANCELLED':
      case 'REJECTED':
      case 'DELETED':
      case 'EXPIRED':
      case 'OVERDUE':
        return 'error';
      case 'DRAFT':
      case 'INACTIVE':
      case 'SUSPENDED':
      case 'ON_HOLD':
        return 'default';
      default:
        return 'primary';
    }
  };

  return (
    <Chip
      label={UI_LABELS.STATUS[status]}
      color={getStatusColor(status) as any}
      size={size}
      variant={variant}
      sx={{ fontWeight: 500 }}
    />
  );
};

/**
 * Standardisierte Prioritäts-Chip-Komponente
 */
export const PriorityChip: React.FC<{
  priority: keyof typeof UI_LABELS.PRIORITY;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}> = ({ priority, size = 'medium', variant = 'filled' }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'default';
      case 'MEDIUM':
        return 'primary';
      case 'HIGH':
        return 'warning';
      case 'URGENT':
      case 'CRITICAL':
        return 'error';
      default:
        return 'primary';
    }
  };

  return (
    <Chip
      label={UI_LABELS.PRIORITY[priority]}
      color={getPriorityColor(priority) as any}
      size={size}
      variant={variant}
      sx={{ fontWeight: 500 }}
    />
  );
};

/**
 * Standardisierte Meldungs-Komponente
 */
export const StandardMessage: React.FC<{
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  showIcon?: boolean;
}> = ({ type, title, message, onClose, showIcon = true }) => {
  const getIcon = () => {
    if (!showIcon) return null;
    
    switch (type) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Alert
      severity={type}
      onClose={onClose}
      icon={getIcon()}
      sx={{ 
        borderRadius: 2,
        '& .MuiAlert-message': {
          width: '100%'
        }
      }}
    >
      {title && (
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>
      )}
      {message}
    </Alert>
  );
};

/**
 * Standardisierte Info-Tooltip-Komponente
 */
export const InfoTooltip: React.FC<{
  title: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
}> = ({ title, children, placement = 'top', size = 'small' }) => {
  return (
    <Tooltip title={title} placement={placement} arrow>
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {children}
        <IconButton size={size} sx={{ ml: 0.5, color: 'text.secondary' }}>
          <InfoIcon fontSize={size} />
        </IconButton>
      </Box>
    </Tooltip>
  );
};

/**
 * Standardisierte Hilfe-Komponente
 */
export const HelpButton: React.FC<{
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ title, content, placement = 'top' }) => {
  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2">
            {content}
          </Typography>
        </Box>
      }
      placement={placement}
      arrow
    >
      <IconButton size="small" sx={{ color: 'text.secondary' }}>
        <HelpIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

/**
 * Hook für UI-Standardisierung
 */
export const useUIStandardization = () => {
  return {
    labels: UI_LABELS,
    getLabel: (path: string) => {
      const keys = path.split('.');
      let value: any = UI_LABELS;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return path; // Fallback: return original path if not found
        }
      }
      
      return typeof value === 'string' ? value : path;
    }
  };
};

export default {
  UI_LABELS,
  StatusChip,
  PriorityChip,
  StandardMessage,
  InfoTooltip,
  HelpButton,
  useUIStandardization
}; 