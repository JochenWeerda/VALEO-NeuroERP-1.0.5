# Integration von Edge-Computing mit dem Warenwirtschaftsmodul

## Übersicht

Die Integration des Edge-Computing-Frameworks mit dem Warenwirtschaftsmodul ermöglicht eine dezentrale Verarbeitung von Warenwirtschaftsdaten direkt am Ort der Entstehung. Dies verbessert die Effizienz, reduziert Latenzzeiten und ermöglicht einen unterbrechungsfreien Betrieb auch bei instabiler Netzwerkverbindung.

## Architektur

Die integrierte Architektur besteht aus folgenden Komponenten:

### 1. Edge-Warehouse-Knoten

- **Lokale Datenbank**: Speichert Lagerbestandsdaten, Bestellungen und Lieferungen
- **Edge-Agent**: Verwaltet die Synchronisation mit dem zentralen System
- **Warenwirtschafts-Module**: Lokale Implementierung der Kernfunktionen
- **Mobile Scanner-Integration**: Direkte Anbindung von Barcode-Scannern und RFID-Lesegeräten

### 2. Synchronisationsmechanismen

- **Bidirektionale Synchronisation**: Abgleich zwischen Edge-Knoten und Zentralsystem
- **Konfliktlösung**: Automatische und manuelle Strategien zur Konfliktlösung
- **Priorisierte Übertragung**: Kritische Daten werden bevorzugt synchronisiert
- **Bandbreitenmanagement**: Optimierte Nutzung verfügbarer Netzwerkressourcen

### 3. Offline-Funktionalität

- **Vollständige Offline-Operationen**: Alle kritischen Funktionen auch ohne Verbindung
- **Lokale Bestandsverwaltung**: Bestandsänderungen werden lokal verarbeitet
- **Bestellabwicklung**: Kompletter Bestellprozess auch offline möglich
- **Lokale Berichterstattung**: Generierung von Berichten ohne Zentralsystem

## Implementierungsdetails

### 1. Datenbankschema für Edge-Knoten

```sql
-- Lokale Bestandstabelle
CREATE TABLE local_inventory (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    warehouse_id VARCHAR(36) NOT NULL,
    location_code VARCHAR(50),
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL,
    sync_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    last_synced TIMESTAMP,
    UNIQUE (product_id, warehouse_id, location_code)
);

-- Lokale Bestelltabelle
CREATE TABLE local_orders (
    id VARCHAR(36) PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE,
    customer_id VARCHAR(36),
    order_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    sync_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    last_synced TIMESTAMP
);

-- Lokale Bestellpositionen
CREATE TABLE local_order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES local_orders(id)
);

-- Synchronisationswarteschlange
CREATE TABLE sync_queue (
    id VARCHAR(36) PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    priority INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP NOT NULL,
    processed_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_error TEXT
);
```

### 2. Edge-Warenwirtschafts-Controller

```typescript
class EdgeWarenwirtschaftController {
  constructor(
    private readonly localDb: Database,
    private readonly syncManager: SyncManager,
    private readonly configManager: ConfigManager,
    private readonly eventBus: EventBus
  ) {}
  
  // Bestand am Edge-Knoten aktualisieren
  async updateInventory(productId: string, quantity: number, operation: 'add' | 'subtract' | 'set'): Promise<void> {
    const warehouseId = this.configManager.get('warehouse_id');
    
    // Transaktion starten
    await this.localDb.beginTransaction();
    
    try {
      // Aktuellen Bestand abrufen
      const currentInventory = await this.localDb.queryOne(
        'SELECT * FROM local_inventory WHERE product_id = ? AND warehouse_id = ?',
        [productId, warehouseId]
      );
      
      let newQuantity = 0;
      
      if (currentInventory) {
        // Bestand aktualisieren
        switch (operation) {
          case 'add':
            newQuantity = currentInventory.quantity + quantity;
            break;
          case 'subtract':
            newQuantity = Math.max(0, currentInventory.quantity - quantity);
            break;
          case 'set':
            newQuantity = quantity;
            break;
        }
        
        await this.localDb.execute(
          'UPDATE local_inventory SET quantity = ?, last_updated = ?, sync_status = ? WHERE id = ?',
          [newQuantity, new Date(), 'pending', currentInventory.id]
        );
      } else {
        // Neuen Bestandseintrag erstellen
        const id = generateUuid();
        newQuantity = operation === 'subtract' ? 0 : quantity;
        
        await this.localDb.execute(
          `INSERT INTO local_inventory 
           (id, product_id, warehouse_id, quantity, last_updated, sync_status) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id, productId, warehouseId, newQuantity, new Date(), 'pending']
        );
      }
      
      // Synchronisationseintrag erstellen
      await this.syncManager.queueForSync({
        entityType: 'inventory',
        entityId: productId,
        operation: 'update',
        priority: 1  // Hohe Priorität für Bestandsänderungen
      });
      
      // Transaktion bestätigen
      await this.localDb.commitTransaction();
      
      // Event auslösen
      this.eventBus.emit('inventory:updated', {
        productId,
        warehouseId,
        quantity: newQuantity,
        operation
      });
    } catch (error) {
      // Transaktion zurückrollen
      await this.localDb.rollbackTransaction();
      throw error;
    }
  }
  
  // Bestellung am Edge-Knoten erstellen
  async createOrder(orderData: EdgeOrderData): Promise<string> {
    const orderId = generateUuid();
    const orderNumber = await this.generateOrderNumber();
    
    // Transaktion starten
    await this.localDb.beginTransaction();
    
    try {
      // Bestellung erstellen
      await this.localDb.execute(
        `INSERT INTO local_orders 
         (id, order_number, customer_id, order_date, status, total_amount, currency, created_by, created_at, sync_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          orderNumber,
          orderData.customerId,
          new Date(),
          'created',
          orderData.totalAmount,
          orderData.currency || 'EUR',
          orderData.userId,
          new Date(),
          'pending'
        ]
      );
      
      // Bestellpositionen erstellen
      for (const item of orderData.items) {
        const itemId = generateUuid();
        
        await this.localDb.execute(
          `INSERT INTO local_order_items 
           (id, order_id, product_id, quantity, unit_price, discount_percent) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            orderId,
            item.productId,
            item.quantity,
            item.unitPrice,
            item.discountPercent || 0
          ]
        );
        
        // Bestand aktualisieren
        await this.updateInventory(item.productId, item.quantity, 'subtract');
      }
      
      // Synchronisationseintrag erstellen
      await this.syncManager.queueForSync({
        entityType: 'order',
        entityId: orderId,
        operation: 'create',
        priority: 2  // Mittlere Priorität für Bestellungen
      });
      
      // Transaktion bestätigen
      await this.localDb.commitTransaction();
      
      // Event auslösen
      this.eventBus.emit('order:created', {
        orderId,
        orderNumber,
        customerId: orderData.customerId,
        totalAmount: orderData.totalAmount
      });
      
      return orderId;
    } catch (error) {
      // Transaktion zurückrollen
      await this.localDb.rollbackTransaction();
      throw error;
    }
  }
  
  // Bestandsbericht am Edge-Knoten generieren
  async generateInventoryReport(): Promise<InventoryReport> {
    const warehouseId = this.configManager.get('warehouse_id');
    
    // Bestandsdaten abrufen
    const inventoryItems = await this.localDb.query(
      `SELECT i.*, p.name as product_name, p.sku, p.category_id, c.name as category_name
       FROM local_inventory i
       JOIN products p ON i.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE i.warehouse_id = ?
       ORDER BY p.category_id, p.name`,
      [warehouseId]
    );
    
    // Bestandswerte berechnen
    const totalItems = inventoryItems.length;
    const totalQuantity = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost || 0), 0);
    
    // Nach Kategorien gruppieren
    const categorySummary = inventoryItems.reduce((summary, item) => {
      const categoryId = item.category_id || 'uncategorized';
      const categoryName = item.category_name || 'Nicht kategorisiert';
      
      if (!summary[categoryId]) {
        summary[categoryId] = {
          categoryId,
          categoryName,
          itemCount: 0,
          totalQuantity: 0,
          totalValue: 0
        };
      }
      
      summary[categoryId].itemCount++;
      summary[categoryId].totalQuantity += item.quantity;
      summary[categoryId].totalValue += (item.quantity * item.unit_cost || 0);
      
      return summary;
    }, {});
    
    return {
      warehouseId,
      generatedAt: new Date(),
      totalItems,
      totalQuantity,
      totalValue,
      categories: Object.values(categorySummary),
      items: inventoryItems.map(item => ({
        productId: item.product_id,
        productName: item.product_name,
        sku: item.sku,
        quantity: item.quantity,
        reservedQuantity: item.reserved_quantity,
        locationCode: item.location_code,
        lastUpdated: item.last_updated
      }))
    };
  }
}
```

### 3. Synchronisationsmanager

```typescript
class WarenwirtschaftSyncManager {
  constructor(
    private readonly localDb: Database,
    private readonly apiClient: ApiClient,
    private readonly networkMonitor: NetworkMonitor,
    private readonly configManager: ConfigManager,
    private readonly eventBus: EventBus
  ) {
    // Netzwerkstatus überwachen
    this.networkMonitor.onStatusChange(status => {
      if (status === 'online') {
        this.processSyncQueue().catch(err => {
          console.error('Fehler bei der Synchronisation:', err);
        });
      }
    });
  }
  
  // Änderung für Synchronisation vormerken
  async queueForSync(item: SyncQueueItem): Promise<void> {
    const id = generateUuid();
    
    await this.localDb.execute(
      `INSERT INTO sync_queue 
       (id, entity_type, entity_id, operation, priority, created_at, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, item.entityType, item.entityId, item.operation, item.priority || 5, new Date(), 'pending']
    );
    
    // Event auslösen
    this.eventBus.emit('sync:queued', {
      id,
      entityType: item.entityType,
      entityId: item.entityId,
      operation: item.operation
    });
    
    // Sofort synchronisieren, wenn online
    if (this.networkMonitor.isOnline()) {
      this.processSyncQueue().catch(err => {
        console.error('Fehler bei der Synchronisation:', err);
      });
    }
  }
  
  // Synchronisationswarteschlange verarbeiten
  async processSyncQueue(): Promise<SyncResult> {
    if (!this.networkMonitor.isOnline()) {
      return { success: false, message: 'Keine Netzwerkverbindung' };
    }
    
    // Synchronisationssperre prüfen
    const syncLock = await this.localDb.queryOne('SELECT value FROM settings WHERE key = ?', ['sync_lock']);
    if (syncLock && syncLock.value === 'true') {
      return { success: false, message: 'Synchronisation läuft bereits' };
    }
    
    // Synchronisationssperre setzen
    await this.localDb.execute(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      ['sync_lock', 'true']
    );
    
    try {
      // Ausstehende Synchronisationseinträge abrufen
      const pendingItems = await this.localDb.query(
        `SELECT * FROM sync_queue 
         WHERE status = ? OR (status = ? AND retry_count < ?) 
         ORDER BY priority ASC, created_at ASC 
         LIMIT ?`,
        ['pending', 'error', 5, 50]
      );
      
      if (pendingItems.length === 0) {
        return { success: true, message: 'Keine ausstehenden Synchronisationseinträge', processed: 0 };
      }
      
      let processed = 0;
      let errors = 0;
      
      // Einträge verarbeiten
      for (const item of pendingItems) {
        try {
          await this.processSyncItem(item);
          processed++;
        } catch (error) {
          errors++;
          
          // Fehler protokollieren und Wiederholungszähler erhöhen
          await this.localDb.execute(
            `UPDATE sync_queue 
             SET status = ?, retry_count = retry_count + 1, last_error = ? 
             WHERE id = ?`,
            ['error', error.message, item.id]
          );
        }
      }
      
      return {
        success: true,
        message: `${processed} Einträge synchronisiert, ${errors} Fehler`,
        processed,
        errors
      };
    } finally {
      // Synchronisationssperre aufheben
      await this.localDb.execute(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        ['sync_lock', 'false']
      );
    }
  }
  
  // Einzelnen Synchronisationseintrag verarbeiten
  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    switch (item.entity_type) {
      case 'inventory':
        await this.syncInventory(item);
        break;
      case 'order':
        await this.syncOrder(item);
        break;
      default:
        throw new Error(`Unbekannter Entitätstyp: ${item.entity_type}`);
    }
    
    // Synchronisationsstatus aktualisieren
    await this.localDb.execute(
      'UPDATE sync_queue SET status = ?, processed_at = ? WHERE id = ?',
      ['completed', new Date(), item.id]
    );
  }
  
  // Bestandsdaten synchronisieren
  private async syncInventory(item: SyncQueueItem): Promise<void> {
    const warehouseId = this.configManager.get('warehouse_id');
    
    // Lokale Bestandsdaten abrufen
    const inventory = await this.localDb.queryOne(
      'SELECT * FROM local_inventory WHERE product_id = ? AND warehouse_id = ?',
      [item.entity_id, warehouseId]
    );
    
    if (!inventory) {
      throw new Error(`Bestandsdaten nicht gefunden: ${item.entity_id}`);
    }
    
    // Bestandsdaten zum zentralen System senden
    const response = await this.apiClient.post('/api/v1/inventory/sync', {
      productId: inventory.product_id,
      warehouseId: inventory.warehouse_id,
      quantity: inventory.quantity,
      reservedQuantity: inventory.reserved_quantity,
      locationCode: inventory.location_code,
      lastUpdated: inventory.last_updated
    });
    
    if (!response.success) {
      throw new Error(`Fehler bei der Bestandssynchronisation: ${response.message}`);
    }
    
    // Lokalen Synchronisationsstatus aktualisieren
    await this.localDb.execute(
      'UPDATE local_inventory SET sync_status = ?, last_synced = ? WHERE id = ?',
      ['synced', new Date(), inventory.id]
    );
  }
  
  // Bestelldaten synchronisieren
  private async syncOrder(item: SyncQueueItem): Promise<void> {
    // Lokale Bestelldaten abrufen
    const order = await this.localDb.queryOne(
      'SELECT * FROM local_orders WHERE id = ?',
      [item.entity_id]
    );
    
    if (!order) {
      throw new Error(`Bestelldaten nicht gefunden: ${item.entity_id}`);
    }
    
    // Bestellpositionen abrufen
    const orderItems = await this.localDb.query(
      'SELECT * FROM local_order_items WHERE order_id = ?',
      [order.id]
    );
    
    // Bestelldaten zum zentralen System senden
    const response = await this.apiClient.post('/api/v1/orders/sync', {
      id: order.id,
      orderNumber: order.order_number,
      customerId: order.customer_id,
      orderDate: order.order_date,
      status: order.status,
      totalAmount: order.total_amount,
      currency: order.currency,
      createdBy: order.created_by,
      createdAt: order.created_at,
      items: orderItems.map(item => ({
        productId: item.product_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        discountPercent: item.discount_percent
      }))
    });
    
    if (!response.success) {
      throw new Error(`Fehler bei der Bestellsynchronisation: ${response.message}`);
    }
    
    // Lokalen Synchronisationsstatus aktualisieren
    await this.localDb.execute(
      'UPDATE local_orders SET sync_status = ?, last_synced = ? WHERE id = ?',
      ['synced', new Date(), order.id]
    );
  }
}
```

## Integration mit dem Kubernetes-Operator

Die Edge-Warenwirtschafts-Integration wird über den VALEO-NeuroERP Kubernetes-Operator verwaltet:

```yaml
apiVersion: erp.valeo.ai/v1
kind: ValeoERP
metadata:
  name: warehouse-edge
  namespace: valeo-edge
spec:
  version: "1.8"
  components:
    - name: edge-warehouse
      version: "1.8"
      replicas: 1
      config:
        warehouseId: "warehouse-01"
        syncInterval: 300
        offlineCapabilities:
          inventoryManagement: true
          orderCreation: true
          reporting: true
        localDatabase:
          size: "5Gi"
          backupSchedule: "0 1 * * *"
  edge:
    enabled: true
    location: "Warehouse Berlin"
    syncConfig:
      mode: "bidirectional"
      priorityEntities:
        - entity: "inventory"
          priority: 1
        - entity: "orders"
          priority: 2
    offlineMode:
      enabled: true
      maxOfflineTime: "7d"
```

## Mobile App Integration

Die Edge-Warenwirtschafts-Integration umfasst auch eine mobile App für Lagerarbeiter:

```typescript
// Mobile App Service
class MobileWarehouseService {
  constructor(
    private readonly apiClient: EdgeApiClient,
    private readonly offlineStorage: OfflineStorage,
    private readonly networkMonitor: NetworkMonitor
  ) {}
  
  // Produkt scannen
  async scanProduct(barcode: string): Promise<ScanResult> {
    try {
      // Produktdaten abrufen
      let product;
      
      if (this.networkMonitor.isOnline()) {
        // Online-Modus: Daten vom Edge-Knoten abrufen
        product = await this.apiClient.get(`/api/products/barcode/${barcode}`);
      } else {
        // Offline-Modus: Daten aus lokalem Speicher abrufen
        product = await this.offlineStorage.getProduct(barcode);
      }
      
      if (!product) {
        return {
          success: false,
          message: 'Produkt nicht gefunden'
        };
      }
      
      return {
        success: true,
        product
      };
    } catch (error) {
      return {
        success: false,
        message: `Fehler beim Scannen: ${error.message}`
      };
    }
  }
  
  // Bestand aktualisieren
  async updateInventory(productId: string, quantity: number, operation: 'add' | 'subtract' | 'set'): Promise<UpdateResult> {
    try {
      if (this.networkMonitor.isOnline()) {
        // Online-Modus: Bestand am Edge-Knoten aktualisieren
        const result = await this.apiClient.post('/api/inventory/update', {
          productId,
          quantity,
          operation
        });
        
        return result;
      } else {
        // Offline-Modus: Änderung lokal speichern
        await this.offlineStorage.queueInventoryUpdate({
          productId,
          quantity,
          operation,
          timestamp: new Date()
        });
        
        return {
          success: true,
          message: 'Bestandsänderung für spätere Synchronisation gespeichert'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Fehler bei der Bestandsaktualisierung: ${error.message}`
      };
    }
  }
  
  // Bestellung erstellen
  async createOrder(orderData: MobileOrderData): Promise<OrderResult> {
    try {
      if (this.networkMonitor.isOnline()) {
        // Online-Modus: Bestellung am Edge-Knoten erstellen
        const result = await this.apiClient.post('/api/orders/create', orderData);
        
        return result;
      } else {
        // Offline-Modus: Bestellung lokal speichern
        const orderId = await this.offlineStorage.queueOrder({
          ...orderData,
          timestamp: new Date()
        });
        
        return {
          success: true,
          orderId,
          message: 'Bestellung für spätere Synchronisation gespeichert'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Fehler bei der Bestellerstellung: ${error.message}`
      };
    }
  }
  
  // Synchronisation durchführen
  async synchronize(): Promise<SyncResult> {
    if (!this.networkMonitor.isOnline()) {
      return {
        success: false,
        message: 'Keine Netzwerkverbindung'
      };
    }
    
    try {
      // Ausstehende Änderungen abrufen
      const pendingInventoryUpdates = await this.offlineStorage.getPendingInventoryUpdates();
      const pendingOrders = await this.offlineStorage.getPendingOrders();
      
      let processedInventory = 0;
      let processedOrders = 0;
      let errors = 0;
      
      // Bestandsänderungen synchronisieren
      for (const update of pendingInventoryUpdates) {
        try {
          await this.apiClient.post('/api/inventory/update', update);
          await this.offlineStorage.markInventoryUpdateAsSynced(update.id);
          processedInventory++;
        } catch (error) {
          errors++;
        }
      }
      
      // Bestellungen synchronisieren
      for (const order of pendingOrders) {
        try {
          await this.apiClient.post('/api/orders/create', order);
          await this.offlineStorage.markOrderAsSynced(order.id);
          processedOrders++;
        } catch (error) {
          errors++;
        }
      }
      
      return {
        success: true,
        message: `${processedInventory} Bestandsänderungen und ${processedOrders} Bestellungen synchronisiert, ${errors} Fehler`,
        processedInventory,
        processedOrders,
        errors
      };
    } catch (error) {
      return {
        success: false,
        message: `Fehler bei der Synchronisation: ${error.message}`
      };
    }
  }
}
```

## Vorteile der Integration

1. **Verbesserte Ausfallsicherheit**
   - Unterbrechungsfreier Betrieb auch bei Netzwerkausfällen
   - Lokale Datenspeicherung und -verarbeitung
   - Automatische Synchronisation bei Wiederverbindung

2. **Reduzierte Latenz**
   - Sofortige Verarbeitung von Warenwirtschaftsdaten vor Ort
   - Schnellere Reaktion auf Bestandsänderungen
   - Verbesserte Benutzererfahrung für Lagerarbeiter

3. **Optimierte Bandbreitennutzung**
   - Priorisierte Synchronisation kritischer Daten
   - Komprimierte Datenübertragung
   - Intelligentes Bandbreitenmanagement

4. **Verbesserte Datenintegrität**
   - Robuste Konfliktlösungsstrategien
   - Transaktionale Verarbeitung auf Edge-Knoten
   - Konsistente Datensynchronisation

## Nächste Schritte

1. **Erweiterte Offline-Analytik**
   - Implementierung von ML-Modellen für Bestandsprognosen am Edge
   - Lokale Anomalieerkennung für Bestandsbewegungen
   - Echtzeit-Dashboards für Lagerleiter

2. **Multi-Edge-Kollaboration**
   - Direkte Kommunikation zwischen benachbarten Edge-Knoten
   - Gemeinsame Ressourcennutzung und Lastverteilung
   - Koordinierte Bestandsverwaltung über mehrere Standorte

3. **IoT-Integration**
   - Anbindung von Sensoren für Umgebungsüberwachung
   - Automatisierte Bestandserfassung durch RFID-Gates
   - Integration mit autonomen Transportrobotern 