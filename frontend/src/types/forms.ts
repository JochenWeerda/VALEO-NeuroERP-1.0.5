/**
 * VALEO NeuroERP 2.0 - Zentrale Formular-Typen-Registrierung
 * Horizon Beta optimiert mit Versionsnummerierung und Rollenverwaltung
 * Serena Quality: Complete type safety with role-based permissions
 */

import { z } from 'zod';

// ============================================================================
// BASIS-TYPEN FÜR ALLE FORMULARE
// ============================================================================

export type FormID = string;
export type FormVersion = string; // Format: "1.0.0"
export type FormStatus = 'draft' | 'active' | 'deprecated' | 'archived';
export type FormPermission = 'read' | 'write' | 'admin' | 'delete';

export interface FormMetadata {
  id: FormID;
  name: string;
  module: string;
  version: FormVersion;
  status: FormStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  description: string;
  tags: string[];
  dependencies: string[];
  permissions: RolePermissions;
}

export interface RolePermissions {
  super_admin: FormPermission[];
  admin: FormPermission[];
  manager: FormPermission[];
  accountant: FormPermission[];
  warehouse: FormPermission[];
  sales: FormPermission[];
  viewer: FormPermission[];
}

export interface FormFieldOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  metadata?: Record<string, any>;
}

export interface FormFieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  async?: (value: any) => Promise<boolean | string>;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox' | 'barcode' | 'autocomplete' | 'file' | 'currency' | 'percentage';
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
  autoComplete?: boolean;
  barcodeScanner?: boolean;
  helpText?: string;
  icon?: React.ReactNode;
  group?: string;
  dependencies?: string[];
  conditional?: (values: any) => boolean;
  metadata?: Record<string, any>;
}

export interface FormConfig {
  id: FormID;
  metadata: FormMetadata;
  fields: FormField[];
  validationSchema: z.ZodSchema<any>;
  defaultValues: Record<string, any>;
  layout: 'vertical' | 'horizontal' | 'grid' | 'tabs' | FormLayout;
  size: 'small' | 'medium' | 'large';
  features: FormFeatures;
}

export interface FormFeatures {
  autoSave: boolean;
  autoSaveInterval: number;
  keyboardShortcuts: boolean;
  barcodeScanner: boolean;
  progressBar: boolean;
  conditionalFields: boolean;
  groupedFields: boolean;
  realTimeValidation: boolean;
  accessibility: boolean;
  mobileOptimized: boolean;
  offlineSupport: boolean;
  bulkOperations: boolean;
  printSupport: boolean;
  exportSupport: boolean;
}

// ============================================================================
// ERP-MODUL SPEZIFISCHE FORMULAR-TYPEN
// ============================================================================

// PERSONAL MODUL
export interface PersonalFormData {
  id?: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  hireDate: Date;
  salary?: number;
  managerId?: string;
  status: 'active' | 'inactive' | 'terminated';
  notes?: string;
}

export const PersonalFormSchema = z.object({
  employeeNumber: z.string().min(1, 'Mitarbeiternummer ist erforderlich'),
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen lang sein'),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().optional(),
  department: z.string().min(1, 'Abteilung ist erforderlich'),
  position: z.string().min(1, 'Position ist erforderlich'),
  hireDate: z.date(),
  salary: z.number().positive().optional(),
  managerId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'terminated']),
  notes: z.string().optional(),
});

// LAGER MODUL
export interface WarehouseFormData {
  id?: string;
  articleNumber: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  location: string;
  supplierId?: string;
  barcode?: string;
  expiryDate?: Date;
  status: 'active' | 'inactive' | 'discontinued';
}

export const WarehouseFormSchema = z.object({
  articleNumber: z.string().min(1, 'Artikelnummer ist erforderlich'),
  name: z.string().min(2, 'Artikelname muss mindestens 2 Zeichen lang sein'),
  description: z.string().optional(),
  category: z.string().min(1, 'Kategorie ist erforderlich'),
  unit: z.string().min(1, 'Einheit ist erforderlich'),
  purchasePrice: z.number().positive('Einkaufspreis muss positiv sein'),
  sellingPrice: z.number().positive('Verkaufspreis muss positiv sein'),
  stockQuantity: z.number().min(0, 'Lagerbestand kann nicht negativ sein'),
  minStockLevel: z.number().min(0, 'Mindestbestand kann nicht negativ sein'),
  maxStockLevel: z.number().min(0, 'Maximalbestand kann nicht negativ sein'),
  location: z.string().min(1, 'Lagerplatz ist erforderlich'),
  supplierId: z.string().optional(),
  barcode: z.string().optional(),
  expiryDate: z.date().optional(),
  status: z.enum(['active', 'inactive', 'discontinued']),
});

// CRM MODUL
export interface CustomerFormData {
  id?: string;
  customerNumber: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  customerType: 'private' | 'business' | 'wholesale';
  creditLimit?: number;
  paymentTerms: string;
  salesRepId?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'blocked';
}

export const CustomerFormSchema = z.object({
  customerNumber: z.string().min(1, 'Kundennummer ist erforderlich'),
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().optional(),
  address: z.string().min(10, 'Adresse muss mindestens 10 Zeichen lang sein'),
  postalCode: z.string().regex(/^\d{5}$/, 'PLZ muss 5 Ziffern haben'),
  city: z.string().min(2, 'Stadt muss mindestens 2 Zeichen lang sein'),
  country: z.string().min(2, 'Land ist erforderlich'),
  customerType: z.enum(['private', 'business', 'wholesale']),
  creditLimit: z.number().positive().optional(),
  paymentTerms: z.string().min(1, 'Zahlungsbedingungen sind erforderlich'),
  salesRepId: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'blocked']),
});

// FINANZEN MODUL
export interface InvoiceFormData {
  id?: string;
  invoiceNumber: string;
  customerId: string;
  invoiceDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  notes?: string;
}

export interface InvoiceItem {
  id?: string;
  articleId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export const InvoiceItemSchema = z.object({
  articleId: z.string().min(1, 'Artikel ist erforderlich'),
  description: z.string().min(1, 'Beschreibung ist erforderlich'),
  quantity: z.number().positive('Menge muss positiv sein'),
  unitPrice: z.number().positive('Einzelpreis muss positiv sein'),
  totalPrice: z.number().positive('Gesamtpreis muss positiv sein'),
});

export const InvoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, 'Rechnungsnummer ist erforderlich'),
  customerId: z.string().min(1, 'Kunde ist erforderlich'),
  invoiceDate: z.date(),
  dueDate: z.date(),
  items: z.array(InvoiceItemSchema).min(1, 'Mindestens ein Artikel ist erforderlich'),
  subtotal: z.number().positive('Zwischensumme muss positiv sein'),
  taxAmount: z.number().min(0, 'Steuerbetrag kann nicht negativ sein'),
  totalAmount: z.number().positive('Gesamtbetrag muss positiv sein'),
  paymentStatus: z.enum(['pending', 'paid', 'overdue', 'cancelled']),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

// LIEFERANTEN MODUL
export interface SupplierFormData {
  id?: string;
  supplierNumber: string;
  name: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  paymentTerms: string;
  creditLimit?: number;
  rating?: number;
  notes?: string;
  status: 'active' | 'inactive' | 'blocked';
}

export const SupplierFormSchema = z.object({
  supplierNumber: z.string().min(1, 'Lieferantennummer ist erforderlich'),
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  contactPerson: z.string().min(2, 'Ansprechpartner ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().optional(),
  address: z.string().min(10, 'Adresse muss mindestens 10 Zeichen lang sein'),
  postalCode: z.string().regex(/^\d{5}$/, 'PLZ muss 5 Ziffern haben'),
  city: z.string().min(2, 'Stadt muss mindestens 2 Zeichen lang sein'),
  country: z.string().min(2, 'Land ist erforderlich'),
  paymentTerms: z.string().min(1, 'Zahlungsbedingungen sind erforderlich'),
  creditLimit: z.number().positive().optional(),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'blocked']),
});

// BESTELLUNGEN MODUL
export interface OrderFormData {
  id?: string;
  orderNumber: string;
  customerId: string;
  orderDate: Date;
  deliveryDate?: Date;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'partial';
  notes?: string;
}

export interface OrderItem {
  id?: string;
  articleId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export const OrderItemSchema = z.object({
  articleId: z.string().min(1, 'Artikel ist erforderlich'),
  description: z.string().min(1, 'Beschreibung ist erforderlich'),
  quantity: z.number().positive('Menge muss positiv sein'),
  unitPrice: z.number().positive('Einzelpreis muss positiv sein'),
  totalPrice: z.number().positive('Gesamtpreis muss positiv sein'),
});

export const OrderFormSchema = z.object({
  orderNumber: z.string().min(1, 'Bestellnummer ist erforderlich'),
  customerId: z.string().min(1, 'Kunde ist erforderlich'),
  orderDate: z.date(),
  deliveryDate: z.date().optional(),
  items: z.array(OrderItemSchema).min(1, 'Mindestens ein Artikel ist erforderlich'),
  subtotal: z.number().positive('Zwischensumme muss positiv sein'),
  taxAmount: z.number().min(0, 'Steuerbetrag kann nicht negativ sein'),
  totalAmount: z.number().positive('Gesamtbetrag muss positiv sein'),
  status: z.enum(['draft', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  paymentStatus: z.enum(['pending', 'paid', 'partial']),
  notes: z.string().optional(),
});

// ============================================================================
// FORMULAR-REGISTRIERUNG UND VERSIONIERUNG
// ============================================================================

export interface FormRegistry {
  forms: Record<FormID, FormConfig>;
  versions: Record<FormID, FormVersion[]>;
  permissions: Record<FormID, RolePermissions>;
  metadata: Record<FormID, FormMetadata>;
}

export interface FormVersionHistory {
  formId: FormID;
  version: FormVersion;
  changes: string[];
  author: string;
  timestamp: Date;
  approvedBy?: string;
  status: 'draft' | 'approved' | 'rejected';
}

export interface FormChangeRequest {
  id: string;
  formId: FormID;
  requestedBy: string;
  requestedAt: Date;
  changes: FormChange[];
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  comments?: string;
}

export interface FormChange {
  field: string;
  type: 'add' | 'modify' | 'remove';
  oldValue?: any;
  newValue?: any;
  reason: string;
}

// ============================================================================
// GLOBALE FORMULAR-VARIABLEN
// ============================================================================

export const FORM_MODULES = {
  PERSONAL: 'personal',
  WAREHOUSE: 'warehouse',
  CRM: 'crm',
  FINANCE: 'finance',
  SUPPLIER: 'supplier',
  ORDER: 'order',
  REPORTING: 'reporting',
  SETTINGS: 'settings',
  PURCHASING: 'purchasing',
  SALES: 'sales',
} as const;

export const FORM_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  DEPRECATED: 'deprecated',
  ARCHIVED: 'archived',
} as const;

export const FORM_PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  ADMIN: 'admin',
  DELETE: 'delete',
} as const;

export const FORM_FEATURES = {
  AUTO_SAVE: 'autoSave',
  KEYBOARD_SHORTCUTS: 'keyboardShortcuts',
  BARCODE_SCANNER: 'barcodeScanner',
  PROGRESS_BAR: 'progressBar',
  CONDITIONAL_FIELDS: 'conditionalFields',
  GROUPED_FIELDS: 'groupedFields',
  REAL_TIME_VALIDATION: 'realTimeValidation',
  ACCESSIBILITY: 'accessibility',
  MOBILE_OPTIMIZED: 'mobileOptimized',
  OFFLINE_SUPPORT: 'offlineSupport',
  BULK_OPERATIONS: 'bulkOperations',
  PRINT_SUPPORT: 'printSupport',
  EXPORT_SUPPORT: 'exportSupport',
} as const;

// ============================================================================
// TYPE GUARDS UND VALIDIERUNGEN
// ============================================================================

export const isFormID = (value: any): value is FormID => {
  return typeof value === 'string' && value.length > 0;
};

export const isFormVersion = (value: any): value is FormVersion => {
  return typeof value === 'string' && /^\d+\.\d+\.\d+$/.test(value);
};

export const isFormStatus = (value: any): value is FormStatus => {
  return Object.values(FORM_STATUSES).includes(value);
};

export const isFormPermission = (value: any): value is FormPermission => {
  return Object.values(FORM_PERMISSIONS).includes(value);
};

// ============================================================================
// EXPORT ALLER TYPEN
// ============================================================================

// Alle Typen sind bereits oben definiert und werden automatisch exportiert

// ============================================================================
// WARENWIRTSCHAFT (WAWI) - FORMULAR-DATENTYPEN
// ============================================================================

// Artikelstammdaten verwalten
export interface ArtikelstammdatenFormData {
  id?: string;
  artikelnummer: string;
  bezeichnung: string;
  kurzbeschreibung?: string;
  langbeschreibung?: string;
  kategorie: string;
  unterkategorie?: string;
  einheit: string;
  gewicht?: number;
  volumen?: number;
  ean?: string;
  hersteller?: string;
  herstellernummer?: string;
  status: 'aktiv' | 'inaktiv' | 'gesperrt';
  preisgruppe: string;
  steuersatz: number;
  mindestbestand: number;
  optimalbestand: number;
  maxbestand: number;
  lagerort?: string;
  bild?: string;
  dokumente?: string[];
  notizen?: string;
}

export interface ArtikelklassifizierungFormData {
  id?: string;
  artikelId: string;
  hauptkategorie: string;
  unterkategorie: string;
  produktgruppe: string;
  produktfamilie: string;
  eigenschaften: Record<string, any>;
  tags: string[];
  bewertung: number;
  prioritaet: 'niedrig' | 'mittel' | 'hoch';
  freigabestatus: 'entwurf' | 'freigegeben' | 'gesperrt';
}

export interface ArtikelvarianteFormData {
  id?: string;
  artikelId: string;
  variantenname: string;
  variantencode: string;
  eigenschaften: Record<string, any>;
  preisaufschlag?: number;
  gewicht?: number;
  volumen?: number;
  lagerbestand: number;
  status: 'aktiv' | 'inaktiv';
}

export interface StuecklisteFormData {
  id?: string;
  stuecklistennummer: string;
  bezeichnung: string;
  version: string;
  gueltigAb: Date;
  gueltigBis?: Date;
  positionen: StuecklistenPosition[];
  status: 'entwurf' | 'freigegeben' | 'archiviert';
  notizen?: string;
}

export interface StuecklistenPosition {
  id?: string;
  artikelId: string;
  menge: number;
  einheit: string;
  position: number;
  notizen?: string;
}

// Lagerverwaltung
export interface EinlagerungFormData {
  id?: string;
  bewegungsnummer: string;
  artikelId: string;
  varianteId?: string;
  menge: number;
  einheit: string;
  lagerortId: string;
  lagerplatzId?: string;
  chargeId?: string;
  seriennummer?: string;
  lieferantId?: string;
  bestellungId?: string;
  einlagerungsdatum: Date;
  qualitaetspruefung: boolean;
  notizen?: string;
}

export interface AuslagerungFormData {
  id?: string;
  bewegungsnummer: string;
  artikelId: string;
  varianteId?: string;
  menge: number;
  einheit: string;
  lagerortId: string;
  lagerplatzId?: string;
  chargeId?: string;
  seriennummer?: string;
  kundeId?: string;
  auftragId?: string;
  auslagerungsdatum: Date;
  kommissioniererId?: string;
  notizen?: string;
}

export interface LagerplatzOptimierungFormData {
  id?: string;
  lagerortId: string;
  lagerplatzId: string;
  artikelId: string;
  optimierungsgrund: string;
  vorgeschlageneAenderungen: Record<string, any>;
  prioritaet: 'niedrig' | 'mittel' | 'hoch';
  status: 'vorgeschlagen' | 'in_bearbeitung' | 'umgesetzt';
  notizen?: string;
}

export interface InventurFormData {
  id?: string;
  inventurnummer: string;
  lagerortId: string;
  inventurdatum: Date;
  inventurart: 'voll' | 'stichprobe' | 'zyklisch';
  status: 'geplant' | 'laufend' | 'abgeschlossen';
  positionen: InventurPosition[];
  notizen?: string;
}

export interface InventurPosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  lagerplatzId?: string;
  chargeId?: string;
  seriennummer?: string;
  buchbestand: number;
  istbestand: number;
  differenz: number;
  bemerkungen?: string;
}

export interface ChargeFormData {
  id?: string;
  chargennummer: string;
  artikelId: string;
  varianteId?: string;
  herstellungsdatum: Date;
  verfallsdatum?: Date;
  hersteller?: string;
  herstellernummer?: string;
  qualitaetszertifikat?: string;
  lagerortId: string;
  lagerplatzId?: string;
  menge: number;
  einheit: string;
  status: 'aktiv' | 'gesperrt' | 'verfallen';
  notizen?: string;
}

// Wareneingang
export interface LieferantenavisierungFormData {
  id?: string;
  avisierungsnummer: string;
  lieferantId: string;
  bestellungId?: string;
  erwartetesLieferdatum: Date;
  positionen: AvisierungPosition[];
  status: 'erwartet' | 'teilweise_angekommen' | 'vollstaendig';
  notizen?: string;
}

export interface AvisierungPosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  erwarteteMenge: number;
  einheit: string;
  lieferantenartikelnummer?: string;
}

export interface WareneingangspruefungFormData {
  id?: string;
  pruefungsnummer: string;
  lieferungId: string;
  prueferId: string;
  pruefungsdatum: Date;
  pruefungsart: 'visuell' | 'stichprobe' | 'vollstaendig';
  ergebnis: 'bestanden' | 'teilweise_bestanden' | 'durchgefallen';
  positionen: PruefungPosition[];
  notizen?: string;
}

export interface PruefungPosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  chargeId?: string;
  seriennummer?: string;
  gepruefteMenge: number;
  einheit: string;
  qualitaet: 'gut' | 'mangelhaft' | 'unbrauchbar';
  bemerkungen?: string;
}

export interface WareneingangsbuchungFormData {
  id?: string;
  buchungsnummer: string;
  lieferungId: string;
  buchungsdatum: Date;
  positionen: BuchungPosition[];
  status: 'entwurf' | 'gebucht' | 'storniert';
  notizen?: string;
}

export interface BuchungPosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  chargeId?: string;
  seriennummer?: string;
  menge: number;
  einheit: string;
  einstandspreis: number;
  lagerortId: string;
  lagerplatzId?: string;
}

export interface ReklamationFormData {
  id?: string;
  reklamationsnummer: string;
  lieferungId: string;
  lieferantId: string;
  reklamationsdatum: Date;
  reklamationsgrund: string;
  reklamationsart: 'qualitaet' | 'menge' | 'lieferung' | 'preis';
  prioritaet: 'niedrig' | 'mittel' | 'hoch' | 'kritisch';
  status: 'eingereicht' | 'in_bearbeitung' | 'geloest' | 'abgelehnt';
  positionen: ReklamationPosition[];
  notizen?: string;
}

export interface ReklamationPosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  chargeId?: string;
  seriennummer?: string;
  reklamierteMenge: number;
  einheit: string;
  grund: string;
  bemerkungen?: string;
}

// Bestellwesen
export interface BedarfsermittlungFormData {
  id?: string;
  ermittlungsnummer: string;
  artikelId: string;
  varianteId?: string;
  periode: string;
  verbrauchsmenge: number;
  einheit: string;
  verbrauchsart: 'verbrauch' | 'verkauf' | 'produktion';
  bedarfsmenge: number;
  sicherheitsbestand: number;
  bestellpunkt: number;
  empfohleneBestellmenge: number;
  lieferantId?: string;
  lieferzeit: number;
  notizen?: string;
}

export interface AnfrageFormData {
  id?: string;
  anfragenummer: string;
  lieferantId: string;
  anfragedatum: Date;
  gueltigBis: Date;
  positionen: AnfragePosition[];
  status: 'entwurf' | 'versendet' | 'beantwortet' | 'abgeschlossen';
  notizen?: string;
}

export interface AnfragePosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  menge: number;
  einheit: string;
  gewuenschterLiefertermin?: Date;
  spezifikationen?: string;
}

export interface BestellungFormData {
  id?: string;
  bestellnummer: string;
  lieferantId: string;
  bestelldatum: Date;
  erwartetesLieferdatum: Date;
  positionen: BestellPosition[];
  gesamtbetrag: number;
  waehrung: string;
  zahlungsbedingungen: string;
  lieferbedingungen: string;
  status: 'entwurf' | 'versendet' | 'bestaetigt' | 'teilweise_geliefert' | 'vollstaendig_geliefert';
  notizen?: string;
}

export interface BestellPosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
  lieferantenartikelnummer?: string;
  spezifikationen?: string;
}

export interface AuftragsbestaetigungFormData {
  id?: string;
  bestaetigungsnummer: string;
  bestellungId: string;
  lieferantId: string;
  bestaetigungsdatum: Date;
  bestaetigterLiefertermin: Date;
  positionen: BestaetigungPosition[];
  status: 'bestaetigt' | 'teilweise_bestaetigt' | 'abgelehnt';
  notizen?: string;
}

export interface BestaetigungPosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  bestellteMenge: number;
  bestaetigteMenge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
  liefertermin: Date;
  bemerkungen?: string;
}

// Warenausgang/Kommissionierung
export interface AuftragsbearbeitungFormData {
  id?: string;
  auftragsnummer: string;
  kundeId: string;
  auftragsdatum: Date;
  gewuenschterLiefertermin: Date;
  bestaetigterLiefertermin?: Date;
  positionen: AuftragsPosition[];
  gesamtbetrag: number;
  waehrung: string;
  status: 'eingegangen' | 'bestaetigt' | 'in_bearbeitung' | 'kommissioniert' | 'versandbereit' | 'versendet';
  prioritaet: 'niedrig' | 'normal' | 'hoch' | 'dringend';
  notizen?: string;
}

export interface AuftragsPosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
  verfuegbarkeit: 'verfuegbar' | 'teilweise_verfuegbar' | 'nicht_verfuegbar';
  kommissioniert: boolean;
  kommissionierteMenge: number;
}

export interface PacklisteFormData {
  id?: string;
  packlistennummer: string;
  auftragId: string;
  kundeId: string;
  packdatum: Date;
  packerId: string;
  positionen: PacklistenPosition[];
  gesamtgewicht?: number;
  gesamtvolumen?: number;
  anzahlPackstuecke: number;
  status: 'in_bearbeitung' | 'abgeschlossen';
  notizen?: string;
}

export interface PacklistenPosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  menge: number;
  einheit: string;
  packstueck: number;
  gewicht?: number;
  volumen?: number;
  chargeId?: string;
  seriennummer?: string;
}

export interface VersandetikettierungFormData {
  id?: string;
  etikettennummer: string;
  packlisteId: string;
  auftragId: string;
  kundeId: string;
  versandart: string;
  versanddienstleister: string;
  trackingnummer?: string;
  etikettenDaten: Record<string, any>;
  status: 'erstellt' | 'gedruckt' | 'versendet';
  notizen?: string;
}

export interface LogistikUebergabeFormData {
  id?: string;
  uebergabenummer: string;
  packlisteId: string;
  auftragId: string;
  uebergabedatum: Date;
  uebergeberId: string;
  empfaengerId: string;
  versanddienstleister: string;
  trackingnummer?: string;
  status: 'uebergeben' | 'in_transport' | 'zugestellt';
  notizen?: string;
}

// Produktion/Rezepturverwaltung
export interface MaterialbedarfsermittlungFormData {
  id?: string;
  ermittlungsnummer: string;
  produktionsauftragId: string;
  stuecklisteId: string;
  ermittlungsdatum: Date;
  positionen: MaterialbedarfPosition[];
  status: 'berechnet' | 'verfuegbarkeit_geprueft' | 'bestellung_erstellt';
  notizen?: string;
}

export interface MaterialbedarfPosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  benoetigteMenge: number;
  einheit: string;
  verfuegbareMenge: number;
  fehlendeMenge: number;
  bestellvorschlag: number;
  lieferantId?: string;
  liefertermin?: Date;
}

export interface RueckverfolgungFormData {
  id?: string;
  rueckverfolgungsnummer: string;
  artikelId: string;
  varianteId?: string;
  chargeId?: string;
  seriennummer?: string;
  herstellungsdatum: Date;
  hersteller?: string;
  lieferantId?: string;
  kundeId?: string;
  auftragId?: string;
  rueckverfolgungskette: Rueckverfolgungsschritt[];
  status: 'vollstaendig' | 'teilweise' | 'unvollstaendig';
  notizen?: string;
}

export interface Rueckverfolgungsschritt {
  id?: string;
  schrittnummer: number;
  schritttyp: string;
  datum: Date;
  beteiligter: string;
  dokumente?: string[];
  bemerkungen?: string;
}

export interface ProduktionsauftragFormData {
  id?: string;
  auftragsnummer: string;
  produktId: string;
  stuecklisteId: string;
  menge: number;
  einheit: string;
  startdatum: Date;
  enddatum: Date;
  status: 'geplant' | 'laufend' | 'abgeschlossen' | 'storniert';
  prioritaet: 'niedrig' | 'normal' | 'hoch' | 'dringend';
  werkstattId?: string;
  maschinenId?: string[];
  mitarbeiterId?: string[];
  notizen?: string;
}

export interface RueckmeldungFormData {
  id?: string;
  rueckmeldungsnummer: string;
  produktionsauftragId: string;
  rueckmeldungsdatum: Date;
  mitarbeiterId: string;
  positionen: RueckmeldungPosition[];
  status: 'teilrueckmeldung' | 'vollstaendig';
  notizen?: string;
}

export interface RueckmeldungPosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  geplanteMenge: number;
  hergestellteMenge: number;
  einheit: string;
  qualitaet: 'gut' | 'mangelhaft' | 'aussortiert';
  bemerkungen?: string;
}

// Lieferantenbewertung
export interface LieferantenbewertungFormData {
  id?: string;
  bewertungsnummer: string;
  lieferantId: string;
  bewertungszeitraum: string;
  bewertungsdatum: Date;
  bewertungskriterien: Bewertungskriterium[];
  gesamtbewertung: number;
  status: 'erstellt' | 'freigegeben' | 'archiviert';
  notizen?: string;
}

export interface Bewertungskriterium {
  id?: string;
  kriterium: string;
  gewichtung: number;
  bewertung: number;
  kommentar?: string;
}

// Retouren/Reklamationen
export interface KundenruecklaeuferFormData {
  id?: string;
  ruecklaeufernummer: string;
  kundeId: string;
  auftragId?: string;
  rechnungId?: string;
  ruecklaeuferdatum: Date;
  grund: string;
  ruecklaeuferart: 'reklamation' | 'garantie' | 'kundenservice' | 'sonstiges';
  prioritaet: 'niedrig' | 'mittel' | 'hoch' | 'kritisch';
  status: 'eingegangen' | 'in_bearbeitung' | 'geloest' | 'abgelehnt';
  positionen: RuecklaeuferPosition[];
  notizen?: string;
}

export interface RuecklaeuferPosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  chargeId?: string;
  seriennummer?: string;
  ruecklaeuferMenge: number;
  einheit: string;
  grund: string;
  bemerkungen?: string;
}

export interface GutschriftFormData {
  id?: string;
  gutschriftsnummer: string;
  ruecklaeuferId?: string;
  rechnungId?: string;
  kundeId: string;
  gutschriftsdatum: Date;
  positionen: GutschriftPosition[];
  gesamtbetrag: number;
  waehrung: string;
  status: 'entwurf' | 'freigegeben' | 'versendet' | 'verbucht';
  notizen?: string;
}

export interface GutschriftPosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
  grund: string;
}

export interface UrsachenanalyseFormData {
  id?: string;
  analysenummer: string;
  ruecklaeuferId: string;
  analysendatum: Date;
  analysentyp: 'qualitaet' | 'lieferung' | 'kommunikation' | 'system';
  ursache: string;
  massnahmen: string[];
  verantwortlicherId: string;
  deadline: Date;
  status: 'in_bearbeitung' | 'abgeschlossen' | 'ueberfaellig';
  notizen?: string;
}

// Verpackung/Gefahrgut
export interface VerpackungsvorschriftenFormData {
  id?: string;
  vorschriftennummer: string;
  artikelId: string;
  varianteId?: string;
  verpackungsart: string;
  verpackungsmaterial: string[];
  verpackungsgroesse: string;
  gewicht: number;
  volumen: number;
  gefahrgutklasse?: string;
  unNummer?: string;
  adrKonform: boolean;
  vorschriften: string[];
  status: 'entwurf' | 'freigegeben' | 'archiviert';
  notizen?: string;
}

export interface EtikettenFormData {
  id?: string;
  etikettennummer: string;
  artikelId: string;
  varianteId?: string;
  etikettentyp: string;
  etikettendaten: Record<string, any>;
  druckformat: string;
  druckerId?: string;
  status: 'entwurf' | 'gedruckt' | 'archiviert';
  notizen?: string;
}

export interface UNNummernFormData {
  id?: string;
  unNummer: string;
  bezeichnung: string;
  gefahrgutklasse: string;
  verpackungsgruppe: string;
  gefahrenzeichen: string[];
  verpackungsvorschriften: string[];
  transportvorschriften: string[];
  lagerungsvorschriften: string[];
  status: 'aktiv' | 'inaktiv';
  notizen?: string;
}

export interface ADRKonformitaetFormData {
  id?: string;
  konformitaetsnummer: string;
  artikelId: string;
  varianteId?: string;
  adrKlasse: string;
  verpackungsgruppe: string;
  unNummer: string;
  gefahrenzeichen: string[];
  konformitaetspruefung: boolean;
  zertifikat?: string;
  gueltigBis?: Date;
  status: 'konform' | 'nicht_konform' | 'in_pruefung';
  notizen?: string;
}

// Inventur & Umlagerung
export interface InventurerfassungFormData {
  id?: string;
  erfassungsnummer: string;
  inventurId: string;
  lagerortId: string;
  erfasserId: string;
  erfassungsdatum: Date;
  erfassungsart: 'manuell' | 'barcode' | 'rfid';
  positionen: ErfassungPosition[];
  status: 'laufend' | 'abgeschlossen';
  notizen?: string;
}

export interface ErfassungPosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  lagerplatzId?: string;
  chargeId?: string;
  seriennummer?: string;
  istbestand: number;
  einheit: string;
  bemerkungen?: string;
}

export interface DifferenzkontrolleFormData {
  id?: string;
  kontrollnummer: string;
  inventurId: string;
  kontrolleurId: string;
  kontrolldatum: Date;
  positionen: DifferenzPosition[];
  gesamtDifferenz: number;
  status: 'in_bearbeitung' | 'abgeschlossen';
  notizen?: string;
}

export interface DifferenzPosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  lagerplatzId?: string;
  chargeId?: string;
  seriennummer?: string;
  buchbestand: number;
  istbestand: number;
  differenz: number;
  differenzgrund?: string;
  bemerkungen?: string;
}

export interface UmlagerungFormData {
  id?: string;
  umlagerungsnummer: string;
  artikelId: string;
  varianteId?: string;
  chargeId?: string;
  seriennummer?: string;
  menge: number;
  einheit: string;
  vonLagerortId: string;
  vonLagerplatzId?: string;
  nachLagerortId: string;
  nachLagerplatzId?: string;
  umlagerungsdatum: Date;
  umlagererId: string;
  grund: string;
  status: 'geplant' | 'in_bearbeitung' | 'abgeschlossen' | 'storniert';
  notizen?: string;
}

// Preis- & Rabattverwaltung
export interface PreislistenFormData {
  id?: string;
  preislistennummer: string;
  bezeichnung: string;
  gueltigAb: Date;
  gueltigBis?: Date;
  waehrung: string;
  kundengruppe?: string;
  positionen: PreislistenPosition[];
  status: 'entwurf' | 'freigegeben' | 'archiviert';
  notizen?: string;
}

export interface PreislistenPosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  einzelpreis: number;
  waehrung: string;
  rabatt?: number;
  mindestmenge?: number;
  bemerkungen?: string;
}

export interface AktionenFormData {
  id?: string;
  aktionsnummer: string;
  bezeichnung: string;
  aktionstyp: 'rabatt' | 'mengenrabatt' | 'gratisartikel' | 'preisreduktion';
  gueltigAb: Date;
  gueltigBis: Date;
  kundengruppe?: string;
  artikelgruppe?: string;
  positionen: AktionsPosition[];
  status: 'geplant' | 'aktiv' | 'beendet' | 'storniert';
  notizen?: string;
}

export interface AktionsPosition {
  id?: string;
  artikelId: string;
  varianteId?: string;
  rabattProzent?: number;
  rabattBetrag?: number;
  gratisMenge?: number;
  mindestmenge?: number;
  bemerkungen?: string;
}

export interface StaffelpreiseFormData {
  id?: string;
  staffelpreisnummer: string;
  artikelId: string;
  varianteId?: string;
  staffeln: StaffelpreisStaffel[];
  gueltigAb: Date;
  gueltigBis?: Date;
  status: 'aktiv' | 'inaktiv';
  notizen?: string;
}

export interface StaffelpreisStaffel {
  id?: string;
  vonMenge: number;
  bisMenge?: number;
  einheit: string;
  einzelpreis: number;
  waehrung: string;
  rabatt?: number;
}

export interface RabattsystemeFormData {
  id?: string;
  rabattsystemnummer: string;
  bezeichnung: string;
  rabattsystemtyp: 'kundengruppe' | 'mengenrabatt' | 'treuerabatt' | 'saisonrabatt';
  gueltigAb: Date;
  gueltigBis?: Date;
  regeln: Rabattregel[];
  status: 'aktiv' | 'inaktiv';
  notizen?: string;
}

export interface Rabattregel {
  id?: string;
  regeltyp: string;
  bedingung: string;
  rabattProzent: number;
  rabattBetrag?: number;
  mindestmenge?: number;
  bemerkungen?: string;
}

// ============================================================================
// ZOD-SCHEMAS FÜR WARENWIRTSCHAFT
// ============================================================================

export const ArtikelstammdatenSchema = z.object({
  artikelnummer: z.string().min(1, 'Artikelnummer ist erforderlich'),
  bezeichnung: z.string().min(1, 'Bezeichnung ist erforderlich'),
  kurzbeschreibung: z.string().optional(),
  langbeschreibung: z.string().optional(),
  kategorie: z.string().min(1, 'Kategorie ist erforderlich'),
  unterkategorie: z.string().optional(),
  einheit: z.string().min(1, 'Einheit ist erforderlich'),
  gewicht: z.number().min(0).optional(),
  volumen: z.number().min(0).optional(),
  ean: z.string().optional(),
  hersteller: z.string().optional(),
  herstellernummer: z.string().optional(),
  status: z.enum(['aktiv', 'inaktiv', 'gesperrt']),
  preisgruppe: z.string().min(1, 'Preisgruppe ist erforderlich'),
  steuersatz: z.number().min(0).max(100),
  mindestbestand: z.number().min(0),
  optimalbestand: z.number().min(0),
  maxbestand: z.number().min(0),
  lagerort: z.string().optional(),
  bild: z.string().optional(),
  dokumente: z.string().optional(),
  notizen: z.string().optional(),
});

export const ArtikelklassifizierungSchema = z.object({
  artikelId: z.string().min(1, 'Artikel-ID ist erforderlich'),
  hauptkategorie: z.string().min(1, 'Hauptkategorie ist erforderlich'),
  unterkategorie: z.string().min(1, 'Unterkategorie ist erforderlich'),
  produktgruppe: z.string().min(1, 'Produktgruppe ist erforderlich'),
  produktfamilie: z.string().min(1, 'Produktfamilie ist erforderlich'),
  bewertung: z.number().min(1).max(5),
  prioritaet: z.enum(['niedrig', 'mittel', 'hoch']),
  freigabestatus: z.enum(['entwurf', 'freigegeben', 'gesperrt']),
});

export const ArtikelvarianteSchema = z.object({
  artikelId: z.string().min(1, 'Artikel-ID ist erforderlich'),
  variantenname: z.string().min(1, 'Variantenname ist erforderlich'),
  variantencode: z.string().min(1, 'Variantencode ist erforderlich'),
  preisaufschlag: z.number().min(0).optional(),
  gewicht: z.number().min(0).optional(),
  volumen: z.number().min(0).optional(),
  lagerbestand: z.number().min(0),
  status: z.enum(['aktiv', 'inaktiv']),
});

export const StuecklisteSchema = z.object({
  stuecklistennummer: z.string().min(1, 'Stücklistennummer ist erforderlich'),
  bezeichnung: z.string().min(1, 'Bezeichnung ist erforderlich'),
  version: z.string().min(1, 'Version ist erforderlich'),
  gueltigAb: z.date(),
  gueltigBis: z.date().optional(),
  status: z.enum(['entwurf', 'freigegeben', 'archiviert']),
  notizen: z.string().optional(),
});

export const EinlagerungSchema = z.object({
  bewegungsnummer: z.string().min(1, 'Bewegungsnummer ist erforderlich'),
  artikelId: z.string().min(1, 'Artikel-ID ist erforderlich'),
  varianteId: z.string().optional(),
  menge: z.number().min(0.001, 'Menge muss größer als 0 sein'),
  einheit: z.string().min(1, 'Einheit ist erforderlich'),
  lagerortId: z.string().min(1, 'Lagerort-ID ist erforderlich'),
  lagerplatzId: z.string().optional(),
  chargeId: z.string().optional(),
  seriennummer: z.string().optional(),
  lieferantId: z.string().optional(),
  bestellungId: z.string().optional(),
  einlagerungsdatum: z.date(),
  qualitaetspruefung: z.boolean(),
  notizen: z.string().optional(),
});

export const AuslagerungSchema = z.object({
  bewegungsnummer: z.string().min(1, 'Bewegungsnummer ist erforderlich'),
  artikelId: z.string().min(1, 'Artikel-ID ist erforderlich'),
  varianteId: z.string().optional(),
  menge: z.number().min(0.001, 'Menge muss größer als 0 sein'),
  einheit: z.string().min(1, 'Einheit ist erforderlich'),
  lagerortId: z.string().min(1, 'Lagerort-ID ist erforderlich'),
  lagerplatzId: z.string().optional(),
  chargeId: z.string().optional(),
  seriennummer: z.string().optional(),
  kundeId: z.string().optional(),
  auftragId: z.string().optional(),
  auslagerungsdatum: z.date(),
  kommissioniererId: z.string().optional(),
  notizen: z.string().optional(),
});

export const LagerplatzOptimierungSchema = z.object({
  lagerortId: z.string().min(1, 'Lagerort-ID ist erforderlich'),
  lagerplatzId: z.string().min(1, 'Lagerplatz-ID ist erforderlich'),
  artikelId: z.string().min(1, 'Artikel-ID ist erforderlich'),
  optimierungsgrund: z.string().min(1, 'Optimierungsgrund ist erforderlich'),
  prioritaet: z.enum(['niedrig', 'mittel', 'hoch']),
  status: z.enum(['vorgeschlagen', 'in_bearbeitung', 'umgesetzt']),
  notizen: z.string().optional(),
});

export const InventurSchema = z.object({
  inventurnummer: z.string().min(1, 'Inventurnummer ist erforderlich'),
  lagerortId: z.string().min(1, 'Lagerort-ID ist erforderlich'),
  inventurdatum: z.date(),
  inventurart: z.enum(['voll', 'stichprobe', 'zyklisch']),
  status: z.enum(['geplant', 'laufend', 'abgeschlossen']),
  notizen: z.string().optional(),
});

export const ChargeSchema = z.object({
  chargennummer: z.string().min(1, 'Chargennummer ist erforderlich'),
  artikelId: z.string().min(1, 'Artikel-ID ist erforderlich'),
  varianteId: z.string().optional(),
  herstellungsdatum: z.date(),
  verfallsdatum: z.date().optional(),
  hersteller: z.string().optional(),
  herstellernummer: z.string().optional(),
  qualitaetszertifikat: z.string().optional(),
  lagerortId: z.string().min(1, 'Lagerort-ID ist erforderlich'),
  lagerplatzId: z.string().optional(),
  menge: z.number().min(0.001, 'Menge muss größer als 0 sein'),
  einheit: z.string().min(1, 'Einheit ist erforderlich'),
  status: z.enum(['aktiv', 'gesperrt', 'verfallen']),
  notizen: z.string().optional(),
});

export const LieferantenavisierungSchema = z.object({
  avisierungsnummer: z.string().min(1, 'Avisierungsnummer ist erforderlich'),
  lieferantId: z.string().min(1, 'Lieferant-ID ist erforderlich'),
  bestellungId: z.string().optional(),
  erwartetesLieferdatum: z.date(),
  status: z.enum(['erwartet', 'teilweise_angekommen', 'vollstaendig']),
  notizen: z.string().optional(),
});

export const WareneingangspruefungSchema = z.object({
  pruefungsnummer: z.string().min(1, 'Prüfungsnummer ist erforderlich'),
  lieferungId: z.string().min(1, 'Lieferung-ID ist erforderlich'),
  prueferId: z.string().min(1, 'Prüfer-ID ist erforderlich'),
  pruefungsdatum: z.date(),
  pruefungsart: z.enum(['visuell', 'stichprobe', 'vollstaendig']),
  ergebnis: z.enum(['bestanden', 'teilweise_bestanden', 'durchgefallen']),
  notizen: z.string().optional(),
});

export const WareneingangsbuchungSchema = z.object({
  buchungsnummer: z.string().min(1, 'Buchungsnummer ist erforderlich'),
  lieferungId: z.string().min(1, 'Lieferung-ID ist erforderlich'),
  buchungsdatum: z.date(),
  status: z.enum(['entwurf', 'gebucht', 'storniert']),
  notizen: z.string().optional(),
});

export const ReklamationSchema = z.object({
  reklamationsnummer: z.string().min(1, 'Reklamationsnummer ist erforderlich'),
  lieferungId: z.string().min(1, 'Lieferung-ID ist erforderlich'),
  lieferantId: z.string().min(1, 'Lieferant-ID ist erforderlich'),
  reklamationsdatum: z.date(),
  reklamationsgrund: z.string().min(1, 'Reklamationsgrund ist erforderlich'),
  reklamationsart: z.enum(['qualitaet', 'menge', 'lieferung', 'preis']),
  prioritaet: z.enum(['niedrig', 'mittel', 'hoch', 'kritisch']),
  status: z.enum(['eingereicht', 'in_bearbeitung', 'geloest', 'abgelehnt']),
  notizen: z.string().optional(),
});

// ============================================================================
// EINHEITLICHE FORMULAR-STRUKTUREN
// ============================================================================

export interface FormTab {
  id: string;
  label: string;
  title?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  fields: string[]; // Array der Feld-Namen in diesem Tab
  validation?: boolean;
  completed?: boolean;
}

export interface FormTimeline {
  steps: TimelineStep[];
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
}

export interface TimelineStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  icon?: React.ReactNode;
  validation?: boolean;
  required?: boolean;
  timestamp?: Date;
}

export interface Belegfolge {
  belegnummer: string;
  belegtyp: string;
  status: 'entwurf' | 'freigegeben' | 'gebucht' | 'storniert';
  erstelltAm: Date;
  erstelltVon: string;
  freigegebenAm?: Date;
  freigegebenVon?: string;
  gebuchtAm?: Date;
  gebuchtVon?: string;
  storniertAm?: Date;
  storniertVon?: string;
  workflow: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  role: string;
  action: string;
  timestamp?: Date;
  user?: string;
  comments?: string;
}

export interface FormLayout {
  type: 'tabs' | 'wizard' | 'accordion' | 'single' | 'standard';
  tabs?: FormTab[];
  timeline?: FormTimeline;
  belegfolge?: Belegfolge;
  navigation: {
    showProgress: boolean;
    showTimeline: boolean;
    showBreadcrumbs: boolean;
    allowSkip: boolean;
    allowBack: boolean;
  };
  validation: {
    realTime: boolean;
    onTabChange: boolean;
    onStepChange: boolean;
    showErrors: boolean;
    mode?: 'onChange' | 'onBlur' | 'onSubmit';
  };
  autoSave: {
    enabled: boolean;
    interval: number;
    showIndicator: boolean;
  };
}

// Erweiterte FormConfig mit einheitlicher Struktur
export interface StandardizedFormConfig extends FormConfig {
  layout: FormLayout;
  module: string;
  title?: string;
  description?: string;
  tabs?: FormTab[];
  security?: any;
  mcpSecurity?: any;
  workflow?: {
    steps: WorkflowStep[];
    currentStep: number;
    canEdit: boolean;
    canApprove: boolean;
    canReject: boolean;
  };
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canApprove: boolean;
    canReject: boolean;
    canView: boolean;
  };
}

// ============================================================================
// STANDARD-TAB-STRUKTUREN FÜR VERSCHIEDENE MODULE
// ============================================================================

export const STANDARD_WAWI_TABS: FormTab[] = [
  {
    id: 'grunddaten',
    label: 'Grunddaten',
    required: true,
    fields: ['artikelnummer', 'bezeichnung', 'kategorie', 'einheit', 'status']
  },
  {
    id: 'klassifizierung',
    label: 'Klassifizierung',
    fields: ['hauptkategorie', 'unterkategorie', 'produktgruppe', 'tags', 'bewertung']
  },
  {
    id: 'lagerdaten',
    label: 'Lagerdaten',
    fields: ['lagerort', 'mindestbestand', 'optimalbestand', 'maxbestand', 'lagerplatz']
  },
  {
    id: 'preise',
    label: 'Preise & Rabatte',
    fields: ['preisgruppe', 'steuersatz', 'einstandspreis', 'verkaufspreis', 'rabatte']
  },
  {
    id: 'lieferanten',
    label: 'Lieferanten',
    fields: ['lieferantId', 'lieferantenartikelnummer', 'lieferzeit', 'mindestbestellmenge']
  },
  {
    id: 'dokumente',
    label: 'Dokumente',
    fields: ['bild', 'dokumente', 'zertifikate', 'notizen']
  }
];

export const STANDARD_FIBU_TABS: FormTab[] = [
  {
    id: 'grunddaten',
    label: 'Grunddaten',
    required: true,
    fields: ['belegnummer', 'belegdatum', 'betrag', 'waehrung', 'status']
  },
  {
    id: 'buchung',
    label: 'Buchung',
    fields: ['sollkonto', 'habenkonto', 'buchungstext', 'steuerbetrag', 'steuersatz']
  },
  {
    id: 'referenzen',
    label: 'Referenzen',
    fields: ['referenzTyp', 'referenzId', 'belegId', 'kostenstelle', 'kostentraeger']
  },
  {
    id: 'workflow',
    label: 'Workflow',
    fields: ['freigabe', 'genehmigung', 'buchung', 'storno']
  }
];

export const STANDARD_CRM_TABS: FormTab[] = [
  {
    id: 'grunddaten',
    label: 'Grunddaten',
    required: true,
    fields: ['kundennummer', 'name', 'email', 'telefon', 'status']
  },
  {
    id: 'adressen',
    label: 'Adressen',
    fields: ['rechnungsadresse', 'lieferadresse', 'kontaktpersonen']
  },
  {
    id: 'geschaeftsdaten',
    label: 'Geschäftsdaten',
    fields: ['kundentyp', 'umsatzklasse', 'zahlungsziel', 'kreditlimit', 'rabatte']
  },
  {
    id: 'beziehungen',
    label: 'Beziehungen',
    fields: ['kundenbetreuer', 'vertriebsgebiet', 'kampagnen', 'notizen']
  }
];

// ============================================================================
// STANDARD-TIMELINE-STRUKTUREN
// ============================================================================

export const STANDARD_WORKFLOW_TIMELINE: TimelineStep[] = [
  {
    id: 'erstellung',
    title: 'Erstellung',
    description: 'Beleg wird erstellt',
    status: 'completed',
    required: true
  },
  {
    id: 'freigabe',
    title: 'Freigabe',
    description: 'Beleg wird zur Freigabe vorgelegt',
    status: 'pending',
    required: true
  },
  {
    id: 'genehmigung',
    title: 'Genehmigung',
    description: 'Beleg wird genehmigt',
    status: 'pending',
    required: true
  },
  {
    id: 'buchung',
    title: 'Buchung',
    description: 'Beleg wird verbucht',
    status: 'pending',
    required: true
  },
  {
    id: 'archivierung',
    title: 'Archivierung',
    description: 'Beleg wird archiviert',
    status: 'pending',
    required: false
  }
];

// ============================================================================
// STANDARD-BELEGFOLGEN
// ============================================================================

export const STANDARD_BELEGFOLGE: Belegfolge = {
  belegnummer: '',
  belegtyp: '',
  status: 'entwurf',
  erstelltAm: new Date(),
  erstelltVon: '',
  workflow: [
    {
      id: 'erstellung',
      name: 'Erstellung',
      status: 'completed',
      role: 'user',
      action: 'create'
    },
    {
      id: 'freigabe',
      name: 'Freigabe',
      status: 'pending',
      role: 'manager',
      action: 'approve'
    },
    {
      id: 'genehmigung',
      name: 'Genehmigung',
      status: 'pending',
      role: 'admin',
      action: 'approve'
    },
    {
      id: 'buchung',
      name: 'Buchung',
      status: 'pending',
      role: 'accountant',
      action: 'post'
    }
  ]
};

// ============================================================================
// FORMULAR-TEMPLATES FÜR VERSCHIEDENE MODULE
// ============================================================================

export interface FormTemplate {
  id: string;
  name: string;
  module: string;
  layout: FormLayout;
  tabs: FormTab[];
  timeline: TimelineStep[];
  belegfolge: Belegfolge;
  defaultFields: FormField[];
  validationSchema: z.ZodSchema<any>;
}

export const FORM_TEMPLATES: Record<string, FormTemplate> = {
  'wawi-artikel': {
    id: 'wawi-artikel',
    name: 'Artikelstammdaten',
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
          fields: ['mindestbestand', 'lagerort', 'einheit']
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
        fields: ['mindestbestand', 'lagerort', 'einheit']
      }
    ],
    timeline: [
      {
        id: 'erstellung',
        title: 'Artikel erstellt',
        status: 'completed',
        timestamp: new Date()
      },
      {
        id: 'freigabe',
        title: 'Zur Freigabe',
        status: 'pending',
        timestamp: new Date()
      }
    ],
    belegfolge: STANDARD_BELEGFOLGE,
    defaultFields: [
      {
        name: 'artikelnummer',
        label: 'Artikelnummer',
        type: 'text' as const,
        required: true,
        placeholder: 'z.B. ART-001'
      },
      {
        name: 'bezeichnung',
        label: 'Bezeichnung',
        type: 'text' as const,
        required: true,
        placeholder: 'Artikelbezeichnung'
      },
      {
        name: 'kategorie',
        label: 'Kategorie',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'rohstoffe', label: 'Rohstoffe' },
          { value: 'halbfertig', label: 'Halbfertigprodukte' },
          { value: 'fertig', label: 'Fertigprodukte' }
        ]
      },
      {
        name: 'beschreibung',
        label: 'Beschreibung',
        type: 'textarea' as const,
        required: false,
        placeholder: 'Detaillierte Beschreibung'
      },
      {
        name: 'einkaufspreis',
        label: 'Einkaufspreis',
        type: 'number' as const,
        required: true,
        placeholder: '0.00'
      },
      {
        name: 'verkaufspreis',
        label: 'Verkaufspreis',
        type: 'number' as const,
        required: true,
        placeholder: '0.00'
      },
      {
        name: 'rabatt',
        label: 'Rabatt (%)',
        type: 'number' as const,
        required: false,
        placeholder: '0'
      },
      {
        name: 'mindestbestand',
        label: 'Mindestbestand',
        type: 'number' as const,
        required: true,
        placeholder: '0'
      },
      {
        name: 'lagerort',
        label: 'Lagerort',
        type: 'text' as const,
        required: true,
        placeholder: 'z.B. A-01-01'
      },
      {
        name: 'einheit',
        label: 'Einheit',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'stueck', label: 'Stück' },
          { value: 'kg', label: 'Kilogramm' },
          { value: 'l', label: 'Liter' },
          { value: 'm', label: 'Meter' }
        ]
      }
    ],
    validationSchema: ArtikelstammdatenSchema
  },
  'fibu-buchung': {
    id: 'fibu-buchung',
    name: 'FiBu Buchung',
    module: 'fibu',
    layout: {
      type: 'tabs',
      tabs: [
        {
          id: 'grunddaten',
          label: 'Grunddaten',
          icon: 'Receipt',
          fields: ['buchungsnummer', 'buchungsdatum', 'belegnummer', 'belegtyp']
        },
        {
          id: 'positionen',
          label: 'Positionen',
          icon: 'List',
          fields: ['positionen']
        },
        {
          id: 'summen',
          label: 'Summen',
          icon: 'Calculate',
          fields: ['summe', 'steuer', 'gesamt']
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
    tabs: [
      {
        id: 'grunddaten',
        label: 'Grunddaten',
        icon: 'Receipt',
        fields: ['buchungsnummer', 'buchungsdatum', 'belegnummer', 'belegtyp']
      },
      {
        id: 'positionen',
        label: 'Positionen',
        icon: 'List',
        fields: ['positionen']
      },
      {
        id: 'summen',
        label: 'Summen',
        icon: 'Calculate',
        fields: ['summe', 'steuer', 'gesamt']
      }
    ],
    timeline: [
      {
        id: 'erstellung',
        title: 'Buchung erstellt',
        status: 'completed',
        timestamp: new Date()
      },
      {
        id: 'freigabe',
        title: 'Zur Freigabe',
        status: 'pending',
        timestamp: new Date()
      }
    ],
    belegfolge: STANDARD_BELEGFOLGE,
    defaultFields: [
      {
        name: 'buchungsnummer',
        label: 'Buchungsnummer',
        type: 'text' as const,
        required: true,
        placeholder: 'z.B. BUCH-001'
      },
      {
        name: 'buchungsdatum',
        label: 'Buchungsdatum',
        type: 'date' as const,
        required: true,
        placeholder: 'TT.MM.YYYY'
      },
      {
        name: 'belegnummer',
        label: 'Belegnummer',
        type: 'text' as const,
        required: true,
        placeholder: 'z.B. BELEG-001'
      },
      {
        name: 'belegtyp',
        label: 'Belegtyp',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'rechnung', label: 'Rechnung' },
          { value: 'gutschrift', label: 'Gutschrift' },
          { value: 'zahlung', label: 'Zahlung' }
        ]
      },
      {
        name: 'summe',
        label: 'Summe',
        type: 'number' as const,
        required: true,
        placeholder: '0.00'
      },
      {
        name: 'steuer',
        label: 'Steuer',
        type: 'number' as const,
        required: true,
        placeholder: '0.00'
      },
      {
        name: 'gesamt',
        label: 'Gesamt',
        type: 'number' as const,
        required: true,
        placeholder: '0.00'
      }
    ],
    validationSchema: z.object({
      buchungsnummer: z.string().min(1, 'Buchungsnummer ist erforderlich'),
      buchungsdatum: z.date(),
      belegnummer: z.string().min(1, 'Belegnummer ist erforderlich'),
      belegtyp: z.string().min(1, 'Belegtyp ist erforderlich'),
      summe: z.number().positive('Summe muss positiv sein'),
      steuer: z.number().min(0, 'Steuer kann nicht negativ sein'),
      gesamt: z.number().positive('Gesamtbetrag muss positiv sein')
    })
  },
  'crm-kunde': {
    id: 'crm-kunde',
    name: 'CRM Kunde',
    module: 'crm',
    layout: {
      type: 'tabs',
      tabs: [
        {
          id: 'grunddaten',
          label: 'Grunddaten',
          icon: 'Person',
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
    tabs: [
      {
        id: 'grunddaten',
        label: 'Grunddaten',
        icon: 'Person',
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
    timeline: [
      {
        id: 'erstellung',
        title: 'Kunde erstellt',
        status: 'completed',
        timestamp: new Date()
      },
      {
        id: 'freigabe',
        title: 'Zur Freigabe',
        status: 'pending',
        timestamp: new Date()
      }
    ],
    belegfolge: STANDARD_BELEGFOLGE,
    defaultFields: [
      {
        name: 'kundennummer',
        label: 'Kundennummer',
        type: 'text' as const,
        required: true,
        placeholder: 'z.B. KUNDE-001'
      },
      {
        name: 'firmenname',
        label: 'Firmenname',
        type: 'text' as const,
        required: true,
        placeholder: 'Firmenname'
      },
      {
        name: 'ansprechpartner',
        label: 'Ansprechpartner',
        type: 'text' as const,
        required: false,
        placeholder: 'Name des Ansprechpartners'
      },
      {
        name: 'email',
        label: 'E-Mail',
        type: 'email' as const,
        required: false,
        placeholder: 'email@firma.de'
      },
      {
        name: 'telefon',
        label: 'Telefon',
        type: 'text' as const,
        required: false,
        placeholder: '+49 123 456789'
      },
      {
        name: 'strasse',
        label: 'Straße',
        type: 'text' as const,
        required: true,
        placeholder: 'Musterstraße 123'
      },
      {
        name: 'plz',
        label: 'PLZ',
        type: 'text' as const,
        required: true,
        placeholder: '12345'
      },
      {
        name: 'ort',
        label: 'Ort',
        type: 'text' as const,
        required: true,
        placeholder: 'Musterstadt'
      },
      {
        name: 'land',
        label: 'Land',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'DE', label: 'Deutschland' },
          { value: 'AT', label: 'Österreich' },
          { value: 'CH', label: 'Schweiz' }
        ]
      },
      {
        name: 'umsatzsteuer_id',
        label: 'Umsatzsteuer-ID',
        type: 'text' as const,
        required: false,
        placeholder: 'DE123456789'
      },
      {
        name: 'kundengruppe',
        label: 'Kundengruppe',
        type: 'select' as const,
        required: false,
        options: [
          { value: 'privat', label: 'Privat' },
          { value: 'geschaeft', label: 'Geschäft' },
          { value: 'grosshandel', label: 'Großhandel' }
        ]
      },
      {
        name: 'zahlungsbedingungen',
        label: 'Zahlungsbedingungen',
        type: 'select' as const,
        required: false,
        options: [
          { value: 'sofort', label: 'Sofort' },
          { value: '14tage', label: '14 Tage' },
          { value: '30tage', label: '30 Tage' }
        ]
      }
    ],
    validationSchema: z.object({
      kundennummer: z.string().min(1, 'Kundennummer ist erforderlich'),
      firmenname: z.string().min(1, 'Firmenname ist erforderlich'),
      strasse: z.string().min(1, 'Straße ist erforderlich'),
      plz: z.string().min(1, 'PLZ ist erforderlich'),
      ort: z.string().min(1, 'Ort ist erforderlich'),
      land: z.string().min(1, 'Land ist erforderlich')
    })
  }
}; 

// ============================================================================
// FEHLENDE SCHEMAS HINZUFÜGEN
// ============================================================================

export const BedarfsermittlungSchema = z.object({
  ermittlungsnummer: z.string().min(1, 'Ermittlungsnummer ist erforderlich'),
  artikelId: z.string().min(1, 'Artikel-ID ist erforderlich'),
  varianteId: z.string().optional(),
  periode: z.string().min(1, 'Periode ist erforderlich'),
  verbrauchsmenge: z.number().min(0, 'Verbrauchsmenge muss positiv sein'),
  einheit: z.string().min(1, 'Einheit ist erforderlich'),
  verbrauchsart: z.enum(['verbrauch', 'verkauf', 'produktion']),
  bedarfsmenge: z.number().min(0, 'Bedarfsmenge muss positiv sein'),
  sicherheitsbestand: z.number().min(0, 'Sicherheitsbestand muss positiv sein'),
  bestellpunkt: z.number().min(0, 'Bestellpunkt muss positiv sein'),
  empfohleneBestellmenge: z.number().min(0, 'Empfohlene Bestellmenge muss positiv sein'),
  lieferantId: z.string().optional(),
  lieferzeit: z.number().min(0, 'Lieferzeit muss positiv sein'),
  notizen: z.string().optional(),
});

export const AnfrageSchema = z.object({
  anfragenummer: z.string().min(1, 'Anfragenummer ist erforderlich'),
  lieferantId: z.string().min(1, 'Lieferant-ID ist erforderlich'),
  anfragedatum: z.date(),
  gueltigBis: z.date(),
  status: z.enum(['entwurf', 'versendet', 'beantwortet', 'abgeschlossen']),
  notizen: z.string().optional(),
});

export const BestellungSchema = z.object({
  bestellnummer: z.string().min(1, 'Bestellnummer ist erforderlich'),
  lieferantId: z.string().min(1, 'Lieferant-ID ist erforderlich'),
  bestelldatum: z.date(),
  erwartetesLieferdatum: z.date(),
  gesamtbetrag: z.number().min(0, 'Gesamtbetrag muss positiv sein'),
  waehrung: z.string().min(1, 'Währung ist erforderlich'),
  zahlungsbedingungen: z.string().min(1, 'Zahlungsbedingungen sind erforderlich'),
  lieferbedingungen: z.string().min(1, 'Lieferbedingungen sind erforderlich'),
  status: z.enum(['entwurf', 'versendet', 'bestaetigt', 'teilweise_geliefert', 'vollstaendig_geliefert']),
  notizen: z.string().optional(),
});

export const AuftragsbestaetigungSchema = z.object({
  bestaetigungsnummer: z.string().min(1, 'Bestätigungsnummer ist erforderlich'),
  bestellungId: z.string().min(1, 'Bestellung-ID ist erforderlich'),
  lieferantId: z.string().min(1, 'Lieferant-ID ist erforderlich'),
  bestaetigungsdatum: z.date(),
  bestaetigterLiefertermin: z.date(),
  status: z.enum(['bestaetigt', 'teilweise_bestaetigt', 'abgelehnt']),
  notizen: z.string().optional(),
});

export const AuftragsbearbeitungSchema = z.object({
  auftragsnummer: z.string().min(1, 'Auftragsnummer ist erforderlich'),
  kundeId: z.string().min(1, 'Kunde-ID ist erforderlich'),
  auftragsdatum: z.date(),
  gewuenschterLiefertermin: z.date(),
  bestaetigterLiefertermin: z.date().optional(),
  gesamtbetrag: z.number().min(0, 'Gesamtbetrag muss positiv sein'),
  waehrung: z.string().min(1, 'Währung ist erforderlich'),
  status: z.enum(['eingegangen', 'bestaetigt', 'in_bearbeitung', 'kommissioniert', 'versandbereit', 'versendet']),
  prioritaet: z.enum(['niedrig', 'normal', 'hoch', 'dringend']),
  notizen: z.string().optional(),
});

export const PacklisteSchema = z.object({
  packlistennummer: z.string().min(1, 'Packlistennummer ist erforderlich'),
  auftragId: z.string().min(1, 'Auftrag-ID ist erforderlich'),
  kundeId: z.string().min(1, 'Kunde-ID ist erforderlich'),
  packdatum: z.date(),
  packerId: z.string().min(1, 'Packer-ID ist erforderlich'),
  gesamtgewicht: z.number().min(0).optional(),
  gesamtvolumen: z.number().min(0).optional(),
  anzahlPackstuecke: z.number().min(1, 'Anzahl Packstücke muss mindestens 1 sein'),
  status: z.enum(['in_bearbeitung', 'abgeschlossen']),
  notizen: z.string().optional(),
});

export const VersandetikettierungSchema = z.object({
  etikettennummer: z.string().min(1, 'Etikettennummer ist erforderlich'),
  packlisteId: z.string().min(1, 'Packliste-ID ist erforderlich'),
  auftragId: z.string().min(1, 'Auftrag-ID ist erforderlich'),
  kundeId: z.string().min(1, 'Kunde-ID ist erforderlich'),
  versandart: z.string().min(1, 'Versandart ist erforderlich'),
  versanddienstleister: z.string().min(1, 'Versanddienstleister ist erforderlich'),
  trackingnummer: z.string().optional(),
  status: z.enum(['erstellt', 'gedruckt', 'versendet']),
  notizen: z.string().optional(),
});

export const LogistikUebergabeSchema = z.object({
  uebergabenummer: z.string().min(1, 'Übergabenummer ist erforderlich'),
  packlisteId: z.string().min(1, 'Packliste-ID ist erforderlich'),
  auftragId: z.string().min(1, 'Auftrag-ID ist erforderlich'),
  uebergabedatum: z.date(),
  uebergeberId: z.string().min(1, 'Übergeber-ID ist erforderlich'),
  empfaengerId: z.string().min(1, 'Empfänger-ID ist erforderlich'),
  versanddienstleister: z.string().min(1, 'Versanddienstleister ist erforderlich'),
  trackingnummer: z.string().optional(),
  status: z.enum(['uebergeben', 'in_transport', 'zugestellt']),
  notizen: z.string().optional(),
});

export const MaterialbedarfsermittlungSchema = z.object({
  ermittlungsnummer: z.string().min(1, 'Ermittlungsnummer ist erforderlich'),
  produktionsauftragId: z.string().min(1, 'Produktionsauftrag-ID ist erforderlich'),
  stuecklisteId: z.string().min(1, 'Stücklisten-ID ist erforderlich'),
  ermittlungsdatum: z.date(),
  status: z.enum(['berechnet', 'verfuegbarkeit_geprueft', 'bestellung_erstellt']),
  notizen: z.string().optional(),
});

export const RueckverfolgungSchema = z.object({
  rueckverfolgungsnummer: z.string().min(1, 'Rückverfolgungsnummer ist erforderlich'),
  artikelId: z.string().min(1, 'Artikel-ID ist erforderlich'),
  varianteId: z.string().optional(),
  chargeId: z.string().optional(),
  seriennummer: z.string().optional(),
  herstellungsdatum: z.date(),
  hersteller: z.string().optional(),
  lieferantId: z.string().optional(),
  kundeId: z.string().optional(),
  auftragId: z.string().optional(),
  status: z.enum(['vollstaendig', 'teilweise', 'unvollstaendig']),
  notizen: z.string().optional(),
});

export const ProduktionsauftragSchema = z.object({
  auftragsnummer: z.string().min(1, 'Auftragsnummer ist erforderlich'),
  produktId: z.string().min(1, 'Produkt-ID ist erforderlich'),
  stuecklisteId: z.string().min(1, 'Stücklisten-ID ist erforderlich'),
  menge: z.number().min(0.001, 'Menge muss größer als 0 sein'),
  einheit: z.string().min(1, 'Einheit ist erforderlich'),
  startdatum: z.date(),
  enddatum: z.date(),
  status: z.enum(['geplant', 'laufend', 'abgeschlossen', 'storniert']),
  prioritaet: z.enum(['niedrig', 'normal', 'hoch', 'dringend']),
  werkstattId: z.string().optional(),
  maschinenId: z.array(z.string()).optional(),
  mitarbeiterId: z.array(z.string()).optional(),
  notizen: z.string().optional(),
});

export const RueckmeldungSchema = z.object({
  rueckmeldungsnummer: z.string().min(1, 'Rückmeldungsnummer ist erforderlich'),
  produktionsauftragId: z.string().min(1, 'Produktionsauftrag-ID ist erforderlich'),
  rueckmeldungsdatum: z.date(),
  mitarbeiterId: z.string().min(1, 'Mitarbeiter-ID ist erforderlich'),
  status: z.enum(['teilrueckmeldung', 'vollstaendig']),
  notizen: z.string().optional(),
});

export const LieferantenbewertungSchema = z.object({
  bewertungsnummer: z.string().min(1, 'Bewertungsnummer ist erforderlich'),
  lieferantId: z.string().min(1, 'Lieferant-ID ist erforderlich'),
  bewertungszeitraum: z.string().min(1, 'Bewertungszeitraum ist erforderlich'),
  bewertungsdatum: z.date(),
  gesamtbewertung: z.number().min(1).max(5),
  status: z.enum(['erstellt', 'freigegeben', 'archiviert']),
  notizen: z.string().optional(),
});

export const KundenruecklaeuferSchema = z.object({
  ruecklaeufernummer: z.string().min(1, 'Rückläufernummer ist erforderlich'),
  kundeId: z.string().min(1, 'Kunde-ID ist erforderlich'),
  auftragId: z.string().optional(),
  rechnungId: z.string().optional(),
  ruecklaeuferdatum: z.date(),
  grund: z.string().min(1, 'Grund ist erforderlich'),
  ruecklaeuferart: z.enum(['reklamation', 'garantie', 'kundenservice', 'sonstiges']),
  prioritaet: z.enum(['niedrig', 'mittel', 'hoch', 'kritisch']),
  status: z.enum(['eingegangen', 'in_bearbeitung', 'geloest', 'abgelehnt']),
  notizen: z.string().optional(),
});

export const GutschriftSchema = z.object({
  gutschriftsnummer: z.string().min(1, 'Gutschriftsnummer ist erforderlich'),
  ruecklaeuferId: z.string().optional(),
  rechnungId: z.string().optional(),
  kundeId: z.string().min(1, 'Kunde-ID ist erforderlich'),
  gutschriftsdatum: z.date(),
  gesamtbetrag: z.number().min(0, 'Gesamtbetrag muss positiv sein'),
  waehrung: z.string().min(1, 'Währung ist erforderlich'),
  status: z.enum(['entwurf', 'freigegeben', 'versendet', 'verbucht']),
  notizen: z.string().optional(),
});

export const UrsachenanalyseSchema = z.object({
  analysenummer: z.string().min(1, 'Analysenummer ist erforderlich'),
  ruecklaeuferId: z.string().min(1, 'Rückläufer-ID ist erforderlich'),
  analysendatum: z.date(),
  analysentyp: z.enum(['qualitaet', 'lieferung', 'kommunikation', 'system']),
  ursache: z.string().min(1, 'Ursache ist erforderlich'),
  massnahmen: z.array(z.string()),
  verantwortlicherId: z.string().min(1, 'Verantwortlicher-ID ist erforderlich'),
  deadline: z.date(),
  status: z.enum(['in_bearbeitung', 'abgeschlossen', 'ueberfaellig']),
  notizen: z.string().optional(),
});

export const VerpackungsvorschriftenSchema = z.object({
  vorschriftennummer: z.string().min(1, 'Vorschriftennummer ist erforderlich'),
  artikelId: z.string().min(1, 'Artikel-ID ist erforderlich'),
  varianteId: z.string().optional(),
  verpackungsart: z.string().min(1, 'Verpackungsart ist erforderlich'),
  verpackungsmaterial: z.array(z.string()),
  verpackungsgroesse: z.string().min(1, 'Verpackungsgröße ist erforderlich'),
  gewicht: z.number().min(0, 'Gewicht muss positiv sein'),
  volumen: z.number().min(0, 'Volumen muss positiv sein'),
  gefahrgutklasse: z.string().optional(),
  unNummer: z.string().optional(),
  adrKonform: z.boolean(),
  vorschriften: z.array(z.string()),
  status: z.enum(['entwurf', 'freigegeben', 'archiviert']),
  notizen: z.string().optional(),
});

export const EtikettenSchema = z.object({
  etikettennummer: z.string().min(1, 'Etikettennummer ist erforderlich'),
  artikelId: z.string().min(1, 'Artikel-ID ist erforderlich'),
  varianteId: z.string().optional(),
  etikettentyp: z.string().min(1, 'Etikettentyp ist erforderlich'),
  druckformat: z.string().min(1, 'Druckformat ist erforderlich'),
  druckerId: z.string().optional(),
  status: z.enum(['entwurf', 'gedruckt', 'archiviert']),
  notizen: z.string().optional(),
});

export const UNNummernSchema = z.object({
  unNummer: z.string().min(1, 'UN-Nummer ist erforderlich'),
  bezeichnung: z.string().min(1, 'Bezeichnung ist erforderlich'),
  gefahrgutklasse: z.string().min(1, 'Gefahrgutklasse ist erforderlich'),
  verpackungsgruppe: z.string().min(1, 'Verpackungsgruppe ist erforderlich'),
  gefahrenzeichen: z.array(z.string()),
  verpackungsvorschriften: z.array(z.string()),
  transportvorschriften: z.array(z.string()),
  lagerungsvorschriften: z.array(z.string()),
  status: z.enum(['aktiv', 'inaktiv']),
  notizen: z.string().optional(),
});

export const ADRKonformitaetSchema = z.object({
  konformitaetsnummer: z.string().min(1, 'Konformitätsnummer ist erforderlich'),
  artikelId: z.string().min(1, 'Artikel-ID ist erforderlich'),
  varianteId: z.string().optional(),
  adrKlasse: z.string().min(1, 'ADR-Klasse ist erforderlich'),
  verpackungsgruppe: z.string().min(1, 'Verpackungsgruppe ist erforderlich'),
  unNummer: z.string().min(1, 'UN-Nummer ist erforderlich'),
  gefahrenzeichen: z.array(z.string()),
  konformitaetspruefung: z.boolean(),
  zertifikat: z.string().optional(),
  gueltigBis: z.date().optional(),
  status: z.enum(['konform', 'nicht_konform', 'in_pruefung']),
  notizen: z.string().optional(),
});

export const InventurerfassungSchema = z.object({
  erfassungsnummer: z.string().min(1, 'Erfassungsnummer ist erforderlich'),
  inventurId: z.string().min(1, 'Inventur-ID ist erforderlich'),
  lagerortId: z.string().min(1, 'Lagerort-ID ist erforderlich'),
  erfasserId: z.string().min(1, 'Erfasser-ID ist erforderlich'),
  erfassungsdatum: z.date(),
  erfassungsart: z.enum(['manuell', 'barcode', 'rfid']),
  status: z.enum(['laufend', 'abgeschlossen']),
  notizen: z.string().optional(),
});

export const DifferenzkontrolleSchema = z.object({
  kontrollnummer: z.string().min(1, 'Kontrollnummer ist erforderlich'),
  inventurId: z.string().min(1, 'Inventur-ID ist erforderlich'),
  kontrolleurId: z.string().min(1, 'Kontrolleur-ID ist erforderlich'),
  kontrolldatum: z.date(),
  gesamtDifferenz: z.number(),
  status: z.enum(['in_bearbeitung', 'abgeschlossen']),
  notizen: z.string().optional(),
});

export const UmlagerungSchema = z.object({
  umlagerungsnummer: z.string().min(1, 'Umlagerungsnummer ist erforderlich'),
  artikelId: z.string().min(1, 'Artikel-ID ist erforderlich'),
  varianteId: z.string().optional(),
  chargeId: z.string().optional(),
  seriennummer: z.string().optional(),
  menge: z.number().min(0.001, 'Menge muss größer als 0 sein'),
  einheit: z.string().min(1, 'Einheit ist erforderlich'),
  vonLagerortId: z.string().min(1, 'Von-Lagerort-ID ist erforderlich'),
  vonLagerplatzId: z.string().optional(),
  nachLagerortId: z.string().min(1, 'Nach-Lagerort-ID ist erforderlich'),
  nachLagerplatzId: z.string().optional(),
  umlagerungsdatum: z.date(),
  umlagererId: z.string().min(1, 'Umlagerer-ID ist erforderlich'),
  grund: z.string().min(1, 'Grund ist erforderlich'),
  status: z.enum(['geplant', 'in_bearbeitung', 'abgeschlossen', 'storniert']),
  notizen: z.string().optional(),
});

export const PreislistenSchema = z.object({
  preislistennummer: z.string().min(1, 'Preislistennummer ist erforderlich'),
  bezeichnung: z.string().min(1, 'Bezeichnung ist erforderlich'),
  gueltigAb: z.date(),
  gueltigBis: z.date().optional(),
  waehrung: z.string().min(1, 'Währung ist erforderlich'),
  kundengruppe: z.string().optional(),
  status: z.enum(['entwurf', 'freigegeben', 'archiviert']),
  notizen: z.string().optional(),
});

export const AktionenSchema = z.object({
  aktionsnummer: z.string().min(1, 'Aktionsnummer ist erforderlich'),
  bezeichnung: z.string().min(1, 'Bezeichnung ist erforderlich'),
  aktionstyp: z.enum(['rabatt', 'mengenrabatt', 'gratisartikel', 'preisreduktion']),
  gueltigAb: z.date(),
  gueltigBis: z.date(),
  kundengruppe: z.string().optional(),
  artikelgruppe: z.string().optional(),
  status: z.enum(['geplant', 'aktiv', 'beendet', 'storniert']),
  notizen: z.string().optional(),
});

export const StaffelpreiseSchema = z.object({
  staffelpreisnummer: z.string().min(1, 'Staffelpreisnummer ist erforderlich'),
  artikelId: z.string().min(1, 'Artikel-ID ist erforderlich'),
  varianteId: z.string().optional(),
  gueltigAb: z.date(),
  gueltigBis: z.date().optional(),
  status: z.enum(['aktiv', 'inaktiv']),
  notizen: z.string().optional(),
});

export const RabattsystemeSchema = z.object({
  rabattsystemnummer: z.string().min(1, 'Rabattsystemnummer ist erforderlich'),
  bezeichnung: z.string().min(1, 'Bezeichnung ist erforderlich'),
  rabattsystemtyp: z.enum(['kundengruppe', 'mengenrabatt', 'treuerabatt', 'saisonrabatt']),
  gueltigAb: z.date(),
  gueltigBis: z.date().optional(),
  status: z.enum(['aktiv', 'inaktiv']),
  notizen: z.string().optional(),
}); 