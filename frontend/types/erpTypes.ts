// ERP TypeScript Interfaces für alle Module

// ============================================================================
// BESTELLVORSCHLAG / BESTELLUNG / LIEFERANTENSTAMM
// ============================================================================

export interface OrderSuggestionData {
  // Kopfbereich
  articleGroup: string;
  branch: string;
  articleNumber: string;
  description1: string;
  description2: string;
  storageLocation: string;
  matchcode: string;
  matchcode2: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  sales: number;
  suggestion: number;
  
  // Tabellendaten
  warehouse: string;
  stock: number;
  purchase: number;
}

export interface OrderSuggestionFilters {
  articleGroup?: string;
  branch?: string;
  matchcode?: string;
  minStock?: number;
  maxStock?: number;
}

// ============================================================================
// BESTELLUNG ERSTELLEN
// ============================================================================

export interface PurchaseOrderData {
  id?: string;
  // Kopfbereich
  creditorAccountNumber: string;
  branch: string;
  costCenter: string;
  commission: string;
  supplier: string;
  latestDeliveryDate: Date;
  loadingDeadline: Date;
  loadingDate: Date;
  orderNumber: string;
  orderDate: Date;
  operator: string;
  completed: boolean;
  
  // Positionen
  positions: PurchaseOrderPosition[];
  
  // Registerkarten
  references: DocumentReference[];
  paymentTerms: PaymentTerms;
  additionalInfo: string;
  
  // Berechnete Felder
  totalAmount: number;
  netAmount: number;
  vatAmount: number;
  
  // Metadaten
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PurchaseOrderPosition {
  id: string;
  position: number;
  articleNumber: string;
  supplier: string;
  description: string;
  quantity: number;
  packageQuantity: number;
  packageUnit: string;
  stock: number;
  price: number;
  contract: string;
  netAmount: number;
}

export interface DocumentReference {
  id: string;
  type: 'inquiry' | 'offer' | 'order';
  number: string;
  date: Date;
  description: string;
}

export interface PaymentTerms {
  paymentMethod: string;
  paymentDeadline: number;
  discountDays: number;
  discountPercent: number;
  notes: string;
}

// ============================================================================
// LIEFERANTEN-ANGEBOT
// ============================================================================

export interface SupplierOfferData {
  id?: string;
  // Kopfbereich
  creditorAccountNumber: string;
  supplier: string;
  supplierMaster: string;
  latestDeliveryDate: Date;
  loadingDeadline: Date;
  loadingDate: Date;
  inquiryNumber: string;
  inquiryDate: Date;
  operator: string;
  completed: boolean;
  
  // Eingabefelder
  contactPerson: {
    name: string;
    salutation: string;
  };
  supplierOfferNumber: string;
  supplierOrderNumber: string;
  offerDate: Date;
  orderDate: Date;
  text1: string; // Kommissions-Name
  text2: string; // Bsp. Liefertermin
  
  // Positionen
  positions: SupplierOfferPosition[];
  
  // Metadaten
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SupplierOfferPosition {
  id: string;
  position: number;
  articleNumber: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  discount: number;
  netAmount: number;
}

// ============================================================================
// ANFRAGE
// ============================================================================

export interface InquiryData {
  id?: string;
  // Kopfbereich (identisch zu Lieferanten-Angebot)
  creditorNumber: string;
  branch: string;
  supplierMaster: string;
  deliveryDate: Date;
  loadingTerm: Date;
  loadingDate: Date;
  inquiryNumber: string;
  inquiryDate: Date;
  operator: string;
  completed: boolean;
  
  // Positionsbereich
  positions: InquiryPosition[];
  
  // Metadaten
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InquiryPosition {
  id: string;
  position: number;
  articleNumber: string;
  description: string;
  quantity: number;
  unit: string;
  notes: string;
}

// ============================================================================
// LIEFERSCHEIN-ERFASSUNG
// ============================================================================

export interface DeliveryNoteData {
  id?: string;
  // Kopfbereich
  deliveryNoteNumber: string;
  date: Date;
  time: string;
  customerNumber: string;
  deliveryAddress: string;
  billingAddress: string;
  debtorNumber: string;
  invoicedInvoiceNumber: string;
  referenceNumber: string;
  
  // Checkboxen
  selfPickup: boolean;
  externalCompany: boolean;
  returnDelivery: boolean;
  freeHouse: boolean;
  info: boolean;
  printed: boolean;
  invoiced: boolean;
  
  // Positionen
  positions: DeliveryPosition[];
  
  // Berechnete Felder
  totalAmount: number;
  netAmount: number;
  vatAmount: number;
  
  // Metadaten
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DeliveryPosition {
  id: string;
  position: number;
  articleNumber: string;
  description: string;
  quantity: number;
  unit: string;
  discount: number;
  discountPercent: number;
  netPrice: number;
  netAmount: number;
  serialNumber: string;
  warehouse: string;
  storageLocation: string;
}

// ============================================================================
// AUFTRAGSBESTÄTIGUNG
// ============================================================================

export interface OrderConfirmationData {
  id?: string;
  // Kopfbereich
  orderNumber: string;
  date: Date;
  customerNumber: string;
  debtorNumber: string;
  status: OrderStatus;
  phoneContact: string;
  creditLimit: number;
  branch: string;
  completed: boolean;
  
  // Navigationsbaum-Daten
  general: CustomerGeneralData;
  offerOrder: OfferOrderData;
  invoicePayment: InvoicePaymentData;
  technical: TechnicalData;
  deliveryPackaging: DeliveryPackagingData;
  documentData: DocumentData;
  contacts: ContactPerson[];
  representatives: Representative[];
  customerAssignment: CustomerAssignmentData;
  
  // Metadaten
  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderStatus = 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface CustomerGeneralData {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  taxNumber: string;
  vatNumber: string;
}

export interface OfferOrderData {
  offerNumber: string;
  offerDate: Date;
  orderNumber: string;
  orderDate: Date;
  conditions: string;
  notes: string;
}

export interface InvoicePaymentData {
  paymentMethod: string;
  paymentTerms: string;
  paymentDeadline: number;
  discountDays: number;
  discountPercent: number;
  bankAccount: string;
  iban: string;
  bic: string;
}

export interface TechnicalData {
  specifications: string;
  qualityRequirements: string;
  certifications: string;
  technicalNotes: string;
}

export interface DeliveryPackagingData {
  deliveryTerms: string;
  packagingRequirements: string;
  palletizationData: string;
  specialInstructions: string;
}

export interface DocumentData {
  documentNumbers: string[];
  references: string[];
  attachments: string[];
}

export interface ContactPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  function: string;
}

export interface Representative {
  id: string;
  name: string;
  phone: string;
  email: string;
  territory: string;
}

export interface CustomerAssignmentData {
  customerGroups: string[];
  industryAssignment: string;
  salesTerritories: string[];
}

// ============================================================================
// ANGEBOT
// ============================================================================

export interface OfferData {
  id?: string;
  // Kopfbereich (identisch zu Auftragsbestätigung)
  offerNumber: string;
  date: Date;
  customerNumber: string;
  debtorNumber: string;
  status: OfferStatus;
  phoneContact: string;
  creditLimit: number;
  branch: string;
  completed: boolean;
  
  // Navigationsbaum-Daten (identisch zu Auftragsbestätigung)
  general: CustomerGeneralData;
  offerOrder: OfferOrderData;
  invoicePayment: InvoicePaymentData;
  technical: TechnicalData;
  deliveryPackaging: DeliveryPackagingData;
  documentData: DocumentData;
  contacts: ContactPerson[];
  representatives: Representative[];
  customerAssignment: CustomerAssignmentData;
  
  // Angebotsspezifische Felder
  validityPeriod: number;
  totalAmount: number;
  netAmount: number;
  vatAmount: number;
  
  // Metadaten
  createdAt?: Date;
  updatedAt?: Date;
}

export type OfferStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

// ============================================================================
// ALLGEMEINE TYPEN
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  branch?: string;
  operator?: string;
}

// ============================================================================
// ENUMERATIONS
// ============================================================================

export enum DocumentType {
  ORDER = 'order',
  OFFER = 'offer',
  INVOICE = 'invoice',
  DELIVERY_NOTE = 'delivery_note',
  PURCHASE_ORDER = 'purchase_order',
  SUPPLIER_OFFER = 'supplier_offer',
  INQUIRY = 'inquiry',
  ORDER_CONFIRMATION = 'order_confirmation'
}

export enum UnitType {
  PIECE = 'Stück',
  KILOGRAM = 'kg',
  LITER = 'l',
  METER = 'm',
  SQUARE_METER = 'm²',
  CUBIC_METER = 'm³',
  PACKAGE = 'Packung',
  BOX = 'Kiste',
  PALLET = 'Palette'
}

export enum PaymentMethod {
  BANK_TRANSFER = 'Überweisung',
  CASH = 'Bar',
  CHECK = 'Scheck',
  CREDIT_CARD = 'Kreditkarte',
  DIRECT_DEBIT = 'Lastschrift'
}

export enum OrderStatusEnum {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum OfferStatusEnum {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
} 