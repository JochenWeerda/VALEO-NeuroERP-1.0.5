import { create } from 'zustand';

interface ZvooveState {
  orders: any[];
  contacts: any[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  fetchContacts: () => Promise<void>;
  createOrder: (orderData: any) => Promise<void>;
}

export const useZvooveStore = create<ZvooveState>((set, get) => ({
  orders: [],
  contacts: [],
  loading: false,
  error: null,
  
  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      // Mock implementation
      set({ orders: [], loading: false });
    } catch (error) {
      set({ error: 'Fehler beim Laden der Aufträge', loading: false });
    }
  },
  
  fetchContacts: async () => {
    set({ loading: true, error: null });
    try {
      // Mock implementation
      set({ contacts: [], loading: false });
    } catch (error) {
      set({ error: 'Fehler beim Laden der Kontakte', loading: false });
    }
  },
  
  createOrder: async (orderData: any) => {
    set({ loading: true, error: null });
    try {
      // Mock implementation
      const newOrder = { id: Date.now().toString(), ...orderData };
      set(state => ({ 
        orders: [...state.orders, newOrder], 
        loading: false 
      }));
    } catch (error) {
      set({ error: 'Fehler beim Erstellen des Auftrags', loading: false });
    }
  }
}));
