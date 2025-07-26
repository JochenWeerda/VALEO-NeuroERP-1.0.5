# ERP-Komponenten Spezifikation

## 🎯 Übersicht
Diese Spezifikation definiert die Frontend-Komponenten für die vollständige ERP-Integration basierend auf den Screenshots.

## 📦 Komponenten-Struktur

### 1. Bestellvorschlag-Komponente (`OrderSuggestion.tsx`)

#### Props Interface
```typescript
interface OrderSuggestionProps {
  onSuggestionSelect: (suggestion: OrderSuggestionData) => void;
  onOrderCreate: (order: OrderData) => void;
  filters: OrderSuggestionFilters;
}
```

#### Datenstruktur
```typescript
interface OrderSuggestionData {
  // Kopfbereich
  articleGroup: string;
  branch: string;
  articleNumber: string;
  description1: string;
  description2: string;
  storageLocation: string;
  matchcode: string;
  matchcode2: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  sales: number;
  suggestion: number;
  
  // Tabellendaten
  warehouse: string;
  stock: number;
  purchase: number;
}
```

#### UI-Elemente
- **Kopfbereich**: Grid-Layout mit allen Eingabefeldern
- **Filter-Bereich**: Dropdown für Artikel-Gruppe, Niederlassung
- **Tabelle**: Ant Design Table mit Sortierung und Filterung
- **Aktions-Buttons**: "Bestellung erstellen", "Vorschlag übernehmen"

---

### 2. Bestellung-Komponente (`PurchaseOrder.tsx`)

#### Props Interface
```typescript
interface PurchaseOrderProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: PurchaseOrderData;
  onSave: (order: PurchaseOrderData) => void;
  onCancel: () => void;
}
```

#### Datenstruktur
```typescript
interface PurchaseOrderData {
  // Kopfbereich
  creditorAccountNumber: string;
  branch: string;
  costCenter: string;
  commission: string;
  supplier: string;
  latestDeliveryDate: Date;
  loadingDeadline: Date;
  loadingDate: Date;
  orderNumber: string;
  orderDate: Date;
  operator: string;
  completed: boolean;
  
  // Positionen
  positions: PurchaseOrderPosition[];
  
  // Registerkarten
  references: DocumentReference[];
  paymentTerms: PaymentTerms;
  additionalInfo: string;
}

interface PurchaseOrderPosition {
  position: number;
  articleNumber: string;
  supplier: string;
  description: string;
  quantity: number;
  packageQuantity: number;
  packageUnit: string;
  stock: number;
  price: number;
  contract: string;
}
```

#### UI-Elemente
- **Kopfbereich**: Form mit allen Eingabefeldern
- **Registerkarten**: Tabs für Positionen, Referenzen, Zahlungsbedingungen, Zusatzangaben
- **Positions-Tabelle**: Editierbare Tabelle mit CRUD-Operationen
- **Aktions-Buttons**: "Speichern", "Abbrechen", "Drucken", "Löschen"

---

### 3. Lieferanten-Angebot-Komponente (`SupplierOffer.tsx`)

#### Props Interface
```typescript
interface SupplierOfferProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: SupplierOfferData;
  onSave: (offer: SupplierOfferData) => void;
  onCancel: () => void;
}
```

#### Datenstruktur
```typescript
interface SupplierOfferData {
  // Kopfbereich
  creditorAccountNumber: string;
  supplier: string;
  supplierMaster: string;
  latestDeliveryDate: Date;
  loadingDeadline: Date;
  loadingDate: Date;
  inquiryNumber: string;
  inquiryDate: Date;
  operator: string;
  completed: boolean;
  
  // Eingabefelder
  contactPerson: {
    name: string;
    salutation: string;
  };
  supplierOfferNumber: string;
  supplierOrderNumber: string;
  offerDate: Date;
  orderDate: Date;
  text1: string; // Kommissions-Name
  text2: string; // Bsp. Liefertermin
}
```

#### UI-Elemente
- **Kopfbereich**: Form mit Lieferanten-Daten
- **Kontakt-Bereich**: Ansprechpartner-Daten
- **Dokumenten-Bereich**: Angebots- und Auftragsnummern
- **Text-Bereich**: Freitextfelder für Zusatzinformationen

---

### 4. Lieferschein-Komponente (`DeliveryNote.tsx`)

#### Props Interface
```typescript
interface DeliveryNoteProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: DeliveryNoteData;
  onSave: (delivery: DeliveryNoteData) => void;
  onCancel: () => void;
}
```

#### Datenstruktur
```typescript
interface DeliveryNoteData {
  // Kopfbereich
  deliveryNoteNumber: string;
  date: Date;
  time: string;
  customerNumber: string;
  deliveryAddress: string;
  billingAddress: string;
  debtorNumber: string;
  invoicedInvoiceNumber: string;
  referenceNumber: string;
  
  // Checkboxen
  selfPickup: boolean;
  externalCompany: boolean;
  returnDelivery: boolean;
  freeHouse: boolean;
  info: boolean;
  printed: boolean;
  invoiced: boolean;
  
  // Positionen
  positions: DeliveryPosition[];
}

interface DeliveryPosition {
  position: number;
  articleNumber: string;
  description: string;
  quantity: number;
  unit: string;
  discount: number;
  discountPercent: number;
  netPrice: number;
  netAmount: number;
  serialNumber: string;
  warehouse: string;
  storageLocation: string;
}
```

#### UI-Elemente
- **Kopfbereich**: Form mit Lieferschein-Daten
- **Adress-Bereich**: Liefer- und Rechnungsanschrift
- **Checkbox-Bereich**: Verschiedene Lieferoptionen
- **Positions-Tabelle**: Editierbare Tabelle mit allen Feldern

---

### 5. Auftragsbestätigung-Komponente (`OrderConfirmation.tsx`)

#### Props Interface
```typescript
interface OrderConfirmationProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: OrderConfirmationData;
  onSave: (confirmation: OrderConfirmationData) => void;
  onCancel: () => void;
}
```

#### Datenstruktur
```typescript
interface OrderConfirmationData {
  // Kopfbereich
  orderNumber: string;
  date: Date;
  customerNumber: string;
  debtorNumber: string;
  status: OrderStatus;
  phoneContact: string;
  creditLimit: number;
  branch: string;
  completed: boolean;
  
  // Navigationsbaum-Daten
  general: CustomerGeneralData;
  offerOrder: OfferOrderData;
  invoicePayment: InvoicePaymentData;
  technical: TechnicalData;
  deliveryPackaging: DeliveryPackagingData;
  documentData: DocumentData;
  contacts: ContactPerson[];
  representatives: Representative[];
  customerAssignment: CustomerAssignmentData;
}

interface ContactPerson {
  name: string;
  phone: string;
  email: string;
  function: string;
}

interface Representative {
  name: string;
  phone: string;
  email: string;
  territory: string;
}
```

#### UI-Elemente
- **Kopfbereich**: Form mit Auftragsdaten
- **Navigationsbaum**: Sidebar mit allen Bereichen
- **Bereichs-Content**: Dynamische Inhalte je nach ausgewähltem Bereich
- **Kontakt-Tabellen**: Editierbare Tabellen für Ansprechpartner und Vertreter

---

### 6. Angebot-Komponente (`Offer.tsx`)

#### Props Interface
```typescript
interface OfferProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: OfferData;
  onSave: (offer: OfferData) => void;
  onCancel: () => void;
}
```

#### Datenstruktur
```typescript
interface OfferData {
  // Kopfbereich (identisch zu Auftragsbestätigung)
  offerNumber: string;
  date: Date;
  customerNumber: string;
  debtorNumber: string;
  status: OfferStatus;
  phoneContact: string;
  creditLimit: number;
  branch: string;
  completed: boolean;
  
  // Navigationsbaum-Daten (identisch zu Auftragsbestätigung)
  general: CustomerGeneralData;
  offerOrder: OfferOrderData;
  invoicePayment: InvoicePaymentData;
  technical: TechnicalData;
  deliveryPackaging: DeliveryPackagingData;
  documentData: DocumentData;
  contacts: ContactPerson[];
  representatives: Representative[];
  customerAssignment: CustomerAssignmentData;
}
```

#### UI-Elemente
- **Kopfbereich**: Form mit Angebotsdaten
- **Navigationsbaum**: Identische Struktur wie Auftragsbestätigung
- **Bereichs-Content**: Dynamische Inhalte je nach ausgewähltem Bereich

---

## 🎨 UI-Framework Integration

### Material-UI Komponenten
```typescript
// Verwendete MUI-Komponenten
import {
  Card,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
```

### Ant Design Komponenten
```typescript
// Verwendete Ant Design Komponenten
import {
  Table as AntTable,
  Form,
  Select,
  DatePicker,
  Input,
  Space,
  Row,
  Col,
  Card as AntCard,
  Button as AntButton,
  Tree,
  TreeSelect
} from 'antd';
```

### Tailwind CSS Klassen
```typescript
// Verwendete Tailwind-Klassen
const containerClasses = "p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md";
const formClasses = "space-y-4";
const tableClasses = "w-full border-collapse";
const buttonClasses = "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded";
```

---

## 🔧 Funktionalitäten

### 1. Datenvalidierung
```typescript
// Yup-Schemas für alle Komponenten
const purchaseOrderSchema = yup.object({
  creditorAccountNumber: yup.string().required('Kreditor-Konto-Nr. ist erforderlich'),
  supplier: yup.string().required('Lieferant ist erforderlich'),
  latestDeliveryDate: yup.date().required('Lieferdatum ist erforderlich'),
  positions: yup.array().of(
    yup.object({
      articleNumber: yup.string().required('Artikel-Nr. ist erforderlich'),
      quantity: yup.number().positive('Menge muss größer als 0 sein'),
      price: yup.number().positive('Preis muss größer als 0 sein')
    })
  ).min(1, 'Mindestens eine Position ist erforderlich')
});
```

### 2. API-Integration
```typescript
// API-Service für alle Module
class ErpApiService {
  // Bestellvorschlag
  async getOrderSuggestions(filters: OrderSuggestionFilters): Promise<OrderSuggestionData[]>
  async createOrderFromSuggestion(suggestion: OrderSuggestionData): Promise<OrderData>
  
  // Bestellung
  async createPurchaseOrder(order: PurchaseOrderData): Promise<PurchaseOrderData>
  async updatePurchaseOrder(id: string, order: Partial<PurchaseOrderData>): Promise<PurchaseOrderData>
  async deletePurchaseOrder(id: string): Promise<void>
  
  // Lieferanten-Angebot
  async createSupplierOffer(offer: SupplierOfferData): Promise<SupplierOfferData>
  async updateSupplierOffer(id: string, offer: Partial<SupplierOfferData>): Promise<SupplierOfferData>
  
  // Lieferschein
  async createDeliveryNote(delivery: DeliveryNoteData): Promise<DeliveryNoteData>
  async updateDeliveryNote(id: string, delivery: Partial<DeliveryNoteData>): Promise<DeliveryNoteData>
  
  // Auftragsbestätigung
  async createOrderConfirmation(confirmation: OrderConfirmationData): Promise<OrderConfirmationData>
  async updateOrderConfirmation(id: string, confirmation: Partial<OrderConfirmationData>): Promise<OrderConfirmationData>
  
  // Angebot
  async createOffer(offer: OfferData): Promise<OfferData>
  async updateOffer(id: string, offer: Partial<OfferData>): Promise<OfferData>
}
```

### 3. State Management
```typescript
// Zustand Store für alle Module
interface ErpStore {
  // Bestellvorschlag
  orderSuggestions: OrderSuggestionData[];
  orderSuggestionFilters: OrderSuggestionFilters;
  
  // Bestellung
  purchaseOrders: PurchaseOrderData[];
  currentPurchaseOrder: PurchaseOrderData | null;
  
  // Lieferanten-Angebot
  supplierOffers: SupplierOfferData[];
  currentSupplierOffer: SupplierOfferData | null;
  
  // Lieferschein
  deliveryNotes: DeliveryNoteData[];
  currentDeliveryNote: DeliveryNoteData | null;
  
  // Auftragsbestätigung
  orderConfirmations: OrderConfirmationData[];
  currentOrderConfirmation: OrderConfirmationData | null;
  
  // Angebot
  offers: OfferData[];
  currentOffer: OfferData | null;
  
  // Allgemein
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchOrderSuggestions: (filters: OrderSuggestionFilters) => Promise<void>;
  createPurchaseOrder: (order: PurchaseOrderData) => Promise<void>;
  updatePurchaseOrder: (id: string, order: Partial<PurchaseOrderData>) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  // ... weitere Actions für alle Module
}
```

---

## 📱 Responsive Design

### Mobile-First Ansatz
```typescript
// Responsive Breakpoints
const breakpoints = {
  xs: 0,    // Mobile
  sm: 600,  // Tablet
  md: 960,  // Desktop
  lg: 1280, // Large Desktop
  xl: 1920  // Extra Large
};

// Responsive Grid-Layout
const responsiveGrid = {
  xs: 12,  // Mobile: 1 Spalte
  sm: 6,   // Tablet: 2 Spalten
  md: 4,   // Desktop: 3 Spalten
  lg: 3    // Large: 4 Spalten
};
```

### Mobile-Optimierungen
- **Touch-freundliche Buttons**: Mindestens 44px Höhe
- **Große Eingabefelder**: Einfache Bedienung auf Touch-Geräten
- **Swipe-Gesten**: Für Tabellen-Navigation
- **Offline-Funktionalität**: Lokale Datenspeicherung

---

## 🧪 Testing

### Unit Tests
```typescript
// Test-Struktur für alle Komponenten
describe('PurchaseOrder Component', () => {
  it('sollte alle erforderlichen Felder anzeigen', () => {
    // Test-Implementation
  });
  
  it('sollte Bestellpositionen hinzufügen und entfernen', () => {
    // Test-Implementation
  });
  
  it('sollte Formular-Validierung durchführen', () => {
    // Test-Implementation
  });
  
  it('sollte API-Integration testen', () => {
    // Test-Implementation
  });
});
```

### Integration Tests
```typescript
// End-to-End Tests
describe('ERP Workflow', () => {
  it('sollte kompletten Bestellvorschlag-Workflow testen', () => {
    // 1. Bestellvorschlag laden
    // 2. Vorschlag auswählen
    // 3. Bestellung erstellen
    // 4. Bestellung speichern
  });
  
  it('sollte Lieferschein-Erstellung testen', () => {
    // 1. Lieferschein erstellen
    // 2. Positionen hinzufügen
    // 3. Lieferschein drucken
  });
});
```

---

## 🚀 Performance-Optimierungen

### Code-Splitting
```typescript
// Lazy Loading für alle Module
const OrderSuggestion = lazy(() => import('./components/OrderSuggestion'));
const PurchaseOrder = lazy(() => import('./components/PurchaseOrder'));
const SupplierOffer = lazy(() => import('./components/SupplierOffer'));
const DeliveryNote = lazy(() => import('./components/DeliveryNote'));
const OrderConfirmation = lazy(() => import('./components/OrderConfirmation'));
const Offer = lazy(() => import('./components/Offer'));
```

### Memoization
```typescript
// React.memo für teure Komponenten
export const PurchaseOrderTable = React.memo<PurchaseOrderTableProps>(({ positions, onEdit, onDelete }) => {
  // Komponenten-Implementation
});

// useMemo für teure Berechnungen
const calculatedTotals = useMemo(() => {
  return positions.reduce((acc, pos) => {
    acc.netAmount += pos.quantity * pos.price * (1 - pos.discount / 100);
    return acc;
  }, { netAmount: 0, vatAmount: 0, totalAmount: 0 });
}, [positions]);
```

### Virtualisierung
```typescript
// Für große Tabellen
import { FixedSizeList as List } from 'react-window';

const VirtualizedTable = ({ data }) => (
  <List
    height={400}
    itemCount={data.length}
    itemSize={50}
    itemData={data}
  >
    {Row}
  </List>
);
```

---

## 📋 Implementierungs-Checkliste

### ✅ Phase 1: Grundstruktur
- [ ] Projekt-Setup mit TypeScript
- [ ] UI-Framework Integration (MUI + Ant Design)
- [ ] Routing-System
- [ ] Basis-Komponenten

### ✅ Phase 2: Datenmodell
- [ ] TypeScript Interfaces
- [ ] Yup-Validierungsschemas
- [ ] API-Service-Klassen
- [ ] Zustand Store

### ✅ Phase 3: Komponenten
- [ ] Bestellvorschlag-Komponente
- [ ] Bestellung-Komponente
- [ ] Lieferanten-Angebot-Komponente
- [ ] Lieferschein-Komponente
- [ ] Auftragsbestätigung-Komponente
- [ ] Angebot-Komponente

### ✅ Phase 4: Integration
- [ ] API-Integration
- [ ] State Management
- [ ] Formular-Validierung
- [ ] Error Handling

### ✅ Phase 5: Testing
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] E2E Tests
- [ ] Performance Tests

### ✅ Phase 6: Optimierung
- [ ] Code-Splitting
- [ ] Memoization
- [ ] Virtualisierung
- [ ] Mobile-Optimierung

---

## 🎯 Nächste Schritte

1. **Komponenten-Entwicklung**: Implementierung aller 6 Hauptkomponenten
2. **API-Integration**: Backend-Anbindung für alle Module
3. **Testing**: Vollständige Test-Suite
4. **Performance**: Optimierung für große Datenmengen
5. **Mobile**: Responsive Design und Touch-Optimierung
6. **Dokumentation**: Benutzer- und Entwickler-Dokumentation

**Das System ist bereit für die vollständige Implementierung aller ERP-Module!** 