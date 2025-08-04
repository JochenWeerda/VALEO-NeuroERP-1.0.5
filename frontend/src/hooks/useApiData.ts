import { useState, useEffect, useCallback } from 'react';
import { notificationActions } from '../store/notificationStore';

// Generic API Data Hook für VALEO NeuroERP
interface UseApiDataOptions<T> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  autoFetch?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  showNotifications?: boolean;
}

interface UseApiDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
  reset: () => void;
}

export const useApiData = <T>({
  url,
  method = 'GET',
  body,
  headers = {},
  autoFetch = true,
  onSuccess,
  onError,
  showNotifications = true
}: UseApiDataOptions<T>): UseApiDataReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }

      if (showNotifications && method !== 'GET') {
        notificationActions.success(
          'Erfolgreich',
          'Daten wurden erfolgreich verarbeitet'
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }

      if (showNotifications) {
        notificationActions.error(
          'Fehler',
          errorMessage
        );
      }
    } finally {
      setLoading(false);
    }
  }, [url, method, body, headers, onSuccess, onError, showNotifications]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate,
    reset
  };
};

// Specialized Hooks für häufige Anwendungsfälle
export const useGetData = <T>(url: string, options?: Omit<UseApiDataOptions<T>, 'url' | 'method'>) => {
  return useApiData<T>({ url, method: 'GET', ...options });
};

export const usePostData = <T>(url: string, body: any, options?: Omit<UseApiDataOptions<T>, 'url' | 'method' | 'body'>) => {
  return useApiData<T>({ url, method: 'POST', body, autoFetch: false, ...options });
};

export const usePutData = <T>(url: string, body: any, options?: Omit<UseApiDataOptions<T>, 'url' | 'method' | 'body'>) => {
  return useApiData<T>({ url, method: 'PUT', body, autoFetch: false, ...options });
};

export const useDeleteData = <T>(url: string, options?: Omit<UseApiDataOptions<T>, 'url' | 'method'>) => {
  return useApiData<T>({ url, method: 'DELETE', autoFetch: false, ...options });
}; 