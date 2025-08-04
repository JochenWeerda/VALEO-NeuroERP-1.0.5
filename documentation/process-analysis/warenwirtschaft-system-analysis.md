# VALEO NeuroERP 2.0 - Warenwirtschaft Systemanalyse

## 🔍 Prozessabdeckung und Praktikabilität

### 1. Artikelstammdaten verwalten

#### ✅ Vorhandene Funktionen
- **Artikelanlage**: Vollständige Maske in `ArticleCreate.tsx`
  - Automatische Artikelnummergenerierung
  - Grunddaten: Bezeichnung, Beschreibung, EAN, SKU
  - Preisfelder: EK, VK, Aktionspreis
  - Lagerparameter: Min/Max-Bestand, Meldebestand
  - Kategorisierung und Tags

#### ⚠️ Teilweise implementiert
- **Variantenverwaltung**: Datenbankstruktur vorhanden, UI fehlt
- **Stücklisten**: Schema definiert, keine Benutzeroberfläche

#### ❌ Fehlende Funktionen
- Artikelklassifizierung nach Warengruppen
- Mehrstufige Stücklisten mit Fertigungsschritten
- Artikelbilder und Dokumente
- Lieferantenzuordnung auf Artikelebene

#### 🛠️ Verbesserungsvorschläge
```typescript
// Erweiterte Artikelmaske mit Varianten
interface ArticleVariant {
  id: number;
  articleId: number;
  variantType: 'color' | 'size' | 'material';
  variantValue: string;
  additionalPrice: number;
  sku: string;
  ean: string;
  stock: number;
}

// Stücklisten-Komponente
interface BillOfMaterial {
  parentArticleId: number;
  components: Array<{
    articleId: number;
    quantity: number;
    unit: string;
    position: number;
    optional: boolean;
  }>;
}
```

### 2. Lagerverwaltung

#### ✅ Vorhandene Funktionen
- **Bestandsverwaltung**: 
  - Grundlegende Bestandsführung in `articles` Tabelle
  - Stock-Movement Tracking über `stock_movements`
  - Trigger für automatische Bestandsaktualisierung

#### ⚠️ Teilweise implementiert
- **Wareneingang**: API-Endpoints vorhanden, UI rudimentär
- **Inventur**: Datenbankstruktur unterstützt es, keine dedizierte UI

#### ❌ Fehlende Funktionen
- Lagerplatzverwaltung
- Chargen-/Seriennummernverwaltung
- MHD-Überwachung
- Mehrlagerfähigkeit
- Inventurverfahren (Stichtag, permanent, Stichprobe)

#### 🛠️ Verbesserungsvorschläge
```sql
-- Erweiterung für Lagerplatzverwaltung
CREATE TABLE warehouse_locations (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouses(id),
    location_code VARCHAR(20) UNIQUE NOT NULL,
    zone VARCHAR(10),
    row_number INTEGER,
    shelf_number INTEGER,
    level_number INTEGER,
    capacity_units INTEGER,
    current_units INTEGER DEFAULT 0
);

-- Chargen-/Seriennummern
CREATE TABLE batch_numbers (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(id),
    batch_number VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100),
    manufacturing_date DATE,
    expiry_date DATE,
    quantity DECIMAL(10,2),
    location_id INTEGER REFERENCES warehouse_locations(id)
);
```

### 3. Wareneingang

#### ✅ Vorhandene Funktionen
- Basis-API für Wareneingangsbuchung
- Bestandserhöhung über Stock-Movements

#### ❌ Fehlende Funktionen
- Lieferantenavisierung (ASN)
- Wareneingangsprüfung mit Protokoll
- Reklamationsworkflow
- Barcode-/QR-Code-Scanning
- Automatische Einlagerungsvorschläge

#### 🛠️ Verbesserungsvorschläge
```tsx
// Wareneingangs-Komponente
const GoodsReceiptForm: React.FC = () => {
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Lieferantendaten */}
        <Grid item xs={12} md={6}>
          <SupplierSelect />
          <TextField label="Lieferscheinnummer" />
          <DatePicker label="Lieferdatum" />
        </Grid>
        
        {/* Positionen scannen/erfassen */}
        <Grid item xs={12}>
          <BarcodeScanner onScan={handleArticleScan} />
          <ArticlePositionsList />
        </Grid>
        
        {/* Qualitätsprüfung */}
        <Grid item xs={12}>
          <QualityCheckForm />
        </Grid>
      </Grid>
    </Box>
  );
};
```

### 4. Bestellwesen

#### ✅ Vorhandene Funktionen
- **Bestellungen**: Grundstruktur in `orders` Tabelle
- **Lieferanten**: Über `suppliers` Tabelle

#### ⚠️ Teilweise implementiert
- Bestellpositionen vorhanden, aber keine Bestellvorschläge
- Keine automatische Bedarfsermittlung

#### ❌ Fehlende Funktionen
- Dispositionsverfahren
- Anfragenverwaltung
- Angebotsvergleich
- Bestellvorschlagswesen
- AB-Überwachung
- EDI-Integration

### 5. Warenausgang / Kommissionierung

#### ✅ Vorhandene Funktionen
- Grundlegende Auftragsverwaltung
- Lieferscheinerstellung

#### ❌ Fehlende Funktionen
- Kommissionierlisten
- Picking-Strategien (FIFO, LIFO, FEFO)
- Mobile Kommissionierung
- Versandetikettierung
- Tracking-Integration

### 6. Masken-Praktikabilität

#### 📊 Bewertung der vorhandenen Masken

| Funktion | Status | Praktikabilität | Verbesserungsbedarf |
|----------|--------|----------------|---------------------|
| **Artikel anlegen** | ✅ | ⭐⭐⭐ | Variantenverwaltung, Bulk-Import |
| **Artikel suchen** | ✅ | ⭐⭐⭐⭐ | Erweiterte Filter |
| **Artikel bearbeiten** | ✅ | ⭐⭐⭐ | Inline-Editing, Massenänderung |
| **Positionen verwalten** | ⚠️ | ⭐⭐ | Drag&Drop, Kopierfunktion |
| **Übergabe Faktura** | ✅ | ⭐⭐⭐ | Automatisierung |
| **Drucken** | ⚠️ | ⭐⭐ | Vorlagenverwaltung |

#### 🚀 Prioritäre Verbesserungen

1. **Schnellerfassung**
   ```tsx
   // Keyboard-Shortcuts
   useKeyboardShortcuts({
     'Ctrl+N': () => createNewArticle(),
     'Ctrl+S': () => saveArticle(),
     'Ctrl+D': () => duplicateArticle(),
     'F3': () => focusSearchField(),
   });
   ```

2. **Bulk-Operationen**
   ```tsx
   // Massenbearbeitung
   const BulkActions = () => (
     <Box>
       <Button onClick={handleBulkPriceUpdate}>
         Preise aktualisieren
       </Button>
       <Button onClick={handleBulkCategoryChange}>
         Kategorie ändern
       </Button>
       <Button onClick={handleBulkExport}>
         Exportieren
       </Button>
     </Box>
   );
   ```

3. **Erweiterte Suche**
   ```tsx
   // Facettierte Suche
   const AdvancedSearch = () => (
     <Box>
       <FilterChips 
         filters={['Lagerbestand', 'Preis', 'Kategorie', 'Lieferant']}
       />
       <SavedSearches />
       <SearchHistory />
     </Box>
   );
   ```

4. **Druckvorlagen-System**
   ```tsx
   // Template-Manager
   interface PrintTemplate {
     id: string;
     name: string;
     type: 'article' | 'order' | 'invoice';
     layout: 'A4' | 'Label' | 'Custom';
     fields: string[];
     logo?: string;
     css?: string;
   }
   ```

### 7. Integration und Workflow-Optimierung

#### 🔄 Prozessautomatisierung

```typescript
// Workflow-Engine für Warenwirtschaft
class WarehouseWorkflow {
  // Automatische Bestellvorschläge
  async generatePurchaseProposals() {
    const articles = await this.getArticlesBelowMinStock();
    const proposals = articles.map(article => ({
      articleId: article.id,
      supplierId: article.preferredSupplierId,
      quantity: article.orderQuantity || (article.maxStock - article.currentStock),
      urgency: this.calculateUrgency(article)
    }));
    return this.consolidateBySupplier(proposals);
  }
  
  // Kommissionier-Optimierung
  async optimizePickingRoute(orderItems: OrderItem[]) {
    const locations = await this.getItemLocations(orderItems);
    return this.calculateOptimalRoute(locations);
  }
}
```

### 8. Mobile Integration

```typescript
// React Native Komponente für Lager-App
const MobileWarehouseApp = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Scanner" component={BarcodeScanner} />
        <Stack.Screen name="GoodsReceipt" component={MobileGoodsReceipt} />
        <Stack.Screen name="Picking" component={MobilePicking} />
        <Stack.Screen name="Inventory" component={MobileInventory} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

## 📋 Implementierungs-Roadmap

### Phase 1 (Sofort)
- [ ] Variantenverwaltung UI
- [ ] Erweiterte Artikelsuche
- [ ] Druckvorlagen-System
- [ ] Bulk-Import/Export

### Phase 2 (Kurzfristig)
- [ ] Lagerplatzverwaltung
- [ ] Chargen-/Seriennummern
- [ ] Mobile Scanner-App
- [ ] Bestellvorschlagswesen

### Phase 3 (Mittelfristig)
- [ ] EDI-Integration
- [ ] Erweiterte Kommissionierung
- [ ] MHD-Überwachung
- [ ] Multi-Warehouse

### Phase 4 (Langfristig)
- [ ] KI-gestützte Disposition
- [ ] Predictive Analytics
- [ ] IoT-Integration (RFID)
- [ ] Blockchain für Lieferkette