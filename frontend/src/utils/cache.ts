/**
 * Frontend Cache Manager
 */
import { useState, useEffect } from 'react';

interface CacheOptions {
    ttl?: number;
    staleWhileRevalidate?: boolean;
}

interface CacheEntry<T> {
    value: T;
    timestamp: number;
    ttl: number;
}

class CacheManager {
    private static instance: CacheManager;
    private cache: Map<string, CacheEntry<any>>;
    private defaultTTL: number = 5 * 60 * 1000; // 5 Minuten

    private constructor() {
        this.cache = new Map();
        
        // Periodische Cache-Bereinigung
        setInterval(() => this.cleanup(), 60 * 1000);
    }

    public static getInstance(): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }

    /**
     * Wert aus Cache lesen
     */
    public get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        
        if (!entry) {
            return null;
        }

        // TTL prüfen
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    /**
     * Wert in Cache schreiben
     */
    public set<T>(
        key: string,
        value: T,
        options: CacheOptions = {}
    ): void {
        const ttl = options.ttl || this.defaultTTL;
        
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl
        });
    }

    /**
     * Wert aus Cache löschen
     */
    public delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Cache leeren
     */
    public clear(): void {
        this.cache.clear();
    }

    /**
     * Abgelaufene Einträge entfernen
     */
    private cleanup(): void {
        const now = Date.now();
        
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
    }
}

/**
 * React Hook für Cache-Nutzung
 */
export function useCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
): {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
} {
    const cache = CacheManager.getInstance();
    const [data, setData] = useState<T | null>(cache.get(key));
    const [loading, setLoading] = useState(!data);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const result = await fetcher();
            
            setData(result);
            cache.set(key, result, options);
            
        } catch (err) {
            setError(err as Error);
            
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Wenn kein Cache-Treffer, dann Daten holen
        if (!data) {
            fetchData();
        }
        // Bei staleWhileRevalidate auch bei Cache-Treffer aktualisieren
        else if (options.staleWhileRevalidate) {
            fetchData();
        }
    }, [key]);

    return {
        data,
        loading,
        error,
        refetch: fetchData
    };
}

// Export
export const cacheManager = CacheManager.getInstance();
export default CacheManager; 