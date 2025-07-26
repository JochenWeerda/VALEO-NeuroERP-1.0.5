// Offline Service für VALEO NeuroERP
// Verwaltet Offline-Daten, Synchronisation und IndexedDB-Operationen

export interface OfflineData {
  key: string;
  type: 'product' | 'transaction' | 'user' | 'ai_suggestion' | 'inventory' | 'voucher';
  data: any;
  timestamp: number;
  synced: boolean;
  version: number;
}

export interface PendingRequest {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: number;
  pendingRequests: number;
  syncInProgress: boolean;
  error?: string;
}

class OfflineService {
  private db: IDBDatabase | null = null;
  private syncInProgress = false;
  private onlineStatus = navigator.onLine;
  private listeners: ((status: SyncStatus) => void)[] = [];

  constructor() {
    this.initDatabase();
    this.setupNetworkListeners();
  }

  // Database Initialisierung
  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ValeoNeuroERP', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Offline Data Store
        if (!db.objectStoreNames.contains('offlineData')) {
          const store = db.createObjectStore('offlineData', { keyPath: 'key' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }

        // Pending Requests Store
        if (!db.objectStoreNames.contains('pendingRequests')) {
          const store = db.createObjectStore('pendingRequests', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('url', 'url', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('retryCount', 'retryCount', { unique: false });
        }

        // Sync Status Store
        if (!db.objectStoreNames.contains('syncStatus')) {
          const store = db.createObjectStore('syncStatus', { keyPath: 'key' });
        }
      };
    });
  }

  // Network Status Listener
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.onlineStatus = true;
      this.notifyListeners();
      this.syncPendingRequests();
    });

    window.addEventListener('offline', () => {
      this.onlineStatus = false;
      this.notifyListeners();
    });
  }

  // Offline Data Management
  async saveOfflineData(type: OfflineData['type'], key: string, data: any): Promise<void> {
    if (!this.db) await this.initDatabase();

    const offlineData: OfflineData = {
      key,
      type,
      data,
      timestamp: Date.now(),
      synced: false,
      version: 1
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.put(offlineData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineData(type: OfflineData['type'], key?: string): Promise<OfflineData[]> {
    if (!this.db) await this.initDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const index = store.index('type');
      const request = key ? store.get(key) : index.getAll(type);

      request.onsuccess = () => {
        const result = request.result;
        resolve(Array.isArray(result) ? result : [result]);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteOfflineData(key: string): Promise<void> {
    if (!this.db) await this.initDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Pending Requests Management
  async addPendingRequest(request: Omit<PendingRequest, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    if (!this.db) await this.initDatabase();

    const pendingRequest: PendingRequest = {
      ...request,
      timestamp: Date.now(),
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingRequests'], 'readwrite');
      const store = transaction.objectStore('pendingRequests');
      const dbRequest = store.add(pendingRequest);

      dbRequest.onsuccess = () => {
        this.notifyListeners();
        resolve();
      };
      dbRequest.onerror = () => reject(dbRequest.error);
    });
  }

  async getPendingRequests(): Promise<PendingRequest[]> {
    if (!this.db) await this.initDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingRequests'], 'readonly');
      const store = transaction.objectStore('pendingRequests');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removePendingRequest(id: number): Promise<void> {
    if (!this.db) await this.initDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingRequests'], 'readwrite');
      const store = transaction.objectStore('pendingRequests');
      const request = store.delete(id);

      request.onsuccess = () => {
        this.notifyListeners();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updatePendingRequestRetry(id: number, retryCount: number): Promise<void> {
    if (!this.db) await this.initDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingRequests'], 'readwrite');
      const store = transaction.objectStore('pendingRequests');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const request = getRequest.result;
        if (request) {
          request.retryCount = retryCount;
          const putRequest = store.put(request);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Synchronisation
  async syncPendingRequests(): Promise<void> {
    if (this.syncInProgress || !this.onlineStatus) return;

    this.syncInProgress = true;
    this.notifyListeners();

    try {
      const pendingRequests = await this.getPendingRequests();
      
      for (const request of pendingRequests) {
        try {
          const response = await fetch(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body ? JSON.stringify(request.body) : undefined
          });

          if (response.ok) {
            await this.removePendingRequest(request.id!);
            console.log(`[OfflineService] Request erfolgreich synchronisiert: ${request.url}`);
          } else {
            await this.updatePendingRequestRetry(request.id!, request.retryCount + 1);
            console.warn(`[OfflineService] Request fehlgeschlagen: ${request.url}`);
          }
        } catch (error) {
          await this.updatePendingRequestRetry(request.id!, request.retryCount + 1);
          console.error(`[OfflineService] Sync-Fehler:`, error);
        }
      }
    } finally {
      this.syncInProgress = false;
      this.notifyListeners();
    }
  }

  // Offline-First API Wrapper
  async offlineFirstRequest<T>(
    url: string,
    options: RequestInit = {},
    offlineDataKey?: string
  ): Promise<T> {
    try {
      // Versuche Online-Request
      const response = await fetch(url, options);
      
      if (response.ok) {
        const data = await response.json();
        
        // Cache für Offline-Nutzung
        if (offlineDataKey) {
          await this.saveOfflineData('product', offlineDataKey, data);
        }
        
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log('[OfflineService] Online-Request fehlgeschlagen, versuche Offline-Daten...');
      
      // Fallback zu Offline-Daten
      if (offlineDataKey) {
        const offlineData = await this.getOfflineData('product', offlineDataKey);
        if (offlineData.length > 0) {
          return offlineData[0].data;
        }
      }
      
      // Request für späteres Sync speichern
      await this.addPendingRequest({
        url,
        method: options.method || 'GET',
        headers: options.headers as Record<string, string> || {},
        body: options.body
      });
      
      throw new Error('Offline-Modus: Daten nicht verfügbar');
    }
  }

  // Status Management
  getSyncStatus(): SyncStatus {
    return {
      isOnline: this.onlineStatus,
      lastSync: Date.now(),
      pendingRequests: 0, // Wird asynchron aktualisiert
      syncInProgress: this.syncInProgress
    };
  }

  async updateSyncStatus(): Promise<SyncStatus> {
    const pendingRequests = await this.getPendingRequests();
    
    const status: SyncStatus = {
      isOnline: this.onlineStatus,
      lastSync: Date.now(),
      pendingRequests: pendingRequests.length,
      syncInProgress: this.syncInProgress
    };

    return status;
  }

  // Event Listener Management
  addStatusListener(listener: (status: SyncStatus) => void): void {
    this.listeners.push(listener);
  }

  removeStatusListener(listener: (status: SyncStatus) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(): void {
    this.updateSyncStatus().then(status => {
      this.listeners.forEach(listener => listener(status));
    });
  }

  // Utility Methods
  isOnline(): boolean {
    return this.onlineStatus;
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.initDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData', 'pendingRequests'], 'readwrite');
      
      const offlineStore = transaction.objectStore('offlineData');
      const pendingStore = transaction.objectStore('pendingRequests');
      
      const offlineRequest = offlineStore.clear();
      const pendingRequest = pendingStore.clear();
      
      let completed = 0;
      const checkComplete = () => {
        completed++;
        if (completed === 2) resolve();
      };
      
      offlineRequest.onsuccess = checkComplete;
      pendingRequest.onsuccess = checkComplete;
      
      offlineRequest.onerror = () => reject(offlineRequest.error);
      pendingRequest.onerror = () => reject(pendingRequest.error);
    });
  }

  async getDatabaseSize(): Promise<number> {
    if (!this.db) await this.initDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData', 'pendingRequests'], 'readonly');
      
      const offlineStore = transaction.objectStore('offlineData');
      const pendingStore = transaction.objectStore('pendingRequests');
      
      const offlineRequest = offlineStore.getAll();
      const pendingRequest = pendingStore.getAll();
      
      let completed = 0;
      let totalSize = 0;
      
      const checkComplete = () => {
        completed++;
        if (completed === 2) resolve(totalSize);
      };
      
      offlineRequest.onsuccess = () => {
        totalSize += JSON.stringify(offlineRequest.result).length;
        checkComplete();
      };
      
      pendingRequest.onsuccess = () => {
        totalSize += JSON.stringify(pendingRequest.result).length;
        checkComplete();
      };
      
      offlineRequest.onerror = () => reject(offlineRequest.error);
      pendingRequest.onerror = () => reject(pendingRequest.error);
    });
  }
}

// Singleton Instance
export const offlineService = new OfflineService();

// Export für React Hooks
export default offlineService; 