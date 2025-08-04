/**
 * Custom React Hooks für API-Datenabfragen
 * Bietet wiederverwendbare Hooks mit Caching, Loading-States und Fehlerbehandlung
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiService, PaginatedResponse } from '../services/api';
import { toast } from 'react-toastify';

// Generischer Hook für Listendaten mit Pagination
export function usePaginatedData<T>(
  key: string,
  fetchFunction: (params: any) => Promise<PaginatedResponse<T>>,
  initialParams?: any
) {
  const [params, setParams] = useState(initialParams || { page: 1, per_page: 20 });
  
  const { data, isLoading, error, refetch } = useQuery(
    [key, params],
    () => fetchFunction(params),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 Minuten
    }
  );

  const updateParams = useCallback((newParams: any) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  return {
    items: data?.items || [],
    total: data?.total || 0,
    page: data?.page || 1,
    pages: data?.pages || 1,
    perPage: data?.per_page || 20,
    isLoading,
    error,
    refetch,
    updateParams,
    goToPage,
  };
}

// Hook für einzelne Datensätze
export function useSingleData<T>(
  key: string | string[],
  fetchFunction: () => Promise<T>,
  enabled = true
) {
  const { data, isLoading, error, refetch } = useQuery(
    key,
    fetchFunction,
    {
      enabled,
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  );

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

// Hook für Mutationen (Create, Update, Delete)
export function useMutationWithToast<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
    invalidateQueries?: string[];
  }
) {
  const queryClient = useQueryClient();

  const mutation = useMutation(mutationFn, {
    onSuccess: (data) => {
      toast.success(options?.successMessage || 'Aktion erfolgreich');
      
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(key => {
          queryClient.invalidateQueries(key);
        });
      }
      
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(options?.errorMessage || error.message);
      options?.onError?.(error);
    },
  });

  return mutation;
}

// Spezifische Hooks für Geschäftsobjekte

// Kunden
export function useCustomers(initialParams?: any) {
  return usePaginatedData('customers', apiService.getCustomers.bind(apiService), initialParams);
}

export function useCustomer(id: number) {
  return useSingleData(
    ['customer', id],
    () => apiService.getCustomer(id),
    !!id
  );
}

export function useCreateCustomer() {
  return useMutationWithToast(
    apiService.createCustomer.bind(apiService),
    {
      successMessage: 'Kunde erfolgreich erstellt',
      invalidateQueries: ['customers'],
    }
  );
}

export function useUpdateCustomer() {
  return useMutationWithToast(
    ({ id, data }: { id: number; data: any }) => apiService.updateCustomer(id, data),
    {
      successMessage: 'Kunde erfolgreich aktualisiert',
      invalidateQueries: ['customers', 'customer'],
    }
  );
}

export function useDeleteCustomer() {
  return useMutationWithToast(
    apiService.deleteCustomer.bind(apiService),
    {
      successMessage: 'Kunde erfolgreich gelöscht',
      invalidateQueries: ['customers'],
    }
  );
}

// Artikel
export function useArticles(initialParams?: any) {
  return usePaginatedData('articles', apiService.getArticles.bind(apiService), initialParams);
}

export function useArticle(id: number) {
  return useSingleData(
    ['article', id],
    () => apiService.getArticle(id),
    !!id
  );
}

export function useArticleStockHistory(id: number, days = 30) {
  return useSingleData(
    ['article-stock-history', id, days],
    () => apiService.getArticleStockHistory(id, days),
    !!id
  );
}

export function useCreateArticle() {
  return useMutationWithToast(
    apiService.createArticle.bind(apiService),
    {
      successMessage: 'Artikel erfolgreich erstellt',
      invalidateQueries: ['articles'],
    }
  );
}

export function useUpdateArticle() {
  return useMutationWithToast(
    ({ id, data }: { id: number; data: any }) => apiService.updateArticle(id, data),
    {
      successMessage: 'Artikel erfolgreich aktualisiert',
      invalidateQueries: ['articles', 'article'],
    }
  );
}

// Rechnungen
export function useInvoices(initialParams?: any) {
  return usePaginatedData('invoices', apiService.getInvoices.bind(apiService), initialParams);
}

export function useInvoice(id: number) {
  return useSingleData(
    ['invoice', id],
    () => apiService.getInvoice(id),
    !!id
  );
}

export function useCreateInvoice() {
  return useMutationWithToast(
    apiService.createInvoice.bind(apiService),
    {
      successMessage: 'Rechnung erfolgreich erstellt',
      invalidateQueries: ['invoices', 'dashboard-stats'],
    }
  );
}

// Dashboard
export function useDashboardStats(dateFrom?: string, dateTo?: string) {
  return useSingleData(
    ['dashboard-stats', dateFrom, dateTo],
    () => apiService.getDashboardStats(dateFrom, dateTo)
  );
}

export function useRevenueChart(period: 'week' | 'month' | 'year' = 'month') {
  return useSingleData(
    ['revenue-chart', period],
    () => apiService.getRevenueChart(period)
  );
}

// Globale Suche mit Debounce
export function useGlobalSearch(debounceMs = 300) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    // Set new timer
    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await apiService.globalSearch(searchQuery);
        setResults(response.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);
  }, [debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    query,
    results,
    isSearching,
    search,
  };
}

// Live-Validierung
export function useLiveValidation<T>(
  validationFn: (data: T) => Promise<any>,
  debounceMs = 500
) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const validate = useCallback((data: T) => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(async () => {
      setIsValidating(true);
      try {
        const result = await validationFn(data);
        setValidationResult(result);
      } catch (error) {
        setValidationResult({ valid: false, errors: { general: ['Validierungsfehler'] } });
      } finally {
        setIsValidating(false);
      }
    }, debounceMs);
  }, [validationFn, debounceMs]);

  return {
    validate,
    isValidating,
    validationResult,
  };
}

// Auto-Save Hook
export function useAutoSave<T>(
  saveFn: (data: T) => Promise<any>,
  data: T,
  enabled = true,
  debounceMs = 2000
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const previousData = useRef<T>(data);
  const saveTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) return;

    // Check if data changed
    const dataChanged = JSON.stringify(data) !== JSON.stringify(previousData.current);
    
    if (dataChanged) {
      setHasChanges(true);
      
      // Clear previous timer
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }

      // Set new timer
      saveTimer.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          await saveFn(data);
          setLastSaved(new Date());
          setHasChanges(false);
          previousData.current = data;
        } catch (error) {
          console.error('Auto-save error:', error);
        } finally {
          setIsSaving(false);
        }
      }, debounceMs);
    }
  }, [data, saveFn, enabled, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    hasChanges,
  };
} 