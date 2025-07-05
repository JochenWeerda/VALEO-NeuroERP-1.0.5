import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ChargeDetails } from './chargenService';
import { ScanResult } from './inventoryApi';

interface OfflineDB extends DBSchema {
  'scan-results': {
    key: string;
    value: {
      id: string;
      timestamp: number;
      result: ScanResult;
      synced: boolean;
    };
    indexes: { 'by-timestamp': number; 'by-synced': boolean };
  };
  'charge-selections': {
    key: string;
    value: {
      id: string;
      timestamp: number;
      artikelId: string;
      artikelName: string;
      chargen: ChargeDetails[];
      benoetigteMenge: number;
      synced: boolean;
    };
    indexes: { 'by-timestamp': number; 'by-synced': boolean; 'by-artikel': string };
  };
  'pending-operations': {
    key: string;
    value: {
      id: string;
      timestamp: number;
      operation: 'wareneingang' | 'warenausgang' | 'inventur' | 'umlagerung';
      data: any;
      retryCount: number;
      synced: boolean;
    };
    indexes: { 'by-timestamp': number; 'by-synced': boolean; 'by-operation': string };
  };
}

// Initialisiert die IndexedDB-Datenbank
const initDB = async (): Promise<IDBPDatabase<OfflineDB>> => {
  return openDB<OfflineDB>('offline-storage', 1, {
    upgrade(db) {
      // Erstellt die Tabelle für Scan-Ergebnisse
      const scanResultsStore = db.createObjectStore('scan-results', {
        keyPath: 'id'
      });
      scanResultsStore.createIndex('by-timestamp', 'timestamp');
      scanResultsStore.createIndex('by-synced', 'synced');

      // Erstellt die Tabelle für Chargen-Auswahlen
      const chargeSelectionsStore = db.createObjectStore('charge-selections', {
        keyPath: 'id'
      });
      chargeSelectionsStore.createIndex('by-timestamp', 'timestamp');
      chargeSelectionsStore.createIndex('by-synced', 'synced');
      chargeSelectionsStore.createIndex('by-artikel', 'artikelId');

      // Erstellt die Tabelle für ausstehende Operationen
      const pendingOperationsStore = db.createObjectStore('pending-operations', {
        keyPath: 'id'
      });
      pendingOperationsStore.createIndex('by-timestamp', 'timestamp');
      pendingOperationsStore.createIndex('by-synced', 'synced');
      pendingOperationsStore.createIndex('by-operation', 'operation');
    }
  });
};

// Speichert ein Scan-Ergebnis in der lokalen Datenbank
export const saveScanResult = async (result: ScanResult): Promise<string> => {
  const db = await initDB();
  const id = `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  await db.add('scan-results', {
    id,
    timestamp: Date.now(),
    result,
    synced: false
  });
  
  return id;
};

// Holt alle ungesynchronisierten Scan-Ergebnisse
export const getUnsyncedScanResults = async (): Promise<any[]> => {
  const db = await initDB();
  return db.getAllFromIndex('scan-results', 'by-synced', false);
};

// Markiert ein Scan-Ergebnis als synchronisiert
export const markScanResultAsSynced = async (id: string): Promise<void> => {
  const db = await initDB();
  const scanResult = await db.get('scan-results', id);
  
  if (scanResult) {
    scanResult.synced = true;
    await db.put('scan-results', scanResult);
  }
};

// Speichert eine Chargen-Auswahl in der lokalen Datenbank
export const saveChargeSelection = async (
  artikelId: string,
  artikelName: string,
  chargen: ChargeDetails[],
  benoetigteMenge: number
): Promise<string> => {
  const db = await initDB();
  const id = `charge-selection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  await db.add('charge-selections', {
    id,
    timestamp: Date.now(),
    artikelId,
    artikelName,
    chargen,
    benoetigteMenge,
    synced: false
  });
  
  return id;
};

// Holt alle ungesynchronisierten Chargen-Auswahlen
export const getUnsyncedChargeSelections = async (): Promise<any[]> => {
  const db = await initDB();
  return db.getAllFromIndex('charge-selections', 'by-synced', false);
};

// Markiert eine Chargen-Auswahl als synchronisiert
export const markChargeSelectionAsSynced = async (id: string): Promise<void> => {
  const db = await initDB();
  const chargeSelection = await db.get('charge-selections', id);
  
  if (chargeSelection) {
    chargeSelection.synced = true;
    await db.put('charge-selections', chargeSelection);
  }
};

// Speichert eine ausstehende Operation in der lokalen Datenbank
export const savePendingOperation = async (
  operation: 'wareneingang' | 'warenausgang' | 'inventur' | 'umlagerung',
  data: any
): Promise<string> => {
  const db = await initDB();
  const id = `operation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  await db.add('pending-operations', {
    id,
    timestamp: Date.now(),
    operation,
    data,
    retryCount: 0,
    synced: false
  });
  
  return id;
};

// Holt alle ungesynchronisierten Operationen
export const getUnsyncedOperations = async (): Promise<any[]> => {
  const db = await initDB();
  return db.getAllFromIndex('pending-operations', 'by-synced', false);
};

// Erhöht den Wiederholungszähler einer Operation
export const incrementRetryCount = async (id: string): Promise<void> => {
  const db = await initDB();
  const operation = await db.get('pending-operations', id);
  
  if (operation) {
    operation.retryCount += 1;
    await db.put('pending-operations', operation);
  }
};

// Markiert eine Operation als synchronisiert
export const markOperationAsSynced = async (id: string): Promise<void> => {
  const db = await initDB();
  const operation = await db.get('pending-operations', id);
  
  if (operation) {
    operation.synced = true;
    await db.put('pending-operations', operation);
  }
};

// Prüft, ob eine Internetverbindung besteht
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Hört auf Änderungen des Online-Status
export const setupOnlineStatusListeners = (
  onlineCallback: () => void,
  offlineCallback: () => void
): void => {
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);
};

// Entfernt die Listener für den Online-Status
export const removeOnlineStatusListeners = (
  onlineCallback: () => void,
  offlineCallback: () => void
): void => {
  window.removeEventListener('online', onlineCallback);
  window.removeEventListener('offline', offlineCallback);
};

// Versucht, alle ungesynchronisierten Daten zu synchronisieren
export const syncOfflineData = async (): Promise<{
  success: boolean;
  syncedCount: number;
  failedCount: number;
}> => {
  if (!isOnline()) {
    return { success: false, syncedCount: 0, failedCount: 0 };
  }
  
  try {
    const unsyncedScanResults = await getUnsyncedScanResults();
    const unsyncedChargeSelections = await getUnsyncedChargeSelections();
    const unsyncedOperations = await getUnsyncedOperations();
    
    let syncedCount = 0;
    let failedCount = 0;
    
    // Hier würden die tatsächlichen API-Aufrufe stattfinden, um die Daten zu synchronisieren
    // Für diese Demo markieren wir einfach alle als synchronisiert
    
    // Synchronisiere Scan-Ergebnisse
    for (const scanResult of unsyncedScanResults) {
      try {
        // Hier würde der API-Aufruf stattfinden
        await new Promise(resolve => setTimeout(resolve, 100));
        await markScanResultAsSynced(scanResult.id);
        syncedCount++;
      } catch (error) {
        console.error('Fehler bei der Synchronisation des Scan-Ergebnisses:', error);
        failedCount++;
      }
    }
    
    // Synchronisiere Chargen-Auswahlen
    for (const chargeSelection of unsyncedChargeSelections) {
      try {
        // Hier würde der API-Aufruf stattfinden
        await new Promise(resolve => setTimeout(resolve, 100));
        await markChargeSelectionAsSynced(chargeSelection.id);
        syncedCount++;
      } catch (error) {
        console.error('Fehler bei der Synchronisation der Chargen-Auswahl:', error);
        failedCount++;
      }
    }
    
    // Synchronisiere ausstehende Operationen
    for (const operation of unsyncedOperations) {
      try {
        // Hier würde der API-Aufruf stattfinden
        await new Promise(resolve => setTimeout(resolve, 100));
        await markOperationAsSynced(operation.id);
        syncedCount++;
      } catch (error) {
        console.error('Fehler bei der Synchronisation der Operation:', error);
        await incrementRetryCount(operation.id);
        failedCount++;
      }
    }
    
    return { success: true, syncedCount, failedCount };
  } catch (error) {
    console.error('Fehler bei der Synchronisation der Offline-Daten:', error);
    return { success: false, syncedCount: 0, failedCount: 0 };
  }
};

export default {
  saveScanResult,
  getUnsyncedScanResults,
  markScanResultAsSynced,
  saveChargeSelection,
  getUnsyncedChargeSelections,
  markChargeSelectionAsSynced,
  savePendingOperation,
  getUnsyncedOperations,
  incrementRetryCount,
  markOperationAsSynced,
  isOnline,
  setupOnlineStatusListeners,
  removeOnlineStatusListeners,
  syncOfflineData
}; 