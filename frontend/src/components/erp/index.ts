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
// Diese werden in den jeweiligen Komponenten-Dateien definiert 