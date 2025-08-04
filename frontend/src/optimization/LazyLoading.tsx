import React, { lazy, Suspense, ComponentType, ReactNode } from 'react';
import { 
  Box, 
  CircularProgress, 
  LinearProgress,
  Typography,
  Skeleton
} from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';

// Fallback-Komponenten

export const PageLoadingFallback: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 2
    }}
  >
    <CircularProgress size={48} />
    <Typography variant="h6" color="text.secondary">
      Seite wird geladen...
    </Typography>
  </Box>
);

export const ComponentLoadingFallback: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <LinearProgress />
  </Box>
);

export const SkeletonFallback: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <Box sx={{ p: 3 }}>
    {Array.from({ length: rows }).map((_, index) => (
      <Skeleton key={index} height={60} sx={{ mb: 1 }} animation="wave" />
    ))}
  </Box>
);

// Error Fallback

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 2,
      p: 3
    }}
  >
    <Typography variant="h5" color="error">
      Etwas ist schiefgelaufen
    </Typography>
    <Typography variant="body1" color="text.secondary" align="center">
      {error.message}
    </Typography>
    <Box sx={{ mt: 2 }}>
      <button onClick={resetErrorBoundary}>
        Erneut versuchen
      </button>
    </Box>
  </Box>
);

// Lazy Loading Wrapper

interface LazyComponentProps {
  fallback?: ReactNode;
  errorFallback?: ComponentType<ErrorFallbackProps>;
}

export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.FC<T extends ComponentType<infer P> ? P & LazyComponentProps : never> {
  const LazyComponent = lazy(importFunc);

  return (props) => {
    const { fallback = <PageLoadingFallback />, errorFallback = ErrorFallback, ...componentProps } = props;

    return (
      <ErrorBoundary FallbackComponent={errorFallback}>
        <Suspense fallback={fallback}>
          <LazyComponent {...componentProps} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

// Preload-Funktionen

export const preloadComponent = (
  importFunc: () => Promise<any>
): void => {
  importFunc();
};

export const preloadComponents = (
  importFuncs: Array<() => Promise<any>>
): void => {
  importFuncs.forEach(preloadComponent);
};

// Route-basiertes Preloading

export const preloadRoute = (routeName: string): void => {
  switch (routeName) {
    case 'customers':
      preloadComponent(() => import('../pages/customers/CustomerList'));
      preloadComponent(() => import('../pages/customers/CustomerDetail'));
      break;
    
    case 'invoices':
      preloadComponent(() => import('../pages/invoices/InvoiceList'));
      preloadComponent(() => import('../pages/invoices/InvoiceCreate'));
      break;
    
    case 'articles':
      preloadComponent(() => import('../pages/articles/ArticleList'));
      preloadComponent(() => import('../pages/articles/ArticleDetail'));
      break;
    
    // Weitere Routes...
  }
};

// Intersection Observer für Lazy Loading von Bildern

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  width = '100%', 
  height = 'auto',
  className 
}) => {
  const [imageSrc, setImageSrc] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);
  const imageRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [src]);

  return (
    <div ref={imageRef} style={{ width, height }} className={className}>
      {isLoading && (
        <Skeleton 
          variant="rectangular" 
          width={width} 
          height={height} 
          animation="wave"
        />
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          onLoad={() => setIsLoading(false)}
          style={{ display: isLoading ? 'none' : 'block' }}
        />
      )}
    </div>
  );
};

// Virtualisierung für große Listen

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
}

export function VirtualList<T>({ 
  items, 
  itemHeight, 
  renderItem, 
  overscan = 5 
}: VirtualListProps<T>) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [containerHeight, setContainerHeight] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setScrollTop(containerRef.current.scrollTop);
      }
    };

    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);
      handleResize();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          top: i * itemHeight,
          height: itemHeight,
          width: '100%',
        }}
      >
        {renderItem(items[i], i)}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        height: '100%',
        overflow: 'auto',
      }}
    >
      <div style={{ height: items.length * itemHeight }}>
        {visibleItems}
      </div>
    </div>
  );
}

// Lazy-geladene Routen

export const LazyCustomerList = lazyLoad(() => import('../pages/customers/CustomerList'));
export const LazyCustomerDetail = lazyLoad(() => import('../pages/customers/CustomerDetail'));
export const LazyCustomerCreate = lazyLoad(() => import('../pages/customers/CustomerCreate'));

export const LazyArticleList = lazyLoad(() => import('../pages/articles/ArticleList'));
export const LazyArticleDetail = lazyLoad(() => import('../pages/articles/ArticleDetail'));
export const LazyArticleCreate = lazyLoad(() => import('../pages/articles/ArticleCreate'));

export const LazyInvoiceList = lazyLoad(() => import('../pages/invoices/InvoiceList'));
export const LazyInvoiceDetail = lazyLoad(() => import('../pages/invoices/InvoiceDetail'));
export const LazyInvoiceCreate = lazyLoad(() => import('../pages/invoices/InvoiceCreate'));

export const LazyOrderList = lazyLoad(() => import('../pages/orders/OrderList'));
export const LazyOrderDetail = lazyLoad(() => import('../pages/orders/OrderDetail'));
export const LazyOrderCreate = lazyLoad(() => import('../pages/orders/OrderCreate'));

export const LazyReports = lazyLoad(() => import('../pages/reports/Reports'));
export const LazySettings = lazyLoad(() => import('../pages/settings/Settings'));
export const LazySystemMonitoring = lazyLoad(() => import('../pages/settings/SystemMonitoring'));

// Bundle-Splitting für schwere Bibliotheken

export const loadChartLibrary = () => import(
  /* webpackChunkName: "charts" */
  'recharts'
);

export const loadPDFLibrary = () => import(
  /* webpackChunkName: "pdf" */
  '@react-pdf/renderer'
);

export const loadExcelLibrary = () => import(
  /* webpackChunkName: "excel" */
  'xlsx'
);

export const loadDateLibrary = () => import(
  /* webpackChunkName: "date" */
  'date-fns'
);