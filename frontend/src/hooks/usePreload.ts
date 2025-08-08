import { useState, useEffect, useCallback, useRef } from 'react';

interface PreloadOptions {
  priority?: 'high' | 'low' | 'auto';
  timeout?: number;
  retries?: number;
}

interface PreloadState {
  isLoading: boolean;
  progress: number;
  loaded: number;
  total: number;
  error: Error | null;
}

interface PreloadItem {
  id: string;
  url: string;
  type: 'image' | 'script' | 'style' | 'data';
  priority: 'high' | 'low' | 'auto';
  status: 'pending' | 'loading' | 'loaded' | 'error';
  progress: number;
  error?: Error;
}

export function usePreload(
  items: Array<{ id: string; url: string; type: 'image' | 'script' | 'style' | 'data' }>,
  options: PreloadOptions = {}
): PreloadState & { preload: () => Promise<void>; cancel: () => void } {
  const { priority = 'auto', timeout = 30000 } = options;
  
  const [state, setState] = useState<PreloadState>({
    isLoading: false,
    progress: 0,
    loaded: 0,
    total: items.length,
    error: null
  });

  const [preloadItems, setPreloadItems] = useState<PreloadItem[]>(() =>
    items.map(item => ({
      ...item,
      priority,
      status: 'pending',
      progress: 0
    }))
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const preload = useCallback(async () => {
    if (state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    abortControllerRef.current = new AbortController();

    const timeoutId = setTimeout(() => {
      abortControllerRef.current?.abort();
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: new Error('Preload timeout') 
      }));
    }, timeout);

    timeoutRef.current = timeoutId;

    try {
      const promises = preloadItems.map(async (item) => {
        if (item.status === 'loaded') return;

        setPreloadItems(prev => prev.map(i => 
          i.id === item.id ? { ...i, status: 'loading' } : i
        ));

        try {
          switch (item.type) {
            case 'image':
              await preloadImage(item.url, abortControllerRef.current!.signal);
              break;
            case 'script':
              await preloadScript(item.url, abortControllerRef.current!.signal);
              break;
            case 'style':
              await preloadStyle(item.url, abortControllerRef.current!.signal);
              break;
            case 'data':
              await preloadData(item.url, abortControllerRef.current!.signal);
              break;
          }

          setPreloadItems(prev => prev.map(i => 
            i.id === item.id ? { ...i, status: 'loaded', progress: 100 } : i
          ));

          setState(prev => ({
            ...prev,
            loaded: prev.loaded + 1,
            progress: ((prev.loaded + 1) / prev.total) * 100
          }));

        } catch (error) {
          const errorObj = error instanceof Error ? error : new Error('Unknown error');
          setPreloadItems(prev => prev.map(i => 
            i.id === item.id ? { ...i, status: 'error', error: errorObj } : i
          ));
          throw errorObj;
        }
      });

      await Promise.allSettled(promises);
      setState(prev => ({ ...prev, isLoading: false }));

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      setState(prev => ({ ...prev, isLoading: false, error: errorObj }));
    } finally {
      clearTimeout(timeoutId);
    }
  }, [preloadItems, state.isLoading, timeout]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    ...state,
    preload,
    cancel
  };
}

// Alias exports für Kompatibilität
export const usePreloadPerformance = usePreload;

// Helper functions for preloading different types of resources
async function preloadImage(url: string, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    
    if (signal.aborted) {
      reject(new Error('Preload cancelled'));
      return;
    }

    signal.addEventListener('abort', () => {
      img.src = '';
      reject(new Error('Preload cancelled'));
    });

    img.src = url;
  });
}

async function preloadScript(url: string, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    
    if (signal.aborted) {
      reject(new Error('Preload cancelled'));
      return;
    }

    signal.addEventListener('abort', () => {
      script.remove();
      reject(new Error('Preload cancelled'));
    });

    document.head.appendChild(script);
  });
}

async function preloadStyle(url: string, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load style: ${url}`));
    
    if (signal.aborted) {
      reject(new Error('Preload cancelled'));
      return;
    }

    signal.addEventListener('abort', () => {
      link.remove();
      reject(new Error('Preload cancelled'));
    });

    document.head.appendChild(link);
  });
}

async function preloadData(url: string, signal: AbortSignal): Promise<void> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Failed to load data: ${url}`);
  }
  await response.json();
}

// Hook for preloading with progress tracking
export function usePreloadWithProgress(
  items: Array<{ id: string; url: string; type: 'image' | 'script' | 'style' | 'data' }>,
  options: PreloadOptions = {}
) {
  const [progress, setProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, Error>>({});

  const preload = useCallback(async () => {
    setProgress(0);
    setErrors({});
    setCurrentItem(null);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      setCurrentItem(item.id);
      
      try {
        switch (item.type) {
          case 'image':
            await preloadImage(item.url, new AbortController().signal);
            break;
          case 'script':
            await preloadScript(item.url, new AbortController().signal);
            break;
          case 'style':
            await preloadStyle(item.url, new AbortController().signal);
            break;
          case 'data':
            await preloadData(item.url, new AbortController().signal);
            break;
        }
        
        setProgress(((i + 1) / items.length) * 100);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error');
        setErrors(prev => ({ ...prev, [item.id]: errorObj }));
      }
    }

    setCurrentItem(null);
  }, [items]);

  return {
    progress,
    currentItem,
    errors,
    preload
  };
}

// Hook for preloading critical resources
export function useCriticalPreload(
  criticalItems: Array<{ id: string; url: string; type: 'image' | 'script' | 'style' | 'data' }>,
  nonCriticalItems: Array<{ id: string; url: string; type: 'image' | 'script' | 'style' | 'data' }> = []
) {
  const [criticalLoaded, setCriticalLoaded] = useState(false);
  const [nonCriticalLoaded, setNonCriticalLoaded] = useState(false);

  const preloadCritical = useCallback(async () => {
    const criticalPreload = usePreload(criticalItems, { priority: 'high' });
    await criticalPreload.preload();
    setCriticalLoaded(true);
  }, [criticalItems]);

  const preloadNonCritical = useCallback(async () => {
    if (nonCriticalItems.length === 0) {
      setNonCriticalLoaded(true);
      return;
    }

    const nonCriticalPreload = usePreload(nonCriticalItems, { priority: 'low' });
    await nonCriticalPreload.preload();
    setNonCriticalLoaded(true);
  }, [nonCriticalItems]);

  const preloadAll = useCallback(async () => {
    await preloadCritical();
    await preloadNonCritical();
  }, [preloadCritical, preloadNonCritical]);

  return {
    criticalLoaded,
    nonCriticalLoaded,
    allLoaded: criticalLoaded && nonCriticalLoaded,
    preloadCritical,
    preloadNonCritical,
    preloadAll
  };
} 