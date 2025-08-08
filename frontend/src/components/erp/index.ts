// ERP-Komponenten für VALEO NeuroERP
// Export aller ERP-bezogenen Komponenten

// Bestehende ERP-Komponenten
export { OrderConfirmation } from './OrderConfirmation';
export { DeliveryNote } from './DeliveryNote';
export { SupplierOffer } from './SupplierOffer';
export { PurchaseOrder } from './PurchaseOrder';
export { OrderSuggestion } from './OrderSuggestion';

// Neue ERP-Komponenten für Einkauf, Lieferschein, Bestellung, Frachtauftrag
export { DeliveryNoteForm } from './DeliveryNoteForm';
export { OrderSuggestionForm } from './OrderSuggestionForm';
export { FreightOrderForm } from './FreightOrderForm';

// TypeScript Interfaces für externe Verwendung
export type {
  PurchaseOrderData,
  PurchaseOrderPosition,
  DocumentReference,
  PaymentTerms,
  PurchaseOrderProps
} from './PurchaseOrder';

export type {
  OrderSuggestionData,
  OrderSuggestionProps
} from './OrderSuggestion';

export type {
  SupplierOfferData,
  SupplierOfferProps
} from './SupplierOffer';

export type {
  DeliveryNoteData,
  DeliveryNoteProps
} from './DeliveryNote';

export type {
  OrderConfirmationData,
  OrderConfirmationProps
} from './OrderConfirmation'; 