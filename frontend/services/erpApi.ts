import axios, { AxiosResponse } from 'axios';
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
  ApiResponse,
  PaginatedResponse,
  FilterOptions,
  DocumentType,
  UnitType,
  PaymentMethod,
  OrderStatusEnum,
  OfferStatusEnum
} from '../types/erpTypes';

// API-Basis-URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Axios-Instanz mit Standard-Konfiguration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request-Interceptor für Authentifizierung
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response-Interceptor für Fehlerbehandlung
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export class ErpApiService {
  // ============================================================================
  // BESTELLVORSCHLAG / BESTELLUNG / LIEFERANTENSTAMM
  // ============================================================================

  /**
   * Bestellvorschläge abrufen
   */
  async getOrderSuggestions(filters: OrderSuggestionFilters): Promise<OrderSuggestionData[]> {
    const response: AxiosResponse<ApiResponse<OrderSuggestionData[]>> = await apiClient.get('/order-suggestions', {
      params: filters
    });
    return response.data.data || [];
  }

  /**
   * Bestellung aus Vorschlag erstellen
   */
  async createOrderFromSuggestion(suggestion: OrderSuggestionData): Promise<PurchaseOrderData> {
    const response: AxiosResponse<ApiResponse<PurchaseOrderData>> = await apiClient.post('/order-suggestions/create-order', suggestion);
    return response.data.data!;
  }

  // ============================================================================
  // BESTELLUNG ERSTELLEN
  // ============================================================================

  /**
   * Bestellungen abrufen
   */
  async getPurchaseOrders(filters?: FilterOptions): Promise<PaginatedResponse<PurchaseOrderData>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<PurchaseOrderData>>> = await apiClient.get('/purchase-orders', {
      params: filters
    });
    return response.data.data!;
  }

  /**
   * Bestellung abrufen
   */
  async getPurchaseOrder(id: string): Promise<PurchaseOrderData> {
    const response: AxiosResponse<ApiResponse<PurchaseOrderData>> = await apiClient.get(`/purchase-orders/${id}`);
    return response.data.data!;
  }

  /**
   * Bestellung erstellen
   */
  async createPurchaseOrder(order: PurchaseOrderData): Promise<PurchaseOrderData> {
    const response: AxiosResponse<ApiResponse<PurchaseOrderData>> = await apiClient.post('/purchase-orders', order);
    return response.data.data!;
  }

  /**
   * Bestellung aktualisieren
   */
  async updatePurchaseOrder(id: string, order: Partial<PurchaseOrderData>): Promise<PurchaseOrderData> {
    const response: AxiosResponse<ApiResponse<PurchaseOrderData>> = await apiClient.put(`/purchase-orders/${id}`, order);
    return response.data.data!;
  }

  /**
   * Bestellung löschen
   */
  async deletePurchaseOrder(id: string): Promise<void> {
    await apiClient.delete(`/purchase-orders/${id}`);
  }

  /**
   * Bestellposition hinzufügen
   */
  async addPurchaseOrderPosition(orderId: string, position: PurchaseOrderPosition): Promise<PurchaseOrderPosition> {
    const response: AxiosResponse<ApiResponse<PurchaseOrderPosition>> = await apiClient.post(`/purchase-orders/${orderId}/positions`, position);
    return response.data.data!;
  }

  /**
   * Bestellposition aktualisieren
   */
  async updatePurchaseOrderPosition(orderId: string, positionId: string, position: Partial<PurchaseOrderPosition>): Promise<PurchaseOrderPosition> {
    const response: AxiosResponse<ApiResponse<PurchaseOrderPosition>> = await apiClient.put(`/purchase-orders/${orderId}/positions/${positionId}`, position);
    return response.data.data!;
  }

  /**
   * Bestellposition löschen
   */
  async deletePurchaseOrderPosition(orderId: string, positionId: string): Promise<void> {
    await apiClient.delete(`/purchase-orders/${orderId}/positions/${positionId}`);
  }

  // ============================================================================
  // LIEFERANTEN-ANGEBOT
  // ============================================================================

  /**
   * Lieferanten-Angebote abrufen
   */
  async getSupplierOffers(filters?: FilterOptions): Promise<PaginatedResponse<SupplierOfferData>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<SupplierOfferData>>> = await apiClient.get('/supplier-offers', {
      params: filters
    });
    return response.data.data!;
  }

  /**
   * Lieferanten-Angebot abrufen
   */
  async getSupplierOffer(id: string): Promise<SupplierOfferData> {
    const response: AxiosResponse<ApiResponse<SupplierOfferData>> = await apiClient.get(`/supplier-offers/${id}`);
    return response.data.data!;
  }

  /**
   * Lieferanten-Angebot erstellen
   */
  async createSupplierOffer(offer: SupplierOfferData): Promise<SupplierOfferData> {
    const response: AxiosResponse<ApiResponse<SupplierOfferData>> = await apiClient.post('/supplier-offers', offer);
    return response.data.data!;
  }

  /**
   * Lieferanten-Angebot aktualisieren
   */
  async updateSupplierOffer(id: string, offer: Partial<SupplierOfferData>): Promise<SupplierOfferData> {
    const response: AxiosResponse<ApiResponse<SupplierOfferData>> = await apiClient.put(`/supplier-offers/${id}`, offer);
    return response.data.data!;
  }

  /**
   * Lieferanten-Angebot löschen
   */
  async deleteSupplierOffer(id: string): Promise<void> {
    await apiClient.delete(`/supplier-offers/${id}`);
  }

  /**
   * Angebotsposition hinzufügen
   */
  async addSupplierOfferPosition(offerId: string, position: SupplierOfferPosition): Promise<SupplierOfferPosition> {
    const response: AxiosResponse<ApiResponse<SupplierOfferPosition>> = await apiClient.post(`/supplier-offers/${offerId}/positions`, position);
    return response.data.data!;
  }

  // ============================================================================
  // ANFRAGE
  // ============================================================================

  /**
   * Anfragen abrufen
   */
  async getInquiries(filters?: FilterOptions): Promise<PaginatedResponse<InquiryData>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<InquiryData>>> = await apiClient.get('/inquiries', {
      params: filters
    });
    return response.data.data!;
  }

  /**
   * Anfrage abrufen
   */
  async getInquiry(id: string): Promise<InquiryData> {
    const response: AxiosResponse<ApiResponse<InquiryData>> = await apiClient.get(`/inquiries/${id}`);
    return response.data.data!;
  }

  /**
   * Anfrage erstellen
   */
  async createInquiry(inquiry: InquiryData): Promise<InquiryData> {
    const response: AxiosResponse<ApiResponse<InquiryData>> = await apiClient.post('/inquiries', inquiry);
    return response.data.data!;
  }

  /**
   * Anfrage aktualisieren
   */
  async updateInquiry(id: string, inquiry: Partial<InquiryData>): Promise<InquiryData> {
    const response: AxiosResponse<ApiResponse<InquiryData>> = await apiClient.put(`/inquiries/${id}`, inquiry);
    return response.data.data!;
  }

  /**
   * Anfrage löschen
   */
  async deleteInquiry(id: string): Promise<void> {
    await apiClient.delete(`/inquiries/${id}`);
  }

  // ============================================================================
  // LIEFERSCHEIN-ERFASSUNG
  // ============================================================================

  /**
   * Lieferscheine abrufen
   */
  async getDeliveryNotes(filters?: FilterOptions): Promise<PaginatedResponse<DeliveryNoteData>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<DeliveryNoteData>>> = await apiClient.get('/delivery-notes', {
      params: filters
    });
    return response.data.data!;
  }

  /**
   * Lieferschein abrufen
   */
  async getDeliveryNote(id: string): Promise<DeliveryNoteData> {
    const response: AxiosResponse<ApiResponse<DeliveryNoteData>> = await apiClient.get(`/delivery-notes/${id}`);
    return response.data.data!;
  }

  /**
   * Lieferschein erstellen
   */
  async createDeliveryNote(delivery: DeliveryNoteData): Promise<DeliveryNoteData> {
    const response: AxiosResponse<ApiResponse<DeliveryNoteData>> = await apiClient.post('/delivery-notes', delivery);
    return response.data.data!;
  }

  /**
   * Lieferschein aktualisieren
   */
  async updateDeliveryNote(id: string, delivery: Partial<DeliveryNoteData>): Promise<DeliveryNoteData> {
    const response: AxiosResponse<ApiResponse<DeliveryNoteData>> = await apiClient.put(`/delivery-notes/${id}`, delivery);
    return response.data.data!;
  }

  /**
   * Lieferschein löschen
   */
  async deleteDeliveryNote(id: string): Promise<void> {
    await apiClient.delete(`/delivery-notes/${id}`);
  }

  /**
   * Lieferposition hinzufügen
   */
  async addDeliveryPosition(deliveryId: string, position: DeliveryPosition): Promise<DeliveryPosition> {
    const response: AxiosResponse<ApiResponse<DeliveryPosition>> = await apiClient.post(`/delivery-notes/${deliveryId}/positions`, position);
    return response.data.data!;
  }

  /**
   * Lieferschein drucken
   */
  async printDeliveryNote(id: string): Promise<Blob> {
    const response = await apiClient.get(`/delivery-notes/${id}/print`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // ============================================================================
  // AUFTRAGSBESTÄTIGUNG
  // ============================================================================

  /**
   * Auftragsbestätigungen abrufen
   */
  async getOrderConfirmations(filters?: FilterOptions): Promise<PaginatedResponse<OrderConfirmationData>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<OrderConfirmationData>>> = await apiClient.get('/order-confirmations', {
      params: filters
    });
    return response.data.data!;
  }

  /**
   * Auftragsbestätigung abrufen
   */
  async getOrderConfirmation(id: string): Promise<OrderConfirmationData> {
    const response: AxiosResponse<ApiResponse<OrderConfirmationData>> = await apiClient.get(`/order-confirmations/${id}`);
    return response.data.data!;
  }

  /**
   * Auftragsbestätigung erstellen
   */
  async createOrderConfirmation(confirmation: OrderConfirmationData): Promise<OrderConfirmationData> {
    const response: AxiosResponse<ApiResponse<OrderConfirmationData>> = await apiClient.post('/order-confirmations', confirmation);
    return response.data.data!;
  }

  /**
   * Auftragsbestätigung aktualisieren
   */
  async updateOrderConfirmation(id: string, confirmation: Partial<OrderConfirmationData>): Promise<OrderConfirmationData> {
    const response: AxiosResponse<ApiResponse<OrderConfirmationData>> = await apiClient.put(`/order-confirmations/${id}`, confirmation);
    return response.data.data!;
  }

  /**
   * Auftragsbestätigung löschen
   */
  async deleteOrderConfirmation(id: string): Promise<void> {
    await apiClient.delete(`/order-confirmations/${id}`);
  }

  /**
   * Ansprechpartner hinzufügen
   */
  async addContactPerson(confirmationId: string, contact: ContactPerson): Promise<ContactPerson> {
    const response: AxiosResponse<ApiResponse<ContactPerson>> = await apiClient.post(`/order-confirmations/${confirmationId}/contacts`, contact);
    return response.data.data!;
  }

  /**
   * Vertreter hinzufügen
   */
  async addRepresentative(confirmationId: string, representative: Representative): Promise<Representative> {
    const response: AxiosResponse<ApiResponse<Representative>> = await apiClient.post(`/order-confirmations/${confirmationId}/representatives`, representative);
    return response.data.data!;
  }

  // ============================================================================
  // ANGEBOT
  // ============================================================================

  /**
   * Angebote abrufen
   */
  async getOffers(filters?: FilterOptions): Promise<PaginatedResponse<OfferData>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<OfferData>>> = await apiClient.get('/offers', {
      params: filters
    });
    return response.data.data!;
  }

  /**
   * Angebot abrufen
   */
  async getOffer(id: string): Promise<OfferData> {
    const response: AxiosResponse<ApiResponse<OfferData>> = await apiClient.get(`/offers/${id}`);
    return response.data.data!;
  }

  /**
   * Angebot erstellen
   */
  async createOffer(offer: OfferData): Promise<OfferData> {
    const response: AxiosResponse<ApiResponse<OfferData>> = await apiClient.post('/offers', offer);
    return response.data.data!;
  }

  /**
   * Angebot aktualisieren
   */
  async updateOffer(id: string, offer: Partial<OfferData>): Promise<OfferData> {
    const response: AxiosResponse<ApiResponse<OfferData>> = await apiClient.put(`/offers/${id}`, offer);
    return response.data.data!;
  }

  /**
   * Angebot löschen
   */
  async deleteOffer(id: string): Promise<void> {
    await apiClient.delete(`/offers/${id}`);
  }

  // ============================================================================
  // ALLGEMEINE FUNKTIONEN
  // ============================================================================

  /**
   * Dokument drucken
   */
  async printDocument(documentType: DocumentType, id: string): Promise<Blob> {
    const response = await apiClient.get(`/${documentType}/${id}/print`, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Dokument als PDF exportieren
   */
  async exportDocument(documentType: DocumentType, id: string): Promise<Blob> {
    const response = await apiClient.get(`/${documentType}/${id}/export`, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Status aktualisieren
   */
  async updateStatus(documentType: DocumentType, id: string, status: string): Promise<void> {
    await apiClient.patch(`/${documentType}/${id}/status`, { status });
  }

  /**
   * Als erledigt markieren
   */
  async markAsCompleted(documentType: DocumentType, id: string): Promise<void> {
    await apiClient.patch(`/${documentType}/${id}/complete`);
  }

  /**
   * Statistiken abrufen
   */
  async getStatistics(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get('/statistics');
    return response.data.data!;
  }

  /**
   * Health Check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

// Singleton-Instanz exportieren
export const erpApiService = new ErpApiService(); 