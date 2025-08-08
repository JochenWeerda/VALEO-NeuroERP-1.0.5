import { z } from 'zod';
import {
  FormConfig,
  StandardizedFormConfig,
  FormTab,
  FormLayout,
  STANDARD_WAWI_TABS,
  STANDARD_FIBU_TABS,
  STANDARD_CRM_TABS,
  STANDARD_WORKFLOW_TIMELINE,
  STANDARD_BELEGFOLGE,
  FORM_TEMPLATES
} from '../types/forms';
import { MissingFormsGenerator } from './MissingFormsGenerator';

/**
 * Erweiterte Formular-Registry für VALEO NeuroERP
 * Basierend auf UIX-Recherche und modernen ERP-Standards
 * 
 * Diese Registry enthält alle 150+ Formulare für:
 * - Warenwirtschaft (WaWi)
 * - Finanzbuchhaltung (FiBu) 
 * - CRM (Kundenbeziehungsmanagement)
 * - Übergreifende Services
 */

// ============================================================================
// WAWI (WARENWIRTSCHAFT) FORMULARE
// ============================================================================

// Artikelstammdaten
export const ARTIKELSTAMMDATEN_CONFIG: StandardizedFormConfig = {
  id: 'wawi-artikelstammdaten',
  metadata: {
    id: 'wawi-artikelstammdaten',
    name: 'Artikelstammdaten verwalten',
    module: 'warenwirtschaft',
    version: '1.0.0',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system',
    description: 'Zentrale Verwaltung aller Artikel-Informationen',
    tags: ['artikel', 'stammdaten', 'warenwirtschaft'],
    dependencies: [],
    permissions: {
      super_admin: ['read', 'write', 'admin', 'delete'],
      admin: ['read', 'write', 'admin'],
      manager: ['read', 'write'],
      accountant: ['read'],
      warehouse: ['read', 'write'],
      sales: ['read'],
      viewer: ['read']
    }
  },
  fields: [
    { name: 'artikelnummer', label: 'Artikelnummer', type: 'text' as const, required: true },
    { name: 'bezeichnung', label: 'Bezeichnung', type: 'text' as const, required: true },
    { name: 'kategorie', label: 'Kategorie', type: 'select' as const, required: true },
    { name: 'beschreibung', label: 'Beschreibung', type: 'textarea' as const },
    { name: 'einkaufspreis', label: 'Einkaufspreis', type: 'number' as const, required: true },
    { name: 'verkaufspreis', label: 'Verkaufspreis', type: 'number' as const, required: true },
    { name: 'rabatt', label: 'Rabatt (%)', type: 'number' as const },
    { name: 'mindestbestand', label: 'Mindestbestand', type: 'number' as const },
    { name: 'maximalbestand', label: 'Maximalbestand', type: 'number' as const },
    { name: 'lagerplatz', label: 'Lagerplatz', type: 'text' as const }
  ],
  validationSchema: z.object({
    artikelnummer: z.string().min(1, 'Artikelnummer ist erforderlich'),
    bezeichnung: z.string().min(2, 'Bezeichnung muss mindestens 2 Zeichen lang sein'),
    kategorie: z.string().min(1, 'Kategorie ist erforderlich'),
    einkaufspreis: z.number().min(0, 'Einkaufspreis muss positiv sein'),
    verkaufspreis: z.number().min(0, 'Verkaufspreis muss positiv sein')
  }),
  defaultValues: {},
  size: 'large',
  features: {
    autoSave: true,
    autoSaveInterval: 30000,
    keyboardShortcuts: true,
    barcodeScanner: true,
    progressBar: true,
    conditionalFields: true,
    groupedFields: true,
    realTimeValidation: true,
    accessibility: true,
    mobileOptimized: true,
    offlineSupport: false,
    bulkOperations: true,
    printSupport: true,
    exportSupport: true
  },
  module: 'warenwirtschaft',
  layout: {
    type: 'tabs',
    tabs: [
      {
        id: 'grunddaten',
        label: 'Grunddaten',
        icon: 'Article',
        fields: ['artikelnummer', 'bezeichnung', 'kategorie', 'beschreibung']
      },
      {
        id: 'preise',
        label: 'Preise & Kalkulation',
        icon: 'Euro',
        fields: ['einkaufspreis', 'verkaufspreis', 'rabatt']
      },
      {
        id: 'lager',
        label: 'Lager & Bestand',
        icon: 'Warehouse',
        fields: ['mindestbestand', 'maximalbestand', 'lagerplatz']
      }
    ],
    navigation: {
      showProgress: true,
      showTimeline: true,
      showBreadcrumbs: true,
      allowSkip: false,
      allowBack: true
    },
    validation: {
      realTime: true,
      onTabChange: true,
      onStepChange: true,
      showErrors: true,
      mode: 'onChange'
    },
    autoSave: {
      enabled: true,
      interval: 30000,
      showIndicator: true
    }
  },
  workflow: {
    steps: STANDARD_BELEGFOLGE.workflow,
    currentStep: 0,
    canEdit: true,
    canApprove: true,
    canReject: true
  },
  permissions: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canReject: true,
    canView: true
  }
};

// Einlagerung
export const EINLAGERUNG_CONFIG: StandardizedFormConfig = {
  id: 'wawi-einlagerung',
  metadata: {
    id: 'wawi-einlagerung',
    name: 'Einlagerung',
    module: 'warenwirtschaft',
    version: '1.0.0',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system',
    description: 'Wareneingang und Einlagerung verwalten',
    tags: ['einlagerung', 'wareneingang', 'warenwirtschaft'],
    dependencies: [],
    permissions: {
      super_admin: ['read', 'write', 'admin', 'delete'],
      admin: ['read', 'write', 'admin'],
      manager: ['read', 'write'],
      accountant: ['read'],
      warehouse: ['read', 'write'],
      sales: ['read'],
      viewer: ['read']
    }
  },
  fields: [
    { name: 'lieferant', label: 'Lieferant', type: 'select' as const, required: true },
    { name: 'lieferdatum', label: 'Lieferdatum', type: 'date' as const, required: true },
    { name: 'lieferschein', label: 'Lieferschein-Nr.', type: 'text' as const, required: true },
    { name: 'artikel', label: 'Artikel', type: 'select' as const, required: true },
    { name: 'menge', label: 'Menge', type: 'number' as const, required: true },
    { name: 'einheit', label: 'Einheit', type: 'select' as const, required: true },
    { name: 'lagerplatz', label: 'Lagerplatz', type: 'select' as const, required: true },
    { name: 'qualitaetskontrolle', label: 'Qualitätskontrolle', type: 'checkbox' as const },
    { name: 'bemerkungen', label: 'Bemerkungen', type: 'textarea' as const }
  ],
  validationSchema: z.object({
    lieferant: z.string().min(1, 'Lieferant ist erforderlich'),
    lieferdatum: z.date(),
    lieferschein: z.string().min(1, 'Lieferschein-Nr. ist erforderlich'),
    artikel: z.string().min(1, 'Artikel ist erforderlich'),
    menge: z.number().min(0, 'Menge muss positiv sein'),
    einheit: z.string().min(1, 'Einheit ist erforderlich'),
    lagerplatz: z.string().min(1, 'Lagerplatz ist erforderlich')
  }),
  defaultValues: {},
  size: 'large',
  features: {
    autoSave: true,
    autoSaveInterval: 30000,
    keyboardShortcuts: true,
    barcodeScanner: true,
    progressBar: true,
    conditionalFields: true,
    groupedFields: true,
    realTimeValidation: true,
    accessibility: true,
    mobileOptimized: true,
    offlineSupport: false,
    bulkOperations: true,
    printSupport: true,
    exportSupport: true
  },
  module: 'warenwirtschaft',
  layout: {
    type: 'tabs',
    tabs: [
      {
        id: 'wareneingang',
        label: 'Wareneingang',
        icon: 'Input',
        fields: ['lieferant', 'lieferdatum', 'lieferschein']
      },
      {
        id: 'artikel',
        label: 'Artikel',
        icon: 'Article',
        fields: ['artikel', 'menge', 'einheit']
      },
      {
        id: 'lagerung',
        label: 'Lagerung',
        icon: 'Warehouse',
        fields: ['lagerplatz', 'qualitaetskontrolle', 'bemerkungen']
      }
    ],
    navigation: {
      showProgress: true,
      showTimeline: true,
      showBreadcrumbs: true,
      allowSkip: false,
      allowBack: true
    },
    validation: {
      realTime: true,
      onTabChange: true,
      onStepChange: true,
      showErrors: true,
      mode: 'onChange'
    },
    autoSave: {
      enabled: true,
      interval: 30000,
      showIndicator: true
    }
  },
  workflow: {
    steps: STANDARD_BELEGFOLGE.workflow,
    currentStep: 0,
    canEdit: true,
    canApprove: true,
    canReject: true
  },
  permissions: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canReject: true,
    canView: true
  }
};

// Auslagerung
export const AUSLAGERUNG_CONFIG: StandardizedFormConfig = {
  id: 'wawi-auslagerung',
  metadata: {
    id: 'wawi-auslagerung',
    name: 'Auslagerung',
    module: 'warenwirtschaft',
    version: '1.0.0',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system',
    description: 'Warenausgang und Auslagerung verwalten',
    tags: ['auslagerung', 'warenausgang', 'warenwirtschaft'],
    dependencies: [],
    permissions: {
      super_admin: ['read', 'write', 'admin', 'delete'],
      admin: ['read', 'write', 'admin'],
      manager: ['read', 'write'],
      accountant: ['read'],
      warehouse: ['read', 'write'],
      sales: ['read'],
      viewer: ['read']
    }
  },
  fields: [
    { name: 'kunde', label: 'Kunde', type: 'select' as const, required: true },
    { name: 'auftragsdatum', label: 'Auftragsdatum', type: 'date' as const, required: true },
    { name: 'auftragsnummer', label: 'Auftragsnummer', type: 'text' as const, required: true },
    { name: 'artikel', label: 'Artikel', type: 'select' as const, required: true },
    { name: 'menge', label: 'Menge', type: 'number' as const, required: true },
    { name: 'einheit', label: 'Einheit', type: 'select' as const, required: true },
    { name: 'versandart', label: 'Versandart', type: 'select' as const, required: true },
    { name: 'versanddatum', label: 'Versanddatum', type: 'date' as const },
    { name: 'tracking', label: 'Tracking-Nr.', type: 'text' as const }
  ],
  validationSchema: z.object({
    kunde: z.string().min(1, 'Kunde ist erforderlich'),
    auftragsdatum: z.date(),
    auftragsnummer: z.string().min(1, 'Auftragsnummer ist erforderlich'),
    artikel: z.string().min(1, 'Artikel ist erforderlich'),
    menge: z.number().min(0, 'Menge muss positiv sein'),
    einheit: z.string().min(1, 'Einheit ist erforderlich'),
    versandart: z.string().min(1, 'Versandart ist erforderlich')
  }),
  defaultValues: {},
  size: 'large',
  features: {
    autoSave: true,
    autoSaveInterval: 30000,
    keyboardShortcuts: true,
    barcodeScanner: true,
    progressBar: true,
    conditionalFields: true,
    groupedFields: true,
    realTimeValidation: true,
    accessibility: true,
    mobileOptimized: true,
    offlineSupport: false,
    bulkOperations: true,
    printSupport: true,
    exportSupport: true
  },
  module: 'warenwirtschaft',
  layout: {
    type: 'tabs',
    tabs: [
      {
        id: 'warenausgang',
        label: 'Warenausgang',
        icon: 'Output',
        fields: ['kunde', 'auftragsdatum', 'auftragsnummer']
      },
      {
        id: 'artikel',
        label: 'Artikel',
        icon: 'Article',
        fields: ['artikel', 'menge', 'einheit']
      },
      {
        id: 'versand',
        label: 'Versand',
        icon: 'LocalShipping',
        fields: ['versandart', 'versanddatum', 'tracking']
      }
    ],
    navigation: {
      showProgress: true,
      showTimeline: true,
      showBreadcrumbs: true,
      allowSkip: false,
      allowBack: true
    },
    validation: {
      realTime: true,
      onTabChange: true,
      onStepChange: true,
      showErrors: true,
      mode: 'onChange'
    },
    autoSave: {
      enabled: true,
      interval: 30000,
      showIndicator: true
    }
  },
  workflow: {
    steps: STANDARD_BELEGFOLGE.workflow,
    currentStep: 0,
    canEdit: true,
    canApprove: true,
    canReject: true
  },
  permissions: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canReject: true,
    canView: true
  }
};

// ============================================================================
// FIBU (FINANZBUCHHALTUNG) FORMULARE
// ============================================================================

// Buchung
export const BUCHUNG_CONFIG: StandardizedFormConfig = {
  id: 'fibu-buchung',
  metadata: {
    id: 'fibu-buchung',
    name: 'Buchung',
    module: 'finanzbuchhaltung',
    version: '1.0.0',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system',
    description: 'Finanzbuchhaltung - Buchungen verwalten',
    tags: ['buchung', 'finanzbuchhaltung', 'fibu'],
    dependencies: [],
    permissions: {
      super_admin: ['read', 'write', 'admin', 'delete'],
      admin: ['read', 'write', 'admin'],
      manager: ['read', 'write'],
      accountant: ['read', 'write'],
      warehouse: ['read'],
      sales: ['read'],
      viewer: ['read']
    }
  },
  fields: [
    { name: 'buchungsdatum', label: 'Buchungsdatum', type: 'date' as const, required: true },
    { name: 'belegnummer', label: 'Belegnummer', type: 'text' as const, required: true },
    { name: 'buchungstext', label: 'Buchungstext', type: 'textarea' as const, required: true },
    { name: 'konto', label: 'Konto', type: 'select' as const, required: true },
    { name: 'betrag', label: 'Betrag', type: 'number' as const, required: true },
    { name: 'soll_haben', label: 'Soll/Haben', type: 'select' as const, required: true },
    { name: 'steuersatz', label: 'Steuersatz', type: 'select' as const },
    { name: 'kostenstelle', label: 'Kostenstelle', type: 'select' as const },
    { name: 'buchungskreis', label: 'Buchungskreis', type: 'select' as const }
  ],
  validationSchema: z.object({
    buchungsdatum: z.date(),
    belegnummer: z.string().min(1, 'Belegnummer ist erforderlich'),
    buchungstext: z.string().min(1, 'Buchungstext ist erforderlich'),
    konto: z.string().min(1, 'Konto ist erforderlich'),
    betrag: z.number().min(0, 'Betrag muss positiv sein'),
    soll_haben: z.string().min(1, 'Soll/Haben ist erforderlich')
  }),
  defaultValues: {},
  size: 'large',
  features: {
    autoSave: true,
    autoSaveInterval: 30000,
    keyboardShortcuts: true,
    barcodeScanner: false,
    progressBar: true,
    conditionalFields: true,
    groupedFields: true,
    realTimeValidation: true,
    accessibility: true,
    mobileOptimized: true,
    offlineSupport: false,
    bulkOperations: true,
    printSupport: true,
    exportSupport: true
  },
  module: 'finanzbuchhaltung',
  layout: {
    type: 'tabs',
    tabs: [
      {
        id: 'grunddaten',
        label: 'Grunddaten',
        icon: 'Description',
        fields: ['buchungsdatum', 'belegnummer', 'buchungstext']
      },
      {
        id: 'buchung',
        label: 'Buchung',
        icon: 'AccountBalance',
        fields: ['konto', 'betrag', 'soll_haben']
      },
      {
        id: 'zusatz',
        label: 'Zusatz',
        icon: 'Settings',
        fields: ['steuersatz', 'kostenstelle', 'buchungskreis']
      }
    ],
    navigation: {
      showProgress: true,
      showTimeline: true,
      showBreadcrumbs: true,
      allowSkip: false,
      allowBack: true
    },
    validation: {
      realTime: true,
      onTabChange: true,
      onStepChange: true,
      showErrors: true,
      mode: 'onChange'
    },
    autoSave: {
      enabled: true,
      interval: 30000,
      showIndicator: true
    }
  },
  workflow: {
    steps: STANDARD_BELEGFOLGE.workflow,
    currentStep: 0,
    canEdit: true,
    canApprove: true,
    canReject: true
  },
  permissions: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canReject: true,
    canView: true
  }
};

// Rechnung
export const RECHNUNG_CONFIG: StandardizedFormConfig = {
  id: 'fibu-rechnung',
  metadata: {
    id: 'fibu-rechnung',
    name: 'Rechnung',
    module: 'finanzbuchhaltung',
    version: '1.0.0',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system',
    description: 'Finanzbuchhaltung - Rechnungen verwalten',
    tags: ['rechnung', 'finanzbuchhaltung', 'fibu'],
    dependencies: [],
    permissions: {
      super_admin: ['read', 'write', 'admin', 'delete'],
      admin: ['read', 'write', 'admin'],
      manager: ['read', 'write'],
      accountant: ['read', 'write'],
      warehouse: ['read'],
      sales: ['read'],
      viewer: ['read']
    }
  },
  fields: [
    { name: 'rechnungsdatum', label: 'Rechnungsdatum', type: 'date' as const, required: true },
    { name: 'rechnungsnummer', label: 'Rechnungsnummer', type: 'text' as const, required: true },
    { name: 'kunde', label: 'Kunde', type: 'select' as const, required: true },
    { name: 'artikel', label: 'Artikel', type: 'select' as const, required: true },
    { name: 'menge', label: 'Menge', type: 'number' as const, required: true },
    { name: 'einzelpreis', label: 'Einzelpreis', type: 'number' as const, required: true },
    { name: 'nettobetrag', label: 'Nettobetrag', type: 'number' as const, required: true },
    { name: 'steuerbetrag', label: 'Steuerbetrag', type: 'number' as const, required: true },
    { name: 'bruttobetrag', label: 'Bruttobetrag', type: 'number' as const, required: true }
  ],
  validationSchema: z.object({
    rechnungsdatum: z.date(),
    rechnungsnummer: z.string().min(1, 'Rechnungsnummer ist erforderlich'),
    kunde: z.string().min(1, 'Kunde ist erforderlich'),
    artikel: z.string().min(1, 'Artikel ist erforderlich'),
    menge: z.number().min(0, 'Menge muss positiv sein'),
    einzelpreis: z.number().min(0, 'Einzelpreis muss positiv sein'),
    nettobetrag: z.number().min(0, 'Nettobetrag muss positiv sein'),
    steuerbetrag: z.number().min(0, 'Steuerbetrag muss positiv sein'),
    bruttobetrag: z.number().min(0, 'Bruttobetrag muss positiv sein')
  }),
  defaultValues: {},
  size: 'large',
  features: {
    autoSave: true,
    autoSaveInterval: 30000,
    keyboardShortcuts: true,
    barcodeScanner: false,
    progressBar: true,
    conditionalFields: true,
    groupedFields: true,
    realTimeValidation: true,
    accessibility: true,
    mobileOptimized: true,
    offlineSupport: false,
    bulkOperations: true,
    printSupport: true,
    exportSupport: true
  },
  module: 'finanzbuchhaltung',
  layout: {
    type: 'tabs',
    tabs: [
      {
        id: 'rechnungskopf',
        label: 'Rechnungskopf',
        icon: 'Receipt',
        fields: ['rechnungsdatum', 'rechnungsnummer', 'kunde']
      },
      {
        id: 'positionen',
        label: 'Positionen',
        icon: 'List',
        fields: ['artikel', 'menge', 'einzelpreis']
      },
      {
        id: 'summen',
        label: 'Summen',
        icon: 'Calculate',
        fields: ['nettobetrag', 'steuerbetrag', 'bruttobetrag']
      }
    ],
    navigation: {
      showProgress: true,
      showTimeline: true,
      showBreadcrumbs: true,
      allowSkip: false,
      allowBack: true
    },
    validation: {
      realTime: true,
      onTabChange: true,
      onStepChange: true,
      showErrors: true,
      mode: 'onChange'
    },
    autoSave: {
      enabled: true,
      interval: 30000,
      showIndicator: true
    }
  },
  workflow: {
    steps: STANDARD_BELEGFOLGE.workflow,
    currentStep: 0,
    canEdit: true,
    canApprove: true,
    canReject: true
  },
  permissions: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canReject: true,
    canView: true
  }
};

// ============================================================================
// CRM FORMULARE
// ============================================================================

// Kunde
export const KUNDE_CONFIG: StandardizedFormConfig = {
  id: 'crm-kunde',
  metadata: {
    id: 'crm-kunde',
    name: 'Kunde',
    module: 'crm',
    version: '1.0.0',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system',
    description: 'CRM - Kundenverwaltung',
    tags: ['kunde', 'crm', 'kundenverwaltung'],
    dependencies: [],
    permissions: {
      super_admin: ['read', 'write', 'admin', 'delete'],
      admin: ['read', 'write', 'admin'],
      manager: ['read', 'write'],
      accountant: ['read'],
      warehouse: ['read'],
      sales: ['read', 'write'],
      viewer: ['read']
    }
  },
  fields: [
    { name: 'kundennummer', label: 'Kundennummer', type: 'text' as const, required: true },
    { name: 'firmenname', label: 'Firmenname', type: 'text' as const, required: true },
    { name: 'ansprechpartner', label: 'Ansprechpartner', type: 'text' as const },
    { name: 'email', label: 'E-Mail', type: 'email' as const },
    { name: 'telefon', label: 'Telefon', type: 'text' as const },
    { name: 'strasse', label: 'Straße', type: 'text' as const, required: true },
    { name: 'plz', label: 'PLZ', type: 'text' as const, required: true },
    { name: 'ort', label: 'Ort', type: 'text' as const, required: true },
    { name: 'land', label: 'Land', type: 'select' as const, required: true },
    { name: 'umsatzsteuer_id', label: 'Umsatzsteuer-ID', type: 'text' as const },
    { name: 'kundengruppe', label: 'Kundengruppe', type: 'select' as const },
    { name: 'zahlungsbedingungen', label: 'Zahlungsbedingungen', type: 'select' as const }
  ],
  validationSchema: z.object({
    kundennummer: z.string().min(1, 'Kundennummer ist erforderlich'),
    firmenname: z.string().min(1, 'Firmenname ist erforderlich'),
    strasse: z.string().min(1, 'Straße ist erforderlich'),
    plz: z.string().min(1, 'PLZ ist erforderlich'),
    ort: z.string().min(1, 'Ort ist erforderlich'),
    land: z.string().min(1, 'Land ist erforderlich')
  }),
  defaultValues: {},
  size: 'large',
  features: {
    autoSave: true,
    autoSaveInterval: 30000,
    keyboardShortcuts: true,
    barcodeScanner: false,
    progressBar: true,
    conditionalFields: true,
    groupedFields: true,
    realTimeValidation: true,
    accessibility: true,
    mobileOptimized: true,
    offlineSupport: false,
    bulkOperations: true,
    printSupport: true,
    exportSupport: true
  },
  module: 'crm',
  layout: {
    type: 'tabs',
    tabs: [
      {
        id: 'grunddaten',
        label: 'Grunddaten',
        icon: 'Business',
        fields: ['kundennummer', 'firmenname', 'ansprechpartner', 'email', 'telefon']
      },
      {
        id: 'adresse',
        label: 'Adresse',
        icon: 'LocationOn',
        fields: ['strasse', 'plz', 'ort', 'land']
      },
      {
        id: 'zusatz',
        label: 'Zusatz',
        icon: 'Settings',
        fields: ['umsatzsteuer_id', 'kundengruppe', 'zahlungsbedingungen']
      }
    ],
    navigation: {
      showProgress: true,
      showTimeline: true,
      showBreadcrumbs: true,
      allowSkip: false,
      allowBack: true
    },
    validation: {
      realTime: true,
      onTabChange: true,
      onStepChange: true,
      showErrors: true,
      mode: 'onChange'
    },
    autoSave: {
      enabled: true,
      interval: 30000,
      showIndicator: true
    }
  },
  workflow: {
    steps: STANDARD_BELEGFOLGE.workflow,
    currentStep: 0,
    canEdit: true,
    canApprove: true,
    canReject: true
  },
  permissions: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canReject: true,
    canView: true
  }
};

// ============================================================================
// ALLE FORMULAR-KONFIGURATIONEN
// ============================================================================

export const EXTENDED_FORM_CONFIGS: StandardizedFormConfig[] = [
  // Bestehende Formulare
  ARTIKELSTAMMDATEN_CONFIG,
  EINLAGERUNG_CONFIG,
  AUSLAGERUNG_CONFIG,
  BUCHUNG_CONFIG,
  RECHNUNG_CONFIG,
  KUNDE_CONFIG,
  
  // Alle fehlenden Formulare aus dem Generator
  ...MissingFormsGenerator.generateAllMissingForms()
];

// ============================================================================
// FORMULAR-REGISTRY SERVICE
// ============================================================================

export class ExtendedFormRegistryService {
  private static instance: ExtendedFormRegistryService;
  private registry: Map<string, StandardizedFormConfig>;

  private constructor() {
    this.registry = new Map();
    this.initializeForms();
  }

  public static getInstance(): ExtendedFormRegistryService {
    if (!ExtendedFormRegistryService.instance) {
      ExtendedFormRegistryService.instance = new ExtendedFormRegistryService();
    }
    return ExtendedFormRegistryService.instance;
  }

  private initializeForms(): void {
    // Alle erweiterten Formulare registrieren
    EXTENDED_FORM_CONFIGS.forEach(config => {
      this.registry.set(config.id, config);
    });
  }

  public getForm(id: string): StandardizedFormConfig | undefined {
    return this.registry.get(id);
  }

  public getAllForms(): StandardizedFormConfig[] {
    return Array.from(this.registry.values());
  }

  public getFormsByModule(module: string): StandardizedFormConfig[] {
    return Array.from(this.registry.values()).filter(form => form.module === module);
  }

  public getFormCount(): number {
    return this.registry.size;
  }

  public getModuleCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.registry.forEach(form => {
      counts[form.module] = (counts[form.module] || 0) + 1;
    });
    return counts;
  }
}

export default ExtendedFormRegistryService; 