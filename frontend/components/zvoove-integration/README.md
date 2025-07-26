# zvoove Handel Integration - Frontend Komponenten

## Übersicht
Diese Komponenten implementieren die Integration mit dem Warenwirtschaftssystem zvoove Handel, basierend auf den analysierten Screenshots und OCR-Ergebnissen.

## 1. Angebots- und Auftragserfassung

### ZvooveOrderForm Component
```typescript
interface ZvooveOrderFormProps {
  mode: 'offer' | 'order' | 'delivery' | 'invoice';
  initialData?: Partial<OrderData>;
  onSave: (data: OrderData) => void;
  onCancel: () => void;
}

interface OrderData {
  // Belegdaten
  customerNumber: string;
  debtorNumber: string;
  documentDate: Date;
  contactPerson: string;
  
  // Positionen
  positions: OrderPosition[];
  
  // Summen
  netAmount: number;
  vatAmount: number;
  totalAmount: number;
}

interface OrderPosition {
  articleNumber: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  netPrice: number;
}
```

### Implementierte Felder:
- **Kundennummer** (customerNumber)
- **Debitoren-Nr.** (debtorNumber) 
- **Angebots-/Auftragsdatum** (documentDate)
- **Ansprechpartner** (contactPerson)
- **Artikel-Nr.** (articleNumber)
- **Beschreibung** (description)
- **Menge** (quantity)
- **Preis** (unitPrice)
- **Rabatt** (discount)

## 2. Lieferscheinerfassung

### ZvooveDeliveryForm Component
```typescript
interface ZvooveDeliveryFormProps {
  deliveryData: DeliveryData;
  onSave: (data: DeliveryData) => void;
  onPrint: () => void;
}

interface DeliveryData {
  // Lieferschein-Daten
  deliveryNumber: string;
  deliveryDate: Date;
  deliveryTime: string;
  
  // Fahrzeug-Daten
  vehicleLicensePlate: string;
  driver: string;
  
  // Fakturierung
  invoiceStatus: 'pending' | 'invoiced' | 'cancelled';
  netPrices: boolean;
  
  // Positionen
  positions: DeliveryPosition[];
  
  // Referenzen
  invoiceReference: string;
  purchasePrice: number;
  salesPrice: number;
}
```

### Implementierte Felder:
- **Lieferschein-Nr.** (deliveryNumber)
- **Lieferdatum** (deliveryDate)
- **Uhrzeit** (deliveryTime)
- **Fahrzeug-Kennzeichen** (vehicleLicensePlate)
- **Fahrer** (driver)
- **Fakturstatus** (invoiceStatus)
- **Nettopreise** (netPrices)

## 3. CRM / Kontaktübersicht

### ZvooveContactOverview Component
```typescript
interface ZvooveContactOverviewProps {
  filters: ContactFilters;
  onFilterChange: (filters: ContactFilters) => void;
  contacts: Contact[];
}

interface ContactFilters {
  // Kontakt-Typ
  contactType: 'sales' | 'purchase';
  
  // Sortierung
  sortBy: 'contactNumber' | 'name' | 'date';
  sortOrder: 'asc' | 'desc';
  
  // Selektion
  representative: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  parity: string;
  
  // Optionen
  onlyPlannedAppointments: boolean;
  articleSumsInPrint: boolean;
}

interface Contact {
  contactNumber: string;
  name: string;
  representative: string;
  appointmentDate?: Date;
  orderQuantity: number;
  remainingQuantity: number;
}
```

### Filteroptionen:
- **Verkaufs-/Einkaufskontakte** (contactType)
- **Sortierung nach Kontaktnummer** (sortBy)
- **Vertreter-Selektion** (representative)
- **Zeitraum** (dateRange)
- **Parität** (parity)
- **Nur geplante Termine** (onlyPlannedAppointments)
- **Artikel-Summen im Ausdruck** (articleSumsInPrint)

## 4. Navigation & Menüband

### ZvooveNavigation Component
```typescript
interface ZvooveNavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

type NavigationTab = 
  | 'ALLGEMEIN'
  | 'ERFASSUNG' 
  | 'ABRECHNUNG'
  | 'LAGER'
  | 'PRODUKTION'
  | 'AUSWERTUNG';

interface NavigationItem {
  id: NavigationTab;
  label: string;
  icon: string;
  subItems?: NavigationSubItem[];
}

interface NavigationSubItem {
  id: string;
  label: string;
  route: string;
}
```

### Menüband-Struktur:
- **ALLGEMEIN**: Grunddaten, Stammdaten
- **ERFASSUNG**: Angebot, Auftrag, Lieferung, Rechnung
- **ABRECHNUNG**: Finanzwesen, Zahlungen
- **LAGER**: Bestand, Wareneingang, Warenausgang
- **PRODUKTION**: Fertigung, Arbeitspläne
- **AUSWERTUNG**: Reports, Statistiken

## 5. Export & Druckfunktionen

### ZvooveExportActions Component
```typescript
interface ZvooveExportActionsProps {
  documentType: 'offer' | 'order' | 'delivery' | 'invoice';
  documentId: string;
  onExport: (format: ExportFormat) => void;
}

type ExportFormat = 'pdf' | 'print' | 'preview' | 'forward' | 'documents';

interface ExportOptions {
  includePositions: boolean;
  includeSums: boolean;
  format: ExportFormat;
  template?: string;
}
```

### Exportfunktionen:
- **PDF** (pdf)
- **Druck** (print)
- **Vorschau** (preview)
- **Weiterleiten** (forward)
- **Unterlagen** (documents)

## 6. Implementierungsrichtlinien

### Material-UI Integration
```typescript
// Beispiel für OrderForm mit MUI
import { 
  Card, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow 
} from '@mui/material';

const ZvooveOrderForm: React.FC<ZvooveOrderFormProps> = ({ mode, initialData, onSave, onCancel }) => {
  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Kundennummer"
          variant="outlined"
          fullWidth
        />
        <TextField
          label="Debitoren-Nr."
          variant="outlined"
          fullWidth
        />
        {/* Weitere Felder */}
      </div>
    </Card>
  );
};
```

### Ant Design Integration
```typescript
// Beispiel für ContactOverview mit Ant Design
import { Table, Form, Select, DatePicker, Checkbox } from 'antd';

const ZvooveContactOverview: React.FC<ZvooveContactOverviewProps> = ({ filters, onFilterChange, contacts }) => {
  return (
    <div className="space-y-4">
      <Form layout="inline">
        <Form.Item label="Kontakt-Typ">
          <Select
            value={filters.contactType}
            onChange={(value) => onFilterChange({ ...filters, contactType: value })}
          >
            <Select.Option value="sales">Verkaufskontakte</Select.Option>
            <Select.Option value="purchase">Einkaufskontakte</Select.Option>
          </Select>
        </Form.Item>
        {/* Weitere Filter */}
      </Form>
      
      <Table dataSource={contacts} columns={columns} />
    </div>
  );
};
```

## 7. Datenmodell-Integration

### API-Service
```typescript
// services/zvooveApi.ts
export class ZvooveApiService {
  async getOrders(filters: OrderFilters): Promise<Order[]> {
    // API-Integration mit zvoove
  }
  
  async createOrder(orderData: OrderData): Promise<Order> {
    // Neue Aufträge erstellen
  }
  
  async getContacts(filters: ContactFilters): Promise<Contact[]> {
    // Kontakte abrufen
  }
  
  async exportDocument(documentId: string, format: ExportFormat): Promise<Blob> {
    // Dokumente exportieren
  }
}
```

### Zustand Store
```typescript
// store/zvooveStore.ts
interface ZvooveStore {
  orders: Order[];
  contacts: Contact[];
  deliveries: Delivery[];
  loading: boolean;
  error: string | null;
  
  fetchOrders: (filters: OrderFilters) => Promise<void>;
  createOrder: (orderData: OrderData) => Promise<void>;
  fetchContacts: (filters: ContactFilters) => Promise<void>;
}

export const useZvooveStore = create<ZvooveStore>((set, get) => ({
  // Store-Implementation
}));
```

## 8. Responsive Design

### Mobile-First Ansatz
```typescript
// Responsive Layout für zvoove Komponenten
const ZvooveResponsiveLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mit Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              zvoove Handel Integration
            </h1>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="/orders" className="text-gray-700 hover:text-gray-900">
                Aufträge
              </a>
              <a href="/contacts" className="text-gray-700 hover:text-gray-900">
                Kontakte
              </a>
              <a href="/deliveries" className="text-gray-700 hover:text-gray-900">
                Lieferungen
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Komponenten */}
        </div>
      </main>
    </div>
  );
};
```

## 9. Testing

### Komponenten-Tests
```typescript
// __tests__/ZvooveOrderForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ZvooveOrderForm } from '../components/ZvooveOrderForm';

describe('ZvooveOrderForm', () => {
  it('rendert alle erforderlichen Felder', () => {
    render(<ZvooveOrderForm mode="order" onSave={jest.fn()} onCancel={jest.fn()} />);
    
    expect(screen.getByLabelText('Kundennummer')).toBeInTheDocument();
    expect(screen.getByLabelText('Debitoren-Nr.')).toBeInTheDocument();
    expect(screen.getByLabelText('Datum')).toBeInTheDocument();
  });

  it('validiert Pflichtfelder', () => {
    const onSave = jest.fn();
    render(<ZvooveOrderForm mode="order" onSave={onSave} onCancel={jest.fn()} />);
    
    fireEvent.click(screen.getByText('Speichern'));
    
    expect(screen.getByText('Kundennummer ist erforderlich')).toBeInTheDocument();
  });
});
```

## 10. Deployment & Integration

### Docker-Integration
```dockerfile
# Dockerfile für zvoove Integration
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Kubernetes-Deployment
```yaml
# kubernetes/zvoove-integration.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zvoove-integration
spec:
  replicas: 2
  selector:
    matchLabels:
      app: zvoove-integration
  template:
    metadata:
      labels:
        app: zvoove-integration
    spec:
      containers:
      - name: zvoove-frontend
        image: valeo/zvoove-integration:latest
        ports:
        - containerPort: 3000
        env:
        - name: ZVOOVE_API_URL
          valueFrom:
            secretKeyRef:
              name: zvoove-secrets
              key: api-url
```

Diese Komponentenbeschreibung bietet eine vollständige Grundlage für die Integration des zvoove Handel Systems in die VALEO NeuroERP Frontend-Architektur. 