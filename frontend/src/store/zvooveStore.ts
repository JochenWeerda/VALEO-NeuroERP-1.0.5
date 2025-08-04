import { create } from 'zustand';
import { ZvooveOrder, ZvooveContact } from '../services/zvooveApi';

interface ZvooveState {
  // Orders
  orders: ZvooveOrder[];
  selectedOrder: ZvooveOrder | null;
  ordersLoading: boolean;
  ordersError: string | null;
  
  // Contacts
  contacts: ZvooveContact[];
  selectedContact: ZvooveContact | null;
  contactsLoading: boolean;
  contactsError: string | null;
  
  // Actions
  setOrders: (orders: ZvooveOrder[]) => void;
  setSelectedOrder: (order: ZvooveOrder | null) => void;
  setOrdersLoading: (loading: boolean) => void;
  setOrdersError: (error: string | null) => void;
  
  setContacts: (contacts: ZvooveContact[]) => void;
  setSelectedContact: (contact: ZvooveContact | null) => void;
  setContactsLoading: (loading: boolean) => void;
  setContactsError: (error: string | null) => void;
  
  // Utility
  reset: () => void;
}

const initialState = {
  orders: [],
  selectedOrder: null,
  ordersLoading: false,
  ordersError: null,
  contacts: [],
  selectedContact: null,
  contactsLoading: false,
  contactsError: null,
};

export const useZvooveStore = create<ZvooveState>((set) => ({
  ...initialState,
  
  // Order actions
  setOrders: (orders) => set({ orders }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setOrdersLoading: (loading) => set({ ordersLoading: loading }),
  setOrdersError: (error) => set({ ordersError: error }),
  
  // Contact actions
  setContacts: (contacts) => set({ contacts }),
  setSelectedContact: (contact) => set({ selectedContact: contact }),
  setContactsLoading: (loading) => set({ contactsLoading: loading }),
  setContactsError: (error) => set({ contactsError: error }),
  
  // Reset
  reset: () => set(initialState),
}));

export default useZvooveStore;