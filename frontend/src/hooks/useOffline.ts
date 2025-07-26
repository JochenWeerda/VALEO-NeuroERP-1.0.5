// React Hooks für Offline-Funktionalität
import { useState, useEffect, useCallback } from 'react';
import offlineService, { SyncStatus, OfflineData } from '../services/OfflineService';

// Hook für Offline-Status
export const useOfflineStatus = () => {
  const [status, setStatus] = useState<SyncStatus>(offlineService.getSyncStatus());

  useEffect(() => {
    const handleStatusChange = (newStatus: SyncStatus) => {
      setStatus(newStatus);
    };

    offlineService.addStatusListener(handleStatusChange);
    
    // Initial Status aktualisieren
    offlineService.updateSyncStatus().then(setStatus);

    return () => {
      offlineService.removeStatusListener(handleStatusChange);
    };
  }, []);

  const syncNow = useCallback(async () => {
    await offlineService.syncPendingRequests();
  }, []);

  return {
    ...status,
    syncNow,
    isOnline: status.isOnline,
    pendingRequests: status.pendingRequests,
    syncInProgress: status.syncInProgress
  };
};

// Hook für Offline-Daten
export const useOfflineData = <T>(
  type: OfflineData['type'],
  key?: string
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const offlineData = await offlineService.getOfflineData(type, key);
      setData(offlineData.map(item => item.data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Offline-Daten');
    } finally {
      setLoading(false);
    }
  }, [type, key]);

  const saveData = useCallback(async (newData: T) => {
    try {
      const dataKey = key || `${type}_${Date.now()}`;
      await offlineService.saveOfflineData(type, dataKey, newData);
      await loadData(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern der Daten');
    }
  }, [type, key, loadData]);

  const deleteData = useCallback(async (dataKey: string) => {
    try {
      await offlineService.deleteOfflineData(dataKey);
      await loadData(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen der Daten');
    }
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    saveData,
    deleteData,
    reload: loadData
  };
};

// Hook für Offline-First API Calls
export const useOfflineFirstRequest = <T>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (
    url: string,
    options: RequestInit = {},
    offlineDataKey?: string
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await offlineService.offlineFirstRequest<T>(url, options, offlineDataKey);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    request,
    loading,
    error
  };
};

// Hook für Pending Requests
export const usePendingRequests = () => {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      const requests = await offlineService.getPendingRequests();
      setPendingRequests(requests);
    } catch (err) {
      console.error('Fehler beim Laden der pending requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const retryRequest = useCallback(async (requestId: number) => {
    try {
      await offlineService.syncPendingRequests();
      await loadPendingRequests();
    } catch (err) {
      console.error('Fehler beim Retry:', err);
    }
  }, [loadPendingRequests]);

  const clearRequest = useCallback(async (requestId: number) => {
    try {
      await offlineService.removePendingRequest(requestId);
      await loadPendingRequests();
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
    }
  }, [loadPendingRequests]);

  useEffect(() => {
    loadPendingRequests();
  }, [loadPendingRequests]);

  return {
    pendingRequests,
    loading,
    retryRequest,
    clearRequest,
    reload: loadPendingRequests
  };
};

// Hook für Service Worker Status
export const useServiceWorker = () => {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const updateApp = useCallback(() => {
    if (registration && updateAvailable) {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration, updateAvailable]);

  return {
    registration,
    updateAvailable,
    updateApp
  };
};

// Hook für Network Status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.effectiveType || 'unknown');
      
      connection.addEventListener('change', () => {
        setConnectionType(connection.effectiveType || 'unknown');
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    connectionType,
    isSlowConnection: connectionType === 'slow-2g' || connectionType === '2g'
  };
};

// Hook für Offline Storage Management
export const useOfflineStorage = () => {
  const [storageSize, setStorageSize] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const calculateStorageSize = useCallback(async () => {
    try {
      setLoading(true);
      const size = await offlineService.getDatabaseSize();
      setStorageSize(size);
    } catch (err) {
      console.error('Fehler beim Berechnen der Speichergröße:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearStorage = useCallback(async () => {
    try {
      await offlineService.clearAllData();
      await calculateStorageSize();
    } catch (err) {
      console.error('Fehler beim Löschen des Speichers:', err);
    }
  }, [calculateStorageSize]);

  useEffect(() => {
    calculateStorageSize();
  }, [calculateStorageSize]);

  return {
    storageSize,
    loading,
    clearStorage,
    refresh: calculateStorageSize
  };
};

// Hook für Offline Notifications
export const useOfflineNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  }, []);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if ('Notification' in window && permission === 'granted') {
      new Notification(title, options);
    }
  }, [permission]);

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported: 'Notification' in window
  };
}; 