import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Invoice Types für VALEO NeuroERP
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
  paymentTerms?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InvoiceStore {
  // State
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  filters: {
    status: string[];
    dateRange: {
      start: Date | null;
      end: Date | null;
    };
    customerId: string | null;
    searchTerm: string;
  };
  loading: boolean;
  error: string | null;
  
  // Actions
  setInvoices: (invoices: Invoice[]) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  
  setFilters: (filters: Partial<InvoiceStore['filters']>) => void;
  clearFilters: () => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Computed Actions
  getInvoicesByStatus: (status: Invoice['status']) => Invoice[];
  getInvoicesByCustomer: (customerId: string) => Invoice[];
  getTotalAmount: () => number;
  getOverdueInvoices: () => Invoice[];
}

export const useInvoiceStore = create<InvoiceStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      invoices: [],
      selectedInvoice: null,
      filters: {
        status: [],
        dateRange: {
          start: null,
          end: null
        },
        customerId: null,
        searchTerm: ''
      },
      loading: false,
      error: null,
      
      // Actions
      setInvoices: (invoices) => {
        set({ invoices });
      },
      
      addInvoice: async (invoiceData) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoiceData)
          });
          
          if (!response.ok) {
            throw new Error('Fehler beim Erstellen der Rechnung');
          }
          
          const newInvoice = await response.json();
          set((state) => ({
            invoices: [...state.invoices, newInvoice],
            loading: false
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unbekannter Fehler',
            loading: false
          });
        }
      },
      
      updateInvoice: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/invoices/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          
          if (!response.ok) {
            throw new Error('Fehler beim Aktualisieren der Rechnung');
          }
          
          const updatedInvoice = await response.json();
          set((state) => ({
            invoices: state.invoices.map(invoice =>
              invoice.id === id ? updatedInvoice : invoice
            ),
            selectedInvoice: state.selectedInvoice?.id === id ? updatedInvoice : state.selectedInvoice,
            loading: false
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unbekannter Fehler',
            loading: false
          });
        }
      },
      
      deleteInvoice: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/invoices/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            throw new Error('Fehler beim Löschen der Rechnung');
          }
          
          set((state) => ({
            invoices: state.invoices.filter(invoice => invoice.id !== id),
            selectedInvoice: state.selectedInvoice?.id === id ? null : state.selectedInvoice,
            loading: false
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unbekannter Fehler',
            loading: false
          });
        }
      },
      
      setSelectedInvoice: (invoice) => {
        set({ selectedInvoice: invoice });
      },
      
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters }
        }));
      },
      
      clearFilters: () => {
        set({
          filters: {
            status: [],
            dateRange: {
              start: null,
              end: null
            },
            customerId: null,
            searchTerm: ''
          }
        });
      },
      
      setLoading: (loading) => {
        set({ loading });
      },
      
      setError: (error) => {
        set({ error });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      // Computed Actions
      getInvoicesByStatus: (status) => {
        return get().invoices.filter(invoice => invoice.status === status);
      },
      
      getInvoicesByCustomer: (customerId) => {
        return get().invoices.filter(invoice => invoice.customerId === customerId);
      },
      
      getTotalAmount: () => {
        return get().invoices.reduce((total, invoice) => total + invoice.total, 0);
      },
      
      getOverdueInvoices: () => {
        const today = new Date();
        return get().invoices.filter(invoice => 
          invoice.status === 'sent' && 
          new Date(invoice.dueDate) < today
        );
      }
    }),
    { name: 'invoice-store' }
  )
); 