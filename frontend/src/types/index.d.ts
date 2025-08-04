/**
 * VALEO NeuroERP 2.0 - TypeScript Definitions
 * Serena Quality: Complete type safety with proper documentation
 */

// Base Types
export type ID = string | number;
export type Timestamp = string | Date;
export type Money = number;
export type Percentage = number;

// Generic Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  timestamp: Timestamp;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// User & Authentication Types
export interface User {
  id: ID;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  roles: Role[];
  permissions: string[];
  lastLogin?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Role {
  id: ID;
  name: string;
  displayName: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
}

export interface Permission {
  id: ID;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
}

// Business Entity Types
export interface Customer {
  id: ID;
  customerNumber: string;
  name: string;
  email: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  website?: string;
  
  // Address
  address?: string;
  address2?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  
  // Business Info
  taxId?: string;
  vatId?: string;
  commercialRegister?: string;
  customerType: 'business' | 'individual';
  
  // Financial
  creditLimit?: Money;
  paymentTerms?: number; // days
  discount?: Percentage;
  
  // Status
  status: 'active' | 'inactive' | 'blocked';
  rating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  tags?: string[];
  
  // Relationships
  contactPersons?: ContactPerson[];
  invoices?: Invoice[];
  orders?: Order[];
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: ID;
  updatedBy?: ID;
}

export interface ContactPerson {
  id: ID;
  customerId: ID;
  salutation?: string;
  firstName: string;
  lastName: string;
  position?: string;
  department?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  isPrimary: boolean;
}

export interface Article {
  id: ID;
  sku: string;
  ean?: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  
  // Pricing
  price: Money;
  purchasePrice?: Money;
  currency: string;
  taxRate: Percentage;
  
  // Stock
  stock: number;
  minStock?: number;
  maxStock?: number;
  stockUnit: string;
  location?: string;
  
  // Attributes
  weight?: number;
  weightUnit?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  
  // Status
  status: 'active' | 'inactive' | 'discontinued';
  isService: boolean;
  isBatchTracked: boolean;
  isSerialTracked: boolean;
  
  // Images
  images?: ArticleImage[];
  thumbnailUrl?: string;
  
  // Relationships
  supplier?: Supplier;
  supplierId?: ID;
  stockMovements?: StockMovement[];
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ArticleImage {
  id: ID;
  articleId: ID;
  url: string;
  alt?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface StockMovement {
  id: ID;
  articleId: ID;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  reference?: string;
  referenceType?: 'purchase' | 'sale' | 'production' | 'inventory' | 'return';
  referenceId?: ID;
  fromLocation?: string;
  toLocation?: string;
  reason?: string;
  performedBy: ID;
  performedAt: Timestamp;
}

export interface Invoice {
  id: ID;
  invoiceNumber: string;
  customerId: ID;
  customer?: Customer;
  
  // Dates
  invoiceDate: Timestamp;
  dueDate: Timestamp;
  deliveryDate?: Timestamp;
  
  // Status
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid';
  
  // Financial
  subtotal: Money;
  taxAmount: Money;
  discountAmount: Money;
  shippingAmount: Money;
  total: Money;
  currency: string;
  exchangeRate?: number;
  
  // Items
  items: InvoiceItem[];
  
  // Payment
  paymentMethod?: string;
  paymentReference?: string;
  paidAmount: Money;
  payments?: Payment[];
  
  // Documents
  pdfUrl?: string;
  attachments?: Attachment[];
  
  // Notes
  customerNotes?: string;
  internalNotes?: string;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: ID;
  sentAt?: Timestamp;
  paidAt?: Timestamp;
}

export interface InvoiceItem {
  id: ID;
  invoiceId: ID;
  articleId?: ID;
  article?: Article;
  
  // Description
  name: string;
  description?: string;
  
  // Quantity & Price
  quantity: number;
  unit: string;
  unitPrice: Money;
  taxRate: Percentage;
  discount: Percentage;
  
  // Totals
  subtotal: Money;
  taxAmount: Money;
  total: Money;
  
  // Order
  sortOrder: number;
}

export interface Payment {
  id: ID;
  invoiceId: ID;
  amount: Money;
  paymentDate: Timestamp;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  createdBy: ID;
  createdAt: Timestamp;
}

export interface Order {
  id: ID;
  orderNumber: string;
  customerId: ID;
  customer?: Customer;
  
  // Type
  orderType: 'sales' | 'purchase';
  
  // Dates
  orderDate: Timestamp;
  deliveryDate?: Timestamp;
  
  // Status
  status: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  
  // Items
  items: OrderItem[];
  
  // Totals
  subtotal: Money;
  taxAmount: Money;
  discountAmount: Money;
  shippingAmount: Money;
  total: Money;
  
  // Delivery
  deliveryAddress?: Address;
  shippingMethod?: string;
  trackingNumber?: string;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  confirmedAt?: Timestamp;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;
}

export interface OrderItem {
  id: ID;
  orderId: ID;
  articleId: ID;
  article?: Article;
  quantity: number;
  unitPrice: Money;
  discount: Percentage;
  taxRate: Percentage;
  total: Money;
  deliveredQuantity?: number;
  backorderQuantity?: number;
}

export interface Supplier {
  id: ID;
  supplierNumber: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  
  // Address
  address?: Address;
  
  // Business
  taxId?: string;
  paymentTerms?: number;
  currency?: string;
  
  // Contact
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  
  // Status
  status: 'active' | 'inactive';
  rating?: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Address {
  street: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface Attachment {
  id: ID;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: Timestamp;
  uploadedBy: ID;
}

// Dashboard Types
export interface DashboardStats {
  revenue: {
    current: Money;
    previous: Money;
    change: Percentage;
  };
  orders: {
    current: number;
    previous: number;
    change: Percentage;
  };
  customers: {
    current: number;
    previous: number;
    change: Percentage;
  };
  inventory: {
    totalValue: Money;
    lowStockItems: number;
    outOfStockItems: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

// Filter & Search Types
export interface FilterCriteria {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between';
  value: any;
}

export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchParams {
  query?: string;
  filters?: FilterCriteria[];
  sort?: SortCriteria[];
  page?: number;
  pageSize?: number;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'date' | 'select' | 'checkbox' | 'textarea';
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: SelectOption[];
  validation?: ValidationRule[];
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'custom';
  value?: any;
  message: string;
}

// Import/Export Types
export interface ImportResult {
  success: number;
  failed: number;
  errors: ImportError[];
  createdIds: ID[];
}

export interface ImportError {
  row: number;
  error: string;
  data?: any;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'json';
  fields?: string[];
  filters?: FilterCriteria[];
}

// Notification Types
export interface Notification {
  id: ID;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  actionUrl?: string;
  actionLabel?: string;
}

// Settings Types
export interface SystemSettings {
  general: {
    companyName: string;
    companyLogo?: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    language: string;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpSecure: boolean;
    fromName: string;
    fromEmail: string;
  };
  features: {
    enableMonitoring: boolean;
    enableCaching: boolean;
    enableRateLimiting: boolean;
    enableTwoFactor: boolean;
  };
}

// Workflow Types
export interface Workflow {
  id: ID;
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  conditions?: WorkflowCondition[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'manual';
  event?: string;
  schedule?: string;
}

export interface WorkflowAction {
  id: ID;
  type: 'email' | 'webhook' | 'update' | 'create';
  config: any;
  order: number;
}

export interface WorkflowCondition {
  field: string;
  operator: string;
  value: any;
  combinator?: 'and' | 'or';
}

// Mobile App Types
export interface MobileSession {
  deviceId: string;
  platform: 'ios' | 'android';
  version: string;
  pushToken?: string;
  lastSync?: Timestamp;
}

export interface OfflineData {
  type: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Timestamp;
  syncStatus: 'pending' | 'synced' | 'failed';
}

// AI/ML Types
export interface AIAssistantMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Timestamp;
  metadata?: any;
}

export interface PredictionResult {
  type: 'demand' | 'price' | 'churn' | 'anomaly';
  value: any;
  confidence: number;
  explanation?: string;
  timestamp: Timestamp;
}