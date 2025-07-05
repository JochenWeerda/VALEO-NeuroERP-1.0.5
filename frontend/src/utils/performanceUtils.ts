import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Debounce Hook - Verzögert die Ausführung einer Funktion
 * 
 * @param value Der Wert, der debounced werden soll
 * @param delay Die Verzögerung in Millisekunden
 * @returns Der debounced Wert
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle Hook - Begrenzt die Häufigkeit der Funktionsausführung
 * 
 * @param callback Die zu throttlende Funktion
 * @param delay Die minimale Zeit zwischen Aufrufen in Millisekunden
 * @returns Die throttled Funktion
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastCall = useRef<number>(0);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const lastArgs = useRef<Parameters<T> | null>(null);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall.current;

    // Speichere die aktuellen Argumente für den verspäteten Aufruf
    lastArgs.current = args;

    const executeCall = () => {
      lastCall.current = Date.now();
      callback(...(lastArgs.current as Parameters<T>));
      lastArgs.current = null;
    };

    // Lösche bestehenden Timeout
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }

    if (timeSinceLastCall >= delay) {
      // Sofortige Ausführung, wenn genug Zeit vergangen ist
      executeCall();
    } else {
      // Setze Timeout für die verbleibende Zeit
      timeout.current = setTimeout(executeCall, delay - timeSinceLastCall);
    }
  }, [callback, delay]);
}

/**
 * Memoization-Funktion für teure Berechnungen
 * 
 * @param func Die zu memoisierte Funktion
 * @returns Die memoiierte Funktion mit Cache
 */
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Hook zur Erkennung von Sichtbarkeit eines Elements im Viewport
 * Nützlich für Lazy Loading und Infinite Scroll
 * 
 * @param options IntersectionObserver Optionen
 * @returns [ref, isVisible] - Eine Referenz für das Element und ein Boolean, ob es sichtbar ist
 */
export function useInView(options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      observer.disconnect();
    };
  }, [options]);

  return [ref, isInView] as const;
}

/**
 * Progressive Loading - Lädt Daten in Batches, um die UI flüssig zu halten
 * 
 * @param items Array von Elementen
 * @param batchSize Größe eines Batches
 * @param interval Zeit zwischen Batches in ms
 * @param onProgress Callback für den Fortschritt (0-1)
 * @returns [visibleItems, isLoading, progress] - Sichtbare Elemente, Ladezustand und Fortschritt
 */
export function useProgressiveLoading<T>(
  items: T[],
  batchSize: number = 20,
  interval: number = 16,
  onProgress?: (progress: number) => void
) {
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(items.length > 0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (items.length === 0) {
      setVisibleItems([]);
      setIsLoading(false);
      setProgress(0);
      return;
    }

    setIsLoading(true);
    let currentIndex = 0;
    
    const loadNextBatch = () => {
      if (currentIndex >= items.length) {
        setIsLoading(false);
        setProgress(1);
        if (onProgress) onProgress(1);
        return;
      }
      
      const nextIndex = Math.min(currentIndex + batchSize, items.length);
      const nextBatch = items.slice(0, nextIndex);
      
      setVisibleItems(nextBatch);
      currentIndex = nextIndex;
      
      const currentProgress = currentIndex / items.length;
      setProgress(currentProgress);
      if (onProgress) onProgress(currentProgress);
      
      if (currentIndex < items.length) {
        setTimeout(loadNextBatch, interval);
      }
    };
    
    loadNextBatch();
    
    return () => {
      setIsLoading(false);
    };
  }, [items, batchSize, interval, onProgress]);

  return [visibleItems, isLoading, progress] as const;
}

/**
 * Ermittelt, ob der Browser den Lazy Loading Support für Images nativ unterstützt
 */
export function supportsNativeLazyLoading(): boolean {
  return 'loading' in HTMLImageElement.prototype;
}

/**
 * AbortController Hook für API-Aufrufe
 * Hilft dabei, ausstehende API-Aufrufe abzubrechen, wenn Komponenten unmounten
 * 
 * @returns [abortController, resetController] - AbortController und Reset-Funktion
 */
export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  const getController = useCallback(() => {
    if (!controllerRef.current || controllerRef.current.signal.aborted) {
      controllerRef.current = new AbortController();
    }
    return controllerRef.current;
  }, []);

  const resetController = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();
    return controllerRef.current;
  }, []);

  // Automatisches Abbrechen beim Unmounten
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  return [getController, resetController] as const;
}

/**
 * Intelligentes Cache-Management für API-Antworten
 */
interface CacheOptions {
  maxAge?: number; // Max Alter in ms
  maxSize?: number; // Max Größe des Cache
}

class ApiCache {
  private cache: Map<string, { data: any; timestamp: number }>;
  private maxAge: number;
  private maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.maxAge = options.maxAge || 5 * 60 * 1000; // 5 Minuten Standard
    this.maxSize = options.maxSize || 100; // 100 Einträge Standard
  }

  get(key: string): any {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Prüfe, ob der Cache-Eintrag abgelaufen ist
    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  set(key: string, data: any): void {
    // Wenn der Cache zu groß ist, entferne den ältesten Eintrag
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  remove(key: string): void {
    this.cache.delete(key);
  }
}

// Exportiere eine singleton Instanz des API Cache
export const apiCache = new ApiCache(); 