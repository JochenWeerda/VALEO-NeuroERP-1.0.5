/**
 * 🚀 Preloading-System für VALEO NeuroERP
 * Intelligentes Vorladen kritischer Routen und Komponenten
 */

import { useEffect, useRef } from 'react';

// Preloading-Strategien
export enum PreloadStrategy {
  IMMEDIATE = 'immediate',    // Sofortiges Laden
  IDLE = 'idle',             // Bei Browser-Idle
  HOVER = 'hover',           // Bei Hover
  INTERSECTION = 'intersection' // Bei Sichtbarkeit
}

// Preload-Konfiguration
interface PreloadConfig {
  strategy: PreloadStrategy;
  priority: 'high' | 'medium' | 'low';
  timeout?: number;
}

// Preload-Manager
class PreloadManager {
  private preloadedModules = new Set<string>();
  private preloadQueue = new Map<string, () => Promise<any>>();
  private observers = new Map<string, IntersectionObserver>();

  /**
   * Registriert ein Modul für Preloading
   */
  registerModule(
    moduleName: string, 
    importFn: () => Promise<any>, 
    config: PreloadConfig
  ): void {
    if (this.preloadedModules.has(moduleName)) {
      return; // Bereits geladen
    }

    this.preloadQueue.set(moduleName, importFn);

    switch (config.strategy) {
      case PreloadStrategy.IMMEDIATE:
        this.preloadImmediate(moduleName, importFn);
        break;
      case PreloadStrategy.IDLE:
        this.preloadOnIdle(moduleName, importFn);
        break;
      case PreloadStrategy.HOVER:
        // Wird über usePreloadOnHover Hook implementiert
        break;
      case PreloadStrategy.INTERSECTION:
        // Wird über usePreloadOnIntersection Hook implementiert
        break;
    }
  }

  /**
   * Sofortiges Preloading
   */
  private preloadImmediate(moduleName: string, importFn: () => Promise<any>): void {
    importFn()
      .then(() => {
        this.preloadedModules.add(moduleName);
        console.log(`🚀 ${moduleName} sofort vorgeladen`);
      })
      .catch(error => {
        console.warn(`⚠️ Preloading fehlgeschlagen für ${moduleName}:`, error);
      });
  }

  /**
   * Preloading bei Browser-Idle
   */
  private preloadOnIdle(moduleName: string, importFn: () => Promise<any>): void {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        this.preloadImmediate(moduleName, importFn);
      });
    } else {
      // Fallback für ältere Browser
      setTimeout(() => {
        this.preloadImmediate(moduleName, importFn);
      }, 1000);
    }
  }

  /**
   * Preloading bei Hover über Element
   */
  preloadOnHover(element: HTMLElement, moduleName: string): void {
    const importFn = this.preloadQueue.get(moduleName);
    if (!importFn) return;

    const handleMouseEnter = () => {
      this.preloadImmediate(moduleName, importFn);
      element.removeEventListener('mouseenter', handleMouseEnter);
    };

    element.addEventListener('mouseenter', handleMouseEnter);
  }

  /**
   * Preloading bei Sichtbarkeit
   */
  preloadOnIntersection(element: HTMLElement, moduleName: string): void {
    const importFn = this.preloadQueue.get(moduleName);
    if (!importFn) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.preloadImmediate(moduleName, importFn);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    this.observers.set(moduleName, observer);
  }

  /**
   * Prüft ob Modul bereits vorgeladen wurde
   */
  isPreloaded(moduleName: string): boolean {
    return this.preloadedModules.has(moduleName);
  }

  /**
   * Bereinigt Observer
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Globaler Preload-Manager
export const preloadManager = new PreloadManager();

// React Hooks für Preloading

/**
 * Hook für Hover-basiertes Preloading
 */
export const usePreloadOnHover = (moduleName: string) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      preloadManager.preloadOnHover(element, moduleName);
    }
  }, [moduleName]);

  return elementRef;
};

/**
 * Hook für Intersection-basiertes Preloading
 */
export const usePreloadOnIntersection = (moduleName: string) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      preloadManager.preloadOnIntersection(element, moduleName);
    }
  }, [moduleName]);

  return elementRef;
};

/**
 * Hook für sofortiges Preloading
 */
export const usePreloadImmediate = (moduleName: string, importFn: () => Promise<any>) => {
  useEffect(() => {
    preloadManager.registerModule(moduleName, importFn, {
      strategy: PreloadStrategy.IMMEDIATE,
      priority: 'high'
    });
  }, [moduleName, importFn]);
};

/**
 * Hook für Idle-basiertes Preloading
 */
export const usePreloadOnIdle = (moduleName: string, importFn: () => Promise<any>) => {
  useEffect(() => {
    preloadManager.registerModule(moduleName, importFn, {
      strategy: PreloadStrategy.IDLE,
      priority: 'medium'
    });
  }, [moduleName, importFn]);
};

// Preloading-Konfiguration für kritische Routen
export const CRITICAL_ROUTES = {
  DASHBOARD: {
    moduleName: 'NeuroFlowDashboard',
    importFn: () => import('../components/neuroflow/NeuroFlowDashboard'),
    config: { strategy: PreloadStrategy.IMMEDIATE, priority: 'high' as const }
  },
  POS_SYSTEM: {
    moduleName: 'POSPage',
    importFn: () => import('../pages/POS/POSPage'),
    config: { strategy: PreloadStrategy.IDLE, priority: 'medium' as const }
  },
  LAKASIR_FEATURES: {
    moduleName: 'LakasirFeatures',
    importFn: () => import('../pages/POS/LakasirFeatures'),
    config: { strategy: PreloadStrategy.IDLE, priority: 'medium' as const }
  }
};

/**
 * Initialisiert Preloading für kritische Routen
 */
export const initializeCriticalPreloading = (): void => {
  Object.values(CRITICAL_ROUTES).forEach(route => {
    preloadManager.registerModule(
      route.moduleName,
      route.importFn,
      route.config
    );
  });

  console.log('🚀 Kritische Routen für Preloading registriert');
};

// Cleanup bei App-Unmount
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    preloadManager.cleanup();
  });
} 