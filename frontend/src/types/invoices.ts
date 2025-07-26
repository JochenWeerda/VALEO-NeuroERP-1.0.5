import { z } from 'zod';

// Enum für Invoice-Status
export const InvoiceStatusEnum = z.enum(['open', 'paid', 'overdue']);
export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;

// Customer-Interface für Foreign Key
export interface Customer {
  id: string;
  name: string;
  email: string;
}

// Invoice-Interface basierend auf Schema
export interface Invoice {
  id?: string; // Optional für neue Invoices
  customer_id: string;
  amount: number;
  status: InvoiceStatus;
  created_at?: string; // Optional, wird automatisch gesetzt
}

// Zod-Schema für Validierung
export const InvoiceSchema = z.object({
  customer_id: z.string().uuid('Ungültige Customer-ID'),
  amount: z.number()
    .positive('Betrag muss positiv sein')
    .min(0.01, 'Betrag muss mindestens 0.01 sein'),
  status: InvoiceStatusEnum,
});

// Form-Interface für React Hook Form
export interface InvoiceFormData {
  customer_id: string;
  amount: string; // String für Input-Feld
  status: InvoiceStatus;
}

// Props für die Komponente
export interface InvoiceFormProps {
  initialData?: Partial<Invoice>;
  customers: Customer[];
  onSubmit: (data: Invoice) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

// E-Invoicing spezifische Interfaces
export interface InvoiceSummary {
  id: string;
  invoiceId: string; // Eindeutige Rechnungsnummer
  customerName: string;
  customerEmail: string;
  amount: number;
  status: InvoiceStatus;
  createdAt: string;
  dueDate: string;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  description?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  taxAmount: number;
}

export interface InvoiceFilter {
  startDate: string;
  endDate: string;
  status?: InvoiceStatus;
  customerId?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

export interface InvoiceStatistics {
  totalInvoices: number;
  totalAmount: number;
  paidInvoices: number;
  paidAmount: number;
  overdueInvoices: number;
  overdueAmount: number;
  openInvoices: number;
  openAmount: number;
  averageAmount: number;
  currency: string;
}

export interface EInvoicingFormData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  description: string;
  dueDate: string;
  items: InvoiceItem[];
}

export interface EInvoicingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface EInvoicingStatistics {
  monthly: InvoiceStatistics[];
  yearly: InvoiceStatistics[];
  topCustomers: {
    customerId: string;
    customerName: string;
    totalAmount: number;
    invoiceCount: number;
  }[];
  paymentMethods: {
    method: string;
    count: number;
    totalAmount: number;
  }[];
} 