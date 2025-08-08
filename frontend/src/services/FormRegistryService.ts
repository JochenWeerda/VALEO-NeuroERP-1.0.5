/**
 * VALEO NeuroERP 2.0 - Formular-Registrierungs-Service
 * Horizon Beta optimiert mit Versionsnummerierung und Rollenverwaltung
 * Serena Quality: Complete form registry with role-based permissions
 */

import {
  FormID,
  FormVersion,
  FormStatus,
  FormPermission,
  FormMetadata,
  RolePermissions,
  FormField,
  FormConfig,
  FormRegistry,
  FormVersionHistory,
  FormChangeRequest,
  FormChange,
  FORM_MODULES,
  FORM_STATUSES,
  FORM_PERMISSIONS,
  FORM_FEATURES,
  PersonalFormSchema,
  WarehouseFormSchema,
  CustomerFormSchema,
  InvoiceFormSchema,
  SupplierFormSchema,
  OrderFormSchema,
  BedarfsermittlungSchema,
  AnfrageSchema,
  BestellungSchema,
  AuftragsbestaetigungSchema,
  AuftragsbearbeitungSchema,
  PacklisteSchema,
  VersandetikettierungSchema,
  LogistikUebergabeSchema,
  MaterialbedarfsermittlungSchema,
  RueckverfolgungSchema,
  ProduktionsauftragSchema,
  RueckmeldungSchema,
  LieferantenbewertungSchema,
  KundenruecklaeuferSchema,
  GutschriftSchema,
  UrsachenanalyseSchema,
  VerpackungsvorschriftenSchema,
  EtikettenSchema,
  UNNummernSchema,
  ADRKonformitaetSchema,
  InventurerfassungSchema,
  DifferenzkontrolleSchema,
  UmlagerungSchema,
  PreislistenSchema,
  AktionenSchema,
  StaffelpreiseSchema,
  RabattsystemeSchema,
  ArtikelstammdatenSchema,
  ArtikelklassifizierungSchema,
  ArtikelvarianteSchema,
  StuecklisteSchema,
  EinlagerungSchema,
  AuslagerungSchema,
  LagerplatzOptimierungSchema,
  InventurSchema,
  ChargeSchema,
  LieferantenavisierungSchema,
  WareneingangspruefungSchema,
  WareneingangsbuchungSchema,
  ReklamationSchema,
} from '../types/forms';

// ============================================================================
// FORMULAR-REGISTRIERUNG MIT VERSIONIERUNG
// ============================================================================

export class FormRegistryService {
  private static instance: FormRegistryService;
  private registry: FormRegistry;
  private versionHistory: Map<FormID, FormVersionHistory[]>;
  private changeRequests: Map<string, FormChangeRequest>;

  private constructor() {
    this.registry = {
      forms: {},
      versions: {},
      permissions: {},
      metadata: {},
    };
    this.versionHistory = new Map();
    this.changeRequests = new Map();
    this.initializeDefaultForms();
  }

  public static getInstance(): FormRegistryService {
    if (!FormRegistryService.instance) {
      FormRegistryService.instance = new FormRegistryService();
    }
    return FormRegistryService.instance;
  }

  // ============================================================================
  // STANDARD-FORMULARE INITIALISIEREN
  // ============================================================================

  private initializeDefaultForms(): void {
    // Personal Formular
    this.registerForm({
      id: 'personal-employee-form',
      metadata: {
        id: 'personal-employee-form',
        name: 'Mitarbeiter-Formular',
        module: FORM_MODULES.PERSONAL,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für die Verwaltung von Mitarbeiterdaten',
        tags: ['personal', 'employee', 'hr'],
        dependencies: [],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getPersonalFormFields(),
      validationSchema: PersonalFormSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    // Warehouse Formular
    this.registerForm({
      id: 'warehouse-article-form',
      metadata: {
        id: 'warehouse-article-form',
        name: 'Artikel-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für die Verwaltung von Artikeldaten',
        tags: ['warehouse', 'article', 'inventory'],
        dependencies: [],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getWarehouseFormFields(),
      validationSchema: WarehouseFormSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    // Customer Formular
    this.registerForm({
      id: 'customer-form',
      metadata: {
        id: 'customer-form',
        name: 'Kunden-Formular',
        module: FORM_MODULES.CRM,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für die Verwaltung von Kundendaten',
        tags: ['crm', 'customer', 'sales'],
        dependencies: [],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getCustomerFormFields(),
      validationSchema: CustomerFormSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    // Invoice Formular
    this.registerForm({
      id: 'invoice-form',
      metadata: {
        id: 'invoice-form',
        name: 'Rechnungs-Formular',
        module: FORM_MODULES.FINANCE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für die Erstellung von Rechnungen',
        tags: ['finance', 'invoice', 'billing'],
        dependencies: [],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getInvoiceFormFields(),
      validationSchema: InvoiceFormSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    // Supplier Formular
    this.registerForm({
      id: 'supplier-form',
      metadata: {
        id: 'supplier-form',
        name: 'Lieferanten-Formular',
        module: FORM_MODULES.PURCHASING,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für die Verwaltung von Lieferantendaten',
        tags: ['purchasing', 'supplier', 'vendor'],
        dependencies: [],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getSupplierFormFields(),
      validationSchema: SupplierFormSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    // Order Formular
    this.registerForm({
      id: 'order-form',
      metadata: {
        id: 'order-form',
        name: 'Auftrags-Formular',
        module: FORM_MODULES.SALES,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für die Erstellung von Aufträgen',
        tags: ['sales', 'order', 'customer'],
        dependencies: [],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getOrderFormFields(),
      validationSchema: OrderFormSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    // ============================================================================
    // WARENWIRTSCHAFT (WAWI) - FORMULARE
    // ============================================================================

    // Artikelstammdaten verwalten
    this.registerForm({
      id: 'wawi-artikelstammdaten-form',
      metadata: {
        id: 'wawi-artikelstammdaten-form',
        name: 'Artikelstammdaten-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für die Verwaltung von Artikelstammdaten',
        tags: ['wawi', 'artikel', 'stammdaten', 'warehouse'],
        dependencies: [],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getArtikelstammdatenFormFields(),
      validationSchema: ArtikelstammdatenSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-artikelklassifizierung-form',
      metadata: {
        id: 'wawi-artikelklassifizierung-form',
        name: 'Artikelklassifizierung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für die Klassifizierung von Artikeln',
        tags: ['wawi', 'artikel', 'klassifizierung', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getArtikelklassifizierungFormFields(),
      validationSchema: ArtikelklassifizierungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-artikelvariante-form',
      metadata: {
        id: 'wawi-artikelvariante-form',
        name: 'Artikelvariante-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für die Verwaltung von Artikelvarianten',
        tags: ['wawi', 'artikel', 'variante', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getArtikelvarianteFormFields(),
      validationSchema: ArtikelvarianteSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-stueckliste-form',
      metadata: {
        id: 'wawi-stueckliste-form',
        name: 'Stückliste-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für die Verwaltung von Stücklisten',
        tags: ['wawi', 'stueckliste', 'produktion', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getStuecklisteFormFields(),
      validationSchema: StuecklisteSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    // Lagerverwaltung
    this.registerForm({
      id: 'wawi-einlagerung-form',
      metadata: {
        id: 'wawi-einlagerung-form',
        name: 'Einlagerung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für die Einlagerung von Artikeln',
        tags: ['wawi', 'einlagerung', 'lager', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getEinlagerungFormFields(),
      validationSchema: EinlagerungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-auslagerung-form',
      metadata: {
        id: 'wawi-auslagerung-form',
        name: 'Auslagerung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für die Auslagerung von Artikeln',
        tags: ['wawi', 'auslagerung', 'lager', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getAuslagerungFormFields(),
      validationSchema: AuslagerungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-lagerplatz-optimierung-form',
      metadata: {
        id: 'wawi-lagerplatz-optimierung-form',
        name: 'Lagerplatz-Optimierung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für die Optimierung von Lagerplätzen',
        tags: ['wawi', 'lagerplatz', 'optimierung', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getLagerplatzOptimierungFormFields(),
      validationSchema: LagerplatzOptimierungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-inventur-form',
      metadata: {
        id: 'wawi-inventur-form',
        name: 'Inventur-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für die Durchführung von Inventuren',
        tags: ['wawi', 'inventur', 'lager', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getInventurFormFields(),
      validationSchema: InventurSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-charge-form',
      metadata: {
        id: 'wawi-charge-form',
        name: 'Charge-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für die Verwaltung von Chargen',
        tags: ['wawi', 'charge', 'lager', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getChargeFormFields(),
      validationSchema: ChargeSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    // Wareneingang
    this.registerForm({
      id: 'wawi-lieferantenavisierung-form',
      metadata: {
        id: 'wawi-lieferantenavisierung-form',
        name: 'Lieferantenavisierung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Lieferantenavisierungen',
        tags: ['wawi', 'avisierung', 'wareneingang', 'warehouse'],
        dependencies: ['supplier-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getLieferantenavisierungFormFields(),
      validationSchema: LieferantenavisierungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-wareneingangspruefung-form',
      metadata: {
        id: 'wawi-wareneingangspruefung-form',
        name: 'Wareneingangsprüfung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Wareneingangsprüfungen',
        tags: ['wawi', 'pruefung', 'wareneingang', 'warehouse'],
        dependencies: ['wawi-lieferantenavisierung-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getWareneingangspruefungFormFields(),
      validationSchema: WareneingangspruefungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-wareneingangsbuchung-form',
      metadata: {
        id: 'wawi-wareneingangsbuchung-form',
        name: 'Wareneingangsbuchung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Wareneingangsbuchungen',
        tags: ['wawi', 'buchung', 'wareneingang', 'warehouse'],
        dependencies: ['wawi-wareneingangspruefung-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getWareneingangsbuchungFormFields(),
      validationSchema: WareneingangsbuchungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-reklamation-form',
      metadata: {
        id: 'wawi-reklamation-form',
        name: 'Reklamation-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Lieferantenreklamationen',
        tags: ['wawi', 'reklamation', 'wareneingang', 'warehouse'],
        dependencies: ['wawi-wareneingangspruefung-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getReklamationFormFields(),
      validationSchema: ReklamationSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    // Bestellwesen
    this.registerForm({
      id: 'wawi-bedarfsermittlung-form',
      metadata: {
        id: 'wawi-bedarfsermittlung-form',
        name: 'Bedarfsermittlung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für die Bedarfsermittlung',
        tags: ['wawi', 'bedarf', 'bestellung', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getBedarfsermittlungFormFields(),
      validationSchema: BedarfsermittlungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-anfrage-form',
      metadata: {
        id: 'wawi-anfrage-form',
        name: 'Anfrage-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Lieferantenanfragen',
        tags: ['wawi', 'anfrage', 'bestellung', 'warehouse'],
        dependencies: ['supplier-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getAnfrageFormFields(),
      validationSchema: AnfrageSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-bestellung-form',
      metadata: {
        id: 'wawi-bestellung-form',
        name: 'Bestellung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Lieferantenbestellungen',
        tags: ['wawi', 'bestellung', 'warehouse'],
        dependencies: ['supplier-form', 'wawi-anfrage-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getBestellungFormFields(),
      validationSchema: BestellungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-auftragsbestaetigung-form',
      metadata: {
        id: 'wawi-auftragsbestaetigung-form',
        name: 'Auftragsbestätigung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Auftragsbestätigungen',
        tags: ['wawi', 'bestaetigung', 'bestellung', 'warehouse'],
        dependencies: ['wawi-bestellung-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getAuftragsbestaetigungFormFields(),
      validationSchema: AuftragsbestaetigungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    // Warenausgang/Kommissionierung
    this.registerForm({
      id: 'wawi-auftragsbearbeitung-form',
      metadata: {
        id: 'wawi-auftragsbearbeitung-form',
        name: 'Auftragsbearbeitung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für die Auftragsbearbeitung',
        tags: ['wawi', 'auftrag', 'kommissionierung', 'warehouse'],
        dependencies: ['order-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getAuftragsbearbeitungFormFields(),
      validationSchema: AuftragsbearbeitungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-packliste-form',
      metadata: {
        id: 'wawi-packliste-form',
        name: 'Packliste-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Packlisten',
        tags: ['wawi', 'packliste', 'versand', 'warehouse'],
        dependencies: ['wawi-auftragsbearbeitung-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getPacklisteFormFields(),
      validationSchema: PacklisteSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-versandetikettierung-form',
      metadata: {
        id: 'wawi-versandetikettierung-form',
        name: 'Versandetikettierung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Versandetikettierung',
        tags: ['wawi', 'etikett', 'versand', 'warehouse'],
        dependencies: ['wawi-packliste-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getVersandetikettierungFormFields(),
      validationSchema: VersandetikettierungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-logistik-uebergabe-form',
      metadata: {
        id: 'wawi-logistik-uebergabe-form',
        name: 'Logistik-Übergabe-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Logistik-Übergaben',
        tags: ['wawi', 'logistik', 'uebergabe', 'warehouse'],
        dependencies: ['wawi-packliste-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getLogistikUebergabeFormFields(),
      validationSchema: LogistikUebergabeSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    // Produktion/Rezepturverwaltung
    this.registerForm({
      id: 'wawi-materialbedarfsermittlung-form',
      metadata: {
        id: 'wawi-materialbedarfsermittlung-form',
        name: 'Materialbedarfsermittlung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Materialbedarfsermittlung',
        tags: ['wawi', 'material', 'produktion', 'warehouse'],
        dependencies: ['wawi-stueckliste-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getMaterialbedarfsermittlungFormFields(),
      validationSchema: MaterialbedarfsermittlungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-rueckverfolgung-form',
      metadata: {
        id: 'wawi-rueckverfolgung-form',
        name: 'Rückverfolgung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Artikelrückverfolgung',
        tags: ['wawi', 'rueckverfolgung', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getRueckverfolgungFormFields(),
      validationSchema: RueckverfolgungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-produktionsauftrag-form',
      metadata: {
        id: 'wawi-produktionsauftrag-form',
        name: 'Produktionsauftrag-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Produktionsaufträge',
        tags: ['wawi', 'produktion', 'auftrag', 'warehouse'],
        dependencies: ['wawi-stueckliste-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getProduktionsauftragFormFields(),
      validationSchema: ProduktionsauftragSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-rueckmeldung-form',
      metadata: {
        id: 'wawi-rueckmeldung-form',
        name: 'Rückmeldung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Produktionsrückmeldungen',
        tags: ['wawi', 'rueckmeldung', 'produktion', 'warehouse'],
        dependencies: ['wawi-produktionsauftrag-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getRueckmeldungFormFields(),
      validationSchema: RueckmeldungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    // Lieferantenbewertung
    this.registerForm({
      id: 'wawi-lieferantenbewertung-form',
      metadata: {
        id: 'wawi-lieferantenbewertung-form',
        name: 'Lieferantenbewertung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Lieferantenbewertungen',
        tags: ['wawi', 'bewertung', 'lieferant', 'warehouse'],
        dependencies: ['supplier-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getLieferantenbewertungFormFields(),
      validationSchema: LieferantenbewertungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    // Retouren/Reklamationen
    this.registerForm({
      id: 'wawi-kundenruecklaeufer-form',
      metadata: {
        id: 'wawi-kundenruecklaeufer-form',
        name: 'Kundenrückläufer-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Kundenrückläufer',
        tags: ['wawi', 'ruecklaeufer', 'kunde', 'warehouse'],
        dependencies: ['customer-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getKundenruecklaeuferFormFields(),
      validationSchema: KundenruecklaeuferSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-gutschrift-form',
      metadata: {
        id: 'wawi-gutschrift-form',
        name: 'Gutschrift-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Gutschriften',
        tags: ['wawi', 'gutschrift', 'warehouse'],
        dependencies: ['wawi-kundenruecklaeufer-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getGutschriftFormFields(),
      validationSchema: GutschriftSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-ursachenanalyse-form',
      metadata: {
        id: 'wawi-ursachenanalyse-form',
        name: 'Ursachenanalyse-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Ursachenanalysen',
        tags: ['wawi', 'ursachenanalyse', 'warehouse'],
        dependencies: ['wawi-kundenruecklaeufer-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getUrsachenanalyseFormFields(),
      validationSchema: UrsachenanalyseSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    // Verpackung/Gefahrgut
    this.registerForm({
      id: 'wawi-verpackungsvorschriften-form',
      metadata: {
        id: 'wawi-verpackungsvorschriften-form',
        name: 'Verpackungsvorschriften-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Verpackungsvorschriften',
        tags: ['wawi', 'verpackung', 'gefahrgut', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getVerpackungsvorschriftenFormFields(),
      validationSchema: VerpackungsvorschriftenSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-etiketten-form',
      metadata: {
        id: 'wawi-etiketten-form',
        name: 'Etiketten-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Etiketten',
        tags: ['wawi', 'etiketten', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getEtikettenFormFields(),
      validationSchema: EtikettenSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-un-nummern-form',
      metadata: {
        id: 'wawi-un-nummern-form',
        name: 'UN-Nummern-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für UN-Nummern',
        tags: ['wawi', 'un-nummern', 'gefahrgut', 'warehouse'],
        dependencies: [],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getUNNummernFormFields(),
      validationSchema: UNNummernSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-adr-konformitaet-form',
      metadata: {
        id: 'wawi-adr-konformitaet-form',
        name: 'ADR-Konformität-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für ADR-Konformität',
        tags: ['wawi', 'adr', 'konformitaet', 'gefahrgut', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form', 'wawi-un-nummern-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getADRKonformitaetFormFields(),
      validationSchema: ADRKonformitaetSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    // Inventur & Umlagerung
    this.registerForm({
      id: 'wawi-inventurerfassung-form',
      metadata: {
        id: 'wawi-inventurerfassung-form',
        name: 'Inventurerfassung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Inventurerfassung',
        tags: ['wawi', 'inventur', 'erfassung', 'warehouse'],
        dependencies: ['wawi-inventur-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getInventurerfassungFormFields(),
      validationSchema: InventurerfassungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-differenzkontrolle-form',
      metadata: {
        id: 'wawi-differenzkontrolle-form',
        name: 'Differenzkontrolle-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Differenzkontrolle',
        tags: ['wawi', 'differenz', 'kontrolle', 'warehouse'],
        dependencies: ['wawi-inventur-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getDifferenzkontrolleFormFields(),
      validationSchema: DifferenzkontrolleSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-umlagerung-form',
      metadata: {
        id: 'wawi-umlagerung-form',
        name: 'Umlagerung-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Umlagerungen',
        tags: ['wawi', 'umlagerung', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getUmlagerungFormFields(),
      validationSchema: UmlagerungSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'medium',
      features: this.getDefaultFeatures(),
    });

    // Preis- & Rabattverwaltung
    this.registerForm({
      id: 'wawi-preislisten-form',
      metadata: {
        id: 'wawi-preislisten-form',
        name: 'Preislisten-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Preislisten',
        tags: ['wawi', 'preislisten', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getPreislistenFormFields(),
      validationSchema: PreislistenSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-aktionen-form',
      metadata: {
        id: 'wawi-aktionen-form',
        name: 'Aktionen-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Aktionen',
        tags: ['wawi', 'aktionen', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getAktionenFormFields(),
      validationSchema: AktionenSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-staffelpreise-form',
      metadata: {
        id: 'wawi-staffelpreise-form',
        name: 'Staffelpreise-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Staffelpreise',
        tags: ['wawi', 'staffelpreise', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getStaffelpreiseFormFields(),
      validationSchema: StaffelpreiseSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });

    this.registerForm({
      id: 'wawi-rabattsysteme-form',
      metadata: {
        id: 'wawi-rabattsysteme-form',
        name: 'Rabattsysteme-Formular',
        module: FORM_MODULES.WAREHOUSE,
        version: '1.0.0',
        status: FORM_STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        description: 'Formular für Rabattsysteme',
        tags: ['wawi', 'rabattsysteme', 'warehouse'],
        dependencies: ['wawi-artikelstammdaten-form'],
        permissions: this.getDefaultPermissions(),
      },
      fields: this.getRabattsystemeFormFields(),
      validationSchema: RabattsystemeSchema,
      defaultValues: {},
      layout: 'grid',
      size: 'large',
      features: this.getDefaultFeatures(),
    });
  }

  // ============================================================================
  // FORMULAR-FELDER DEFINITIONEN
  // ============================================================================

  private getPersonalFormFields(): FormField[] {
    return [
      {
        name: 'employeeNumber',
        label: 'Mitarbeiternummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        helpText: 'Eindeutige Mitarbeiternummer',
        validation: { required: true, pattern: /^[A-Z]{2}\d{4}$/ },
      },
      {
        name: 'firstName',
        label: 'Vorname',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, min: 2 },
      },
      {
        name: 'lastName',
        label: 'Nachname',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, min: 2 },
      },
      {
        name: 'email',
        label: 'E-Mail',
        type: 'email' as const,
        required: true,
        group: 'kontakt',
        validation: { required: true },
      },
      {
        name: 'phone',
        label: 'Telefon',
        type: 'text' as const,
        group: 'kontakt',
        validation: { pattern: /^[\+]?[0-9\s\-\(\)]+$/ },
      },
      {
        name: 'department',
        label: 'Abteilung',
        type: 'select' as const,
        required: true,
        group: 'position',
        options: [
          { value: 'hr', label: 'Personal' },
          { value: 'finance', label: 'Finanzen' },
          { value: 'warehouse', label: 'Lager' },
          { value: 'sales', label: 'Vertrieb' },
          { value: 'it', label: 'IT' },
        ],
        validation: { required: true },
      },
      {
        name: 'position',
        label: 'Position',
        type: 'text' as const,
        required: true,
        group: 'position',
        validation: { required: true, min: 2 },
      },
      {
        name: 'hireDate',
        label: 'Einstellungsdatum',
        type: 'date' as const,
        required: true,
        group: 'position',
        validation: { required: true },
      },
      {
        name: 'salary',
        label: 'Gehalt',
        type: 'number' as const,
        group: 'finanzen',
        validation: { min: 0 },
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select' as const,
        required: true,
        group: 'status',
        options: [
          { value: 'active', label: 'Aktiv' },
          { value: 'inactive', label: 'Inaktiv' },
          { value: 'terminated', label: 'Gekündigt' },
        ],
        validation: { required: true },
      },
      {
        name: 'notes',
        label: 'Notizen',
        type: 'textarea' as const,
        group: 'zusätzlich',
      },
    ];
  }

  private getWarehouseFormFields(): FormField[] {
    return [
      {
        name: 'articleNumber',
        label: 'Artikelnummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        barcodeScanner: true,
        validation: { required: true, min: 3 },
      },
      {
        name: 'name',
        label: 'Artikelname',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, min: 2 },
      },
      {
        name: 'description',
        label: 'Beschreibung',
        type: 'textarea' as const,
        group: 'grunddaten',
      },
      {
        name: 'category',
        label: 'Kategorie',
        type: 'select' as const,
        required: true,
        group: 'klassifizierung',
        options: [
          { value: 'electronics', label: 'Elektronik' },
          { value: 'clothing', label: 'Kleidung' },
          { value: 'books', label: 'Bücher' },
          { value: 'tools', label: 'Werkzeuge' },
        ],
        validation: { required: true },
      },
      {
        name: 'unit',
        label: 'Einheit',
        type: 'select' as const,
        required: true,
        group: 'grunddaten',
        options: [
          { value: 'piece', label: 'Stück' },
          { value: 'kg', label: 'Kilogramm' },
          { value: 'liter', label: 'Liter' },
          { value: 'meter', label: 'Meter' },
        ],
        validation: { required: true },
      },
      {
        name: 'purchasePrice',
        label: 'Einkaufspreis',
        type: 'currency' as const,
        required: true,
        group: 'preise',
        validation: { required: true, min: 0 },
      },
      {
        name: 'sellingPrice',
        label: 'Verkaufspreis',
        type: 'currency' as const,
        required: true,
        group: 'preise',
        validation: { required: true, min: 0 },
      },
      {
        name: 'stockQuantity',
        label: 'Lagerbestand',
        type: 'number' as const,
        required: true,
        group: 'lager',
        validation: { required: true, min: 0 },
      },
      {
        name: 'minStockLevel',
        label: 'Mindestbestand',
        type: 'number' as const,
        required: true,
        group: 'lager',
        validation: { required: true, min: 0 },
      },
      {
        name: 'maxStockLevel',
        label: 'Maximalbestand',
        type: 'number' as const,
        required: true,
        group: 'lager',
        validation: { required: true, min: 0 },
      },
      {
        name: 'location',
        label: 'Lagerplatz',
        type: 'text' as const,
        required: true,
        group: 'lager',
        validation: { required: true },
      },
      {
        name: 'supplierId',
        label: 'Lieferant',
        type: 'select' as const,
        group: 'lieferant',
        options: [
          { value: 'supplier1', label: 'Lieferant 1' },
          { value: 'supplier2', label: 'Lieferant 2' },
        ],
      },
      {
        name: 'barcode',
        label: 'Barcode',
        type: 'barcode' as const,
        group: 'identifikation',
      },
      {
        name: 'expiryDate',
        label: 'Verfallsdatum',
        type: 'date' as const,
        group: 'qualität',
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select' as const,
        required: true,
        group: 'status',
        options: [
          { value: 'active', label: 'Aktiv' },
          { value: 'inactive', label: 'Inaktiv' },
          { value: 'discontinued', label: 'Eingestellt' },
        ],
        validation: { required: true },
      },
    ];
  }

  private getCustomerFormFields(): FormField[] {
    return [
      {
        name: 'customerNumber',
        label: 'Kundennummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, pattern: /^[A-Z]{2}\d{4}$/ },
      },
      {
        name: 'name',
        label: 'Name',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, min: 2 },
      },
      {
        name: 'email',
        label: 'E-Mail',
        type: 'email' as const,
        required: true,
        group: 'kontakt',
        validation: { required: true },
      },
      {
        name: 'phone',
        label: 'Telefon',
        type: 'text' as const,
        group: 'kontakt',
        validation: { pattern: /^[\+]?[0-9\s\-\(\)]+$/ },
      },
      {
        name: 'address',
        label: 'Adresse',
        type: 'textarea' as const,
        required: true,
        group: 'adresse',
        validation: { required: true },
      },
      {
        name: 'postalCode',
        label: 'PLZ',
        type: 'text' as const,
        required: true,
        group: 'adresse',
        validation: { required: true, pattern: /^\d{5}$/ },
      },
      {
        name: 'city',
        label: 'Stadt',
        type: 'text' as const,
        required: true,
        group: 'adresse',
        validation: { required: true },
      },
      {
        name: 'country',
        label: 'Land',
        type: 'select' as const,
        required: true,
        group: 'adresse',
        options: [
          { value: 'DE', label: 'Deutschland' },
          { value: 'AT', label: 'Österreich' },
          { value: 'CH', label: 'Schweiz' },
        ],
        validation: { required: true },
      },
      {
        name: 'customerType',
        label: 'Kundentyp',
        type: 'select' as const,
        required: true,
        group: 'klassifizierung',
        options: [
          { value: 'private', label: 'Privat' },
          { value: 'business', label: 'Geschäft' },
          { value: 'wholesale', label: 'Großhandel' },
        ],
        validation: { required: true },
      },
      {
        name: 'creditLimit',
        label: 'Kreditlimit',
        type: 'currency' as const,
        group: 'finanzen',
        validation: { min: 0 },
      },
      {
        name: 'paymentTerms',
        label: 'Zahlungsbedingungen',
        type: 'text' as const,
        group: 'finanzen',
      },
      {
        name: 'salesRepId',
        label: 'Vertriebsmitarbeiter',
        type: 'select' as const,
        group: 'vertrieb',
        options: [
          { value: 'rep1', label: 'Vertriebler 1' },
          { value: 'rep2', label: 'Vertriebler 2' },
        ],
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select' as const,
        required: true,
        group: 'status',
        options: [
          { value: 'active', label: 'Aktiv' },
          { value: 'inactive', label: 'Inaktiv' },
          { value: 'blocked', label: 'Gesperrt' },
        ],
        validation: { required: true },
      },
      {
        name: 'notes',
        label: 'Notizen',
        type: 'textarea' as const,
        group: 'zusätzlich',
      },
    ];
  }

  private getInvoiceFormFields(): FormField[] {
    return [
      {
        name: 'invoiceNumber',
        label: 'Rechnungsnummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, pattern: /^INV-\d{6}$/ },
      },
      {
        name: 'customerId',
        label: 'Kunde',
        type: 'select' as const,
        required: true,
        group: 'kunde',
        options: [
          { value: 'customer1', label: 'Kunde 1' },
          { value: 'customer2', label: 'Kunde 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'invoiceDate',
        label: 'Rechnungsdatum',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'dueDate',
        label: 'Fälligkeitsdatum',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'paymentStatus',
        label: 'Zahlungsstatus',
        type: 'select' as const,
        required: true,
        group: 'zahlung',
        options: [
          { value: 'pending', label: 'Ausstehend' },
          { value: 'paid', label: 'Bezahlt' },
          { value: 'overdue', label: 'Überfällig' },
          { value: 'cancelled', label: 'Storniert' },
        ],
        validation: { required: true },
      },
      {
        name: 'paymentMethod',
        label: 'Zahlungsmethode',
        type: 'select' as const,
        group: 'zahlung',
        options: [
          { value: 'bank_transfer', label: 'Banküberweisung' },
          { value: 'credit_card', label: 'Kreditkarte' },
          { value: 'cash', label: 'Bargeld' },
        ],
      },
      {
        name: 'notes',
        label: 'Notizen',
        type: 'textarea' as const,
        group: 'zusätzlich',
      },
    ];
  }

  private getSupplierFormFields(): FormField[] {
    return [
      {
        name: 'supplierNumber',
        label: 'Lieferantennummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, pattern: /^[A-Z]{2}\d{4}$/ },
      },
      {
        name: 'name',
        label: 'Name',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, min: 2 },
      },
      {
        name: 'contactPerson',
        label: 'Ansprechpartner',
        type: 'text' as const,
        required: true,
        group: 'kontakt',
        validation: { required: true },
      },
      {
        name: 'email',
        label: 'E-Mail',
        type: 'email' as const,
        required: true,
        group: 'kontakt',
        validation: { required: true },
      },
      {
        name: 'phone',
        label: 'Telefon',
        type: 'text' as const,
        group: 'kontakt',
        validation: { pattern: /^[\+]?[0-9\s\-\(\)]+$/ },
      },
      {
        name: 'address',
        label: 'Adresse',
        type: 'textarea' as const,
        required: true,
        group: 'adresse',
        validation: { required: true },
      },
      {
        name: 'postalCode',
        label: 'PLZ',
        type: 'text' as const,
        required: true,
        group: 'adresse',
        validation: { required: true, pattern: /^\d{5}$/ },
      },
      {
        name: 'city',
        label: 'Stadt',
        type: 'text' as const,
        required: true,
        group: 'adresse',
        validation: { required: true },
      },
      {
        name: 'country',
        label: 'Land',
        type: 'select' as const,
        required: true,
        group: 'adresse',
        options: [
          { value: 'DE', label: 'Deutschland' },
          { value: 'AT', label: 'Österreich' },
          { value: 'CH', label: 'Schweiz' },
        ],
        validation: { required: true },
      },
      {
        name: 'paymentTerms',
        label: 'Zahlungsbedingungen',
        type: 'text' as const,
        group: 'finanzen',
      },
      {
        name: 'creditLimit',
        label: 'Kreditlimit',
        type: 'currency' as const,
        group: 'finanzen',
        validation: { min: 0 },
      },
      {
        name: 'rating',
        label: 'Bewertung',
        type: 'number' as const,
        group: 'bewertung',
        validation: { min: 1, max: 5 },
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select' as const,
        required: true,
        group: 'status',
        options: [
          { value: 'active', label: 'Aktiv' },
          { value: 'inactive', label: 'Inaktiv' },
          { value: 'blocked', label: 'Gesperrt' },
        ],
        validation: { required: true },
      },
      {
        name: 'notes',
        label: 'Notizen',
        type: 'textarea' as const,
        group: 'zusätzlich',
      },
    ];
  }

  private getOrderFormFields(): FormField[] {
    return [
      {
        name: 'orderNumber',
        label: 'Auftragsnummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, pattern: /^ORD-\d{6}$/ },
      },
      {
        name: 'customerId',
        label: 'Kunde',
        type: 'select' as const,
        required: true,
        group: 'kunde',
        options: [
          { value: 'customer1', label: 'Kunde 1' },
          { value: 'customer2', label: 'Kunde 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'orderDate',
        label: 'Auftragsdatum',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'deliveryDate',
        label: 'Lieferdatum',
        type: 'date' as const,
        group: 'datum',
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select' as const,
        required: true,
        group: 'status',
        options: [
          { value: 'draft', label: 'Entwurf' },
          { value: 'confirmed', label: 'Bestätigt' },
          { value: 'shipped', label: 'Versendet' },
          { value: 'delivered', label: 'Geliefert' },
          { value: 'cancelled', label: 'Storniert' },
        ],
        validation: { required: true },
      },
      {
        name: 'paymentStatus',
        label: 'Zahlungsstatus',
        type: 'select' as const,
        required: true,
        group: 'zahlung',
        options: [
          { value: 'pending', label: 'Ausstehend' },
          { value: 'paid', label: 'Bezahlt' },
          { value: 'partial', label: 'Teilweise' },
        ],
        validation: { required: true },
      },
      {
        name: 'notes',
        label: 'Notizen',
        type: 'textarea' as const,
        group: 'zusätzlich',
      },
    ];
  }

  // ============================================================================
  // STANDARD-KONFIGURATIONEN
  // ============================================================================

  private getDefaultPermissions(): RolePermissions {
    return {
      super_admin: [FORM_PERMISSIONS.READ, FORM_PERMISSIONS.WRITE, FORM_PERMISSIONS.ADMIN, FORM_PERMISSIONS.DELETE],
      admin: [FORM_PERMISSIONS.READ, FORM_PERMISSIONS.WRITE, FORM_PERMISSIONS.ADMIN],
      manager: [FORM_PERMISSIONS.READ, FORM_PERMISSIONS.WRITE],
      accountant: [FORM_PERMISSIONS.READ, FORM_PERMISSIONS.WRITE],
      warehouse: [FORM_PERMISSIONS.READ, FORM_PERMISSIONS.WRITE],
      sales: [FORM_PERMISSIONS.READ, FORM_PERMISSIONS.WRITE],
      viewer: [FORM_PERMISSIONS.READ],
    };
  }

  private getDefaultFeatures() {
    return {
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
      bulkOperations: false,
      printSupport: true,
      exportSupport: true,
    };
  }

  // ============================================================================
  // FORMULAR-REGISTRIERUNG
  // ============================================================================

  public registerForm(config: FormConfig): void {
    this.registry.forms[config.id] = config;
    this.registry.metadata[config.id] = config.metadata;
    this.registry.permissions[config.id] = config.metadata.permissions;
    this.registry.versions[config.id] = [config.metadata.version];
    
    // Version-Historie initialisieren
    this.versionHistory.set(config.id, [{
      formId: config.id,
      version: config.metadata.version,
      changes: ['Initiale Version'],
      author: config.metadata.createdBy,
      timestamp: config.metadata.createdAt,
      status: 'approved',
    }]);
  }

  public getForm(formId: FormID): FormConfig | null {
    return this.registry.forms[formId] || null;
  }

  public getAllForms(): FormConfig[] {
    return Object.values(this.registry.forms);
  }

  public getFormsByModule(module: string): FormConfig[] {
    return Object.values(this.registry.forms).filter(
      form => form.metadata.module === module
    );
  }

  // ============================================================================
  // VERSIONIERUNG
  // ============================================================================

  public createNewVersion(formId: FormID, version: FormVersion, changes: string[], author: string): void {
    const form = this.getForm(formId);
    if (!form) {
      throw new Error(`Formular ${formId} nicht gefunden`);
    }

    // Neue Version zur Historie hinzufügen
    const history = this.versionHistory.get(formId) || [];
    history.push({
      formId,
      version,
      changes,
      author,
      timestamp: new Date(),
      status: 'draft',
    });
    this.versionHistory.set(formId, history);

    // Version zur Registry hinzufügen
    this.registry.versions[formId].push(version);
  }

  public getVersionHistory(formId: FormID): FormVersionHistory[] {
    return this.versionHistory.get(formId) || [];
  }

  public approveVersion(formId: FormID, version: FormVersion, approvedBy: string): void {
    const history = this.versionHistory.get(formId);
    if (history) {
      const versionEntry = history.find(h => h.version === version);
      if (versionEntry) {
        versionEntry.status = 'approved';
        versionEntry.approvedBy = approvedBy;
      }
    }
  }

  // ============================================================================
  // ÄNDERUNGSANFRAGEN
  // ============================================================================

  public createChangeRequest(
    formId: FormID,
    requestedBy: string,
    changes: FormChange[],
    comments?: string
  ): string {
    const requestId = `cr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const changeRequest: FormChangeRequest = {
      id: requestId,
      formId,
      requestedBy,
      requestedAt: new Date(),
      changes,
      status: 'pending',
      comments,
    };

    this.changeRequests.set(requestId, changeRequest);
    return requestId;
  }

  public getChangeRequest(requestId: string): FormChangeRequest | null {
    return this.changeRequests.get(requestId) || null;
  }

  public getAllChangeRequests(): FormChangeRequest[] {
    return Array.from(this.changeRequests.values());
  }

  public approveChangeRequest(requestId: string, reviewedBy: string, comments?: string): void {
    const request = this.changeRequests.get(requestId);
    if (request) {
      request.status = 'approved';
      request.reviewedBy = reviewedBy;
      request.reviewedAt = new Date();
      request.comments = comments;
    }
  }

  public rejectChangeRequest(requestId: string, reviewedBy: string, comments?: string): void {
    const request = this.changeRequests.get(requestId);
    if (request) {
      request.status = 'rejected';
      request.reviewedBy = reviewedBy;
      request.reviewedAt = new Date();
      request.comments = comments;
    }
  }

  // ============================================================================
  // BERECHTIGUNGEN
  // ============================================================================

  public hasPermission(formId: FormID, role: string, permission: FormPermission): boolean {
    const formPermissions = this.registry.permissions[formId];
    if (!formPermissions) return false;

    const rolePermissions = formPermissions[role as keyof RolePermissions];
    if (!rolePermissions) return false;

    return rolePermissions.includes(permission);
  }

  public updatePermissions(formId: FormID, permissions: RolePermissions, updatedBy: string): void {
    this.registry.permissions[formId] = permissions;
    
    // Metadata aktualisieren
    const metadata = this.registry.metadata[formId];
    if (metadata) {
      metadata.permissions = permissions;
      metadata.updatedAt = new Date();
      metadata.updatedBy = updatedBy;
    }
  }

  public getFormPermissions(formId: FormID): RolePermissions | null {
    return this.registry.permissions[formId] || null;
  }

  // ============================================================================
  // EXPORT UND IMPORT
  // ============================================================================

  public exportRegistry(): FormRegistry {
    return JSON.parse(JSON.stringify(this.registry));
  }

  public importRegistry(registry: FormRegistry): void {
    this.registry = registry;
  }

  public exportVersionHistory(): Map<FormID, FormVersionHistory[]> {
    return new Map(this.versionHistory);
  }

  public importVersionHistory(history: Map<FormID, FormVersionHistory[]>): void {
    this.versionHistory = history;
  }

  // ============================================================================
  // STATISTIKEN UND METRIKEN
  // ============================================================================

  public getFormStatistics() {
    const forms = this.getAllForms();
    const modules = new Map<string, number>();
    const statuses = new Map<string, number>();
    const versions = new Map<string, number>();

    forms.forEach(form => {
      // Module zählen
      const moduleCount = modules.get(form.metadata.module) || 0;
      modules.set(form.metadata.module, moduleCount + 1);

      // Status zählen
      const statusCount = statuses.get(form.metadata.status) || 0;
      statuses.set(form.metadata.status, statusCount + 1);

      // Versionen zählen
      const versionCount = versions.get(form.metadata.version) || 0;
      versions.set(form.metadata.version, versionCount + 1);
    });

    return {
      totalForms: forms.length,
      byModule: Object.fromEntries(modules),
      byStatus: Object.fromEntries(statuses),
      byVersion: Object.fromEntries(versions),
      changeRequests: this.getAllChangeRequests().length,
      pendingRequests: this.getAllChangeRequests().filter(cr => cr.status === 'pending').length,
    };
  }

  public getFormTable(): Array<{
    id: FormID;
    name: string;
    module: string;
    version: FormVersion;
    status: FormStatus;
    permissions: RolePermissions;
    lastUpdated: Date;
  }> {
    return Object.values(this.registry.forms).map(form => ({
      id: form.id,
      name: form.metadata.name,
      module: form.metadata.module,
      version: form.metadata.version,
      status: form.metadata.status,
      permissions: form.metadata.permissions,
      lastUpdated: form.metadata.updatedAt,
    }));
  }

  private getBedarfsermittlungFormFields(): FormField[] {
    return [
      {
        name: 'ermittlungsnummer',
        label: 'Ermittlungsnummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, pattern: /^BED-\d{6}$/ },
      },
      {
        name: 'artikelId',
        label: 'Artikel',
        type: 'select' as const,
        required: true,
        group: 'artikel',
        options: [
          { value: 'artikel1', label: 'Artikel 1' },
          { value: 'artikel2', label: 'Artikel 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'varianteId',
        label: 'Variante',
        type: 'select' as const,
        group: 'artikel',
        options: [
          { value: 'variante1', label: 'Variante 1' },
          { value: 'variante2', label: 'Variante 2' },
        ],
      },
      {
        name: 'periode',
        label: 'Periode',
        type: 'text' as const,
        required: true,
        group: 'zeitraum',
        validation: { required: true },
      },
      {
        name: 'verbrauchsmenge',
        label: 'Verbrauchsmenge',
        type: 'number' as const,
        required: true,
        group: 'verbrauch',
        validation: { required: true, min: 0 },
      },
      {
        name: 'einheit',
        label: 'Einheit',
        type: 'select' as const,
        required: true,
        group: 'verbrauch',
        options: [
          { value: 'kg', label: 'Kilogramm' },
          { value: 'l', label: 'Liter' },
          { value: 'stk', label: 'Stück' },
        ],
        validation: { required: true },
      },
      {
        name: 'verbrauchsart',
        label: 'Verbrauchsart',
        type: 'select' as const,
        required: true,
        group: 'verbrauch',
        options: [
          { value: 'verbrauch', label: 'Verbrauch' },
          { value: 'verkauf', label: 'Verkauf' },
          { value: 'produktion', label: 'Produktion' },
        ],
        validation: { required: true },
      },
      {
        name: 'bedarfsmenge',
        label: 'Bedarfsmenge',
        type: 'number' as const,
        required: true,
        group: 'bedarf',
        validation: { required: true, min: 0 },
      },
      {
        name: 'sicherheitsbestand',
        label: 'Sicherheitsbestand',
        type: 'number' as const,
        required: true,
        group: 'bedarf',
        validation: { required: true, min: 0 },
      },
      {
        name: 'bestellpunkt',
        label: 'Bestellpunkt',
        type: 'number' as const,
        required: true,
        group: 'bedarf',
        validation: { required: true, min: 0 },
      },
      {
        name: 'empfohleneBestellmenge',
        label: 'Empfohlene Bestellmenge',
        type: 'number' as const,
        required: true,
        group: 'bedarf',
        validation: { required: true, min: 0 },
      },
      {
        name: 'lieferantId',
        label: 'Lieferant',
        type: 'select' as const,
        group: 'lieferant',
        options: [
          { value: 'lieferant1', label: 'Lieferant 1' },
          { value: 'lieferant2', label: 'Lieferant 2' },
        ],
      },
      {
        name: 'lieferzeit',
        label: 'Lieferzeit (Tage)',
        type: 'number' as const,
        group: 'lieferant',
        validation: { min: 0 },
      },
      {
        name: 'notizen',
        label: 'Notizen',
        type: 'textarea' as const,
        group: 'zusätzlich',
      },
    ];
  }

  private getAnfrageFormFields(): FormField[] {
    return [
      {
        name: 'anfragenummer',
        label: 'Anfragenummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, pattern: /^ANF-\d{6}$/ },
      },
      {
        name: 'lieferantId',
        label: 'Lieferant',
        type: 'select' as const,
        required: true,
        group: 'lieferant',
        options: [
          { value: 'lieferant1', label: 'Lieferant 1' },
          { value: 'lieferant2', label: 'Lieferant 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'anfragedatum',
        label: 'Anfragedatum',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'gueltigBis',
        label: 'Gültig bis',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select' as const,
        required: true,
        group: 'status',
        options: [
          { value: 'entwurf', label: 'Entwurf' },
          { value: 'versendet', label: 'Versendet' },
          { value: 'beantwortet', label: 'Beantwortet' },
          { value: 'abgeschlossen', label: 'Abgeschlossen' },
        ],
        validation: { required: true },
      },
      {
        name: 'notizen',
        label: 'Notizen',
        type: 'textarea' as const,
        group: 'zusätzlich',
      },
    ];
  }

  private getBestellungFormFields(): FormField[] {
    return [
      {
        name: 'bestellnummer',
        label: 'Bestellnummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, pattern: /^BES-\d{6}$/ },
      },
      {
        name: 'lieferantId',
        label: 'Lieferant',
        type: 'select' as const,
        required: true,
        group: 'lieferant',
        options: [
          { value: 'lieferant1', label: 'Lieferant 1' },
          { value: 'lieferant2', label: 'Lieferant 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'bestelldatum',
        label: 'Bestelldatum',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'erwartetesLieferdatum',
        label: 'Erwartetes Lieferdatum',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'gesamtbetrag',
        label: 'Gesamtbetrag',
        type: 'currency' as const,
        required: true,
        group: 'finanzen',
        validation: { required: true, min: 0 },
      },
      {
        name: 'waehrung',
        label: 'Währung',
        type: 'select' as const,
        required: true,
        group: 'finanzen',
        options: [
          { value: 'EUR', label: 'Euro' },
          { value: 'USD', label: 'US Dollar' },
        ],
        validation: { required: true },
      },
      {
        name: 'zahlungsbedingungen',
        label: 'Zahlungsbedingungen',
        type: 'text' as const,
        required: true,
        group: 'finanzen',
        validation: { required: true },
      },
      {
        name: 'lieferbedingungen',
        label: 'Lieferbedingungen',
        type: 'text' as const,
        required: true,
        group: 'lieferung',
        validation: { required: true },
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select' as const,
        required: true,
        group: 'status',
        options: [
          { value: 'entwurf', label: 'Entwurf' },
          { value: 'versendet', label: 'Versendet' },
          { value: 'bestaetigt', label: 'Bestätigt' },
          { value: 'teilweise_geliefert', label: 'Teilweise geliefert' },
          { value: 'vollstaendig_geliefert', label: 'Vollständig geliefert' },
        ],
        validation: { required: true },
      },
      {
        name: 'notizen',
        label: 'Notizen',
        type: 'textarea' as const,
        group: 'zusätzlich',
      },
    ];
  }

  private getAuftragsbestaetigungFormFields(): FormField[] {
    return [
      {
        name: 'bestaetigungsnummer',
        label: 'Bestätigungsnummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, pattern: /^ABC-\d{6}$/ },
      },
      {
        name: 'bestellungId',
        label: 'Bestellung',
        type: 'select' as const,
        required: true,
        group: 'bestellung',
        options: [
          { value: 'bestellung1', label: 'Bestellung 1' },
          { value: 'bestellung2', label: 'Bestellung 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'lieferantId',
        label: 'Lieferant',
        type: 'select' as const,
        required: true,
        group: 'lieferant',
        options: [
          { value: 'lieferant1', label: 'Lieferant 1' },
          { value: 'lieferant2', label: 'Lieferant 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'bestaetigungsdatum',
        label: 'Bestätigungsdatum',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'bestaetigterLiefertermin',
        label: 'Bestätigter Liefertermin',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select' as const,
        required: true,
        group: 'status',
        options: [
          { value: 'bestaetigt', label: 'Bestätigt' },
          { value: 'teilweise_bestaetigt', label: 'Teilweise bestätigt' },
          { value: 'abgelehnt', label: 'Abgelehnt' },
        ],
        validation: { required: true },
      },
      {
        name: 'notizen',
        label: 'Notizen',
        type: 'textarea' as const,
        group: 'zusätzlich',
      },
    ];
  }

  private getAuftragsbearbeitungFormFields(): FormField[] {
    return [
      {
        name: 'auftragsnummer',
        label: 'Auftragsnummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, pattern: /^AUB-\d{6}$/ },
      },
      {
        name: 'kundeId',
        label: 'Kunde',
        type: 'select' as const,
        required: true,
        group: 'kunde',
        options: [
          { value: 'kunde1', label: 'Kunde 1' },
          { value: 'kunde2', label: 'Kunde 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'auftragsdatum',
        label: 'Auftragsdatum',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'gewuenschterLiefertermin',
        label: 'Gewünschter Liefertermin',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'bestaetigterLiefertermin',
        label: 'Bestätigter Liefertermin',
        type: 'date' as const,
        group: 'datum',
      },
      {
        name: 'gesamtbetrag',
        label: 'Gesamtbetrag',
        type: 'currency' as const,
        required: true,
        group: 'finanzen',
        validation: { required: true, min: 0 },
      },
      {
        name: 'waehrung',
        label: 'Währung',
        type: 'select' as const,
        required: true,
        group: 'finanzen',
        options: [
          { value: 'EUR', label: 'Euro' },
          { value: 'USD', label: 'US Dollar' },
        ],
        validation: { required: true },
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select' as const,
        required: true,
        group: 'status',
        options: [
          { value: 'eingegangen', label: 'Eingegangen' },
          { value: 'bestaetigt', label: 'Bestätigt' },
          { value: 'in_bearbeitung', label: 'In Bearbeitung' },
          { value: 'kommissioniert', label: 'Kommissioniert' },
          { value: 'versandbereit', label: 'Versandbereit' },
          { value: 'versendet', label: 'Versendet' },
        ],
        validation: { required: true },
      },
      {
        name: 'prioritaet',
        label: 'Priorität',
        type: 'select' as const,
        required: true,
        group: 'priorität',
        options: [
          { value: 'niedrig', label: 'Niedrig' },
          { value: 'normal', label: 'Normal' },
          { value: 'hoch', label: 'Hoch' },
          { value: 'dringend', label: 'Dringend' },
        ],
        validation: { required: true },
      },
      {
        name: 'notizen',
        label: 'Notizen',
        type: 'textarea' as const,
        group: 'zusätzlich',
      },
    ];
  }

  private getPacklisteFormFields(): FormField[] {
    return [
      {
        name: 'packlistennummer',
        label: 'Packlistennummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, pattern: /^PAC-\d{6}$/ },
      },
      {
        name: 'auftragId',
        label: 'Auftrag',
        type: 'select' as const,
        required: true,
        group: 'auftrag',
        options: [
          { value: 'auftrag1', label: 'Auftrag 1' },
          { value: 'auftrag2', label: 'Auftrag 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'kundeId',
        label: 'Kunde',
        type: 'select' as const,
        required: true,
        group: 'kunde',
        options: [
          { value: 'kunde1', label: 'Kunde 1' },
          { value: 'kunde2', label: 'Kunde 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'packdatum',
        label: 'Packdatum',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'packerId',
        label: 'Packer',
        type: 'select' as const,
        required: true,
        group: 'personal',
        options: [
          { value: 'packer1', label: 'Packer 1' },
          { value: 'packer2', label: 'Packer 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'gesamtgewicht',
        label: 'Gesamtgewicht (kg)',
        type: 'number' as const,
        group: 'versand',
        validation: { min: 0 },
      },
      {
        name: 'gesamtvolumen',
        label: 'Gesamtvolumen (m³)',
        type: 'number' as const,
        group: 'versand',
        validation: { min: 0 },
      },
      {
        name: 'anzahlPackstuecke',
        label: 'Anzahl Packstücke',
        type: 'number' as const,
        required: true,
        group: 'versand',
        validation: { required: true, min: 1 },
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select' as const,
        required: true,
        group: 'status',
        options: [
          { value: 'in_bearbeitung', label: 'In Bearbeitung' },
          { value: 'abgeschlossen', label: 'Abgeschlossen' },
        ],
        validation: { required: true },
      },
      {
        name: 'notizen',
        label: 'Notizen',
        type: 'textarea' as const,
        group: 'zusätzlich',
      },
    ];
  }

  private getVersandetikettierungFormFields(): FormField[] {
    return [
      {
        name: 'etikettennummer',
        label: 'Etikettennummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, pattern: /^ETI-\d{6}$/ },
      },
      {
        name: 'packlisteId',
        label: 'Packliste',
        type: 'select' as const,
        required: true,
        group: 'packliste',
        options: [
          { value: 'packliste1', label: 'Packliste 1' },
          { value: 'packliste2', label: 'Packliste 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'auftragId',
        label: 'Auftrag',
        type: 'select' as const,
        required: true,
        group: 'auftrag',
        options: [
          { value: 'auftrag1', label: 'Auftrag 1' },
          { value: 'auftrag2', label: 'Auftrag 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'kundeId',
        label: 'Kunde',
        type: 'select' as const,
        required: true,
        group: 'kunde',
        options: [
          { value: 'kunde1', label: 'Kunde 1' },
          { value: 'kunde2', label: 'Kunde 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'versandart',
        label: 'Versandart',
        type: 'select' as const,
        required: true,
        group: 'versand',
        options: [
          { value: 'standard', label: 'Standard' },
          { value: 'express', label: 'Express' },
          { value: 'spedition', label: 'Spedition' },
        ],
        validation: { required: true },
      },
      {
        name: 'versanddienstleister',
        label: 'Versanddienstleister',
        type: 'select' as const,
        required: true,
        group: 'versand',
        options: [
          { value: 'dhl', label: 'DHL' },
          { value: 'dpd', label: 'DPD' },
          { value: 'hermes', label: 'Hermes' },
        ],
        validation: { required: true },
      },
      {
        name: 'trackingnummer',
        label: 'Trackingnummer',
        type: 'text' as const,
        group: 'versand',
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select' as const,
        required: true,
        group: 'status',
        options: [
          { value: 'erstellt', label: 'Erstellt' },
          { value: 'gedruckt', label: 'Gedruckt' },
          { value: 'versendet', label: 'Versendet' },
        ],
        validation: { required: true },
      },
      {
        name: 'notizen',
        label: 'Notizen',
        type: 'textarea' as const,
        group: 'zusätzlich',
      },
    ];
  }

  private getLogistikUebergabeFormFields(): FormField[] {
    return [
      {
        name: 'uebergabenummer',
        label: 'Übergabenummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, pattern: /^UEG-\d{6}$/ },
      },
      {
        name: 'packlisteId',
        label: 'Packliste',
        type: 'select' as const,
        required: true,
        group: 'packliste',
        options: [
          { value: 'packliste1', label: 'Packliste 1' },
          { value: 'packliste2', label: 'Packliste 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'auftragId',
        label: 'Auftrag',
        type: 'select' as const,
        required: true,
        group: 'auftrag',
        options: [
          { value: 'auftrag1', label: 'Auftrag 1' },
          { value: 'auftrag2', label: 'Auftrag 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'uebergabedatum',
        label: 'Übergabedatum',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'uebergeberId',
        label: 'Übergeber',
        type: 'select' as const,
        required: true,
        group: 'personal',
        options: [
          { value: 'mitarbeiter1', label: 'Mitarbeiter 1' },
          { value: 'mitarbeiter2', label: 'Mitarbeiter 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'empfaengerId',
        label: 'Empfänger',
        type: 'select' as const,
        required: true,
        group: 'personal',
        options: [
          { value: 'spediteur1', label: 'Spediteur 1' },
          { value: 'spediteur2', label: 'Spediteur 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'versanddienstleister',
        label: 'Versanddienstleister',
        type: 'select' as const,
        required: true,
        group: 'versand',
        options: [
          { value: 'dhl', label: 'DHL' },
          { value: 'dpd', label: 'DPD' },
          { value: 'hermes', label: 'Hermes' },
        ],
        validation: { required: true },
      },
      {
        name: 'trackingnummer',
        label: 'Trackingnummer',
        type: 'text' as const,
        group: 'versand',
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select' as const,
        required: true,
        group: 'status',
        options: [
          { value: 'uebergeben', label: 'Übergeben' },
          { value: 'in_transport', label: 'In Transport' },
          { value: 'zugestellt', label: 'Zugestellt' },
        ],
        validation: { required: true },
      },
      {
        name: 'notizen',
        label: 'Notizen',
        type: 'textarea' as const,
        group: 'zusätzlich',
      },
    ];
  }

  private getMaterialbedarfsermittlungFormFields(): FormField[] {
    return [
      {
        name: 'ermittlungsnummer',
        label: 'Ermittlungsnummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, pattern: /^MAT-\d{6}$/ },
      },
      {
        name: 'produktionsauftragId',
        label: 'Produktionsauftrag',
        type: 'select' as const,
        required: true,
        group: 'produktion',
        options: [
          { value: 'auftrag1', label: 'Auftrag 1' },
          { value: 'auftrag2', label: 'Auftrag 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'stuecklisteId',
        label: 'Stückliste',
        type: 'select' as const,
        required: true,
        group: 'produktion',
        options: [
          { value: 'stueckliste1', label: 'Stückliste 1' },
          { value: 'stueckliste2', label: 'Stückliste 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'ermittlungsdatum',
        label: 'Ermittlungsdatum',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select' as const,
        required: true,
        group: 'status',
        options: [
          { value: 'berechnet', label: 'Berechnet' },
          { value: 'verfuegbarkeit_geprueft', label: 'Verfügbarkeit geprüft' },
          { value: 'bestellung_erstellt', label: 'Bestellung erstellt' },
        ],
        validation: { required: true },
      },
      {
        name: 'notizen',
        label: 'Notizen',
        type: 'textarea' as const,
        group: 'zusätzlich',
      },
    ];
  }

  private getRueckverfolgungFormFields(): FormField[] {
    return [
      {
        name: 'rueckverfolgungsnummer',
        label: 'Rückverfolgungsnummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, pattern: /^RUE-\d{6}$/ },
      },
      {
        name: 'artikelId',
        label: 'Artikel',
        type: 'select' as const,
        required: true,
        group: 'artikel',
        options: [
          { value: 'artikel1', label: 'Artikel 1' },
          { value: 'artikel2', label: 'Artikel 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'varianteId',
        label: 'Variante',
        type: 'select' as const,
        group: 'artikel',
        options: [
          { value: 'variante1', label: 'Variante 1' },
          { value: 'variante2', label: 'Variante 2' },
        ],
      },
      {
        name: 'chargeId',
        label: 'Charge',
        type: 'select' as const,
        group: 'artikel',
        options: [
          { value: 'charge1', label: 'Charge 1' },
          { value: 'charge2', label: 'Charge 2' },
        ],
      },
      {
        name: 'seriennummer',
        label: 'Seriennummer',
        type: 'text' as const,
        group: 'artikel',
      },
      {
        name: 'herstellungsdatum',
        label: 'Herstellungsdatum',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'hersteller',
        label: 'Hersteller',
        type: 'text' as const,
        group: 'hersteller',
      },
      {
        name: 'lieferantId',
        label: 'Lieferant',
        type: 'select' as const,
        group: 'lieferant',
        options: [
          { value: 'lieferant1', label: 'Lieferant 1' },
          { value: 'lieferant2', label: 'Lieferant 2' },
        ],
      },
      {
        name: 'kundeId',
        label: 'Kunde',
        type: 'select' as const,
        group: 'kunde',
        options: [
          { value: 'kunde1', label: 'Kunde 1' },
          { value: 'kunde2', label: 'Kunde 2' },
        ],
      },
      {
        name: 'auftragId',
        label: 'Auftrag',
        type: 'select' as const,
        group: 'auftrag',
        options: [
          { value: 'auftrag1', label: 'Auftrag 1' },
          { value: 'auftrag2', label: 'Auftrag 2' },
        ],
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select' as const,
        required: true,
        group: 'status',
        options: [
          { value: 'vollstaendig', label: 'Vollständig' },
          { value: 'teilweise', label: 'Teilweise' },
          { value: 'unvollstaendig', label: 'Unvollständig' },
        ],
        validation: { required: true },
      },
      {
        name: 'notizen',
        label: 'Notizen',
        type: 'textarea' as const,
        group: 'zusätzlich',
      },
    ];
  }

  private getProduktionsauftragFormFields(): FormField[] {
    return [
      {
        name: 'auftragsnummer',
        label: 'Auftragsnummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, pattern: /^PRO-\d{6}$/ },
      },
      {
        name: 'produktId',
        label: 'Produkt',
        type: 'select' as const,
        required: true,
        group: 'produkt',
        options: [
          { value: 'produkt1', label: 'Produkt 1' },
          { value: 'produkt2', label: 'Produkt 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'stuecklisteId',
        label: 'Stückliste',
        type: 'select' as const,
        required: true,
        group: 'produktion',
        options: [
          { value: 'stueckliste1', label: 'Stückliste 1' },
          { value: 'stueckliste2', label: 'Stückliste 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'menge',
        label: 'Menge',
        type: 'number' as const,
        required: true,
        group: 'menge',
        validation: { required: true, min: 0.001 },
      },
      {
        name: 'einheit',
        label: 'Einheit',
        type: 'select' as const,
        required: true,
        group: 'menge',
        options: [
          { value: 'stk', label: 'Stück' },
          { value: 'kg', label: 'Kilogramm' },
          { value: 'l', label: 'Liter' },
        ],
        validation: { required: true },
      },
      {
        name: 'startdatum',
        label: 'Startdatum',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'enddatum',
        label: 'Enddatum',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select' as const,
        required: true,
        group: 'status',
        options: [
          { value: 'geplant', label: 'Geplant' },
          { value: 'laufend', label: 'Laufend' },
          { value: 'abgeschlossen', label: 'Abgeschlossen' },
          { value: 'storniert', label: 'Storniert' },
        ],
        validation: { required: true },
      },
      {
        name: 'prioritaet',
        label: 'Priorität',
        type: 'select' as const,
        required: true,
        group: 'priorität',
        options: [
          { value: 'niedrig', label: 'Niedrig' },
          { value: 'normal', label: 'Normal' },
          { value: 'hoch', label: 'Hoch' },
          { value: 'dringend', label: 'Dringend' },
        ],
        validation: { required: true },
      },
      {
        name: 'werkstattId',
        label: 'Werkstatt',
        type: 'select' as const,
        group: 'werkstatt',
        options: [
          { value: 'werkstatt1', label: 'Werkstatt 1' },
          { value: 'werkstatt2', label: 'Werkstatt 2' },
        ],
      },
      {
        name: 'maschinenId',
        label: 'Maschinen',
        type: 'select' as const,
        group: 'maschinen',
        options: [
          { value: 'maschine1', label: 'Maschine 1' },
          { value: 'maschine2', label: 'Maschine 2' },
        ],
      },
      {
        name: 'mitarbeiterId',
        label: 'Mitarbeiter',
        type: 'select' as const,
        group: 'personal',
        options: [
          { value: 'mitarbeiter1', label: 'Mitarbeiter 1' },
          { value: 'mitarbeiter2', label: 'Mitarbeiter 2' },
        ],
      },
      {
        name: 'notizen',
        label: 'Notizen',
        type: 'textarea' as const,
        group: 'zusätzlich',
      },
    ];
  }

  private getRueckmeldungFormFields(): FormField[] {
    return [
      {
        name: 'rueckmeldungsnummer',
        label: 'Rückmeldungsnummer',
        type: 'text' as const,
        required: true,
        group: 'grunddaten',
        validation: { required: true, pattern: /^RUE-\d{6}$/ },
      },
      {
        name: 'produktionsauftragId',
        label: 'Produktionsauftrag',
        type: 'select' as const,
        required: true,
        group: 'produktion',
        options: [
          { value: 'auftrag1', label: 'Auftrag 1' },
          { value: 'auftrag2', label: 'Auftrag 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'rueckmeldungsdatum',
        label: 'Rückmeldungsdatum',
        type: 'date' as const,
        required: true,
        group: 'datum',
        validation: { required: true },
      },
      {
        name: 'mitarbeiterId',
        label: 'Mitarbeiter',
        type: 'select' as const,
        required: true,
        group: 'personal',
        options: [
          { value: 'mitarbeiter1', label: 'Mitarbeiter 1' },
          { value: 'mitarbeiter2', label: 'Mitarbeiter 2' },
        ],
        validation: { required: true },
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select' as const,
        required: true,
        group: 'status',
        options: [
          { value: 'teilrueckmeldung', label: 'Teilrückmeldung' },
          { value: 'vollstaendig', label: 'Vollständig' },
        ],
        validation: { required: true },
      },
      {
        name: 'notizen',
        label: 'Notizen',
        type: 'textarea' as const,
        group: 'zusätzlich',
      },
    ];
  }

  private getLieferantenbewertungFormFields(): FormField[] {
    return [
      { name: 'bewertungsnummer', label: 'Bewertungsnummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^BEW-\d{6}$/ } },
      { name: 'lieferantId', label: 'Lieferant', type: 'select' as const, required: true, group: 'lieferant', options: [{ value: 'lieferant1', label: 'Lieferant 1' }, { value: 'lieferant2', label: 'Lieferant 2' }], validation: { required: true } },
      { name: 'bewertungszeitraum', label: 'Bewertungszeitraum', type: 'text' as const, required: true, group: 'zeitraum', validation: { required: true } },
      { name: 'bewertungsdatum', label: 'Bewertungsdatum', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'gesamtbewertung', label: 'Gesamtbewertung', type: 'number' as const, required: true, group: 'bewertung', validation: { required: true, min: 1, max: 5 } },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'erstellt', label: 'Erstellt' }, { value: 'freigegeben', label: 'Freigegeben' }, { value: 'archiviert', label: 'Archiviert' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getKundenruecklaeuferFormFields(): FormField[] {
    return [
      { name: 'ruecklaeufernummer', label: 'Rückläufernummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^RUE-\d{6}$/ } },
      { name: 'kundeId', label: 'Kunde', type: 'select' as const, required: true, group: 'kunde', options: [{ value: 'kunde1', label: 'Kunde 1' }, { value: 'kunde2', label: 'Kunde 2' }], validation: { required: true } },
      { name: 'auftragId', label: 'Auftrag', type: 'select' as const, group: 'auftrag', options: [{ value: 'auftrag1', label: 'Auftrag 1' }, { value: 'auftrag2', label: 'Auftrag 2' }] },
      { name: 'rechnungId', label: 'Rechnung', type: 'select' as const, group: 'rechnung', options: [{ value: 'rechnung1', label: 'Rechnung 1' }, { value: 'rechnung2', label: 'Rechnung 2' }] },
      { name: 'ruecklaeuferdatum', label: 'Rückläuferdatum', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'grund', label: 'Grund', type: 'text' as const, required: true, group: 'grund', validation: { required: true } },
      { name: 'ruecklaeuferart', label: 'Rückläuferart', type: 'select' as const, required: true, group: 'art', options: [{ value: 'reklamation', label: 'Reklamation' }, { value: 'garantie', label: 'Garantie' }, { value: 'kundenservice', label: 'Kundenservice' }, { value: 'sonstiges', label: 'Sonstiges' }], validation: { required: true } },
      { name: 'prioritaet', label: 'Priorität', type: 'select' as const, required: true, group: 'priorität', options: [{ value: 'niedrig', label: 'Niedrig' }, { value: 'mittel', label: 'Mittel' }, { value: 'hoch', label: 'Hoch' }, { value: 'kritisch', label: 'Kritisch' }], validation: { required: true } },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'eingegangen', label: 'Eingegangen' }, { value: 'in_bearbeitung', label: 'In Bearbeitung' }, { value: 'geloest', label: 'Gelöst' }, { value: 'abgelehnt', label: 'Abgelehnt' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getGutschriftFormFields(): FormField[] {
    return [
      { name: 'gutschriftsnummer', label: 'Gutschriftsnummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^GUT-\d{6}$/ } },
      { name: 'ruecklaeuferId', label: 'Rückläufer', type: 'select' as const, group: 'rueckläufer', options: [{ value: 'ruecklaeufer1', label: 'Rückläufer 1' }, { value: 'ruecklaeufer2', label: 'Rückläufer 2' }] },
      { name: 'rechnungId', label: 'Rechnung', type: 'select' as const, group: 'rechnung', options: [{ value: 'rechnung1', label: 'Rechnung 1' }, { value: 'rechnung2', label: 'Rechnung 2' }] },
      { name: 'kundeId', label: 'Kunde', type: 'select' as const, required: true, group: 'kunde', options: [{ value: 'kunde1', label: 'Kunde 1' }, { value: 'kunde2', label: 'Kunde 2' }], validation: { required: true } },
      { name: 'gutschriftsdatum', label: 'Gutschriftsdatum', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'gesamtbetrag', label: 'Gesamtbetrag', type: 'currency' as const, required: true, group: 'finanzen', validation: { required: true, min: 0 } },
      { name: 'waehrung', label: 'Währung', type: 'select' as const, required: true, group: 'finanzen', options: [{ value: 'EUR', label: 'Euro' }, { value: 'USD', label: 'US Dollar' }], validation: { required: true } },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'entwurf', label: 'Entwurf' }, { value: 'freigegeben', label: 'Freigegeben' }, { value: 'versendet', label: 'Versendet' }, { value: 'verbucht', label: 'Verbucht' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getUrsachenanalyseFormFields(): FormField[] {
    return [
      { name: 'analysenummer', label: 'Analysenummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^ANA-\d{6}$/ } },
      { name: 'ruecklaeuferId', label: 'Rückläufer', type: 'select' as const, required: true, group: 'rueckläufer', options: [{ value: 'ruecklaeufer1', label: 'Rückläufer 1' }, { value: 'ruecklaeufer2', label: 'Rückläufer 2' }], validation: { required: true } },
      { name: 'analysendatum', label: 'Analysendatum', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'analysentyp', label: 'Analysentyp', type: 'select' as const, required: true, group: 'analyse', options: [{ value: 'qualitaet', label: 'Qualität' }, { value: 'lieferung', label: 'Lieferung' }, { value: 'kommunikation', label: 'Kommunikation' }, { value: 'system', label: 'System' }], validation: { required: true } },
      { name: 'ursache', label: 'Ursache', type: 'text' as const, required: true, group: 'ursache', validation: { required: true } },
      { name: 'verantwortlicherId', label: 'Verantwortlicher', type: 'select' as const, required: true, group: 'personal', options: [{ value: 'mitarbeiter1', label: 'Mitarbeiter 1' }, { value: 'mitarbeiter2', label: 'Mitarbeiter 2' }], validation: { required: true } },
      { name: 'deadline', label: 'Deadline', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'in_bearbeitung', label: 'In Bearbeitung' }, { value: 'abgeschlossen', label: 'Abgeschlossen' }, { value: 'ueberfaellig', label: 'Überfällig' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getVerpackungsvorschriftenFormFields(): FormField[] {
    return [
      { name: 'vorschriftennummer', label: 'Vorschriftennummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^VER-\d{6}$/ } },
      { name: 'artikelId', label: 'Artikel', type: 'select' as const, required: true, group: 'artikel', options: [{ value: 'artikel1', label: 'Artikel 1' }, { value: 'artikel2', label: 'Artikel 2' }], validation: { required: true } },
      { name: 'varianteId', label: 'Variante', type: 'select' as const, group: 'artikel', options: [{ value: 'variante1', label: 'Variante 1' }, { value: 'variante2', label: 'Variante 2' }] },
      { name: 'verpackungsart', label: 'Verpackungsart', type: 'text' as const, required: true, group: 'verpackung', validation: { required: true } },
      { name: 'verpackungsgroesse', label: 'Verpackungsgröße', type: 'text' as const, required: true, group: 'verpackung', validation: { required: true } },
      { name: 'gewicht', label: 'Gewicht (kg)', type: 'number' as const, required: true, group: 'verpackung', validation: { required: true, min: 0 } },
      { name: 'volumen', label: 'Volumen (m³)', type: 'number' as const, required: true, group: 'verpackung', validation: { required: true, min: 0 } },
      { name: 'gefahrgutklasse', label: 'Gefahrgutklasse', type: 'text' as const, group: 'gefahrgut' },
      { name: 'unNummer', label: 'UN-Nummer', type: 'text' as const, group: 'gefahrgut' },
      { name: 'adrKonform', label: 'ADR-konform', type: 'checkbox' as const, group: 'gefahrgut' },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'entwurf', label: 'Entwurf' }, { value: 'freigegeben', label: 'Freigegeben' }, { value: 'archiviert', label: 'Archiviert' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getEtikettenFormFields(): FormField[] {
    return [
      { name: 'etikettennummer', label: 'Etikettennummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^ETI-\d{6}$/ } },
      { name: 'artikelId', label: 'Artikel', type: 'select' as const, required: true, group: 'artikel', options: [{ value: 'artikel1', label: 'Artikel 1' }, { value: 'artikel2', label: 'Artikel 2' }], validation: { required: true } },
      { name: 'varianteId', label: 'Variante', type: 'select' as const, group: 'artikel', options: [{ value: 'variante1', label: 'Variante 1' }, { value: 'variante2', label: 'Variante 2' }] },
      { name: 'etikettentyp', label: 'Etikettentyp', type: 'text' as const, required: true, group: 'etikett', validation: { required: true } },
      { name: 'druckformat', label: 'Druckformat', type: 'text' as const, required: true, group: 'druck', validation: { required: true } },
      { name: 'druckerId', label: 'Drucker', type: 'select' as const, group: 'druck', options: [{ value: 'drucker1', label: 'Drucker 1' }, { value: 'drucker2', label: 'Drucker 2' }] },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'entwurf', label: 'Entwurf' }, { value: 'gedruckt', label: 'Gedruckt' }, { value: 'archiviert', label: 'Archiviert' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getUNNummernFormFields(): FormField[] {
    return [
      { name: 'unNummer', label: 'UN-Nummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^\d{4}$/ } },
      { name: 'bezeichnung', label: 'Bezeichnung', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true } },
      { name: 'gefahrgutklasse', label: 'Gefahrgutklasse', type: 'text' as const, required: true, group: 'gefahrgut', validation: { required: true } },
      { name: 'verpackungsgruppe', label: 'Verpackungsgruppe', type: 'text' as const, required: true, group: 'gefahrgut', validation: { required: true } },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'aktiv', label: 'Aktiv' }, { value: 'inaktiv', label: 'Inaktiv' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getADRKonformitaetFormFields(): FormField[] {
    return [
      { name: 'konformitaetsnummer', label: 'Konformitätsnummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^ADR-\d{6}$/ } },
      { name: 'artikelId', label: 'Artikel', type: 'select' as const, required: true, group: 'artikel', options: [{ value: 'artikel1', label: 'Artikel 1' }, { value: 'artikel2', label: 'Artikel 2' }], validation: { required: true } },
      { name: 'varianteId', label: 'Variante', type: 'select' as const, group: 'artikel', options: [{ value: 'variante1', label: 'Variante 1' }, { value: 'variante2', label: 'Variante 2' }] },
      { name: 'adrKlasse', label: 'ADR-Klasse', type: 'text' as const, required: true, group: 'adr', validation: { required: true } },
      { name: 'verpackungsgruppe', label: 'Verpackungsgruppe', type: 'text' as const, required: true, group: 'adr', validation: { required: true } },
      { name: 'unNummer', label: 'UN-Nummer', type: 'text' as const, required: true, group: 'adr', validation: { required: true } },
      { name: 'konformitaetspruefung', label: 'Konformitätsprüfung', type: 'checkbox' as const, required: true, group: 'adr', validation: { required: true } },
      { name: 'zertifikat', label: 'Zertifikat', type: 'text' as const, group: 'adr' },
      { name: 'gueltigBis', label: 'Gültig bis', type: 'date' as const, group: 'adr' },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'konform', label: 'Konform' }, { value: 'nicht_konform', label: 'Nicht konform' }, { value: 'in_pruefung', label: 'In Prüfung' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getInventurerfassungFormFields(): FormField[] {
    return [
      { name: 'erfassungsnummer', label: 'Erfassungsnummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^ERF-\d{6}$/ } },
      { name: 'inventurId', label: 'Inventur', type: 'select' as const, required: true, group: 'inventur', options: [{ value: 'inventur1', label: 'Inventur 1' }, { value: 'inventur2', label: 'Inventur 2' }], validation: { required: true } },
      { name: 'lagerortId', label: 'Lagerort', type: 'select' as const, required: true, group: 'lager', options: [{ value: 'lagerort1', label: 'Lagerort 1' }, { value: 'lagerort2', label: 'Lagerort 2' }], validation: { required: true } },
      { name: 'erfasserId', label: 'Erfasser', type: 'select' as const, required: true, group: 'personal', options: [{ value: 'mitarbeiter1', label: 'Mitarbeiter 1' }, { value: 'mitarbeiter2', label: 'Mitarbeiter 2' }], validation: { required: true } },
      { name: 'erfassungsdatum', label: 'Erfassungsdatum', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'erfassungsart', label: 'Erfassungsart', type: 'select' as const, required: true, group: 'erfassung', options: [{ value: 'manuell', label: 'Manuell' }, { value: 'barcode', label: 'Barcode' }, { value: 'rfid', label: 'RFID' }], validation: { required: true } },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'laufend', label: 'Laufend' }, { value: 'abgeschlossen', label: 'Abgeschlossen' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getDifferenzkontrolleFormFields(): FormField[] {
    return [
      { name: 'kontrollnummer', label: 'Kontrollnummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^KON-\d{6}$/ } },
      { name: 'inventurId', label: 'Inventur', type: 'select' as const, required: true, group: 'inventur', options: [{ value: 'inventur1', label: 'Inventur 1' }, { value: 'inventur2', label: 'Inventur 2' }], validation: { required: true } },
      { name: 'kontrolleurId', label: 'Kontrolleur', type: 'select' as const, required: true, group: 'personal', options: [{ value: 'mitarbeiter1', label: 'Mitarbeiter 1' }, { value: 'mitarbeiter2', label: 'Mitarbeiter 2' }], validation: { required: true } },
      { name: 'kontrolldatum', label: 'Kontrolldatum', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'gesamtDifferenz', label: 'Gesamtdifferenz', type: 'number' as const, required: true, group: 'differenz', validation: { required: true } },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'in_bearbeitung', label: 'In Bearbeitung' }, { value: 'abgeschlossen', label: 'Abgeschlossen' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getUmlagerungFormFields(): FormField[] {
    return [
      { name: 'umlagerungsnummer', label: 'Umlagerungsnummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^UML-\d{6}$/ } },
      { name: 'artikelId', label: 'Artikel', type: 'select' as const, required: true, group: 'artikel', options: [{ value: 'artikel1', label: 'Artikel 1' }, { value: 'artikel2', label: 'Artikel 2' }], validation: { required: true } },
      { name: 'varianteId', label: 'Variante', type: 'select' as const, group: 'artikel', options: [{ value: 'variante1', label: 'Variante 1' }, { value: 'variante2', label: 'Variante 2' }] },
      { name: 'chargeId', label: 'Charge', type: 'select' as const, group: 'artikel', options: [{ value: 'charge1', label: 'Charge 1' }, { value: 'charge2', label: 'Charge 2' }] },
      { name: 'seriennummer', label: 'Seriennummer', type: 'text' as const, group: 'artikel' },
      { name: 'menge', label: 'Menge', type: 'number' as const, required: true, group: 'menge', validation: { required: true, min: 0.001 } },
      { name: 'einheit', label: 'Einheit', type: 'select' as const, required: true, group: 'menge', options: [{ value: 'stk', label: 'Stück' }, { value: 'kg', label: 'Kilogramm' }, { value: 'l', label: 'Liter' }], validation: { required: true } },
      { name: 'vonLagerortId', label: 'Von Lagerort', type: 'select' as const, required: true, group: 'lager', options: [{ value: 'lagerort1', label: 'Lagerort 1' }, { value: 'lagerort2', label: 'Lagerort 2' }], validation: { required: true } },
      { name: 'vonLagerplatzId', label: 'Von Lagerplatz', type: 'select' as const, group: 'lager', options: [{ value: 'lagerplatz1', label: 'Lagerplatz 1' }, { value: 'lagerplatz2', label: 'Lagerplatz 2' }] },
      { name: 'nachLagerortId', label: 'Nach Lagerort', type: 'select' as const, required: true, group: 'lager', options: [{ value: 'lagerort1', label: 'Lagerort 1' }, { value: 'lagerort2', label: 'Lagerort 2' }], validation: { required: true } },
      { name: 'nachLagerplatzId', label: 'Nach Lagerplatz', type: 'select' as const, group: 'lager', options: [{ value: 'lagerplatz1', label: 'Lagerplatz 1' }, { value: 'lagerplatz2', label: 'Lagerplatz 2' }] },
      { name: 'umlagerungsdatum', label: 'Umlagerungsdatum', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'umlagererId', label: 'Umlagerer', type: 'select' as const, required: true, group: 'personal', options: [{ value: 'mitarbeiter1', label: 'Mitarbeiter 1' }, { value: 'mitarbeiter2', label: 'Mitarbeiter 2' }], validation: { required: true } },
      { name: 'grund', label: 'Grund', type: 'text' as const, required: true, group: 'grund', validation: { required: true } },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'geplant', label: 'Geplant' }, { value: 'in_bearbeitung', label: 'In Bearbeitung' }, { value: 'abgeschlossen', label: 'Abgeschlossen' }, { value: 'storniert', label: 'Storniert' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getPreislistenFormFields(): FormField[] {
    return [
      { name: 'preislistennummer', label: 'Preislistennummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^PRE-\d{6}$/ } },
      { name: 'bezeichnung', label: 'Bezeichnung', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true } },
      { name: 'gueltigAb', label: 'Gültig ab', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'gueltigBis', label: 'Gültig bis', type: 'date' as const, group: 'datum' },
      { name: 'waehrung', label: 'Währung', type: 'select' as const, required: true, group: 'finanzen', options: [{ value: 'EUR', label: 'Euro' }, { value: 'USD', label: 'US Dollar' }], validation: { required: true } },
      { name: 'kundengruppe', label: 'Kundengruppe', type: 'select' as const, group: 'kunde', options: [{ value: 'gruppe1', label: 'Gruppe 1' }, { value: 'gruppe2', label: 'Gruppe 2' }] },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'entwurf', label: 'Entwurf' }, { value: 'freigegeben', label: 'Freigegeben' }, { value: 'archiviert', label: 'Archiviert' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getAktionenFormFields(): FormField[] {
    return [
      { name: 'aktionsnummer', label: 'Aktionsnummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^AKT-\d{6}$/ } },
      { name: 'bezeichnung', label: 'Bezeichnung', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true } },
      { name: 'aktionstyp', label: 'Aktionstyp', type: 'select' as const, required: true, group: 'aktion', options: [{ value: 'rabatt', label: 'Rabatt' }, { value: 'mengenrabatt', label: 'Mengenrabatt' }, { value: 'gratisartikel', label: 'Gratisartikel' }, { value: 'preisreduktion', label: 'Preisreduktion' }], validation: { required: true } },
      { name: 'gueltigAb', label: 'Gültig ab', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'gueltigBis', label: 'Gültig bis', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'kundengruppe', label: 'Kundengruppe', type: 'select' as const, group: 'kunde', options: [{ value: 'gruppe1', label: 'Gruppe 1' }, { value: 'gruppe2', label: 'Gruppe 2' }] },
      { name: 'artikelgruppe', label: 'Artikelgruppe', type: 'select' as const, group: 'artikel', options: [{ value: 'gruppe1', label: 'Gruppe 1' }, { value: 'gruppe2', label: 'Gruppe 2' }] },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'geplant', label: 'Geplant' }, { value: 'aktiv', label: 'Aktiv' }, { value: 'beendet', label: 'Beendet' }, { value: 'storniert', label: 'Storniert' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getStaffelpreiseFormFields(): FormField[] {
    return [
      { name: 'staffelpreisnummer', label: 'Staffelpreisnummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^STA-\d{6}$/ } },
      { name: 'artikelId', label: 'Artikel', type: 'select' as const, required: true, group: 'artikel', options: [{ value: 'artikel1', label: 'Artikel 1' }, { value: 'artikel2', label: 'Artikel 2' }], validation: { required: true } },
      { name: 'varianteId', label: 'Variante', type: 'select' as const, group: 'artikel', options: [{ value: 'variante1', label: 'Variante 1' }, { value: 'variante2', label: 'Variante 2' }] },
      { name: 'gueltigAb', label: 'Gültig ab', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'gueltigBis', label: 'Gültig bis', type: 'date' as const, group: 'datum' },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'aktiv', label: 'Aktiv' }, { value: 'inaktiv', label: 'Inaktiv' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getRabattsystemeFormFields(): FormField[] {
    return [
      { name: 'rabattsystemnummer', label: 'Rabattsystemnummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^RAB-\d{6}$/ } },
      { name: 'bezeichnung', label: 'Bezeichnung', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true } },
      { name: 'rabattsystemtyp', label: 'Rabattsystemtyp', type: 'select' as const, required: true, group: 'rabatt', options: [{ value: 'kundengruppe', label: 'Kundengruppe' }, { value: 'mengenrabatt', label: 'Mengenrabatt' }, { value: 'treuerabatt', label: 'Treuerabatt' }, { value: 'saisonrabatt', label: 'Saisonrabatt' }], validation: { required: true } },
      { name: 'gueltigAb', label: 'Gültig ab', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'gueltigBis', label: 'Gültig bis', type: 'date' as const, group: 'datum' },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'aktiv', label: 'Aktiv' }, { value: 'inaktiv', label: 'Inaktiv' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getArtikelstammdatenFormFields(): FormField[] {
    return [
      { name: 'artikelnummer', label: 'Artikelnummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^ART-\d{6}$/ } },
      { name: 'bezeichnung', label: 'Bezeichnung', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true } },
      { name: 'kurzbeschreibung', label: 'Kurzbeschreibung', type: 'text' as const, group: 'beschreibung' },
      { name: 'langbeschreibung', label: 'Langbeschreibung', type: 'textarea' as const, group: 'beschreibung' },
      { name: 'kategorie', label: 'Kategorie', type: 'select' as const, required: true, group: 'klassifizierung', options: [{ value: 'kategorie1', label: 'Kategorie 1' }, { value: 'kategorie2', label: 'Kategorie 2' }], validation: { required: true } },
      { name: 'unterkategorie', label: 'Unterkategorie', type: 'select' as const, group: 'klassifizierung', options: [{ value: 'unterkategorie1', label: 'Unterkategorie 1' }, { value: 'unterkategorie2', label: 'Unterkategorie 2' }] },
      { name: 'einheit', label: 'Einheit', type: 'select' as const, required: true, group: 'grunddaten', options: [{ value: 'stk', label: 'Stück' }, { value: 'kg', label: 'Kilogramm' }, { value: 'l', label: 'Liter' }], validation: { required: true } },
      { name: 'gewicht', label: 'Gewicht (kg)', type: 'number' as const, group: 'eigenschaften', validation: { min: 0 } },
      { name: 'volumen', label: 'Volumen (m³)', type: 'number' as const, group: 'eigenschaften', validation: { min: 0 } },
      { name: 'ean', label: 'EAN-Code', type: 'text' as const, group: 'identifikation' },
      { name: 'hersteller', label: 'Hersteller', type: 'text' as const, group: 'hersteller' },
      { name: 'herstellernummer', label: 'Herstellernummer', type: 'text' as const, group: 'hersteller' },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'aktiv', label: 'Aktiv' }, { value: 'inaktiv', label: 'Inaktiv' }, { value: 'gesperrt', label: 'Gesperrt' }], validation: { required: true } },
      { name: 'preisgruppe', label: 'Preisgruppe', type: 'select' as const, required: true, group: 'preise', options: [{ value: 'gruppe1', label: 'Gruppe 1' }, { value: 'gruppe2', label: 'Gruppe 2' }], validation: { required: true } },
      { name: 'steuersatz', label: 'Steuersatz (%)', type: 'number' as const, required: true, group: 'preise', validation: { required: true, min: 0, max: 100 } },
      { name: 'mindestbestand', label: 'Mindestbestand', type: 'number' as const, required: true, group: 'lager', validation: { required: true, min: 0 } },
      { name: 'optimalbestand', label: 'Optimalbestand', type: 'number' as const, required: true, group: 'lager', validation: { required: true, min: 0 } },
      { name: 'maxbestand', label: 'Maximalbestand', type: 'number' as const, required: true, group: 'lager', validation: { required: true, min: 0 } },
      { name: 'lagerort', label: 'Lagerort', type: 'text' as const, group: 'lager' },
      { name: 'bild', label: 'Bild', type: 'file' as const, group: 'medien' },
      { name: 'dokumente', label: 'Dokumente', type: 'file' as const, group: 'medien' },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getArtikelklassifizierungFormFields(): FormField[] {
    return [
      { name: 'artikelId', label: 'Artikel', type: 'select' as const, required: true, group: 'artikel', options: [{ value: 'artikel1', label: 'Artikel 1' }, { value: 'artikel2', label: 'Artikel 2' }], validation: { required: true } },
      { name: 'hauptkategorie', label: 'Hauptkategorie', type: 'select' as const, required: true, group: 'klassifizierung', options: [{ value: 'haupt1', label: 'Hauptkategorie 1' }, { value: 'haupt2', label: 'Hauptkategorie 2' }], validation: { required: true } },
      { name: 'unterkategorie', label: 'Unterkategorie', type: 'select' as const, required: true, group: 'klassifizierung', options: [{ value: 'unter1', label: 'Unterkategorie 1' }, { value: 'unter2', label: 'Unterkategorie 2' }], validation: { required: true } },
      { name: 'produktgruppe', label: 'Produktgruppe', type: 'select' as const, required: true, group: 'klassifizierung', options: [{ value: 'gruppe1', label: 'Gruppe 1' }, { value: 'gruppe2', label: 'Gruppe 2' }], validation: { required: true } },
      { name: 'produktfamilie', label: 'Produktfamilie', type: 'select' as const, required: true, group: 'klassifizierung', options: [{ value: 'familie1', label: 'Familie 1' }, { value: 'familie2', label: 'Familie 2' }], validation: { required: true } },
      { name: 'bewertung', label: 'Bewertung', type: 'number' as const, required: true, group: 'bewertung', validation: { required: true, min: 1, max: 5 } },
      { name: 'prioritaet', label: 'Priorität', type: 'select' as const, required: true, group: 'priorität', options: [{ value: 'niedrig', label: 'Niedrig' }, { value: 'mittel', label: 'Mittel' }, { value: 'hoch', label: 'Hoch' }], validation: { required: true } },
      { name: 'freigabestatus', label: 'Freigabestatus', type: 'select' as const, required: true, group: 'status', options: [{ value: 'entwurf', label: 'Entwurf' }, { value: 'freigegeben', label: 'Freigegeben' }, { value: 'gesperrt', label: 'Gesperrt' }], validation: { required: true } },
    ];
  }

  private getArtikelvarianteFormFields(): FormField[] {
    return [
      { name: 'artikelId', label: 'Artikel', type: 'select' as const, required: true, group: 'artikel', options: [{ value: 'artikel1', label: 'Artikel 1' }, { value: 'artikel2', label: 'Artikel 2' }], validation: { required: true } },
      { name: 'variantenname', label: 'Variantenname', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true } },
      { name: 'variantencode', label: 'Variantencode', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true } },
      { name: 'preisaufschlag', label: 'Preisaufschlag (%)', type: 'number' as const, group: 'preise', validation: { min: 0 } },
      { name: 'gewicht', label: 'Gewicht (kg)', type: 'number' as const, group: 'eigenschaften', validation: { min: 0 } },
      { name: 'volumen', label: 'Volumen (m³)', type: 'number' as const, group: 'eigenschaften', validation: { min: 0 } },
      { name: 'lagerbestand', label: 'Lagerbestand', type: 'number' as const, required: true, group: 'lager', validation: { required: true, min: 0 } },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'aktiv', label: 'Aktiv' }, { value: 'inaktiv', label: 'Inaktiv' }], validation: { required: true } },
    ];
  }

  private getStuecklisteFormFields(): FormField[] {
    return [
      { name: 'stuecklistennummer', label: 'Stücklistennummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^STU-\d{6}$/ } },
      { name: 'bezeichnung', label: 'Bezeichnung', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true } },
      { name: 'version', label: 'Version', type: 'text' as const, required: true, group: 'version', validation: { required: true } },
      { name: 'gueltigAb', label: 'Gültig ab', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'gueltigBis', label: 'Gültig bis', type: 'date' as const, group: 'datum' },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'entwurf', label: 'Entwurf' }, { value: 'freigegeben', label: 'Freigegeben' }, { value: 'archiviert', label: 'Archiviert' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getEinlagerungFormFields(): FormField[] {
    return [
      { name: 'bewegungsnummer', label: 'Bewegungsnummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^EIN-\d{6}$/ } },
      { name: 'artikelId', label: 'Artikel', type: 'select' as const, required: true, group: 'artikel', options: [{ value: 'artikel1', label: 'Artikel 1' }, { value: 'artikel2', label: 'Artikel 2' }], validation: { required: true } },
      { name: 'varianteId', label: 'Variante', type: 'select' as const, group: 'artikel', options: [{ value: 'variante1', label: 'Variante 1' }, { value: 'variante2', label: 'Variante 2' }] },
      { name: 'menge', label: 'Menge', type: 'number' as const, required: true, group: 'menge', validation: { required: true, min: 0.001 } },
      { name: 'einheit', label: 'Einheit', type: 'select' as const, required: true, group: 'menge', options: [{ value: 'stk', label: 'Stück' }, { value: 'kg', label: 'Kilogramm' }, { value: 'l', label: 'Liter' }], validation: { required: true } },
      { name: 'lagerortId', label: 'Lagerort', type: 'select' as const, required: true, group: 'lager', options: [{ value: 'lagerort1', label: 'Lagerort 1' }, { value: 'lagerort2', label: 'Lagerort 2' }], validation: { required: true } },
      { name: 'lagerplatzId', label: 'Lagerplatz', type: 'select' as const, group: 'lager', options: [{ value: 'lagerplatz1', label: 'Lagerplatz 1' }, { value: 'lagerplatz2', label: 'Lagerplatz 2' }] },
      { name: 'chargeId', label: 'Charge', type: 'select' as const, group: 'artikel', options: [{ value: 'charge1', label: 'Charge 1' }, { value: 'charge2', label: 'Charge 2' }] },
      { name: 'seriennummer', label: 'Seriennummer', type: 'text' as const, group: 'artikel' },
      { name: 'lieferantId', label: 'Lieferant', type: 'select' as const, group: 'lieferant', options: [{ value: 'lieferant1', label: 'Lieferant 1' }, { value: 'lieferant2', label: 'Lieferant 2' }] },
      { name: 'bestellungId', label: 'Bestellung', type: 'select' as const, group: 'bestellung', options: [{ value: 'bestellung1', label: 'Bestellung 1' }, { value: 'bestellung2', label: 'Bestellung 2' }] },
      { name: 'einlagerungsdatum', label: 'Einlagerungsdatum', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'qualitaetspruefung', label: 'Qualitätsprüfung', type: 'checkbox' as const, required: true, group: 'qualität', validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getAuslagerungFormFields(): FormField[] {
    return [
      { name: 'bewegungsnummer', label: 'Bewegungsnummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^AUS-\d{6}$/ } },
      { name: 'artikelId', label: 'Artikel', type: 'select' as const, required: true, group: 'artikel', options: [{ value: 'artikel1', label: 'Artikel 1' }, { value: 'artikel2', label: 'Artikel 2' }], validation: { required: true } },
      { name: 'varianteId', label: 'Variante', type: 'select' as const, group: 'artikel', options: [{ value: 'variante1', label: 'Variante 1' }, { value: 'variante2', label: 'Variante 2' }] },
      { name: 'menge', label: 'Menge', type: 'number' as const, required: true, group: 'menge', validation: { required: true, min: 0.001 } },
      { name: 'einheit', label: 'Einheit', type: 'select' as const, required: true, group: 'menge', options: [{ value: 'stk', label: 'Stück' }, { value: 'kg', label: 'Kilogramm' }, { value: 'l', label: 'Liter' }], validation: { required: true } },
      { name: 'lagerortId', label: 'Lagerort', type: 'select' as const, required: true, group: 'lager', options: [{ value: 'lagerort1', label: 'Lagerort 1' }, { value: 'lagerort2', label: 'Lagerort 2' }], validation: { required: true } },
      { name: 'lagerplatzId', label: 'Lagerplatz', type: 'select' as const, group: 'lager', options: [{ value: 'lagerplatz1', label: 'Lagerplatz 1' }, { value: 'lagerplatz2', label: 'Lagerplatz 2' }] },
      { name: 'chargeId', label: 'Charge', type: 'select' as const, group: 'artikel', options: [{ value: 'charge1', label: 'Charge 1' }, { value: 'charge2', label: 'Charge 2' }] },
      { name: 'seriennummer', label: 'Seriennummer', type: 'text' as const, group: 'artikel' },
      { name: 'kundeId', label: 'Kunde', type: 'select' as const, group: 'kunde', options: [{ value: 'kunde1', label: 'Kunde 1' }, { value: 'kunde2', label: 'Kunde 2' }] },
      { name: 'auftragId', label: 'Auftrag', type: 'select' as const, group: 'auftrag', options: [{ value: 'auftrag1', label: 'Auftrag 1' }, { value: 'auftrag2', label: 'Auftrag 2' }] },
      { name: 'auslagerungsdatum', label: 'Auslagerungsdatum', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'kommissioniererId', label: 'Kommissionierer', type: 'select' as const, group: 'personal', options: [{ value: 'mitarbeiter1', label: 'Mitarbeiter 1' }, { value: 'mitarbeiter2', label: 'Mitarbeiter 2' }] },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getLagerplatzOptimierungFormFields(): FormField[] {
    return [
      { name: 'lagerortId', label: 'Lagerort', type: 'select' as const, required: true, group: 'lager', options: [{ value: 'lagerort1', label: 'Lagerort 1' }, { value: 'lagerort2', label: 'Lagerort 2' }], validation: { required: true } },
      { name: 'lagerplatzId', label: 'Lagerplatz', type: 'select' as const, required: true, group: 'lager', options: [{ value: 'lagerplatz1', label: 'Lagerplatz 1' }, { value: 'lagerplatz2', label: 'Lagerplatz 2' }], validation: { required: true } },
      { name: 'artikelId', label: 'Artikel', type: 'select' as const, required: true, group: 'artikel', options: [{ value: 'artikel1', label: 'Artikel 1' }, { value: 'artikel2', label: 'Artikel 2' }], validation: { required: true } },
      { name: 'optimierungsgrund', label: 'Optimierungsgrund', type: 'text' as const, required: true, group: 'grund', validation: { required: true } },
      { name: 'prioritaet', label: 'Priorität', type: 'select' as const, required: true, group: 'priorität', options: [{ value: 'niedrig', label: 'Niedrig' }, { value: 'mittel', label: 'Mittel' }, { value: 'hoch', label: 'Hoch' }], validation: { required: true } },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'vorgeschlagen', label: 'Vorgeschlagen' }, { value: 'in_bearbeitung', label: 'In Bearbeitung' }, { value: 'umgesetzt', label: 'Umgesetzt' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getInventurFormFields(): FormField[] {
    return [
      { name: 'inventurnummer', label: 'Inventurnummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^INV-\d{6}$/ } },
      { name: 'lagerortId', label: 'Lagerort', type: 'select' as const, required: true, group: 'lager', options: [{ value: 'lagerort1', label: 'Lagerort 1' }, { value: 'lagerort2', label: 'Lagerort 2' }], validation: { required: true } },
      { name: 'inventurdatum', label: 'Inventurdatum', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'inventurart', label: 'Inventurart', type: 'select' as const, required: true, group: 'art', options: [{ value: 'voll', label: 'Voll' }, { value: 'stichprobe', label: 'Stichprobe' }, { value: 'zyklisch', label: 'Zyklisch' }], validation: { required: true } },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'geplant', label: 'Geplant' }, { value: 'laufend', label: 'Laufend' }, { value: 'abgeschlossen', label: 'Abgeschlossen' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getChargeFormFields(): FormField[] {
    return [
      { name: 'chargennummer', label: 'Chargennummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^CHA-\d{6}$/ } },
      { name: 'artikelId', label: 'Artikel', type: 'select' as const, required: true, group: 'artikel', options: [{ value: 'artikel1', label: 'Artikel 1' }, { value: 'artikel2', label: 'Artikel 2' }], validation: { required: true } },
      { name: 'varianteId', label: 'Variante', type: 'select' as const, group: 'artikel', options: [{ value: 'variante1', label: 'Variante 1' }, { value: 'variante2', label: 'Variante 2' }] },
      { name: 'herstellungsdatum', label: 'Herstellungsdatum', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'verfallsdatum', label: 'Verfallsdatum', type: 'date' as const, group: 'datum' },
      { name: 'hersteller', label: 'Hersteller', type: 'text' as const, group: 'hersteller' },
      { name: 'herstellernummer', label: 'Herstellernummer', type: 'text' as const, group: 'hersteller' },
      { name: 'qualitaetszertifikat', label: 'Qualitätszertifikat', type: 'text' as const, group: 'qualität' },
      { name: 'lagerortId', label: 'Lagerort', type: 'select' as const, required: true, group: 'lager', options: [{ value: 'lagerort1', label: 'Lagerort 1' }, { value: 'lagerort2', label: 'Lagerort 2' }], validation: { required: true } },
      { name: 'lagerplatzId', label: 'Lagerplatz', type: 'select' as const, group: 'lager', options: [{ value: 'lagerplatz1', label: 'Lagerplatz 1' }, { value: 'lagerplatz2', label: 'Lagerplatz 2' }] },
      { name: 'menge', label: 'Menge', type: 'number' as const, required: true, group: 'menge', validation: { required: true, min: 0.001 } },
      { name: 'einheit', label: 'Einheit', type: 'select' as const, required: true, group: 'menge', options: [{ value: 'stk', label: 'Stück' }, { value: 'kg', label: 'Kilogramm' }, { value: 'l', label: 'Liter' }], validation: { required: true } },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'aktiv', label: 'Aktiv' }, { value: 'gesperrt', label: 'Gesperrt' }, { value: 'verfallen', label: 'Verfallen' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getLieferantenavisierungFormFields(): FormField[] {
    return [
      { name: 'avisierungsnummer', label: 'Avisierungsnummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^AVI-\d{6}$/ } },
      { name: 'lieferantId', label: 'Lieferant', type: 'select' as const, required: true, group: 'lieferant', options: [{ value: 'lieferant1', label: 'Lieferant 1' }, { value: 'lieferant2', label: 'Lieferant 2' }], validation: { required: true } },
      { name: 'bestellungId', label: 'Bestellung', type: 'select' as const, group: 'bestellung', options: [{ value: 'bestellung1', label: 'Bestellung 1' }, { value: 'bestellung2', label: 'Bestellung 2' }] },
      { name: 'erwartetesLieferdatum', label: 'Erwartetes Lieferdatum', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'erwartet', label: 'Erwartet' }, { value: 'teilweise_angekommen', label: 'Teilweise angekommen' }, { value: 'vollstaendig', label: 'Vollständig' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getWareneingangspruefungFormFields(): FormField[] {
    return [
      { name: 'pruefungsnummer', label: 'Prüfungsnummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^PRU-\d{6}$/ } },
      { name: 'lieferungId', label: 'Lieferung', type: 'select' as const, required: true, group: 'lieferung', options: [{ value: 'lieferung1', label: 'Lieferung 1' }, { value: 'lieferung2', label: 'Lieferung 2' }], validation: { required: true } },
      { name: 'prueferId', label: 'Prüfer', type: 'select' as const, required: true, group: 'personal', options: [{ value: 'mitarbeiter1', label: 'Mitarbeiter 1' }, { value: 'mitarbeiter2', label: 'Mitarbeiter 2' }], validation: { required: true } },
      { name: 'pruefungsdatum', label: 'Prüfungsdatum', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'pruefungsart', label: 'Prüfungsart', type: 'select' as const, required: true, group: 'prüfung', options: [{ value: 'visuell', label: 'Visuell' }, { value: 'stichprobe', label: 'Stichprobe' }, { value: 'vollstaendig', label: 'Vollständig' }], validation: { required: true } },
      { name: 'ergebnis', label: 'Ergebnis', type: 'select' as const, required: true, group: 'ergebnis', options: [{ value: 'bestanden', label: 'Bestanden' }, { value: 'teilweise_bestanden', label: 'Teilweise bestanden' }, { value: 'durchgefallen', label: 'Durchgefallen' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getWareneingangsbuchungFormFields(): FormField[] {
    return [
      { name: 'buchungsnummer', label: 'Buchungsnummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^BUC-\d{6}$/ } },
      { name: 'lieferungId', label: 'Lieferung', type: 'select' as const, required: true, group: 'lieferung', options: [{ value: 'lieferung1', label: 'Lieferung 1' }, { value: 'lieferung2', label: 'Lieferung 2' }], validation: { required: true } },
      { name: 'buchungsdatum', label: 'Buchungsdatum', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'entwurf', label: 'Entwurf' }, { value: 'gebucht', label: 'Gebucht' }, { value: 'storniert', label: 'Storniert' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }

  private getReklamationFormFields(): FormField[] {
    return [
      { name: 'reklamationsnummer', label: 'Reklamationsnummer', type: 'text' as const, required: true, group: 'grunddaten', validation: { required: true, pattern: /^REK-\d{6}$/ } },
      { name: 'lieferungId', label: 'Lieferung', type: 'select' as const, required: true, group: 'lieferung', options: [{ value: 'lieferung1', label: 'Lieferung 1' }, { value: 'lieferung2', label: 'Lieferung 2' }], validation: { required: true } },
      { name: 'lieferantId', label: 'Lieferant', type: 'select' as const, required: true, group: 'lieferant', options: [{ value: 'lieferant1', label: 'Lieferant 1' }, { value: 'lieferant2', label: 'Lieferant 2' }], validation: { required: true } },
      { name: 'reklamationsdatum', label: 'Reklamationsdatum', type: 'date' as const, required: true, group: 'datum', validation: { required: true } },
      { name: 'reklamationsgrund', label: 'Reklamationsgrund', type: 'text' as const, required: true, group: 'grund', validation: { required: true } },
      { name: 'reklamationsart', label: 'Reklamationsart', type: 'select' as const, required: true, group: 'art', options: [{ value: 'qualitaet', label: 'Qualität' }, { value: 'menge', label: 'Menge' }, { value: 'lieferung', label: 'Lieferung' }, { value: 'preis', label: 'Preis' }], validation: { required: true } },
      { name: 'prioritaet', label: 'Priorität', type: 'select' as const, required: true, group: 'priorität', options: [{ value: 'niedrig', label: 'Niedrig' }, { value: 'mittel', label: 'Mittel' }, { value: 'hoch', label: 'Hoch' }, { value: 'kritisch', label: 'Kritisch' }], validation: { required: true } },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, group: 'status', options: [{ value: 'eingereicht', label: 'Eingereicht' }, { value: 'in_bearbeitung', label: 'In Bearbeitung' }, { value: 'geloest', label: 'Gelöst' }, { value: 'abgelehnt', label: 'Abgelehnt' }], validation: { required: true } },
      { name: 'notizen', label: 'Notizen', type: 'textarea' as const, group: 'zusätzlich' },
    ];
  }
}

// ============================================================================
// GLOBALE INSTANZ
// ============================================================================

export const formRegistryService = FormRegistryService.getInstance(); 