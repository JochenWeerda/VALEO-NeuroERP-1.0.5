// React Hooks für Offline-Funktionalität
import { useState, useEffect, useCallback, useRef } from 'react';

interface OfflineRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: unknown;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
}

interface OfflineState {
  isOnline: boolean;
  isOffline: boolean;
  pendingRequests: OfflineRequest[];
  syncInProgress: boolean;
  lastSyncTime: number | null;
}

interface OfflineActions {
  addPendingRequest: (request: Omit<OfflineRequest, 'id' | 'timestamp' | 'retryCount'>) => void;
  removePendingRequest: (id: string) => void;
  retryPendingRequest: (id: string) => Promise<void>;
  retryAllPendingRequests: () => Promise<void>;
  clearPendingRequests: () => void;
  syncPendingRequests: () => Promise<void>;
}

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 5000; // 5 seconds

export function useOffline(): OfflineState & OfflineActions {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingRequests, setPendingRequests] = useState<OfflineRequest[]>([]);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🟢 Online - Starting sync...');
      syncPendingRequests();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('🔴 Offline - Requests will be queued');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingRequests.length > 0) {
      syncPendingRequests();
    }
  }, [isOnline, pendingRequests.length]);

  // Add pending request
  const addPendingRequest = useCallback((request: Omit<OfflineRequest, 'id' | 'timestamp' | 'retryCount'>) => {
    const newRequest: OfflineRequest = {
      ...request,
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    setPendingRequests(prev => [...prev, newRequest]);
    
    // Store in localStorage for persistence
    const storedRequests = JSON.parse(localStorage.getItem('offline-requests') || '[]') as OfflineRequest[];
    storedRequests.push(newRequest);
    localStorage.setItem('offline-requests', JSON.stringify(storedRequests));
    
    console.log('📝 Added pending request:', newRequest.id);
  }, []);

  // Remove pending request
  const removePendingRequest = useCallback((id: string) => {
    setPendingRequests(prev => prev.filter(req => req.id !== id));
    
    // Remove from localStorage
    const storedRequests = JSON.parse(localStorage.getItem('offline-requests') || '[]') as OfflineRequest[];
    const updatedRequests = storedRequests.filter((req: OfflineRequest) => req.id !== id);
    localStorage.setItem('offline-requests', JSON.stringify(updatedRequests));
    
    console.log('🗑️ Removed pending request:', id);
  }, []);

  // Retry single pending request
  const retryPendingRequest = useCallback(async (id: string) => {
    const request = pendingRequests.find(req => req.id === id);
    if (!request) return;

    if (request.retryCount >= MAX_RETRY_COUNT) {
      console.log('❌ Max retry count reached for request:', id);
      removePendingRequest(id);
      return;
    }

    try {
      console.log(`🔄 Retrying request ${id} (attempt ${request.retryCount + 1}/${MAX_RETRY_COUNT})`);
      
      const response = await fetch(request.url, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...request.headers
        },
        body: request.data ? JSON.stringify(request.data) : undefined
      });

      if (response.ok) {
        console.log('✅ Request succeeded:', id);
        removePendingRequest(id);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Request failed:', id, error);
      
      // Increment retry count
      setPendingRequests(prev => prev.map(req => 
        req.id === id 
          ? { ...req, retryCount: req.retryCount + 1 }
          : req
      ));
      
      // Update localStorage
      const storedRequests = JSON.parse(localStorage.getItem('offline-requests') || '[]') as OfflineRequest[];
      const updatedRequests = storedRequests.map((req: OfflineRequest) => 
        req.id === id 
          ? { ...req, retryCount: req.retryCount + 1 }
          : req
      );
      localStorage.setItem('offline-requests', JSON.stringify(updatedRequests));
    }
  }, [pendingRequests, removePendingRequest]);

  // Retry all pending requests
  const retryAllPendingRequests = useCallback(async () => {
    if (pendingRequests.length === 0) return;

    console.log(`🔄 Retrying ${pendingRequests.length} pending requests...`);
    
    const promises = pendingRequests.map(request => retryPendingRequest(request.id));
    await Promise.allSettled(promises);
  }, [pendingRequests, retryPendingRequest]);

  // Clear all pending requests
  const clearPendingRequests = useCallback(() => {
    setPendingRequests([]);
    localStorage.removeItem('offline-requests');
    console.log('🧹 Cleared all pending requests');
  }, []);

  // Sync pending requests
  const syncPendingRequests = useCallback(async () => {
    if (syncInProgress || !isOnline || pendingRequests.length === 0) return;

    setSyncInProgress(true);
    console.log(`🔄 Starting sync of ${pendingRequests.length} pending requests...`);

    try {
      await retryAllPendingRequests();
      setLastSyncTime(Date.now());
      console.log('✅ Sync completed');
    } catch (error) {
      console.error('❌ Sync failed:', error);
    } finally {
      setSyncInProgress(false);
    }
  }, [syncInProgress, isOnline, pendingRequests.length, retryAllPendingRequests]);

  // Load pending requests from localStorage on mount
  useEffect(() => {
    try {
      const storedRequests = JSON.parse(localStorage.getItem('offline-requests') || '[]') as OfflineRequest[];
      if (storedRequests.length > 0) {
        setPendingRequests(storedRequests);
        console.log(`📋 Loaded ${storedRequests.length} pending requests from storage`);
      }
    } catch (error) {
      console.error('❌ Failed to load pending requests from storage:', error);
      localStorage.removeItem('offline-requests');
    }
  }, []);

  // Auto-retry with exponential backoff
  useEffect(() => {
    if (pendingRequests.length > 0 && isOnline) {
      const retryDelay = Math.min(RETRY_DELAY * Math.pow(2, pendingRequests[0]?.retryCount || 0), 30000);
      
      syncTimeoutRef.current = setTimeout(() => {
        syncPendingRequests();
      }, retryDelay);

      return () => {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
      };
    }
  }, [pendingRequests, isOnline, syncPendingRequests]);

  return {
    isOnline,
    isOffline: !isOnline,
    pendingRequests,
    syncInProgress,
    lastSyncTime,
    addPendingRequest,
    removePendingRequest,
    retryPendingRequest,
    retryAllPendingRequests,
    clearPendingRequests,
    syncPendingRequests
  };
}

// Hook for offline-capable API calls
export function useOfflineAPI() {
  const { isOnline, addPendingRequest } = useOffline();

  const offlineFetch = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    if (isOnline) {
      // Try online first
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          return response;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        console.log('🌐 Online request failed, queuing for offline:', error);
      }
    }

    // Queue for offline
    addPendingRequest({
      method: (options.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH') || 'GET',
      url,
      data: options.body ? JSON.parse(options.body as string) : undefined,
      headers: options.headers as Record<string, string>
    });

    // Return a mock response for offline
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Request queued for offline processing',
      offline: true 
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    });
  }, [isOnline, addPendingRequest]);

  return { offlineFetch, isOnline };
}

// Hook for offline data storage
export function useOfflineStorage<T = unknown>(key: string, initialValue: T) {
  const [data, setData] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(`offline-${key}`);
      return stored ? JSON.parse(stored) : initialValue;
    } catch (error) {
      console.error('❌ Failed to load offline data:', error);
      return initialValue;
    }
  });

  const setOfflineData = useCallback((value: T) => {
    setData(value);
    try {
      localStorage.setItem(`offline-${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('❌ Failed to save offline data:', error);
    }
  }, [key]);

  const clearOfflineData = useCallback(() => {
    setData(initialValue);
    localStorage.removeItem(`offline-${key}`);
  }, [key, initialValue]);

  return [data, setOfflineData, clearOfflineData] as const;
}

// Hook for offline queue management
export function useOfflineQueue() {
  const { pendingRequests, removePendingRequest, retryPendingRequest, clearPendingRequests } = useOffline();

  const getQueueStats = useCallback(() => {
    const stats = {
      total: pendingRequests.length,
      byMethod: {} as Record<string, number>,
      byStatus: {
        pending: 0,
        retrying: 0,
        failed: 0
      }
    };

    pendingRequests.forEach(request => {
      // Count by method
      stats.byMethod[request.method] = (stats.byMethod[request.method] || 0) + 1;
      
      // Count by status
      if (request.retryCount === 0) {
        stats.byStatus.pending++;
      } else if (request.retryCount < 3) {
        stats.byStatus.retrying++;
      } else {
        stats.byStatus.failed++;
      }
    });

    return stats;
  }, [pendingRequests]);

  const getQueueByMethod = useCallback((method: string) => {
    return pendingRequests.filter(request => request.method === method);
  }, [pendingRequests]);

  const getQueueByStatus = useCallback((status: 'pending' | 'retrying' | 'failed') => {
    return pendingRequests.filter(request => {
      if (status === 'pending') return request.retryCount === 0;
      if (status === 'retrying') return request.retryCount > 0 && request.retryCount < 3;
      if (status === 'failed') return request.retryCount >= 3;
      return false;
    });
  }, [pendingRequests]);

  return {
    pendingRequests,
    removePendingRequest,
    retryPendingRequest,
    clearPendingRequests,
    getQueueStats,
    getQueueByMethod,
    getQueueByStatus
  };
}

// Alias exports für Kompatibilität
export const useOfflineStatus = useOffline;
export const usePendingRequests = useOffline; 