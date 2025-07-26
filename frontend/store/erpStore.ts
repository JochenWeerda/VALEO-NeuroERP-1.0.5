import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { erpApiService } from '../services/erpApi';
import {
  // Bestellvorschlag
  OrderSuggestionData,
  OrderSuggestionFilters,
  
  // Bestellung
  PurchaseOrderData,
  PurchaseOrderPosition,
  
  // Lieferanten-Angebot
  SupplierOfferData,
  SupplierOfferPosition,
  
  // Anfrage
  InquiryData,
  InquiryPosition,
  
  // Lieferschein
  DeliveryNoteData,
  DeliveryPosition,
  
  // Auftragsbestätigung
  OrderConfirmationData,
  ContactPerson,
  Representative,
  
  // Angebot
  OfferData,
  
  // Allgemeine Typen
  FilterOptions,
  ApiResponse,
  PaginatedResponse
} from '../types/erpTypes';

// ============================================================================
// STORE INTERFACES
// ============================================================================

interface ErpStore {
  // ============================================================================
  // BESTELLVORSCHLAG
  // ============================================================================
  orderSuggestions: OrderSuggestionData[];
  orderSuggestionFilters: OrderSuggestionFilters;
  orderSuggestionLoading: boolean;
  orderSuggestionError: string | null;

  // ============================================================================
  // BESTELLUNG
  // ============================================================================
  purchaseOrders: PurchaseOrderData[];
  currentPurchaseOrder: PurchaseOrderData | null;
  purchaseOrderLoading: boolean;
  purchaseOrderError: string | null;

  // ============================================================================
  // LIEFERANTEN-ANGEBOT
  // ============================================================================
  supplierOffers: SupplierOfferData[];
  currentSupplierOffer: SupplierOfferData | null;
  supplierOfferLoading: boolean;
  supplierOfferError: string | null;

  // ============================================================================
  // ANFRAGE
  // ============================================================================
  inquiries: InquiryData[];
  currentInquiry: InquiryData | null;
  inquiryLoading: boolean;
  inquiryError: string | null;

  // ============================================================================
  // LIEFERSCHEIN
  // ============================================================================
  deliveryNotes: DeliveryNoteData[];
  currentDeliveryNote: DeliveryNoteData | null;
  deliveryNoteLoading: boolean;
  deliveryNoteError: string | null;

  // ============================================================================
  // AUFTRAGSBESTÄTIGUNG
  // ============================================================================
  orderConfirmations: OrderConfirmationData[];
  currentOrderConfirmation: OrderConfirmationData | null;
  orderConfirmationLoading: boolean;
  orderConfirmationError: string | null;

  // ============================================================================
  // ANGEBOT
  // ============================================================================
  offers: OfferData[];
  currentOffer: OfferData | null;
  offerLoading: boolean;
  offerError: string | null;

  // ============================================================================
  // ALLGEMEIN
  // ============================================================================
  loading: boolean;
  error: string | null;

  // ============================================================================
  // ACTIONS - BESTELLVORSCHLAG
  // ============================================================================
  fetchOrderSuggestions: (filters: OrderSuggestionFilters) => Promise<void>;
  createOrderFromSuggestion: (suggestion: OrderSuggestionData) => Promise<void>;

  // ============================================================================
  // ACTIONS - BESTELLUNG
  // ============================================================================
  fetchPurchaseOrders: (filters?: FilterOptions) => Promise<void>;
  fetchPurchaseOrder: (id: string) => Promise<void>;
  createPurchaseOrder: (order: PurchaseOrderData) => Promise<void>;
  updatePurchaseOrder: (id: string, order: Partial<PurchaseOrderData>) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  addPurchaseOrderPosition: (orderId: string, position: PurchaseOrderPosition) => Promise<void>;
  updatePurchaseOrderPosition: (orderId: string, positionId: string, position: Partial<PurchaseOrderPosition>) => Promise<void>;
  deletePurchaseOrderPosition: (orderId: string, positionId: string) => Promise<void>;
  setCurrentPurchaseOrder: (order: PurchaseOrderData | null) => void;

  // ============================================================================
  // ACTIONS - LIEFERANTEN-ANGEBOT
  // ============================================================================
  fetchSupplierOffers: (filters?: FilterOptions) => Promise<void>;
  fetchSupplierOffer: (id: string) => Promise<void>;
  createSupplierOffer: (offer: SupplierOfferData) => Promise<void>;
  updateSupplierOffer: (id: string, offer: Partial<SupplierOfferData>) => Promise<void>;
  deleteSupplierOffer: (id: string) => Promise<void>;
  addSupplierOfferPosition: (offerId: string, position: SupplierOfferPosition) => Promise<void>;
  setCurrentSupplierOffer: (offer: SupplierOfferData | null) => void;

  // ============================================================================
  // ACTIONS - ANFRAGE
  // ============================================================================
  fetchInquiries: (filters?: FilterOptions) => Promise<void>;
  fetchInquiry: (id: string) => Promise<void>;
  createInquiry: (inquiry: InquiryData) => Promise<void>;
  updateInquiry: (id: string, inquiry: Partial<InquiryData>) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  setCurrentInquiry: (inquiry: InquiryData | null) => void;

  // ============================================================================
  // ACTIONS - LIEFERSCHEIN
  // ============================================================================
  fetchDeliveryNotes: (filters?: FilterOptions) => Promise<void>;
  fetchDeliveryNote: (id: string) => Promise<void>;
  createDeliveryNote: (delivery: DeliveryNoteData) => Promise<void>;
  updateDeliveryNote: (id: string, delivery: Partial<DeliveryNoteData>) => Promise<void>;
  deleteDeliveryNote: (id: string) => Promise<void>;
  addDeliveryPosition: (deliveryId: string, position: DeliveryPosition) => Promise<void>;
  printDeliveryNote: (id: string) => Promise<Blob>;
  setCurrentDeliveryNote: (delivery: DeliveryNoteData | null) => void;

  // ============================================================================
  // ACTIONS - AUFTRAGSBESTÄTIGUNG
  // ============================================================================
  fetchOrderConfirmations: (filters?: FilterOptions) => Promise<void>;
  fetchOrderConfirmation: (id: string) => Promise<void>;
  createOrderConfirmation: (confirmation: OrderConfirmationData) => Promise<void>;
  updateOrderConfirmation: (id: string, confirmation: Partial<OrderConfirmationData>) => Promise<void>;
  deleteOrderConfirmation: (id: string) => Promise<void>;
  addContactPerson: (confirmationId: string, contact: ContactPerson) => Promise<void>;
  addRepresentative: (confirmationId: string, representative: Representative) => Promise<void>;
  setCurrentOrderConfirmation: (confirmation: OrderConfirmationData | null) => void;

  // ============================================================================
  // ACTIONS - ANGEBOT
  // ============================================================================
  fetchOffers: (filters?: FilterOptions) => Promise<void>;
  fetchOffer: (id: string) => Promise<void>;
  createOffer: (offer: OfferData) => Promise<void>;
  updateOffer: (id: string, offer: Partial<OfferData>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  setCurrentOffer: (offer: OfferData | null) => void;

  // ============================================================================
  // ACTIONS - ALLGEMEIN
  // ============================================================================
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  printDocument: (documentType: string, id: string) => Promise<Blob>;
  exportDocument: (documentType: string, id: string) => Promise<Blob>;
  updateStatus: (documentType: string, id: string, status: string) => Promise<void>;
  markAsCompleted: (documentType: string, id: string) => Promise<void>;

  // Platzhalter für neue Funktionen
  orders: any[];
  contacts: any[];
  deliveries: any[];
  fetchOrders: () => Promise<void>;
  createOrder: (order: any) => Promise<void>;
  updateOrder: (id: string, order: Partial<any>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  fetchContacts: () => Promise<void>;
  createContact: (contact: any) => Promise<void>;
  updateContact: (id: string, contact: Partial<any>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  fetchDeliveries: () => Promise<void>;
  createDelivery: (delivery: any) => Promise<void>;
  updateDelivery: (id: string, delivery: Partial<any>) => Promise<void>;
  deleteDelivery: (id: string) => Promise<void>;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useErpStore = create<ErpStore>()(
  devtools(
    (set, get) => ({
      // ============================================================================
      // INITIAL STATE
      // ============================================================================
      
      // Bestellvorschlag
      orderSuggestions: [],
      orderSuggestionFilters: {},
      orderSuggestionLoading: false,
      orderSuggestionError: null,

      // Bestellung
      purchaseOrders: [],
      currentPurchaseOrder: null,
      purchaseOrderLoading: false,
      purchaseOrderError: null,

      // Lieferanten-Angebot
      supplierOffers: [],
      currentSupplierOffer: null,
      supplierOfferLoading: false,
      supplierOfferError: null,

      // Anfrage
      inquiries: [],
      currentInquiry: null,
      inquiryLoading: false,
      inquiryError: null,

      // Lieferschein
      deliveryNotes: [],
      currentDeliveryNote: null,
      deliveryNoteLoading: false,
      deliveryNoteError: null,

      // Auftragsbestätigung
      orderConfirmations: [],
      currentOrderConfirmation: null,
      orderConfirmationLoading: false,
      orderConfirmationError: null,

      // Angebot
      offers: [],
      currentOffer: null,
      offerLoading: false,
      offerError: null,

      // Allgemein
      loading: false,
      error: null,

      // Platzhalter für neue Funktionen
      orders: [],
      contacts: [],
      deliveries: [],

      // ============================================================================
      // ACTIONS - BESTELLVORSCHLAG
      // ============================================================================

      fetchOrderSuggestions: async (filters: OrderSuggestionFilters) => {
        set({ orderSuggestionLoading: true, orderSuggestionError: null });
        try {
          const suggestions = await erpApiService.getOrderSuggestions(filters);
          set({ 
            orderSuggestions: suggestions,
            orderSuggestionFilters: filters,
            orderSuggestionLoading: false 
          });
        } catch (error) {
          set({ 
            orderSuggestionError: error instanceof Error ? error.message : 'Fehler beim Laden der Bestellvorschläge',
            orderSuggestionLoading: false 
          });
        }
      },

      createOrderFromSuggestion: async (suggestion: OrderSuggestionData) => {
        set({ loading: true, error: null });
        try {
          const order = await erpApiService.createOrderFromSuggestion(suggestion);
          set({ 
            currentPurchaseOrder: order,
            loading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Erstellen der Bestellung',
            loading: false 
          });
        }
      },

      // ============================================================================
      // ACTIONS - BESTELLUNG
      // ============================================================================

      fetchPurchaseOrders: async (filters?: FilterOptions) => {
        set({ purchaseOrderLoading: true, purchaseOrderError: null });
        try {
          const response = await erpApiService.getPurchaseOrders(filters);
          set({ 
            purchaseOrders: response.data,
            purchaseOrderLoading: false 
          });
        } catch (error) {
          set({ 
            purchaseOrderError: error instanceof Error ? error.message : 'Fehler beim Laden der Bestellungen',
            purchaseOrderLoading: false 
          });
        }
      },

      fetchPurchaseOrder: async (id: string) => {
        set({ purchaseOrderLoading: true, purchaseOrderError: null });
        try {
          const order = await erpApiService.getPurchaseOrder(id);
          set({ 
            currentPurchaseOrder: order,
            purchaseOrderLoading: false 
          });
        } catch (error) {
          set({ 
            purchaseOrderError: error instanceof Error ? error.message : 'Fehler beim Laden der Bestellung',
            purchaseOrderLoading: false 
          });
        }
      },

      createPurchaseOrder: async (order: PurchaseOrderData) => {
        set({ loading: true, error: null });
        try {
          const createdOrder = await erpApiService.createPurchaseOrder(order);
          set(state => ({ 
            purchaseOrders: [...state.purchaseOrders, createdOrder],
            currentPurchaseOrder: createdOrder,
            loading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Erstellen der Bestellung',
            loading: false 
          });
        }
      },

      updatePurchaseOrder: async (id: string, order: Partial<PurchaseOrderData>) => {
        set({ loading: true, error: null });
        try {
          const updatedOrder = await erpApiService.updatePurchaseOrder(id, order);
          set(state => ({
            purchaseOrders: state.purchaseOrders.map(o => o.id === id ? updatedOrder : o),
            currentPurchaseOrder: state.currentPurchaseOrder?.id === id ? updatedOrder : state.currentPurchaseOrder,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Aktualisieren der Bestellung',
            loading: false 
          });
        }
      },

      deletePurchaseOrder: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await erpApiService.deletePurchaseOrder(id);
          set(state => ({
            purchaseOrders: state.purchaseOrders.filter(o => o.id !== id),
            currentPurchaseOrder: state.currentPurchaseOrder?.id === id ? null : state.currentPurchaseOrder,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Löschen der Bestellung',
            loading: false 
          });
        }
      },

      addPurchaseOrderPosition: async (orderId: string, position: PurchaseOrderPosition) => {
        set({ loading: true, error: null });
        try {
          const newPosition = await erpApiService.addPurchaseOrderPosition(orderId, position);
          set(state => ({
            currentPurchaseOrder: state.currentPurchaseOrder?.id === orderId 
              ? { ...state.currentPurchaseOrder, positions: [...state.currentPurchaseOrder.positions, newPosition] }
              : state.currentPurchaseOrder,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Hinzufügen der Position',
            loading: false 
          });
        }
      },

      updatePurchaseOrderPosition: async (orderId: string, positionId: string, position: Partial<PurchaseOrderPosition>) => {
        set({ loading: true, error: null });
        try {
          const updatedPosition = await erpApiService.updatePurchaseOrderPosition(orderId, positionId, position);
          set(state => ({
            currentPurchaseOrder: state.currentPurchaseOrder?.id === orderId 
              ? { 
                  ...state.currentPurchaseOrder, 
                  positions: state.currentPurchaseOrder.positions.map(p => 
                    p.id === positionId ? updatedPosition : p
                  ) 
                }
              : state.currentPurchaseOrder,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Aktualisieren der Position',
            loading: false 
          });
        }
      },

      deletePurchaseOrderPosition: async (orderId: string, positionId: string) => {
        set({ loading: true, error: null });
        try {
          await erpApiService.deletePurchaseOrderPosition(orderId, positionId);
          set(state => ({
            currentPurchaseOrder: state.currentPurchaseOrder?.id === orderId 
              ? { 
                  ...state.currentPurchaseOrder, 
                  positions: state.currentPurchaseOrder.positions.filter(p => p.id !== positionId) 
                }
              : state.currentPurchaseOrder,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Löschen der Position',
            loading: false 
          });
        }
      },

      setCurrentPurchaseOrder: (order: PurchaseOrderData | null) => {
        set({ currentPurchaseOrder: order });
      },

      // ============================================================================
      // ACTIONS - LIEFERANTEN-ANGEBOT
      // ============================================================================

      fetchSupplierOffers: async (filters?: FilterOptions) => {
        set({ supplierOfferLoading: true, supplierOfferError: null });
        try {
          const response = await erpApiService.getSupplierOffers(filters);
          set({ 
            supplierOffers: response.data,
            supplierOfferLoading: false 
          });
        } catch (error) {
          set({ 
            supplierOfferError: error instanceof Error ? error.message : 'Fehler beim Laden der Lieferanten-Angebote',
            supplierOfferLoading: false 
          });
        }
      },

      fetchSupplierOffer: async (id: string) => {
        set({ supplierOfferLoading: true, supplierOfferError: null });
        try {
          const offer = await erpApiService.getSupplierOffer(id);
          set({ 
            currentSupplierOffer: offer,
            supplierOfferLoading: false 
          });
        } catch (error) {
          set({ 
            supplierOfferError: error instanceof Error ? error.message : 'Fehler beim Laden des Lieferanten-Angebots',
            supplierOfferLoading: false 
          });
        }
      },

      createSupplierOffer: async (offer: SupplierOfferData) => {
        set({ loading: true, error: null });
        try {
          const createdOffer = await erpApiService.createSupplierOffer(offer);
          set(state => ({ 
            supplierOffers: [...state.supplierOffers, createdOffer],
            currentSupplierOffer: createdOffer,
            loading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Erstellen des Lieferanten-Angebots',
            loading: false 
          });
        }
      },

      updateSupplierOffer: async (id: string, offer: Partial<SupplierOfferData>) => {
        set({ loading: true, error: null });
        try {
          const updatedOffer = await erpApiService.updateSupplierOffer(id, offer);
          set(state => ({
            supplierOffers: state.supplierOffers.map(o => o.id === id ? updatedOffer : o),
            currentSupplierOffer: state.currentSupplierOffer?.id === id ? updatedOffer : state.currentSupplierOffer,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Lieferanten-Angebots',
            loading: false 
          });
        }
      },

      deleteSupplierOffer: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await erpApiService.deleteSupplierOffer(id);
          set(state => ({
            supplierOffers: state.supplierOffers.filter(o => o.id !== id),
            currentSupplierOffer: state.currentSupplierOffer?.id === id ? null : state.currentSupplierOffer,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Löschen des Lieferanten-Angebots',
            loading: false 
          });
        }
      },

      addSupplierOfferPosition: async (offerId: string, position: SupplierOfferPosition) => {
        set({ loading: true, error: null });
        try {
          const newPosition = await erpApiService.addSupplierOfferPosition(offerId, position);
          set(state => ({
            currentSupplierOffer: state.currentSupplierOffer?.id === offerId 
              ? { ...state.currentSupplierOffer, positions: [...state.currentSupplierOffer.positions, newPosition] }
              : state.currentSupplierOffer,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Hinzufügen der Position',
            loading: false 
          });
        }
      },

      setCurrentSupplierOffer: (offer: SupplierOfferData | null) => {
        set({ currentSupplierOffer: offer });
      },

      // ============================================================================
      // ACTIONS - ANFRAGE
      // ============================================================================

      fetchInquiries: async (filters?: FilterOptions) => {
        set({ inquiryLoading: true, inquiryError: null });
        try {
          const response = await erpApiService.getInquiries(filters);
          set({ 
            inquiries: response.data,
            inquiryLoading: false 
          });
        } catch (error) {
          set({ 
            inquiryError: error instanceof Error ? error.message : 'Fehler beim Laden der Anfragen',
            inquiryLoading: false 
          });
        }
      },

      fetchInquiry: async (id: string) => {
        set({ inquiryLoading: true, inquiryError: null });
        try {
          const inquiry = await erpApiService.getInquiry(id);
          set({ 
            currentInquiry: inquiry,
            inquiryLoading: false 
          });
        } catch (error) {
          set({ 
            inquiryError: error instanceof Error ? error.message : 'Fehler beim Laden der Anfrage',
            inquiryLoading: false 
          });
        }
      },

      createInquiry: async (inquiry: InquiryData) => {
        set({ loading: true, error: null });
        try {
          const createdInquiry = await erpApiService.createInquiry(inquiry);
          set(state => ({ 
            inquiries: [...state.inquiries, createdInquiry],
            currentInquiry: createdInquiry,
            loading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Erstellen der Anfrage',
            loading: false 
          });
        }
      },

      updateInquiry: async (id: string, inquiry: Partial<InquiryData>) => {
        set({ loading: true, error: null });
        try {
          const updatedInquiry = await erpApiService.updateInquiry(id, inquiry);
          set(state => ({
            inquiries: state.inquiries.map(i => i.id === id ? updatedInquiry : i),
            currentInquiry: state.currentInquiry?.id === id ? updatedInquiry : state.currentInquiry,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Aktualisieren der Anfrage',
            loading: false 
          });
        }
      },

      deleteInquiry: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await erpApiService.deleteInquiry(id);
          set(state => ({
            inquiries: state.inquiries.filter(i => i.id !== id),
            currentInquiry: state.currentInquiry?.id === id ? null : state.currentInquiry,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Löschen der Anfrage',
            loading: false 
          });
        }
      },

      setCurrentInquiry: (inquiry: InquiryData | null) => {
        set({ currentInquiry: inquiry });
      },

      // ============================================================================
      // ACTIONS - LIEFERSCHEIN
      // ============================================================================

      fetchDeliveryNotes: async (filters?: FilterOptions) => {
        set({ deliveryNoteLoading: true, deliveryNoteError: null });
        try {
          const response = await erpApiService.getDeliveryNotes(filters);
          set({ 
            deliveryNotes: response.data,
            deliveryNoteLoading: false 
          });
        } catch (error) {
          set({ 
            deliveryNoteError: error instanceof Error ? error.message : 'Fehler beim Laden der Lieferscheine',
            deliveryNoteLoading: false 
          });
        }
      },

      fetchDeliveryNote: async (id: string) => {
        set({ deliveryNoteLoading: true, deliveryNoteError: null });
        try {
          const delivery = await erpApiService.getDeliveryNote(id);
          set({ 
            currentDeliveryNote: delivery,
            deliveryNoteLoading: false 
          });
        } catch (error) {
          set({ 
            deliveryNoteError: error instanceof Error ? error.message : 'Fehler beim Laden des Lieferscheins',
            deliveryNoteLoading: false 
          });
        }
      },

      createDeliveryNote: async (delivery: DeliveryNoteData) => {
        set({ loading: true, error: null });
        try {
          const createdDelivery = await erpApiService.createDeliveryNote(delivery);
          set(state => ({ 
            deliveryNotes: [...state.deliveryNotes, createdDelivery],
            currentDeliveryNote: createdDelivery,
            loading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Erstellen des Lieferscheins',
            loading: false 
          });
        }
      },

      updateDeliveryNote: async (id: string, delivery: Partial<DeliveryNoteData>) => {
        set({ loading: true, error: null });
        try {
          const updatedDelivery = await erpApiService.updateDeliveryNote(id, delivery);
          set(state => ({
            deliveryNotes: state.deliveryNotes.map(d => d.id === id ? updatedDelivery : d),
            currentDeliveryNote: state.currentDeliveryNote?.id === id ? updatedDelivery : state.currentDeliveryNote,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Lieferscheins',
            loading: false 
          });
        }
      },

      deleteDeliveryNote: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await erpApiService.deleteDeliveryNote(id);
          set(state => ({
            deliveryNotes: state.deliveryNotes.filter(d => d.id !== id),
            currentDeliveryNote: state.currentDeliveryNote?.id === id ? null : state.currentDeliveryNote,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Löschen des Lieferscheins',
            loading: false 
          });
        }
      },

      addDeliveryPosition: async (deliveryId: string, position: DeliveryPosition) => {
        set({ loading: true, error: null });
        try {
          const newPosition = await erpApiService.addDeliveryPosition(deliveryId, position);
          set(state => ({
            currentDeliveryNote: state.currentDeliveryNote?.id === deliveryId 
              ? { ...state.currentDeliveryNote, positions: [...state.currentDeliveryNote.positions, newPosition] }
              : state.currentDeliveryNote,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Hinzufügen der Position',
            loading: false 
          });
        }
      },

      printDeliveryNote: async (id: string) => {
        try {
          return await erpApiService.printDeliveryNote(id);
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Drucken des Lieferscheins'
          });
          throw error;
        }
      },

      setCurrentDeliveryNote: (delivery: DeliveryNoteData | null) => {
        set({ currentDeliveryNote: delivery });
      },

      // ============================================================================
      // ACTIONS - AUFTRAGSBESTÄTIGUNG
      // ============================================================================

      fetchOrderConfirmations: async (filters?: FilterOptions) => {
        set({ orderConfirmationLoading: true, orderConfirmationError: null });
        try {
          const response = await erpApiService.getOrderConfirmations(filters);
          set({ 
            orderConfirmations: response.data,
            orderConfirmationLoading: false 
          });
        } catch (error) {
          set({ 
            orderConfirmationError: error instanceof Error ? error.message : 'Fehler beim Laden der Auftragsbestätigungen',
            orderConfirmationLoading: false 
          });
        }
      },

      fetchOrderConfirmation: async (id: string) => {
        set({ orderConfirmationLoading: true, orderConfirmationError: null });
        try {
          const confirmation = await erpApiService.getOrderConfirmation(id);
          set({ 
            currentOrderConfirmation: confirmation,
            orderConfirmationLoading: false 
          });
        } catch (error) {
          set({ 
            orderConfirmationError: error instanceof Error ? error.message : 'Fehler beim Laden der Auftragsbestätigung',
            orderConfirmationLoading: false 
          });
        }
      },

      createOrderConfirmation: async (confirmation: OrderConfirmationData) => {
        set({ loading: true, error: null });
        try {
          const createdConfirmation = await erpApiService.createOrderConfirmation(confirmation);
          set(state => ({ 
            orderConfirmations: [...state.orderConfirmations, createdConfirmation],
            currentOrderConfirmation: createdConfirmation,
            loading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Erstellen der Auftragsbestätigung',
            loading: false 
          });
        }
      },

      updateOrderConfirmation: async (id: string, confirmation: Partial<OrderConfirmationData>) => {
        set({ loading: true, error: null });
        try {
          const updatedConfirmation = await erpApiService.updateOrderConfirmation(id, confirmation);
          set(state => ({
            orderConfirmations: state.orderConfirmations.map(c => c.id === id ? updatedConfirmation : c),
            currentOrderConfirmation: state.currentOrderConfirmation?.id === id ? updatedConfirmation : state.currentOrderConfirmation,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Aktualisieren der Auftragsbestätigung',
            loading: false 
          });
        }
      },

      deleteOrderConfirmation: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await erpApiService.deleteOrderConfirmation(id);
          set(state => ({
            orderConfirmations: state.orderConfirmations.filter(c => c.id !== id),
            currentOrderConfirmation: state.currentOrderConfirmation?.id === id ? null : state.currentOrderConfirmation,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Löschen der Auftragsbestätigung',
            loading: false 
          });
        }
      },

      addContactPerson: async (confirmationId: string, contact: ContactPerson) => {
        set({ loading: true, error: null });
        try {
          const newContact = await erpApiService.addContactPerson(confirmationId, contact);
          set(state => ({
            currentOrderConfirmation: state.currentOrderConfirmation?.id === confirmationId 
              ? { ...state.currentOrderConfirmation, contacts: [...state.currentOrderConfirmation.contacts, newContact] }
              : state.currentOrderConfirmation,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Hinzufügen des Ansprechpartners',
            loading: false 
          });
        }
      },

      addRepresentative: async (confirmationId: string, representative: Representative) => {
        set({ loading: true, error: null });
        try {
          const newRepresentative = await erpApiService.addRepresentative(confirmationId, representative);
          set(state => ({
            currentOrderConfirmation: state.currentOrderConfirmation?.id === confirmationId 
              ? { ...state.currentOrderConfirmation, representatives: [...state.currentOrderConfirmation.representatives, newRepresentative] }
              : state.currentOrderConfirmation,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Hinzufügen des Vertreters',
            loading: false 
          });
        }
      },

      setCurrentOrderConfirmation: (confirmation: OrderConfirmationData | null) => {
        set({ currentOrderConfirmation: confirmation });
      },

      // ============================================================================
      // ACTIONS - ANGEBOT
      // ============================================================================

      fetchOffers: async (filters?: FilterOptions) => {
        set({ offerLoading: true, offerError: null });
        try {
          const response = await erpApiService.getOffers(filters);
          set({ 
            offers: response.data,
            offerLoading: false 
          });
        } catch (error) {
          set({ 
            offerError: error instanceof Error ? error.message : 'Fehler beim Laden der Angebote',
            offerLoading: false 
          });
        }
      },

      fetchOffer: async (id: string) => {
        set({ offerLoading: true, offerError: null });
        try {
          const offer = await erpApiService.getOffer(id);
          set({ 
            currentOffer: offer,
            offerLoading: false 
          });
        } catch (error) {
          set({ 
            offerError: error instanceof Error ? error.message : 'Fehler beim Laden des Angebots',
            offerLoading: false 
          });
        }
      },

      createOffer: async (offer: OfferData) => {
        set({ loading: true, error: null });
        try {
          const createdOffer = await erpApiService.createOffer(offer);
          set(state => ({ 
            offers: [...state.offers, createdOffer],
            currentOffer: createdOffer,
            loading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Erstellen des Angebots',
            loading: false 
          });
        }
      },

      updateOffer: async (id: string, offer: Partial<OfferData>) => {
        set({ loading: true, error: null });
        try {
          const updatedOffer = await erpApiService.updateOffer(id, offer);
          set(state => ({
            offers: state.offers.map(o => o.id === id ? updatedOffer : o),
            currentOffer: state.currentOffer?.id === id ? updatedOffer : state.currentOffer,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Angebots',
            loading: false 
          });
        }
      },

      deleteOffer: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await erpApiService.deleteOffer(id);
          set(state => ({
            offers: state.offers.filter(o => o.id !== id),
            currentOffer: state.currentOffer?.id === id ? null : state.currentOffer,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Löschen des Angebots',
            loading: false 
          });
        }
      },

      setCurrentOffer: (offer: OfferData | null) => {
        set({ currentOffer: offer });
      },

      // ============================================================================
      // ACTIONS - ALLGEMEIN
      // ============================================================================

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      printDocument: async (documentType: string, id: string) => {
        try {
          return await erpApiService.printDocument(documentType as any, id);
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Drucken des Dokuments'
          });
          throw error;
        }
      },

      exportDocument: async (documentType: string, id: string) => {
        try {
          return await erpApiService.exportDocument(documentType as any, id);
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Exportieren des Dokuments'
          });
          throw error;
        }
      },

      updateStatus: async (documentType: string, id: string, status: string) => {
        set({ loading: true, error: null });
        try {
          await erpApiService.updateStatus(documentType as any, id, status);
          set({ loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Status',
            loading: false 
          });
        }
      },

      markAsCompleted: async (documentType: string, id: string) => {
        set({ loading: true, error: null });
        try {
          await erpApiService.markAsCompleted(documentType as any, id);
          set({ loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Fehler beim Markieren als erledigt',
            loading: false 
          });
        }
      },

      // Platzhalter für neue Funktionen
      fetchOrders: async () => { throw new Error('Not implemented'); },
      createOrder: async (order: any) => { throw new Error('Not implemented'); },
      updateOrder: async (id: string, order: Partial<any>) => { throw new Error('Not implemented'); },
      deleteOrder: async (id: string) => { throw new Error('Not implemented'); },
      fetchContacts: async () => { throw new Error('Not implemented'); },
      createContact: async (contact: any) => { throw new Error('Not implemented'); },
      updateContact: async (id: string, contact: Partial<any>) => { throw new Error('Not implemented'); },
      deleteContact: async (id: string) => { throw new Error('Not implemented'); },
      fetchDeliveries: async () => { throw new Error('Not implemented'); },
      createDelivery: async (delivery: any) => { throw new Error('Not implemented'); },
      updateDelivery: async (id: string, delivery: Partial<any>) => { throw new Error('Not implemented'); },
      deleteDelivery: async (id: string) => { throw new Error('Not implemented'); },
    }),
    { name: 'erp-store' }
  )
);

// Selectors für optimierte Performance
export const useErpSelectors = () => {
  const store = useErpStore();
  
  return {
    // Orders
    orders: store.orders,
    orderById: (id: string) => store.orders.find(o => o.id === id),
    ordersByStatus: (status: string) => store.orders.filter(o => o.status === status),
    ordersByDateRange: (from: Date, to: Date) => 
      store.orders.filter(o => {
        const orderDate = new Date(o.documentDate);
        return orderDate >= from && orderDate <= to;
      }),
    
    // Contacts
    contacts: store.contacts,
    contactById: (id: string) => store.contacts.find(c => c.id === id),
    contactsByType: (type: string) => store.contacts.filter(c => c.contactType === type),
    contactsByRepresentative: (representative: string) => 
      store.contacts.filter(c => c.representative === representative),
    
    // Deliveries
    deliveries: store.deliveries,
    deliveryById: (id: string) => store.deliveries.find(d => d.id === id),
    deliveriesByStatus: (status: string) => store.deliveries.filter(d => d.status === status),
    
    // Statistics
    orderStatistics: () => {
      const orders = store.orders;
      return {
        total: orders.length,
        byStatus: orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byType: orders.reduce((acc, order) => {
          acc[order.documentType] = (acc[order.documentType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0)
      };
    },
    
    contactStatistics: () => {
      const contacts = store.contacts;
      return {
        total: contacts.length,
        byType: contacts.reduce((acc, contact) => {
          acc[contact.contactType] = (acc[contact.contactType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byStatus: contacts.reduce((acc, contact) => {
          acc[contact.status] = (acc[contact.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
    }
  };
};

// Custom Hooks für spezifische Use Cases
export const useErpOrders = () => {
  const { orders, fetchOrders, createOrder, updateOrder, deleteOrder } = useErpStore();
  const { orderStatistics } = useErpSelectors();
  
  return {
    orders,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    statistics: orderStatistics()
  };
};

export const useErpContacts = () => {
  const { contacts, fetchContacts, createContact, updateContact, deleteContact } = useErpStore();
  const { contactStatistics } = useErpSelectors();
  
  return {
    contacts,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    statistics: contactStatistics()
  };
};

export const useErpDeliveries = () => {
  const { deliveries, fetchDeliveries, createDelivery, updateDelivery, deleteDelivery } = useErpStore();
  
  return {
    deliveries,
    fetchDeliveries,
    createDelivery,
    updateDelivery,
    deleteDelivery
  };
};

export const useErpExport = () => {
  const { exportDocument } = useErpStore();
  
  return {
    exportDocument
  };
}; 