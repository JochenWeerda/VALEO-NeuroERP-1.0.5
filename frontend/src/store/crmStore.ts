import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// CRM Types für VALEO NeuroERP
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  status: 'active' | 'inactive' | 'prospect' | 'lead';
  category: 'A' | 'B' | 'C';
  lastContact?: Date;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Contact {
  id: string;
  customerId: string;
  type: 'email' | 'phone' | 'meeting' | 'note';
  subject: string;
  description: string;
  date: Date;
  outcome?: string;
  nextAction?: string;
  assignedTo?: string;
}

interface CRMStore {
  // State
  customers: Customer[];
  contacts: Contact[];
  selectedCustomer: Customer | null;
  filters: {
    status: string[];
    category: string[];
    tags: string[];
    searchTerm: string;
  };
  loading: boolean;
  error: string | null;
  
  // Actions
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  setSelectedCustomer: (customer: Customer | null) => void;
  
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Omit<Contact, 'id'>) => Promise<void>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  
  setFilters: (filters: Partial<CRMStore['filters']>) => void;
  clearFilters: () => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCRMStore = create<CRMStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      customers: [],
      contacts: [],
      selectedCustomer: null,
      filters: {
        status: [],
        category: [],
        tags: [],
        searchTerm: ''
      },
      loading: false,
      error: null,
      
      // Actions
      setCustomers: (customers) => {
        set({ customers });
      },
      
      addCustomer: async (customerData) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/crm/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
          });
          
          if (!response.ok) {
            throw new Error('Fehler beim Erstellen des Kunden');
          }
          
          const newCustomer = await response.json();
          set((state) => ({
            customers: [...state.customers, newCustomer],
            loading: false
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unbekannter Fehler',
            loading: false
          });
        }
      },
      
      updateCustomer: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/crm/customers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          
          if (!response.ok) {
            throw new Error('Fehler beim Aktualisieren des Kunden');
          }
          
          const updatedCustomer = await response.json();
          set((state) => ({
            customers: state.customers.map(customer =>
              customer.id === id ? updatedCustomer : customer
            ),
            selectedCustomer: state.selectedCustomer?.id === id ? updatedCustomer : state.selectedCustomer,
            loading: false
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unbekannter Fehler',
            loading: false
          });
        }
      },
      
      deleteCustomer: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/crm/customers/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            throw new Error('Fehler beim Löschen des Kunden');
          }
          
          set((state) => ({
            customers: state.customers.filter(customer => customer.id !== id),
            selectedCustomer: state.selectedCustomer?.id === id ? null : state.selectedCustomer,
            loading: false
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unbekannter Fehler',
            loading: false
          });
        }
      },
      
      setSelectedCustomer: (customer) => {
        set({ selectedCustomer: customer });
      },
      
      setContacts: (contacts) => {
        set({ contacts });
      },
      
      addContact: async (contactData) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/crm/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData)
          });
          
          if (!response.ok) {
            throw new Error('Fehler beim Erstellen des Kontakts');
          }
          
          const newContact = await response.json();
          set((state) => ({
            contacts: [...state.contacts, newContact],
            loading: false
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unbekannter Fehler',
            loading: false
          });
        }
      },
      
      updateContact: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/crm/contacts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          
          if (!response.ok) {
            throw new Error('Fehler beim Aktualisieren des Kontakts');
          }
          
          const updatedContact = await response.json();
          set((state) => ({
            contacts: state.contacts.map(contact =>
              contact.id === id ? updatedContact : contact
            ),
            loading: false
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unbekannter Fehler',
            loading: false
          });
        }
      },
      
      deleteContact: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/crm/contacts/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            throw new Error('Fehler beim Löschen des Kontakts');
          }
          
          set((state) => ({
            contacts: state.contacts.filter(contact => contact.id !== id),
            loading: false
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unbekannter Fehler',
            loading: false
          });
        }
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
            category: [],
            tags: [],
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
      }
    }),
    { name: 'crm-store' }
  )
); 