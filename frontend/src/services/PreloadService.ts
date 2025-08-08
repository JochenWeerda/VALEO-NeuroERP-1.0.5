import { lazy, ComponentType } from 'react';

// Erweiterte Typen für Preloading-Strategien
export interface PreloadConfig {
  priority: 'critical' | 'high' | 'medium' | 'low';
  preloadTrigger: 'immediate' | 'idle' | 'hover' | 'intersection' | 'network-idle';
  dependencies?: string[];
  estimatedSize?: number; // Geschätzte Bundle-Größe in KB
  loadTime?: number; // Geschätzte Ladezeit in ms
}

// Performance-Metriken Interface
export interface PerformanceMetrics {
  route: string;
  loadTime: number;
  bundleSize: number;
  preloadTime?: number;
  cacheHit: boolean;
  timestamp: number;
}

// Bundle-Analyse Interface
export interface BundleAnalysis {
  totalSize: number;
  chunkCount: number;
  largestChunks: Array<{
    name: string;
    size: number;
    percentage: number;
  }>;
  optimizationSuggestions: string[];
}

// Kritische Routen-Konfiguration mit erweiterten Metriken
export const CRITICAL_ROUTES: Record<string, PreloadConfig> = {
  '/dashboard': {
    priority: 'critical',
    preloadTrigger: 'immediate',
    estimatedSize: 45,
    loadTime: 120
  },
  '/streckengeschaeft': {
    priority: 'high',
    preloadTrigger: 'idle',
    dependencies: ['/dashboard'],
    estimatedSize: 78,
    loadTime: 200
  },
  '/pos': {
    priority: 'high',
    preloadTrigger: 'idle',
    dependencies: ['/dashboard'],
    estimatedSize: 92,
    loadTime: 250
  },
  '/lakasir-features': {
    priority: 'medium',
    preloadTrigger: 'hover',
    estimatedSize: 35,
    loadTime: 150
  },
  '/daily-report': {
    priority: 'medium',
    preloadTrigger: 'hover',
    dependencies: ['/pos'],
    estimatedSize: 28,
    loadTime: 100
  },
  '/e-invoicing': {
    priority: 'medium',
    preloadTrigger: 'network-idle',
    estimatedSize: 65,
    loadTime: 180
  },
  '/crm': {
    priority: 'low',
    preloadTrigger: 'intersection',
    estimatedSize: 120,
    loadTime: 300
  }
};

// Lazy-Loading-Komponenten mit erweiterter Preloading-Unterstützung
export const lazyWithPreload = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  routeName: string,
  config?: Partial<PreloadConfig>
) => {
  let Component: T | null = null;
  let loadingPromise: Promise<T> | null = null;
  let loadStartTime: number | null = null;

  const loadComponent = async (): Promise<T> => {
    if (Component) return Component;
    if (loadingPromise) return loadingPromise;

    loadStartTime = performance.now();
    loadingPromise = importFunc().then(module => {
      Component = module.default;
      const loadTime = performance.now() - (loadStartTime || 0);
      
      // Performance-Metrik speichern
      preloadService.recordPerformanceMetric({
        route: routeName,
        loadTime,
        bundleSize: config?.estimatedSize || 0,
        cacheHit: false,
        timestamp: Date.now()
      });
      
      return Component;
    });

    return loadingPromise;
  };

  const preload = () => {
    if (!Component && !loadingPromise) {
      loadComponent();
    }
  };

  const preloadWithPriority = (priority: PreloadConfig['priority'] = 'medium') => {
    if (!Component && !loadingPromise) {
      preloadService.queuePreload(routeName, priority, loadComponent);
    }
  };

  return {
    Component: lazy(importFunc),
    preload,
    preloadWithPriority,
    isLoaded: () => Component !== null,
    routeName,
    config
  };
};

// Erweiterter PreloadService für intelligentes Preloading und Performance-Monitoring
class PreloadService {
  private preloadedRoutes = new Set<string>();
  private preloadQueue: Array<{route: string, priority: number, callback: () => void}> = [];
  private performanceMetrics: PerformanceMetrics[] = [];
  private isIdle = false;
  private networkIdleTimer: number | null = null;
  private bundleAnalysis: BundleAnalysis | null = null;

  constructor() {
    this.setupIdleDetection();
    this.setupIntersectionObserver();
    this.setupNetworkIdleDetection();
    this.setupPerformanceMonitoring();
  }

  // Bundle-Analyse generieren
  async generateBundleAnalysis(): Promise<BundleAnalysis> {
    try {
      // Versuche Bundle-Analyse-Datei zu laden
      const response = await fetch('/bundle-analysis.json');
      if (response.ok) {
        const data = await response.json();
        this.bundleAnalysis = data;
        return data;
      }
    } catch (error) {
      console.warn('Bundle-Analyse nicht verfügbar:', error);
    }

    // Fallback: Schätzung basierend auf PreloadConfig
    const totalSize = Object.values(CRITICAL_ROUTES).reduce((sum, config) => 
      sum + (config.estimatedSize || 0), 0
    );

    this.bundleAnalysis = {
      totalSize,
      chunkCount: Object.keys(CRITICAL_ROUTES).length,
      largestChunks: Object.entries(CRITICAL_ROUTES)
        .map(([route, config]) => ({
          name: route,
          size: config.estimatedSize || 0,
          percentage: ((config.estimatedSize || 0) / totalSize) * 100
        }))
        .sort((a, b) => b.size - a.size)
        .slice(0, 5),
      optimizationSuggestions: this.generateOptimizationSuggestions()
    };

    return this.bundleAnalysis;
  }

  // Optimierungsvorschläge generieren
  private generateOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    
    if (this.bundleAnalysis) {
      const { totalSize, largestChunks } = this.bundleAnalysis;
      
      if (totalSize > 500) {
        suggestions.push('Bundle-Größe über 500KB - Code-Splitting empfohlen');
      }
      
      if (largestChunks[0]?.percentage > 30) {
        suggestions.push(`Chunk "${largestChunks[0].name}" macht ${largestChunks[0].percentage.toFixed(1)}% aus - Optimierung empfohlen`);
      }
      
      if (largestChunks.length > 3) {
        suggestions.push('Mehr als 3 große Chunks - Konsolidierung empfohlen');
      }
    }
    
    return suggestions;
  }

  // Performance-Metrik aufzeichnen
  recordPerformanceMetric(metric: PerformanceMetrics): void {
    this.performanceMetrics.push(metric);
    
    // Nur die letzten 100 Metriken behalten
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics = this.performanceMetrics.slice(-100);
    }
    
    // Performance-Warnungen
    if (metric.loadTime > 1000) {
      console.warn(`⚠️ Langsame Route: ${metric.route} (${metric.loadTime.toFixed(0)}ms)`);
    }
  }

  // Performance-Report generieren
  getPerformanceReport(): {
    averageLoadTime: number;
    slowestRoutes: PerformanceMetrics[];
    totalPreloadedRoutes: number;
    cacheHitRate: number;
  } {
    const avgLoadTime = this.performanceMetrics.length > 0
      ? this.performanceMetrics.reduce((sum, m) => sum + m.loadTime, 0) / this.performanceMetrics.length
      : 0;

    const slowestRoutes = [...this.performanceMetrics]
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 5);

    const cacheHitRate = this.performanceMetrics.length > 0
      ? (this.performanceMetrics.filter(m => m.cacheHit).length / this.performanceMetrics.length) * 100
      : 0;

    return {
      averageLoadTime: avgLoadTime,
      slowestRoutes,
      totalPreloadedRoutes: this.preloadedRoutes.size,
      cacheHitRate
    };
  }

  // Preload mit Priorität in Queue einreihen
  queuePreload(route: string, priority: PreloadConfig['priority'], callback: () => void): void {
    const priorityMap = { critical: 4, high: 3, medium: 2, low: 1 };
    const priorityValue = priorityMap[priority];
    
    this.preloadQueue.push({ route, priority: priorityValue, callback });
    this.preloadQueue.sort((a, b) => b.priority - a.priority);
    
    this.processQueue();
  }

  // Queue verarbeiten
  private processQueue(): void {
    if (this.isIdle && this.preloadQueue.length > 0) {
      const item = this.preloadQueue.shift();
      if (item) {
        item.callback();
      }
    }
  }

  // Sofortiges Preloading für kritische Routen
  preloadCriticalRoutes(): void {
    Object.entries(CRITICAL_ROUTES)
      .filter(([_, config]) => config.priority === 'critical')
      .forEach(([route]) => {
        this.preloadRoute(route);
      });
  }

  // Preloading basierend auf Konfiguration
  preloadRoute(route: string): void {
    if (this.preloadedRoutes.has(route)) return;

    const config = CRITICAL_ROUTES[route];
    if (!config) return;

    switch (config.preloadTrigger) {
      case 'immediate':
        this.executePreload(route);
        break;
      case 'idle':
        this.queueForIdle(() => this.executePreload(route));
        break;
      case 'network-idle':
        this.queueForNetworkIdle(() => this.executePreload(route));
        break;
      case 'hover':
        this.setupHoverPreload(route);
        break;
      case 'intersection':
        this.setupIntersectionPreload(route);
        break;
    }
  }

  // Abhängigkeiten preloaden
  preloadDependencies(route: string): void {
    const config = CRITICAL_ROUTES[route];
    if (config?.dependencies) {
      config.dependencies.forEach(dep => this.preloadRoute(dep));
    }
  }

  // Preload basierend auf aktueller Route
  preloadBasedOnCurrentRoute(currentRoute: string): void {
    const likelyNextRoutes = this.getLikelyNextRoutes(currentRoute);
    likelyNextRoutes.forEach(route => this.preloadRoute(route));
  }

  // Wahrscheinliche nächste Routen basierend auf aktueller Route
  private getLikelyNextRoutes(currentRoute: string): string[] {
    const routeFlow: Record<string, string[]> = {
      '/dashboard': ['/streckengeschaeft', '/pos', '/lakasir-features'],
      '/streckengeschaeft': ['/pos', '/lakasir-features'],
      '/pos': ['/daily-report', '/dashboard'],
      '/lakasir-features': ['/dashboard', '/streckengeschaeft'],
      '/daily-report': ['/pos', '/dashboard'],
      '/e-invoicing': ['/dashboard', '/crm'],
      '/crm': ['/dashboard', '/e-invoicing']
    };

    return routeFlow[currentRoute] || [];
  }

  // Preload ausführen
  private executePreload(route: string): void {
    if (this.preloadedRoutes.has(route)) return;

    const startTime = performance.now();
    console.log(`🔄 Preloading route: ${route}`);
    
    this.preloadedRoutes.add(route);

    // Performance-Metrik aufzeichnen
    this.recordPerformanceMetric({
      route,
      loadTime: performance.now() - startTime,
      bundleSize: CRITICAL_ROUTES[route]?.estimatedSize || 0,
      preloadTime: performance.now() - startTime,
      cacheHit: false,
      timestamp: Date.now()
    });
  }

  // Queue für Idle-Zeit
  private queueForIdle(callback: () => void): void {
    if (this.isIdle) {
      callback();
    } else {
      this.preloadQueue.push({ route: '', priority: 1, callback });
    }
  }

  // Queue für Network-Idle
  private queueForNetworkIdle(callback: () => void): void {
    if (this.networkIdleTimer) {
      clearTimeout(this.networkIdleTimer);
    }
    
    this.networkIdleTimer = window.setTimeout(() => {
      callback();
    }, 1000); // 1 Sekunde nach letzter Netzwerkaktivität
  }

  // Idle-Detection Setup
  private setupIdleDetection(): void {
    if ('requestIdleCallback' in window) {
      const processQueue = () => {
        this.isIdle = true;
        this.processQueue();
        this.isIdle = false;
        requestIdleCallback(processQueue);
      };
      requestIdleCallback(processQueue);
    }
  }

  // Network-Idle Detection Setup
  private setupNetworkIdleDetection(): void {
    let lastNetworkActivity = Date.now();
    
    // Netzwerkaktivität überwachen
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      lastNetworkActivity = Date.now();
      return originalFetch.apply(window, args);
    };
  }

  // Performance-Monitoring Setup
  private setupPerformanceMonitoring(): void {
    // Navigation Timing API
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          console.log(`📊 Page Load Time: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
        }
      });
    }
  }

  // Intersection Observer Setup
  private setupIntersectionObserver(): void {
    if ('IntersectionObserver' in window) {
      console.log('🔍 Intersection Observer für Preloading eingerichtet');
    }
  }

  // Hover-Preloading Setup
  private setupHoverPreload(route: string): void {
    const links = document.querySelectorAll(`[data-route="${route}"]`);
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        this.executePreload(route);
      });
    });
  }

  // Intersection-Preloading Setup
  private setupIntersectionPreload(route: string): void {
    const links = document.querySelectorAll(`[data-route="${route}"]`);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.executePreload(route);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    links.forEach(link => observer.observe(link));
  }

  // Preload-Status abrufen
  getPreloadStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    Object.keys(CRITICAL_ROUTES).forEach(route => {
      status[route] = this.preloadedRoutes.has(route);
    });
    return status;
  }

  // Alle Routen preloaden
  preloadAllRoutes(): void {
    Object.keys(CRITICAL_ROUTES).forEach(route => {
      this.preloadRoute(route);
    });
  }

  // Bundle-Analyse abrufen
  getBundleAnalysis(): BundleAnalysis | null {
    return this.bundleAnalysis;
  }

  // Service-Status abrufen
  getServiceStatus(): {
    preloadedRoutes: number;
    queueLength: number;
    isIdle: boolean;
    performanceMetrics: number;
  } {
    return {
      preloadedRoutes: this.preloadedRoutes.size,
      queueLength: this.preloadQueue.length,
      isIdle: this.isIdle,
      performanceMetrics: this.performanceMetrics.length
    };
  }

  getStatus(): string {
    return this.isIdle ? 'idle' : 'active';
  }

  getPreloadedRoutes(): string[] {
    return Array.from(this.preloadedRoutes);
  }

  getPendingRoutes(): string[] {
    return this.preloadQueue.map(item => item.route);
  }
}

// Singleton-Instanz
export const preloadService = new PreloadService();

// React Hook für erweitertes Preloading
export const usePreload = () => {
  return {
    preloadRoute: (route: string) => preloadService.preloadRoute(route),
    preloadCriticalRoutes: () => preloadService.preloadCriticalRoutes(),
    getPreloadStatus: () => preloadService.getPreloadStatus(),
    preloadAllRoutes: () => preloadService.preloadAllRoutes(),
    getPerformanceReport: () => preloadService.getPerformanceReport(),
    getBundleAnalysis: () => preloadService.getBundleAnalysis(),
    getServiceStatus: () => preloadService.getServiceStatus(),
    generateBundleAnalysis: () => preloadService.generateBundleAnalysis()
  };
}; 