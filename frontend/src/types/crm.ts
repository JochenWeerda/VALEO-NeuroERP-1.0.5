// CRM Types für VALEO NeuroERP
// Basierend auf zvoove-Handelssoftware CRM-Funktionalitäten

// --- CRM Tab & UI Enums ---
export enum CRMMainTab {
  GENERAL = 'general',
  CONTACTS = 'contacts',
  SALES = 'sales', // Neuer Vertriebs-Tab
  ORDERS = 'orders',
  INVOICES = 'invoices',
  DOCUMENTS = 'documents',
  ANALYSIS = 'analysis',
  DIRECT_BUSINESS = 'direct_business',
  EXTERNAL_STOCKS = 'external_stocks',
  COMMUNICATIONS = 'communications',
  SUPPLIERS = 'suppliers', // Neuer Lieferanten-Tab
  WHATSAPP_WEB = 'whatsapp_web'
}

export enum CRMSubTab {
  // Allgemein
  BASIC_INFO = 'basic_info',
  ADDRESS = 'address',
  FINANCIAL = 'financial',
  
  // Kontakte
  CONTACT_PERSONS = 'contact_persons',
  CONTACT_HISTORY = 'contact_history',
  CONTACT_SCHEDULE = 'contact_schedule',
  
  // Vertrieb
  DEALS = 'deals',
  OFFERS = 'offers',
  SALES_PIPELINE = 'sales_pipeline',
  SALES_ACTIVITIES = 'sales_activities',
  SALES_ANALYTICS = 'sales_analytics',
  
  // Aufträge
  ORDERS = 'orders',
  DELIVERIES = 'deliveries',
  PURCHASE_OFFERS = 'purchase_offers',
  
  // Rechnungen
  INVOICES = 'invoices',
  REMINDERS = 'reminders',
  PAYMENTS = 'payments',
  
  // Kommunikation
  EMAIL = 'email',
  PHONE = 'phone',
  WHATSAPP_HISTORY = 'whatsapp_history',
  MEETINGS = 'meetings',
  
  // Dokumente
  CUSTOMER_DOCS = 'customer_docs',
  CONTRACTS = 'contracts',
  CERTIFICATES = 'certificates',
  
  // Analyse
  REVENUE_ANALYSIS = 'revenue_analysis',
  CREDIT_ANALYSIS = 'credit_analysis',
  ACTIVITY_ANALYSIS = 'activity_analysis',
  
  // Streckengeschäfte
  DIRECT_ORDERS = 'direct_orders',
  DIRECT_INVOICES = 'direct_invoices',
  
  // Fremdbestände
  EXTERNAL_INVENTORY = 'external_inventory',
  STOCK_MOVEMENTS = 'stock_movements',
  
  // Lieferanten
  SUPPLIER_INQUIRIES = 'supplier_inquiries',
  SUPPLIER_ORDERS = 'supplier_orders',
  SUPPLIER_DELIVERIES = 'supplier_deliveries',
  SUPPLIER_INVOICES = 'supplier_invoices',
  SUPPLIER_ANALYTICS = 'supplier_analytics'
}

export enum CRMRibbonSection {
  FILE = 'file',
  HOME = 'home',
  INSERT = 'insert',
  VIEW = 'view',
  TOOLS = 'tools',
  HELP = 'help'
}

export enum CRMRibbonAction {
  // File Section
  NEW_CUSTOMER = 'new_customer',
  SAVE = 'save',
  PRINT = 'print',
  EXPORT = 'export',
  IMPORT = 'import',
  
  // Home Section
  EDIT = 'edit',
  DELETE = 'delete',
  DUPLICATE = 'duplicate',
  REFRESH = 'refresh',
  
  // Insert Section
  ADD_CONTACT = 'add_contact',
  ADD_DOCUMENT = 'add_document',
  ADD_OFFER = 'add_offer',
  ADD_ORDER = 'add_order',
  SEND_WHATSAPP = 'send_whatsapp',
  
  // View Section
  DETAIL_VIEW = 'detail_view',
  LIST_VIEW = 'list_view',
  CARD_VIEW = 'card_view',
  FILTER = 'filter',
  SORT = 'sort',
  
  // Tools Section
  ANALYZE = 'analyze',
  REPORT = 'report',
  SETTINGS = 'settings',
  BACKUP = 'backup',
  
  // Help Section
  HELP = 'help',
  ABOUT = 'about',
  SUPPORT = 'support'
}

export interface CRMFunctionalRibbon {
  section: CRMRibbonSection;
  actions: CRMRibbonAction[];
  isEnabled: boolean;
  isVisible: boolean;
}

export interface CRMContextAction {
  id: string;
  label: string;
  icon?: string;
  action: CRMRibbonAction;
  isEnabled: boolean;
  isVisible: boolean;
  requiresConfirmation?: boolean;
}

// --- Kontaktwochentage explizite Struktur ---
export interface ContactWeekdaysInterface {
  monday: ContactWeekday;
  tuesday: ContactWeekday;
  wednesday: ContactWeekday;
  thursday: ContactWeekday;
  friday: ContactWeekday;
  saturday: ContactWeekday;
  sunday: ContactWeekday;
}

export interface ContactWeekday {
  available: boolean;
  preferredTimeSlots: ContactTimeSlot[];
  notes?: string;
  isHoliday?: boolean;
}

export interface ContactTimeSlot {
  startTime: string; // Format: "09:00"
  endTime: string;   // Format: "17:00"
  isPreferred: boolean;
  notes?: string;
}

// --- Erweiterte Dokumentenmanagement-Typen ---
export enum DocumentCategory {
  CONTRACT = 'contract',
  INVOICE = 'invoice',
  OFFER = 'offer',
  ORDER = 'order',
  CERTIFICATE = 'certificate',
  CORRESPONDENCE = 'correspondence',
  TECHNICAL_DOC = 'technical_doc',
  FINANCIAL_DOC = 'financial_doc',
  OTHER = 'other'
}

export enum DocumentStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

export interface CustomerDocument {
  id: string;
  customerId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: DocumentCategory;
  status: DocumentStatus;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
  description?: string;
  tags?: string[];
  expiryDate?: string;
  version: string;
  isPublic: boolean;
  accessRights: DocumentAccessRights[];
}

export interface DocumentAccessRights {
  userId: string;
  userName: string;
  permissions: DocumentPermission[];
  grantedAt: string;
  grantedBy: string;
}

export enum DocumentPermission {
  VIEW = 'view',
  DOWNLOAD = 'download',
  EDIT = 'edit',
  DELETE = 'delete',
  SHARE = 'share'
}

// --- Erweiterte Analyse- und Umsatzfelder ---
export interface CustomerAnalysis {
  customerId: string;
  year: number;
  month?: number;
  
  // Umsatzdaten
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueGrowth: number; // Prozentuale Veränderung
  
  // Offene Posten
  openInvoices: number;
  overdueInvoices: number;
  overdueAmount: number;
  averagePaymentTime: number; // in Tagen
  
  // Kreditdaten
  creditLimit: number;
  creditUsed: number;
  creditUtilization: number; // Prozent
  
  // Aktivitätsdaten
  lastOrderDate?: string;
  lastContactDate?: string;
  contactFrequency: number; // Kontakte pro Monat
  orderFrequency: number; // Bestellungen pro Monat
  
  // Kundenwert
  customerLifetimeValue: number;
  customerSegment: CustomerSegment;
  riskScore: number; // 1-10
  
  // Trenddaten
  revenueTrend: 'increasing' | 'decreasing' | 'stable';
  orderTrend: 'increasing' | 'decreasing' | 'stable';
  paymentTrend: 'improving' | 'worsening' | 'stable';
}

export enum CustomerSegment {
  PREMIUM = 'premium',
  REGULAR = 'regular',
  BASIC = 'basic',
  PROSPECT = 'prospect',
  INACTIVE = 'inactive'
}

// --- Erweiterte Streckengeschäfte ---
export interface DirectBusiness {
  id: string;
  customerId: string;
  description: string;
  orderNumber: string;
  date: string;
  amount: number;
  status: DirectBusinessStatus;
  
  // Erweiterte Felder
  type: DirectBusinessType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  dueDate?: string;
  completionDate?: string;
  
  // Finanzielle Details
  costPrice?: number;
  profitMargin?: number;
  commission?: number;
  
  // Dokumentation
  notes?: string;
  attachments?: string[];
  tags?: string[];
  
  // Metadaten
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export enum DirectBusinessStatus {
  OPEN = 'offen',
  IN_PROGRESS = 'in_bearbeitung',
  COMPLETED = 'abgeschlossen',
  CANCELLED = 'storniert',
  ON_HOLD = 'pausiert'
}

export enum DirectBusinessType {
  SALE = 'verkauf',
  PURCHASE = 'einkauf',
  EXCHANGE = 'tausch',
  CONSIGNMENT = 'konsignation',
  LEASING = 'leasing'
}

// --- Erweiterte Fremdbestände ---
export interface ExternalStock {
  id: string;
  customerId: string;
  productId: string;
  productName: string;
  quantity: number;
  location: string;
  
  // Erweiterte Felder
  unitPrice?: number;
  totalValue?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  
  // Status und Verfügbarkeit
  status: ExternalStockStatus;
  availability: 'available' | 'reserved' | 'damaged' | 'expired';
  expiryDate?: string;
  
  // Standortdetails
  warehouse?: string;
  shelf?: string;
  bin?: string;
  notes?: string;
  
  // Bewegungen
  lastMovementDate?: string;
  movementHistory?: StockMovement[];
  
  // Metadaten
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export enum ExternalStockStatus {
  ACTIVE = 'aktiv',
  INACTIVE = 'inaktiv',
  DISCONTINUED = 'eingestellt',
  TEMPORARY = 'temporär'
}

export interface StockMovement {
  id: string;
  stockId: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference?: string; // Bestellnummer, Lieferschein, etc.
  date: string;
  performedBy: string;
  notes?: string;
}

// --- Erweiterte Kommunikationshistorie ---
export interface CustomerCommunication {
  id: string;
  customerId: string;
  type: CommunicationType;
  subject: string;
  content: string;
  date: string;
  from: string;
  to: string;
  relatedContactPersonId?: string;
  
  // Erweiterte Felder
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: CommunicationStatus;
  outcome: CommunicationOutcome;
  
  // Follow-up
  followUpDate?: string;
  followUpAction?: string;
  followUpCompleted?: boolean;
  
  // Anhänge
  attachments?: CommunicationAttachment[];
  
  // Tags und Kategorien
  tags?: string[];
  category?: string;
  
  // Metadaten
  duration?: number; // in Minuten
  cost?: number;
  createdBy: string;
  updatedAt: string;
}

export enum CommunicationType {
  EMAIL = 'email',
  PHONE = 'phone',
  WHATSAPP = 'whatsapp',
  FAX = 'fax',
  LETTER = 'letter',
  MEETING = 'meeting',
  VISIT = 'visit',
  VIDEO_CALL = 'video_call',
  CHAT = 'chat',
  OTHER = 'other'
}

export enum CommunicationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  RESPONDED = 'responded',
  FAILED = 'failed'
}

export enum CommunicationOutcome {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  FOLLOW_UP_REQUIRED = 'follow_up_required',
  RESOLVED = 'resolved'
}

export interface CommunicationAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: string;
}

// --- Erweiterte Kontaktpersonen ---
export interface ContactPerson {
  id: string;
  customerId: string;
  
  // Persönliche Daten
  salutation: 'Herr' | 'Frau' | 'Divers';
  firstName: string;
  lastName: string;
  position: string;
  department?: string;
  birthDate?: string;
  
  // Kontaktdaten (konsistente Property-Namen)
  phone1: string;
  phone2?: string;
  fax?: string;
  email?: string;
  mobile?: string;
  whatsapp?: string;
  
  // Erweiterte Kontaktdaten
  skype?: string;
  linkedin?: string;
  website?: string;
  
  // Kontaktzeiten (vereinfachte Struktur)
  contactSchedule: {
    monday: ContactTime;
    tuesday: ContactTime;
    wednesday: ContactTime;
    thursday: ContactTime;
    friday: ContactTime;
    saturday: ContactTime;
    sunday: ContactTime;
  };
  
  // Status und Rollen (konsistente Property-Namen)
  isMainContact: boolean;
  isActive: boolean;
  role: ContactRole;
  permissions: ContactPermission[];
  
  // Notizen und Tags
  notes?: string;
  tags?: string[];
  
  // Metadaten
  createdAt: string;
  updatedAt: string;
  lastContactDate?: string;
  createdBy: string;
}

export enum ContactRole {
  DECISION_MAKER = 'entscheider',
  INFLUENCER = 'beeinflusser',
  USER = 'anwender',
  TECHNICAL_CONTACT = 'technischer_ansprechpartner',
  BILLING_CONTACT = 'rechnungsansprechpartner',
  OTHER = 'sonstiger'
}

export enum ContactPermission {
  VIEW_ORDERS = 'view_orders',
  PLACE_ORDERS = 'place_orders',
  VIEW_INVOICES = 'view_invoices',
  VIEW_DOCUMENTS = 'view_documents',
  RECEIVE_COMMUNICATIONS = 'receive_communications',
  MANAGE_CONTACTS = 'manage_contacts'
}

export interface Customer {
  id: string;
  customerNumber: string;
  debtorAccount: string;
  customerGroup: string;
  salesRep: string;
  dispatcher: string;
  creditLimit: number;
  
  // Allgemeine Informationen
  name: string;
  address: {
    street: string;
    zipCode: string;
    city: string;
    postBox?: string;
    country?: string;
    state?: string;
  };
  
  // Kommunikationsdaten
  phone: string;
  fax?: string;
  email?: string;
  homepage?: string;
  
  // Erweiterte Kontaktdaten
  whatsapp?: string;
  skype?: string;
  linkedin?: string;
  twitter?: string;
  
  // Status und Metadaten
  status: 'active' | 'inactive' | 'prospect';
  createdAt: string;
  updatedAt: string;
  lastContact?: string;
  
  // CRM-spezifische Felder
  totalRevenue: number;
  openInvoices: number;
  creditUsed: number;
  paymentTerms: string;
  discountGroup?: string;
  
  // Erweiterte Geschäftsdaten
  industry?: string;
  companySize?: 'small' | 'medium' | 'large' | 'enterprise';
  annualRevenue?: number;
  employeeCount?: number;
  taxNumber?: string;
  vatNumber?: string;
  
  // Kundenklassifizierung
  customerSegment: CustomerSegment;
  riskScore: number; // 1-10
  priority: 'low' | 'medium' | 'high' | 'vip';
  
  // Erweiterte Adressdaten
  billingAddress?: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
    isSameAsMain: boolean;
  };
  
  shippingAddress?: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
    isSameAsMain: boolean;
  };

  // --- UI Tabs & Funktionsleisten ---
  documents?: CustomerDocument[];
  communications?: CustomerCommunication[];
  analysis?: CustomerAnalysis;
  directBusinesses?: DirectBusiness[];
  externalStocks?: ExternalStock[];
  
  // Erweiterte Beziehungen
  contactPersons?: ContactPerson[];
  deals?: Deal[];
  offers?: Offer[];
  orders?: Order[];
  invoices?: Invoice[];
  reminders?: Reminder[];
  purchaseOffers?: PurchaseOffer[];
  externalInventory?: ExternalInventory[];
  
  // Vertriebsakte
  salesHistory?: SalesHistory;
}

export interface ContactTime {
  available: boolean;
  startTime?: string; // Format: "09:00"
  endTime?: string;   // Format: "17:00"
  notes?: string;
}

export interface ContactHistory {
  id: string;
  customerId: string;
  contactPersonId?: string;
  
  type: 'phone' | 'email' | 'whatsapp' | 'meeting' | 'visit' | 'other';
  subject: string;
  description: string;
  date: string;
  duration?: number; // in minutes
  outcome: 'positive' | 'neutral' | 'negative' | 'follow_up';
  
  // Follow-up
  followUpDate?: string;
  followUpAction?: string;
  
  createdBy: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  customerId: string;
  dealId?: string;
  offerNumber: string;
  
  // Angebotsdaten
  title: string;
  description?: string;
  validFrom: string;
  validUntil: string;
  
  // Vertriebsdaten
  salesRep: string;
  assignedTo?: string;
  leadSource?: string;
  
  // Lieferung & Baustelle
  plannedDeliveryDate?: string;
  constructionSite?: string;
  deliveryAddress?: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
    notes?: string;
  };
  
  // Preise
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  
  // Status & Workflow
  status: OfferStatus;
  stage: OfferStage;
  probability: number; // 0-100%
  
  // Verknüpfungen
  convertedToOrder?: string; // Order ID
  relatedOrders: Order[];
  
  // Metadaten
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
  
  // Items
  items: OfferItem[];
  
  // Dokumentation
  attachments?: string[];
  notes?: string;
  tags?: string[];
}

export interface OfferItem {
  id: string;
  offerId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  dealId?: string;
  offerId?: string;
  orderNumber: string;
  
  // Auftragsdaten
  title: string;
  description?: string;
  orderDate: string;
  
  // Lieferung & Baustelle
  plannedDeliveryDate?: string;
  requestedDeliveryDate?: string;
  confirmedDeliveryDate?: string;
  constructionSite?: string;
  deliveryAddress?: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
    contactPerson?: string;
    phone?: string;
    notes?: string;
  };
  
  // Preise
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  
  // Status & Workflow
  status: OrderStatus;
  stage: OrderStage;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Vertriebsdaten
  salesRep: string;
  assignedTo?: string;
  
  // Lager & Verfügbarkeit
  inventoryStatus: InventoryStatus;
  availabilityCheckDate?: string;
  stockReserved: boolean;
  
  // Verknüpfungen
  deliveries: DeliveryNote[];
  invoices: Invoice[];
  
  // Metadaten
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
  
  // Items
  items: OrderItem[];
  
  // Dokumentation
  attachments?: string[];
  notes?: string;
  tags?: string[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  totalPrice: number;
  deliveredQuantity: number;
}

export interface DeliveryNote {
  id: string;
  customerId: string;
  orderId: string;
  deliveryNumber: string;
  
  // Lieferschein-Daten
  deliveryDate: string;
  deliveryAddress?: string;
  notes?: string;
  
  // Status
  status: 'draft' | 'sent' | 'delivered' | 'confirmed';
  
  // Metadaten
  createdBy: string;
  createdAt: string;
  
  // Items
  items: DeliveryItem[];
}

export interface DeliveryItem {
  id: string;
  deliveryId: string;
  productId: string;
  productName: string;
  quantity: number;
  deliveredQuantity: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  orderId?: string;
  invoiceNumber: string;
  
  // Rechnungsdaten
  invoiceDate: string;
  dueDate: string;
  paymentDate?: string;
  
  // Preise
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  
  // Status
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  
  // Metadaten
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Items
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  totalPrice: number;
}

export interface Reminder {
  id: string;
  customerId: string;
  invoiceId: string;
  reminderNumber: string;
  
  // Mahnungsdaten
  reminderDate: string;
  dueDate: string;
  reminderLevel: 1 | 2 | 3; // 1. Mahnung, 2. Mahnung, etc.
  
  // Kosten
  reminderFee: number;
  totalAmount: number;
  
  // Status
  status: 'sent' | 'paid' | 'escalated';
  
  // Metadaten
  createdBy: string;
  createdAt: string;
}

export interface PurchaseOffer {
  id: string;
  customerId: string;
  purchaseOfferNumber: string;
  
  // Kaufangebots-Daten
  title: string;
  description?: string;
  validFrom: string;
  validUntil: string;
  
  // Preise
  totalAmount: number;
  
  // Status
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  
  // Metadaten
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Items
  items: PurchaseOfferItem[];
}

export interface PurchaseOfferItem {
  id: string;
  purchaseOfferId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ExternalInventory {
  id: string;
  customerId: string;
  productId: string;
  productName: string;
  
  // Fremdbestands-Daten
  quantity: number;
  location: string;
  notes?: string;
  
  // Metadaten
  createdAt: string;
  updatedAt: string;
}

// --- Dokumentenmanagement & Kommunikation ---

export interface CustomerDocument {
  id: string;
  customerId: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
  description?: string;
}



// --- Analyse/Umsatzdaten ---

export interface CustomerAnalysis {
  customerId: string;
  year: number;
  totalRevenue: number;
  openInvoices: number;
  overdueInvoices: number;
  creditLimit: number;
  creditUsed: number;
  lastOrderDate?: string;
  lastContactDate?: string;
}

// --- Streckengeschäfte, Fremdbestände, etc. ---



export interface ExternalStock {
  id: string;
  customerId: string;
  productId: string;
  productName: string;
  quantity: number;
  location: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Dashboard-Integration & UI-Konfiguration ---

export interface CRMTabConfig {
  id: CRMMainTab;
  label: string;
  icon: React.ReactElement;
  component: React.ComponentType<any>;
  subTabs: Array<{
    id: CRMSubTab;
    label: string;
  }>;
  isEnabled?: boolean;
  isVisible?: boolean;
  order?: number;
  badge?: string | number;
}

export interface CRMCustomerViewConfig {
  tabs: CRMTabConfig[];
  ribbon: CRMFunctionalRibbon[];
  contextActions: CRMContextAction[];
  defaultTab: CRMMainTab;
  defaultSubTab: CRMSubTab;
}

// --- CRM Dashboard Widgets ---
export interface CRMDashboardWidget {
  id: string;
  type: CRMWidgetType;
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: CRMWidgetConfig;
  isEnabled: boolean;
  refreshInterval?: number; // in Sekunden
}

export enum CRMWidgetType {
  CUSTOMER_OVERVIEW = 'customer_overview',
  RECENT_ACTIVITIES = 'recent_activities',
  REVENUE_CHART = 'revenue_chart',
  TASK_LIST = 'task_list',
  ALERTS = 'alerts',
  QUICK_ACTIONS = 'quick_actions',
  CUSTOMER_SEARCH = 'customer_search',
  ANALYTICS = 'analytics'
}

export interface CRMWidgetConfig {
  customerId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
  displayOptions?: Record<string, any>;
}

// --- CRM Task Management ---
export interface CRMTask {
  id: string;
  customerId?: string;
  contactPersonId?: string;
  title: string;
  description?: string;
  type: CRMTaskType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: CRMTaskStatus;
  assignedTo?: string;
  dueDate?: string;
  completedDate?: string;
  estimatedDuration?: number; // in Minuten
  actualDuration?: number; // in Minuten
  tags?: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export enum CRMTaskType {
  CALL = 'call',
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  MEETING = 'meeting',
  VISIT = 'visit',
  FOLLOW_UP = 'follow_up',
  DOCUMENT_REVIEW = 'document_review',
  OFFER_PREPARATION = 'offer_preparation',
  OTHER = 'other'
}

export enum CRMTaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

// --- CRM Alert System ---
export interface CRMAlert {
  id: string;
  customerId?: string;
  type: CRMAlertType;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  isRead: boolean;
  isDismissed: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
  createdBy: string;
}

export enum CRMAlertType {
  CREDIT_LIMIT_EXCEEDED = 'credit_limit_exceeded',
  PAYMENT_OVERDUE = 'payment_overdue',
  CONTRACT_EXPIRING = 'contract_expiring',
  TASK_OVERDUE = 'task_overdue',
  CUSTOMER_INACTIVE = 'customer_inactive',
  REVENUE_DECLINE = 'revenue_decline',
  SYSTEM_NOTIFICATION = 'system_notification'
}

// CRM Filter & Search Types
export interface CustomerFilter {
  search?: string;
  customerGroup?: string;
  salesRep?: string;
  status?: string;
  customerSegment?: CustomerSegment;
  priority?: 'low' | 'medium' | 'high' | 'vip';
  industry?: string;
  companySize?: 'small' | 'medium' | 'large' | 'enterprise';
  creditLimit?: {
    min?: number;
    max?: number;
  };
  lastContact?: {
    from?: string;
    to?: string;
  };
  createdAt?: {
    from?: string;
    to?: string;
  };
  totalRevenue?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
  hasOpenInvoices?: boolean;
  hasOverdueInvoices?: boolean;
  hasActiveTasks?: boolean;
}

export interface ContactPersonFilter {
  search?: string;
  role?: ContactRole;
  isMainContact?: boolean;
  isActive?: boolean;
  department?: string;
  hasEmail?: boolean;
  hasPhone?: boolean;
  lastContact?: {
    from?: string;
    to?: string;
  };
}

export interface TaskFilter {
  search?: string;
  type?: CRMTaskType;
  status?: CRMTaskStatus;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  customerId?: string;
  dueDate?: {
    from?: string;
    to?: string;
  };
  tags?: string[];
}

export interface CommunicationFilter {
  search?: string;
  type?: CommunicationType;
  status?: CommunicationStatus;
  outcome?: CommunicationOutcome;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  from?: string;
  to?: string;
  date?: {
    from?: string;
    to?: string;
  };
  tags?: string[];
  category?: string;
}

export interface DocumentFilter {
  search?: string;
  category?: DocumentCategory;
  status?: DocumentStatus;
  uploadedBy?: string;
  uploadedAt?: {
    from?: string;
    to?: string;
  };
  tags?: string[];
  isPublic?: boolean;
}

export interface DirectBusinessFilter {
  search?: string;
  type?: DirectBusinessType;
  status?: DirectBusinessStatus;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  date?: {
    from?: string;
    to?: string;
  };
  amount?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
}

export interface ExternalStockFilter {
  search?: string;
  status?: ExternalStockStatus;
  availability?: 'available' | 'reserved' | 'damaged' | 'expired';
  warehouse?: string;
  location?: string;
  quantity?: {
    min?: number;
    max?: number;
  };
  expiryDate?: {
    from?: string;
    to?: string;
  };
}

// --- CRM Search & Analytics ---
export interface CRMSearchResult {
  customers: Customer[];
  contactPersons: ContactPerson[];
  tasks: CRMTask[];
  communications: CustomerCommunication[];
  documents: CustomerDocument[];
  totalResults: number;
  searchTime: number;
  suggestions?: string[];
}

export interface CRMAnalytics {
  customerCount: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  totalRevenue: number;
  averageOrderValue: number;
  openInvoices: number;
  overdueInvoices: number;
  activeTasks: number;
  overdueTasks: number;
  topCustomers: Customer[];
  recentActivities: (CustomerCommunication | CRMTask)[];
  revenueTrend: {
    labels: string[];
    data: number[];
  };
  customerSegments: {
    segment: CustomerSegment;
    count: number;
    revenue: number;
  }[];
}

// CRM Form Types
export interface CustomerFormData {
  customerNumber: string;
  debtorAccount: string;
  customerGroup: string;
  salesRep: string;
  dispatcher: string;
  creditLimit: number;
  name: string;
  street: string;
  zipCode: string;
  city: string;
  postBox?: string;
  country?: string;
  state?: string;
  phone: string;
  fax?: string;
  email?: string;
  homepage?: string;
  skype?: string;
  linkedin?: string;
  twitter?: string;
  status: 'active' | 'inactive' | 'prospect';
  paymentTerms: string;
  discountGroup?: string;
  industry?: string;
  companySize?: 'small' | 'medium' | 'large' | 'enterprise';
  annualRevenue?: number;
  employeeCount?: number;
  taxNumber?: string;
  vatNumber?: string;
  customerSegment: CustomerSegment;
  riskScore: number;
  priority: 'low' | 'medium' | 'high' | 'vip';
  
  // Adressdaten
  billingAddress?: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
    isSameAsMain: boolean;
  };
  shippingAddress?: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
    isSameAsMain: boolean;
  };
}

// --- MAPPING FUNKTIONEN FÜR CUSTOMER ---
export const mapApiCustomerToFormData = (apiCustomer: Customer): CustomerFormData => ({
  // Grunddaten
  customerNumber: apiCustomer.customerNumber,
  debtorAccount: apiCustomer.debtorAccount,
  customerGroup: apiCustomer.customerGroup,
  salesRep: apiCustomer.salesRep,
  dispatcher: apiCustomer.dispatcher,
  creditLimit: apiCustomer.creditLimit,
  name: apiCustomer.name,
  
  // Adressdaten
  street: apiCustomer.address.street,
  zipCode: apiCustomer.address.zipCode,
  city: apiCustomer.address.city,
  postBox: apiCustomer.address.postBox,
  country: apiCustomer.address.country,
  state: apiCustomer.address.state,
  
  // Kontaktdaten
  phone: apiCustomer.phone,
  fax: apiCustomer.fax,
  email: apiCustomer.email,
  homepage: apiCustomer.homepage,
  skype: apiCustomer.skype,
  linkedin: apiCustomer.linkedin,
  twitter: apiCustomer.whatsapp, // Mapping von whatsapp zu twitter für Formular
  
  // Status und Klassifizierung
  status: apiCustomer.status,
  paymentTerms: apiCustomer.paymentTerms,
  discountGroup: apiCustomer.discountGroup,
  industry: apiCustomer.industry,
  companySize: apiCustomer.companySize,
  annualRevenue: apiCustomer.annualRevenue,
  employeeCount: apiCustomer.employeeCount,
  taxNumber: apiCustomer.taxNumber,
  vatNumber: apiCustomer.vatNumber,
  customerSegment: apiCustomer.customerSegment,
  riskScore: apiCustomer.riskScore,
  priority: apiCustomer.priority,
  
  // Erweiterte Adressdaten
  billingAddress: apiCustomer.billingAddress,
  shippingAddress: apiCustomer.shippingAddress
});

export const mapFormDataToApiCustomer = (formData: CustomerFormData, customerId: string): Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'lastContact' | 'totalRevenue' | 'openInvoices' | 'creditUsed' | 'documents' | 'communications' | 'analysis' | 'directBusinesses' | 'externalStocks' | 'contactPersons' | 'deals' | 'offers' | 'orders' | 'invoices' | 'reminders' | 'purchaseOffers' | 'externalInventory' | 'salesHistory'> => ({
  customerNumber: formData.customerNumber,
  debtorAccount: formData.debtorAccount,
  customerGroup: formData.customerGroup,
  salesRep: formData.salesRep,
  dispatcher: formData.dispatcher,
  creditLimit: formData.creditLimit,
  name: formData.name,
  
  // Adressdaten
  address: {
    street: formData.street,
    zipCode: formData.zipCode,
    city: formData.city,
    postBox: formData.postBox,
    country: formData.country,
    state: formData.state
  },
  
  // Kontaktdaten
  phone: formData.phone,
  fax: formData.fax,
  email: formData.email,
  homepage: formData.homepage,
  whatsapp: formData.twitter, // Mapping von twitter zu whatsapp für API
  skype: formData.skype,
  linkedin: formData.linkedin,
  
  // Status und Klassifizierung
  status: formData.status,
  paymentTerms: formData.paymentTerms,
  discountGroup: formData.discountGroup,
  industry: formData.industry,
  companySize: formData.companySize,
  annualRevenue: formData.annualRevenue,
  employeeCount: formData.employeeCount,
  taxNumber: formData.taxNumber,
  vatNumber: formData.vatNumber,
  customerSegment: formData.customerSegment,
  riskScore: formData.riskScore,
  priority: formData.priority,
  
  // Erweiterte Adressdaten
  billingAddress: formData.billingAddress,
  shippingAddress: formData.shippingAddress
});

// --- INITIALWERTE FÜR CUSTOMER FORM DATA ---
export const getInitialCustomerFormData = (): CustomerFormData => ({
  // Grunddaten
  customerNumber: '',
  debtorAccount: '',
  customerGroup: '',
  salesRep: '',
  dispatcher: '',
  creditLimit: 0,
  name: '',
  
  // Adressdaten
  street: '',
  zipCode: '',
  city: '',
  postBox: '',
  country: 'Deutschland',
  state: '',
  
  // Kontaktdaten
  phone: '',
  fax: '',
  email: '',
  homepage: '',
  skype: '',
  linkedin: '',
  twitter: '',
  
  // Status und Klassifizierung
  status: 'active',
  paymentTerms: '',
  discountGroup: '',
  industry: '',
  companySize: 'medium',
  annualRevenue: 0,
  employeeCount: 0,
  taxNumber: '',
  vatNumber: '',
  customerSegment: CustomerSegment.REGULAR,
  riskScore: 5,
  priority: 'medium',
  
  // Erweiterte Adressdaten
  billingAddress: {
    street: '',
    zipCode: '',
    city: '',
    country: 'Deutschland',
    isSameAsMain: true
  },
  shippingAddress: {
    street: '',
    zipCode: '',
    city: '',
    country: 'Deutschland',
    isSameAsMain: true
  }
});

// --- EINDEUTIGE FORM-DATEN TYPEN FÜR CONTACT PERSON ---
export interface ContactPersonFormData {
  // Persönliche Daten
  salutation: 'Herr' | 'Frau' | 'Divers';
  firstName: string;
  lastName: string;
  position: string;
  department?: string;
  birthDate?: string;
  
  // Kontaktdaten (explizit, keine Partial<T>)
  phone1: string;
  phone2?: string;
  fax?: string;
  email?: string;
  mobile?: string;
  whatsapp?: string;
  skype?: string;
  linkedin?: string;
  website?: string;
  
  // Status und Rollen
  isMainContact: boolean;
  isActive: boolean;
  role: ContactRole;
  permissions: ContactPermission[];
  
  // Notizen und Tags
  notes?: string;
  tags?: string[];
  
  // Kontaktzeiten (vereinfacht)
  contactSchedule: {
    monday: ContactTime;
    tuesday: ContactTime;
    wednesday: ContactTime;
    thursday: ContactTime;
    friday: ContactTime;
    saturday: ContactTime;
    sunday: ContactTime;
  };
}

// --- MAPPING FUNKTIONEN FÜR CONTACT PERSON ---
export const mapApiContactToFormData = (apiContact: ContactPerson): ContactPersonFormData => ({
  salutation: apiContact.salutation,
  firstName: apiContact.firstName,
  lastName: apiContact.lastName,
  position: apiContact.position,
  department: apiContact.department,
  birthDate: apiContact.birthDate,
  phone1: apiContact.phone1,
  phone2: apiContact.phone2,
  fax: apiContact.fax,
  email: apiContact.email,
  mobile: apiContact.mobile,
  whatsapp: apiContact.whatsapp,
  skype: apiContact.skype,
  linkedin: apiContact.linkedin,
  website: apiContact.website,
  isMainContact: apiContact.isMainContact,
  isActive: apiContact.isActive,
  role: apiContact.role,
  permissions: apiContact.permissions,
  notes: apiContact.notes,
  tags: apiContact.tags,
  contactSchedule: apiContact.contactSchedule
});

export const mapFormDataToApiContact = (formData: ContactPersonFormData, customerId: string): Omit<ContactPerson, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> => ({
  customerId,
  salutation: formData.salutation,
  firstName: formData.firstName,
  lastName: formData.lastName,
  position: formData.position,
  department: formData.department,
  birthDate: formData.birthDate,
  phone1: formData.phone1,
  phone2: formData.phone2,
  fax: formData.fax,
  email: formData.email,
  mobile: formData.mobile,
  whatsapp: formData.whatsapp,
  skype: formData.skype,
  linkedin: formData.linkedin,
  website: formData.website,
  isMainContact: formData.isMainContact,
  isActive: formData.isActive,
  role: formData.role,
  permissions: formData.permissions,
  notes: formData.notes,
  tags: formData.tags,
  contactSchedule: formData.contactSchedule
});

// --- INITIALWERTE FÜR CONTACT PERSON FORMULAR ---
export const getInitialContactFormData = (): ContactPersonFormData => ({
  salutation: 'Herr',
  firstName: '',
  lastName: '',
  position: '',
  department: '',
  birthDate: '',
  phone1: '',
  phone2: '',
  fax: '',
  email: '',
  mobile: '',
  whatsapp: '',
  skype: '',
  linkedin: '',
  website: '',
  isMainContact: false,
  isActive: true,
  role: ContactRole.OTHER,
  permissions: [],
  notes: '',
  tags: [],
  contactSchedule: {
    monday: { available: false, startTime: '09:00', endTime: '17:00', notes: '' },
    tuesday: { available: false, startTime: '09:00', endTime: '17:00', notes: '' },
    wednesday: { available: false, startTime: '09:00', endTime: '17:00', notes: '' },
    thursday: { available: false, startTime: '09:00', endTime: '17:00', notes: '' },
    friday: { available: false, startTime: '09:00', endTime: '17:00', notes: '' },
    saturday: { available: false, startTime: '09:00', endTime: '17:00', notes: '' },
    sunday: { available: false, startTime: '09:00', endTime: '17:00', notes: '' }
  }
});

// --- UTILITY FUNKTIONEN ---
export const getWeekdayLabels = () => ({
  monday: 'Montag',
  tuesday: 'Dienstag', 
  wednesday: 'Mittwoch',
  thursday: 'Donnerstag',
  friday: 'Freitag',
  saturday: 'Samstag',
  sunday: 'Sonntag'
});

export const getWeekdayArray = () => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

// --- Erweiterte Form-Typen ---
export interface TaskFormData {
  title: string;
  description?: string;
  type: CRMTaskType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  dueDate?: string;
  estimatedDuration?: number;
  tags?: string[];
  customerId?: string;
  contactPersonId?: string;
}

// Mapping-Funktionen für Task
export const mapApiTaskToFormData = (apiTask: CRMTask): TaskFormData => ({
  title: apiTask.title,
  description: apiTask.description || '',
  type: apiTask.type,
  priority: apiTask.priority,
  assignedTo: apiTask.assignedTo || '',
  dueDate: apiTask.dueDate || '',
  estimatedDuration: apiTask.estimatedDuration || 0,
  tags: apiTask.tags || [],
  customerId: apiTask.customerId || '',
  contactPersonId: apiTask.contactPersonId || ''
});

export const mapFormDataToApiTask = (formData: TaskFormData, taskId: string): Omit<CRMTask, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status' | 'completedDate' | 'actualDuration' | 'attachments'> => ({
  customerId: formData.customerId || undefined,
  contactPersonId: formData.contactPersonId || undefined,
  title: formData.title,
  description: formData.description || undefined,
  type: formData.type,
  priority: formData.priority,
  assignedTo: formData.assignedTo || undefined,
  dueDate: formData.dueDate || undefined,
  estimatedDuration: formData.estimatedDuration || undefined,
  tags: formData.tags || []
});

export const getInitialTaskFormData = (): TaskFormData => ({
  title: '',
  description: '',
  type: CRMTaskType.OTHER,
  priority: 'medium',
  assignedTo: '',
  dueDate: '',
  estimatedDuration: 0,
  tags: [],
  customerId: '',
  contactPersonId: ''
});

export interface CommunicationFormData {
  type: CommunicationType;
  subject: string;
  content: string;
  from: string;
  to: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedContactPersonId?: string;
  followUpDate?: string;
  followUpAction?: string;
  tags?: string[];
  category?: string;
  attachments?: File[];
}

export interface DocumentFormData {
  fileName: string;
  fileType: string;
  category: DocumentCategory;
  description?: string;
  tags?: string[];
  expiryDate?: string;
  isPublic: boolean;
  accessRights: DocumentAccessRights[];
}

export interface DirectBusinessFormData {
  description: string;
  orderNumber: string;
  date: string;
  amount: number;
  type: DirectBusinessType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  dueDate?: string;
  costPrice?: number;
  profitMargin?: number;
  commission?: number;
  notes?: string;
  tags?: string[];
}

export interface ExternalStockFormData {
  productId: string;
  productName: string;
  quantity: number;
  location: string;
  unitPrice?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  status: ExternalStockStatus;
  availability: 'available' | 'reserved' | 'damaged' | 'expired';
  expiryDate?: string;
  warehouse?: string;
  shelf?: string;
  bin?: string;
  notes?: string;
} 

// --- Vertriebs- & Deal-Management (basierend auf zvoove) ---
export enum DealStage {
  PROSPECT = 'prospect',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
  DELIVERED = 'delivered',
  PAID = 'paid'
}

export enum DealType {
  NEW_BUSINESS = 'new_business',
  EXISTING_BUSINESS = 'existing_business',
  UPSELL = 'upsell',
  CROSS_SELL = 'cross_sell',
  RENEWAL = 'renewal'
}

export interface Deal {
  id: string;
  customerId: string;
  dealNumber: string;
  title: string;
  description?: string;
  
  // Deal-Management
  stage: DealStage;
  type: DealType;
  probability: number; // 0-100%
  expectedCloseDate: string;
  actualCloseDate?: string;
  
  // Finanzielle Daten
  estimatedValue: number;
  actualValue?: number;
  currency: string;
  
  // Vertriebsdaten
  salesRep: string;
  assignedTo?: string;
  leadSource?: string;
  
  // Workflow & Status
  isActive: boolean;
  lastActivityDate?: string;
  nextFollowUpDate?: string;
  
  // Verknüpfungen
  offers: Offer[];
  orders: Order[];
  activities: DealActivity[];
  
  // Metadaten
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface DealActivity {
  id: string;
  dealId: string;
  type: DealActivityType;
  subject: string;
  description?: string;
  date: string;
  duration?: number; // in Minuten
  
  // Ergebnis & Follow-up
  outcome: DealActivityOutcome;
  nextAction?: string;
  nextActionDate?: string;
  
  // Beteiligte
  participants: string[];
  createdBy: string;
  createdAt: string;
}

export enum DealActivityType {
  CALL = 'call',
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  MEETING = 'meeting',
  PRESENTATION = 'presentation',
  DEMO = 'demo',
  SITE_VISIT = 'site_visit',
  PROPOSAL_SENT = 'proposal_sent',
  NEGOTIATION = 'negotiation',
  CLOSING = 'closing'
}

export enum DealActivityOutcome {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  SCHEDULED_FOLLOW_UP = 'scheduled_follow_up',
  DEAL_CLOSED = 'deal_closed',
  DEAL_LOST = 'deal_lost'
}

// --- Erweiterte Angebotsverwaltung (zvoove-Inspiriert) ---
export interface Offer {
  id: string;
  customerId: string;
  dealId?: string;
  offerNumber: string;
  
  // Angebotsdaten
  title: string;
  description?: string;
  validFrom: string;
  validUntil: string;
  
  // Vertriebsdaten
  salesRep: string;
  assignedTo?: string;
  leadSource?: string;
  
  // Lieferung & Baustelle
  plannedDeliveryDate?: string;
  constructionSite?: string;
  deliveryAddress?: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
    notes?: string;
  };
  
  // Preise
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  
  // Status & Workflow
  status: OfferStatus;
  stage: OfferStage;
  probability: number; // 0-100%
  
  // Verknüpfungen
  convertedToOrder?: string; // Order ID
  relatedOrders: Order[];
  
  // Metadaten
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
  
  // Items
  items: OfferItem[];
  
  // Dokumentation
  attachments?: string[];
  notes?: string;
  tags?: string[];
}

export enum OfferStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  NEGOTIATING = 'negotiating',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CONVERTED = 'converted'
}

export enum OfferStage {
  PREPARATION = 'preparation',
  SENT = 'sent',
  FOLLOW_UP = 'follow_up',
  NEGOTIATION = 'negotiation',
  CLOSING = 'closing',
  CLOSED = 'closed'
}

// --- Erweiterte Auftragsverwaltung (zvoove-Inspiriert) ---
export interface Order {
  id: string;
  customerId: string;
  dealId?: string;
  offerId?: string;
  orderNumber: string;
  
  // Auftragsdaten
  title: string;
  description?: string;
  orderDate: string;
  
  // Lieferung & Baustelle
  plannedDeliveryDate?: string;
  requestedDeliveryDate?: string;
  confirmedDeliveryDate?: string;
  constructionSite?: string;
  deliveryAddress?: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
    contactPerson?: string;
    phone?: string;
    notes?: string;
  };
  
  // Preise
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  
  // Status & Workflow
  status: OrderStatus;
  stage: OrderStage;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Vertriebsdaten
  salesRep: string;
  assignedTo?: string;
  
  // Lager & Verfügbarkeit
  inventoryStatus: InventoryStatus;
  availabilityCheckDate?: string;
  stockReserved: boolean;
  
  // Verknüpfungen
  deliveries: DeliveryNote[];
  invoices: Invoice[];
  
  // Metadaten
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
  
  // Items
  items: OrderItem[];
  
  // Dokumentation
  attachments?: string[];
  notes?: string;
  tags?: string[];
}

export enum SupplierOrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  IN_PRODUCTION = 'in_production',
  READY_FOR_DELIVERY = 'ready_for_delivery',
  PARTIALLY_DELIVERED = 'partially_delivered',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export enum OrderStage {
  CREATION = 'creation',
  CONFIRMATION = 'confirmation',
  PRODUCTION = 'production',
  DELIVERY = 'delivery',
  COMPLETION = 'completion'
}

export enum InventoryStatus {
  AVAILABLE = 'available',
  PARTIALLY_AVAILABLE = 'partially_available',
  NOT_AVAILABLE = 'not_available',
  ON_ORDER = 'on_order',
  BACKORDER = 'backorder'
}

// --- Vertriebsakte & Historie ---
export interface SalesHistory {
  customerId: string;
  deals: Deal[];
  offers: Offer[];
  orders: Order[];
  activities: DealActivity[];
  
  // Statistiken
  totalRevenue: number;
  totalOrders: number;
  totalOffers: number;
  conversionRate: number; // Angebot zu Auftrag
  averageOrderValue: number;
  
  // Trends
  revenueTrend: 'increasing' | 'decreasing' | 'stable';
  orderFrequency: number; // pro Monat
  lastOrderDate?: string;
  lastActivityDate?: string;
}

// --- Deal-Funnel & Pipeline ---
export interface SalesPipeline {
  id: string;
  name: string;
  description?: string;
  
  // Funnel-Stufen
  stages: PipelineStage[];
  
  // Statistiken
  totalDeals: number;
  totalValue: number;
  conversionRates: Record<DealStage, number>;
  
  // Metadaten
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PipelineStage {
  stage: DealStage;
  name: string;
  description?: string;
  order: number;
  probability: number; // 0-100%
  color?: string;
  isActive: boolean;
}

// --- Vertriebs-Dashboard Widgets ---
export interface SalesDashboardWidget {
  id: string;
  type: SalesWidgetType;
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: SalesWidgetConfig;
  isEnabled: boolean;
  refreshInterval?: number;
}

export enum SalesWidgetType {
  DEAL_PIPELINE = 'deal_pipeline',
  SALES_FUNNEL = 'sales_funnel',
  REVENUE_FORECAST = 'revenue_forecast',
  TOP_DEALS = 'top_deals',
  SALES_ACTIVITIES = 'sales_activities',
  OFFER_CONVERSION = 'offer_conversion',
  ORDER_STATUS = 'order_status',
  SALES_PERFORMANCE = 'sales_performance'
}

export interface SalesWidgetConfig {
  customerId?: string;
  salesRep?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  pipelineId?: string;
  filters?: Record<string, any>;
  displayOptions?: Record<string, any>;
}

// --- Vertriebs-Filter & Suche ---
export interface DealFilter {
  search?: string;
  stage?: DealStage;
  type?: DealType;
  salesRep?: string;
  assignedTo?: string;
  probability?: {
    min?: number;
    max?: number;
  };
  estimatedValue?: {
    min?: number;
    max?: number;
  };
  expectedCloseDate?: {
    from?: string;
    to?: string;
  };
  isActive?: boolean;
  tags?: string[];
}

export interface OfferFilter {
  search?: string;
  status?: OfferStatus;
  stage?: OfferStage;
  salesRep?: string;
  assignedTo?: string;
  validFrom?: {
    from?: string;
    to?: string;
  };
  validUntil?: {
    from?: string;
    to?: string;
  };
  totalAmount?: {
    min?: number;
    max?: number;
  };
  convertedToOrder?: boolean;
  tags?: string[];
}

export interface OrderFilter {
  search?: string;
  status?: OrderStatus;
  stage?: OrderStage;
  salesRep?: string;
  assignedTo?: string;
  orderDate?: {
    from?: string;
    to?: string;
  };
  plannedDeliveryDate?: {
    from?: string;
    to?: string;
  };
  totalAmount?: {
    min?: number;
    max?: number;
  };
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  inventoryStatus?: InventoryStatus;
  tags?: string[];
}

// --- Vertriebs-Formulare ---
export interface DealFormData {
  title: string;
  description?: string;
  stage: DealStage;
  type: DealType;
  probability: number;
  expectedCloseDate: string;
  estimatedValue: number;
  currency: string;
  salesRep: string;
  assignedTo?: string;
  leadSource?: string;
  isActive: boolean;
  nextFollowUpDate?: string;
  tags?: string[];
}

export interface OfferFormData {
  title: string;
  description?: string;
  validFrom: string;
  validUntil: string;
  salesRep: string;
  assignedTo?: string;
  leadSource?: string;
  plannedDeliveryDate?: string;
  constructionSite?: string;
  deliveryAddress?: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
    notes?: string;
  };
  currency: string;
  status: OfferStatus;
  stage: OfferStage;
  probability: number;
  tags?: string[];
  notes?: string;
}

export interface OrderFormData {
  title: string;
  description?: string;
  orderDate: string;
  salesRep: string;
  assignedTo?: string;
  plannedDeliveryDate?: string;
  requestedDeliveryDate?: string;
  constructionSite?: string;
  deliveryAddress?: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
    contactPerson?: string;
    phone?: string;
    notes?: string;
  };
  currency: string;
  status: OrderStatus;
  stage: OrderStage;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  notes?: string;
}

// --- Vertriebs-Analytics ---
export interface SalesAnalytics {
  // Pipeline-Metriken
  totalDeals: number;
  activeDeals: number;
  wonDeals: number;
  lostDeals: number;
  totalPipelineValue: number;
  averageDealSize: number;
  
  // Conversion-Metriken
  offerToOrderConversion: number;
  dealToOrderConversion: number;
  averageSalesCycle: number; // in Tagen
  
  // Umsatz-Metriken
  totalRevenue: number;
  forecastedRevenue: number;
  revenueGrowth: number;
  
  // Aktivitäts-Metriken
  totalActivities: number;
  averageActivitiesPerDeal: number;
  topSalesReps: {
    salesRep: string;
    deals: number;
    revenue: number;
  }[];
  
  // Trends
  pipelineTrend: {
    labels: string[];
    data: number[];
  };
  revenueTrend: {
    labels: string[];
    data: number[];
  };
  conversionTrend: {
    labels: string[];
    data: number[];
  };
} 

// --- Lieferantenmanagement Enums & Types ---
export enum SupplierStatus {
  ACTIVE = 'aktiv',
  INACTIVE = 'inaktiv',
  BLOCKED = 'gesperrt',
  PENDING = 'ausstehend',
  APPROVED = 'genehmigt'
}

export enum SupplierCategory {
  MANUFACTURER = 'hersteller',
  WHOLESALER = 'großhändler',
  RETAILER = 'einzelhändler',
  SERVICE_PROVIDER = 'dienstleister',
  LOGISTICS = 'logistik',
  OTHER = 'sonstiger'
}

export enum InquiryStatus {
  DRAFT = 'entwurf',
  SENT = 'gesendet',
  RECEIVED = 'erhalten',
  NEGOTIATING = 'verhandlung',
  ACCEPTED = 'angenommen',
  REJECTED = 'abgelehnt',
  EXPIRED = 'abgelaufen'
}

export enum OrderStatus {
  DRAFT = 'entwurf',
  SENT = 'gesendet',
  CONFIRMED = 'bestätigt',
  IN_PRODUCTION = 'in_produktion',
  READY_FOR_DELIVERY = 'lieferbereit',
  PARTIALLY_DELIVERED = 'teilweise_geliefert',
  DELIVERED = 'geliefert',
  COMPLETED = 'abgeschlossen',
  CANCELLED = 'storniert',
  ON_HOLD = 'pausiert'
}

export enum PaymentStatus {
  PENDING = 'ausstehend',
  PARTIAL = 'teilweise',
  PAID = 'bezahlt',
  OVERDUE = 'überfällig',
  CANCELLED = 'storniert'
}

export interface Supplier {
  id: string;
  supplierNumber: string;
  name: string;
  
  // Stammdaten
  status: SupplierStatus;
  category: SupplierCategory;
  taxNumber?: string;
  vatNumber?: string;
  commercialRegister?: string;
  
  // Adressdaten
  address: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
    postBox?: string;
    state?: string;
  };
  
  // Kontaktdaten
  phone: string;
  fax?: string;
  email?: string;
  website?: string;
  
  // Erweiterte Kontaktdaten
  skype?: string;
  linkedin?: string;
  
  // Geschäftsdaten
  industry?: string;
  companySize?: 'small' | 'medium' | 'large' | 'enterprise';
  annualRevenue?: number;
  employeeCount?: number;
  
  // Einkaufsdaten
  purchasingRep: string;
  assignedTo?: string;
  paymentTerms: string;
  creditLimit: number;
  discountGroup?: string;
  
  // Bewertung & Klassifizierung
  rating: number; // 1-5 Sterne
  reliability: 'high' | 'medium' | 'low';
  deliveryTime: number; // in Tagen
  qualityRating: number; // 1-10
  
  // Finanzielle Daten
  totalSpent: number;
  openInvoices: number;
  overdueInvoices: number;
  creditUsed: number;
  
  // Verknüpfungen
  inquiries?: SupplierInquiry[];
  orders?: SupplierOrder[];
  deliveries?: SupplierDelivery[];
  invoices?: SupplierInvoice[];
  contactPersons?: SupplierContactPerson[];
  
  // Metadaten
  createdAt: string;
  updatedAt: string;
  lastContact?: string;
  createdBy: string;
}

export interface SupplierContactPerson {
  id: string;
  supplierId: string;
  
  // Persönliche Daten
  salutation: 'Herr' | 'Frau' | 'Divers';
  firstName: string;
  lastName: string;
  position: string;
  department?: string;
  
  // Kontaktdaten
  phone: string;
  mobile?: string;
  fax?: string;
  email?: string;
  skype?: string;
  linkedin?: string;
  
  // Status & Rollen
  isMainContact: boolean;
  isActive: boolean;
  role: 'purchasing' | 'technical' | 'billing' | 'logistics' | 'other';
  
  // Notizen
  notes?: string;
  tags?: string[];
  
  // Metadaten
  createdAt: string;
  updatedAt: string;
  lastContactDate?: string;
  createdBy: string;
}

export interface SupplierInquiry {
  id: string;
  supplierId: string;
  inquiryNumber: string;
  
  // Anfragedaten
  title: string;
  description?: string;
  inquiryDate: string;
  plannedDeliveryDate?: string;
  
  // Bediener & Kommission
  operator: string;
  commission?: string;
  
  // Angebotsdaten
  offerNumber?: string;
  offerDate?: string;
  netAmount?: number;
  
  // Status & Workflow
  status: InquiryStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Verknüpfungen
  convertedToOrder?: string; // Order ID
  relatedOrders: SupplierOrder[];
  
  // Items
  items: InquiryItem[];
  
  // Metadaten
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
  
  // Dokumentation
  attachments?: string[];
  notes?: string;
  tags?: string[];
}

export interface InquiryItem {
  id: string;
  inquiryId: string;
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unit?: string;
  estimatedPrice?: number;
  notes?: string;
}

export interface SupplierOrder {
  id: string;
  supplierId: string;
  inquiryId?: string;
  orderNumber: string;
  
  // Bestelldaten
  title: string;
  description?: string;
  orderDate: string;
  plannedDeliveryDate?: string;
  
  // Bediener & Kommission
  operator: string;
  commission?: string;
  
  // Lieferung
  confirmedDeliveryDate?: string;
  requestedDeliveryDate?: string;
  
  // Preise
  netAmount: number;
  grossAmount: number;
  taxAmount: number;
  currency: string;
  
  // Status & Workflow
  status: SupplierOrderStatus;
  paymentStatus: PaymentStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Rechnungsdaten
  invoiceNumber?: string;
  invoiceDate?: string;
  
  // Anwendungsgebiet & Experte
  applicationArea?: string;
  expert?: string;
  
  // Info an Lieferant
  infoToSupplier?: string;
  
  // Verknüpfungen
  deliveries: SupplierDelivery[];
  invoices: SupplierInvoice[];
  
  // Items
  items: OrderItem[];
  
  // Metadaten
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
  
  // Dokumentation
  attachments?: string[];
  notes?: string;
  tags?: string[];
}

export interface SupplierDelivery {
  id: string;
  supplierId: string;
  orderId: string;
  deliveryNumber: string;
  
  // Lieferschein-Daten
  deliveryDate: string;
  deliveryAddress?: string;
  notes?: string;
  
  // Status
  status: 'draft' | 'sent' | 'delivered' | 'confirmed' | 'partially_delivered';
  
  // Items
  items: DeliveryItem[];
  
  // Metadaten
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierInvoice {
  id: string;
  supplierId: string;
  orderId?: string;
  invoiceNumber: string;
  
  // Rechnungsdaten
  invoiceDate: string;
  dueDate: string;
  paymentDate?: string;
  
  // Preise
  netAmount: number;
  grossAmount: number;
  taxAmount: number;
  paidAmount: number;
  currency: string;
  
  // Status
  status: 'draft' | 'received' | 'approved' | 'paid' | 'overdue' | 'cancelled';
  paymentStatus: PaymentStatus;
  
  // Items
  items: InvoiceItem[];
  
  // Metadaten
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierAnalytics {
  supplierId: string;
  year: number;
  month?: number;
  
  // Einkaufsdaten
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  spendingGrowth: number; // Prozentuale Veränderung
  
  // Offene Posten
  openInvoices: number;
  overdueInvoices: number;
  overdueAmount: number;
  averagePaymentTime: number; // in Tagen
  
  // Lieferantenbewertung
  deliveryPerformance: number; // Prozent pünktlicher Lieferungen
  qualityPerformance: number; // Prozent fehlerfreier Lieferungen
  priceCompetitiveness: number; // 1-10 Bewertung
  
  // Aktivitätsdaten
  lastOrderDate?: string;
  lastContactDate?: string;
  orderFrequency: number; // Bestellungen pro Monat
  
  // Trends
  spendingTrend: 'increasing' | 'decreasing' | 'stable';
  orderTrend: 'increasing' | 'decreasing' | 'stable';
  performanceTrend: 'improving' | 'worsening' | 'stable';
}

// --- UI Configuration für Lieferanten ---
export interface SupplierTabConfig {
  mainTab: CRMMainTab;
  subTabs: CRMSubTab[];
  isEnabled: boolean;
  isVisible: boolean;
  order: number;
  icon?: string;
  badge?: number;
}

export interface SupplierViewConfig {
  tabs: SupplierTabConfig[];
  ribbon: CRMFunctionalRibbon[];
  contextActions: CRMContextAction[];
  defaultTab: CRMMainTab;
  defaultSubTab: CRMSubTab;
}

// --- Filter & Search für Lieferanten ---
export interface SupplierFilter {
  search?: string;
  status?: SupplierStatus;
  category?: SupplierCategory;
  purchasingRep?: string;
  assignedTo?: string;
  rating?: {
    min?: number;
    max?: number;
  };
  totalSpent?: {
    min?: number;
    max?: number;
  };
  lastContact?: {
    from?: string;
    to?: string;
  };
  createdAt?: {
    from?: string;
    to?: string;
  };
  hasOpenInvoices?: boolean;
  hasOverdueInvoices?: boolean;
  tags?: string[];
}

export interface InquiryFilter {
  search?: string;
  status?: InquiryStatus;
  operator?: string;
  commission?: string;
  inquiryDate?: {
    from?: string;
    to?: string;
  };
  plannedDeliveryDate?: {
    from?: string;
    to?: string;
  };
  convertedToOrder?: boolean;
  tags?: string[];
}

export interface SupplierOrderFilter {
  search?: string;
  status?: SupplierOrderStatus;
  paymentStatus?: PaymentStatus;
  operator?: string;
  commission?: string;
  orderDate?: {
    from?: string;
    to?: string;
  };
  plannedDeliveryDate?: {
    from?: string;
    to?: string;
  };
  netAmount?: {
    min?: number;
    max?: number;
  };
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
}

// --- Form Data Types für Lieferanten ---
export interface SupplierFormData {
  supplierNumber: string;
  name: string;
  status: SupplierStatus;
  category: SupplierCategory;
  taxNumber?: string;
  vatNumber?: string;
  commercialRegister?: string;
  street: string;
  zipCode: string;
  city: string;
  country: string;
  postBox?: string;
  state?: string;
  phone: string;
  fax?: string;
  email?: string;
  website?: string;
  skype?: string;
  linkedin?: string;
  industry?: string;
  companySize?: 'small' | 'medium' | 'large' | 'enterprise';
  annualRevenue?: number;
  employeeCount?: number;
  purchasingRep: string;
  assignedTo?: string;
  paymentTerms: string;
  creditLimit: number;
  discountGroup?: string;
  rating: number;
  reliability: 'high' | 'medium' | 'low';
  deliveryTime: number;
  qualityRating: number;
}

export interface SupplierContactPersonFormData {
  salutation: 'Herr' | 'Frau' | 'Divers';
  firstName: string;
  lastName: string;
  position: string;
  department?: string;
  phone: string;
  mobile?: string;
  fax?: string;
  email?: string;
  skype?: string;
  linkedin?: string;
  isMainContact: boolean;
  isActive: boolean;
  role: 'purchasing' | 'technical' | 'billing' | 'logistics' | 'other';
  notes?: string;
  tags?: string[];
}

export interface InquiryFormData {
  title: string;
  description?: string;
  inquiryDate: string;
  plannedDeliveryDate?: string;
  operator: string;
  commission?: string;
  status: InquiryStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  notes?: string;
}

export interface SupplierOrderFormData {
  title: string;
  description?: string;
  orderDate: string;
  plannedDeliveryDate?: string;
  requestedDeliveryDate?: string;
  operator: string;
  commission?: string;
  applicationArea?: string;
  expert?: string;
  infoToSupplier?: string;
  currency: string;
  status: SupplierOrderStatus;
  paymentStatus: PaymentStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  notes?: string;
}

// --- Dashboard Widgets für Lieferanten ---
export interface SupplierDashboardWidget {
  id: string;
  type: SupplierWidgetType;
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: SupplierWidgetConfig;
  isEnabled: boolean;
  refreshInterval?: number;
}

export enum SupplierWidgetType {
  SUPPLIER_OVERVIEW = 'supplier_overview',
  RECENT_ORDERS = 'recent_orders',
  SPENDING_CHART = 'spending_chart',
  SUPPLIER_RATINGS = 'supplier_ratings',
  DELIVERY_PERFORMANCE = 'delivery_performance',
  QUICK_ACTIONS = 'quick_actions',
  SUPPLIER_SEARCH = 'supplier_search',
  ANALYTICS = 'analytics'
}

export interface SupplierWidgetConfig {
  supplierId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
  displayOptions?: Record<string, any>;
} 

// --- Fehlende Enums und Types für TypeScript-Fehler ---
export enum ContactWeekdays {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday'
}

export interface InvoiceFilter {
  status?: string[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  customerId?: string | null;
  searchTerm?: string;
} 

// Mapping-Funktionen für Communication
export const mapApiCommunicationToFormData = (apiCommunication: CustomerCommunication): CommunicationFormData => ({
  type: apiCommunication.type,
  subject: apiCommunication.subject,
  content: apiCommunication.content,
  from: apiCommunication.from,
  to: apiCommunication.to,
  priority: apiCommunication.priority,
  relatedContactPersonId: apiCommunication.relatedContactPersonId || '',
  followUpDate: apiCommunication.followUpDate || '',
  followUpAction: apiCommunication.followUpAction || '',
  tags: apiCommunication.tags || [],
  category: apiCommunication.category || '',
  attachments: []
});

export const mapFormDataToApiCommunication = (formData: CommunicationFormData, communicationId: string): Omit<CustomerCommunication, 'id' | 'customerId' | 'date' | 'status' | 'outcome' | 'followUpCompleted' | 'duration' | 'cost' | 'createdBy' | 'updatedAt'> => ({
  type: formData.type,
  subject: formData.subject,
  content: formData.content,
  from: formData.from,
  to: formData.to,
  priority: formData.priority,
  relatedContactPersonId: formData.relatedContactPersonId || undefined,
  followUpDate: formData.followUpDate || undefined,
  followUpAction: formData.followUpAction || undefined,
  tags: formData.tags || [],
  category: formData.category || undefined
});

export const getInitialCommunicationFormData = (): CommunicationFormData => ({
  type: CommunicationType.EMAIL,
  subject: '',
  content: '',
  from: '',
  to: '',
  priority: 'medium',
  relatedContactPersonId: '',
  followUpDate: '',
  followUpAction: '',
  tags: [],
  category: '',
  attachments: []
});