import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { preloadService, CRITICAL_ROUTES } from '../services/PreloadService';

// Hook für Preloading-Funktionalität
export const usePreload = () => {
  const location = useLocation();
  const [preloadStatus, setPreloadStatus] = useState<Record<string, boolean>>({});

  // Preload-Status aktualisieren
  const updatePreloadStatus = useCallback(() => {
    setPreloadStatus(preloadService.getPreloadStatus());
  }, []);

  // Route preloaden
  const preloadRoute = useCallback((route: string) => {
    preloadService.preloadRoute(route);
    updatePreloadStatus();
  }, [updatePreloadStatus]);

  // Kritische Routen preloaden
  const preloadCriticalRoutes = useCallback(() => {
    preloadService.preloadCriticalRoutes();
    updatePreloadStatus();
  }, [updatePreloadStatus]);

  // Basierend auf aktueller Route preloaden
  const preloadBasedOnCurrentRoute = useCallback(() => {
    preloadService.preloadBasedOnCurrentRoute(location.pathname);
    updatePreloadStatus();
  }, [location.pathname, updatePreloadStatus]);

  // Abhängigkeiten preloaden
  const preloadDependencies = useCallback((route: string) => {
    preloadService.preloadDependencies(route);
    updatePreloadStatus();
  }, [updatePreloadStatus]);

  // Alle Routen preloaden
  const preloadAllRoutes = useCallback(() => {
    preloadService.preloadAllRoutes();
    updatePreloadStatus();
  }, [updatePreloadStatus]);

  // Status regelmäßig aktualisieren
  useEffect(() => {
    updatePreloadStatus();
    const interval = setInterval(updatePreloadStatus, 1000);
    return () => clearInterval(interval);
  }, [updatePreloadStatus]);

  // Automatisches Preloading basierend auf Route-Änderungen
  useEffect(() => {
    preloadBasedOnCurrentRoute();
  }, [preloadBasedOnCurrentRoute]);

  return {
    preloadRoute,
    preloadCriticalRoutes,
    preloadBasedOnCurrentRoute,
    preloadDependencies,
    preloadAllRoutes,
    preloadStatus,
    updatePreloadStatus,
    isRoutePreloaded: (route: string) => preloadStatus[route] || false,
    getPreloadedRoutes: () => Object.keys(preloadStatus).filter(route => preloadStatus[route]),
    getPendingRoutes: () => Object.keys(CRITICAL_ROUTES).filter(route => !preloadStatus[route])
  };
};

// Hook für spezifische Route-Preloading
export const useRoutePreload = (route: string) => {
  const { preloadRoute, isRoutePreloaded } = usePreload();
  const [isPreloading, setIsPreloading] = useState(false);

  const preload = useCallback(async () => {
    if (isRoutePreloaded(route) || isPreloading) return;

    setIsPreloading(true);
    try {
      preloadRoute(route);
    } finally {
      setIsPreloading(false);
    }
  }, [route, preloadRoute, isRoutePreloaded, isPreloading]);

  return {
    preload,
    isPreloaded: isRoutePreloaded(route),
    isPreloading
  };
};

// Hook für intelligentes Preloading basierend auf Benutzerverhalten
export const useSmartPreload = () => {
  const location = useLocation();
  const { preloadRoute, preloadStatus } = usePreload();
  const [userBehavior, setUserBehavior] = useState<Record<string, number>>({});

  // Benutzerverhalten tracken
  const trackRouteVisit = useCallback((route: string) => {
    setUserBehavior(prev => ({
      ...prev,
      [route]: (prev[route] || 0) + 1
    }));
  }, []);

  // Route besuchen und Verhalten tracken
  const visitRoute = useCallback((route: string) => {
    trackRouteVisit(route);
  }, [trackRouteVisit]);

  // Häufig besuchte Routen preloaden
  const preloadFrequentRoutes = useCallback(() => {
    const sortedRoutes = Object.entries(userBehavior)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3) // Top 3 Routen
      .map(([route]) => route);

    sortedRoutes.forEach(route => {
      if (!preloadStatus[route]) {
        preloadRoute(route);
      }
    });
  }, [userBehavior, preloadRoute, preloadStatus]);

  // Automatisches Preloading basierend auf Verhalten
  useEffect(() => {
    if (Object.keys(userBehavior).length > 0) {
      preloadFrequentRoutes();
    }
  }, [userBehavior, preloadFrequentRoutes]);

  return {
    visitRoute,
    trackRouteVisit,
    preloadFrequentRoutes,
    userBehavior,
    getMostVisitedRoutes: () => 
      Object.entries(userBehavior)
        .sort(([, a], [, b]) => b - a)
        .map(([route]) => route)
  };
};

// Hook für Performance-Monitoring
export const usePreloadPerformance = () => {
  const [metrics, setMetrics] = useState({
    totalPreloads: 0,
    successfulPreloads: 0,
    failedPreloads: 0,
    averageLoadTime: 0,
    lastPreloadTime: 0
  });

  const trackPreloadAttempt = useCallback((success: boolean, loadTime: number) => {
    setMetrics(prev => ({
      totalPreloads: prev.totalPreloads + 1,
      successfulPreloads: prev.successfulPreloads + (success ? 1 : 0),
      failedPreloads: prev.failedPreloads + (success ? 0 : 1),
      averageLoadTime: (prev.averageLoadTime + loadTime) / 2,
      lastPreloadTime: loadTime
    }));
  }, []);

  const getSuccessRate = useCallback(() => {
    return metrics.totalPreloads > 0 
      ? (metrics.successfulPreloads / metrics.totalPreloads) * 100 
      : 0;
  }, [metrics]);

  return {
    metrics,
    trackPreloadAttempt,
    getSuccessRate,
    resetMetrics: () => setMetrics({
      totalPreloads: 0,
      successfulPreloads: 0,
      failedPreloads: 0,
      averageLoadTime: 0,
      lastPreloadTime: 0
    })
  };
}; 