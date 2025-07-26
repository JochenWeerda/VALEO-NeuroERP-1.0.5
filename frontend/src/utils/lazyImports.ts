import React from 'react';

// Date-fns lazy imports
export const dateFns = {
  format: () => import('date-fns/format'),
  parseISO: () => import('date-fns/parseISO'),
  addDays: () => import('date-fns/addDays'),
  subDays: () => import('date-fns/subDays'),
  startOfDay: () => import('date-fns/startOfDay'),
  endOfDay: () => import('date-fns/endOfDay'),
  isToday: () => import('date-fns/isToday'),
  isYesterday: () => import('date-fns/isYesterday'),
  differenceInDays: () => import('date-fns/differenceInDays'),
  differenceInHours: () => import('date-fns/differenceInHours'),
  formatDistance: () => import('date-fns/formatDistance'),
  formatRelative: () => import('date-fns/formatRelative')
};

// Quagga lazy imports
export const quagga = {
  init: () => import('quagga'),
  start: () => import('quagga'),
  stop: () => import('quagga'),
  decodeSingle: () => import('quagga')
};

// Generic lazy loading function
export function lazyWithPreload<T extends React.ComponentType<any>>(importFn: () => Promise<T>) {
  return React.lazy(async () => {
    const module = await importFn();
    return { default: module };
  });
}

// Preload function
export function usePreload<T>(importFn: () => Promise<T>) {
  const [module, setModule] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    importFn()
      .then(setModule)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [importFn]);

  return { module, loading, error };
}

// Analytics tracking
export function trackLazyLoad(componentName: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'lazy_load', {
      component_name: componentName,
      timestamp: new Date().toISOString()
    });
  }
} 