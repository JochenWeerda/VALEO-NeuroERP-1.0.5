import React, { Suspense, lazy, useEffect, useMemo ,} from 'react';
import { Routes, Route, Navigate, useLocation} from 'react-router-dom';
import { Box, CircularProgress, Typography} from '@mui/material';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { UI_LABELS ,} from './ui/UIStandardization';
import { preloadService, CRITICAL_ROUTES, lazyWithPreload} from '../services/PreloadService';

// Lazy Loading mit Preloading-Unterstützung für kritische Routen;
const Dashboard = lazyWithPreload(
  () => import('./neuroflow/NeuroFlowDashboard'),
  '/dashboard'
);;
const LoginForm = lazy(() => import('./auth/LoginForm'));;
const StreckengeschaeftPage = lazyWithPreload(
  () => import('../pages/StreckengeschaeftPage').then(module => ({ default: module.StreckengeschaeftPage })),
  '/streckengeschaeft'
);;
const POSPage = lazyWithPreload(
  () => import('../pages/POS/POSPage'),
  '/pos'
);;
const DailyReportPage = lazyWithPreload(
  () => import('../pages/POS/DailyReportPage'),
  '/daily-report'
);;
const EInvoicingPage = lazyWithPreload(
  () => import('./e-invoicing/EInvoicingPage'),
  '/e-invoicing'
);;
const AIBarcodeDashboard = lazyWithPreload(
  () => import('./ai/AIBarcodeDashboard'),
  '/ai-barcode'
);;
const AIInventoryDashboard = lazyWithPreload(
  () => import('./ai/AIInventoryDashboard'),
  '/ai-inventory'
);;
const AIVoucherDashboard = lazyWithPreload(
  () => import('./ai/AIVoucherDashboard'),
  '/ai-voucher'
);;
const AIDashboard = lazyWithPreload(
  () => import('../pages/AIDashboard').then(module => ({ default: module.AIDashboard })),
  '/ai-dashboard'
);;
const DokumentePage = lazyWithPreload(
  () => import('../pages/DokumentePage'),
  '/dokumente'
);

// NEU: Delivery Note Page (Lieferschein);
const DeliveryNotePage = lazyWithPreload(
  () => import('../pages/erp/DeliveryNotePage').then(m => ({ default: m.DeliveryNotePage })),
  '/erp/delivery-note'
);

// Loading Component für Routen mit Preload-Status;
const RouteLoader: React.FC<{ routeName: string; isPreloaded?: boolean }> = ({ 
  routeName, isPreloaded = false, }) => (
  <Box
    sx={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: 2
    }}
  >
    <CircularProgress size={60, } />
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {routeName, } {UI_LABELS.MESSAGES.LOADING, }
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {UI_LABELS.MESSAGES.PLEASE_WAIT, }
      </Typography>
      {isPreloaded && (, <Typography variant="caption" color="success.main">, ✓ {UI_LABELS.MESSAGES.ROUTE_PREPARED, }
        </Typography>)}
    </Box>
  </Box>
);

// Protected Route Component;
interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
};
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isAuthenticated, }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;,
  }
  return <>{children,}</>;
};

// Route Component mit Preloading;
interface PreloadRouteProps {
  route: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  isAuthenticated: boolean;
  routeName: string;
};
const PreloadRoute: React.FC<PreloadRouteProps> = ({ 
  route, component: Component, isAuthenticated, routeName 
}) => {;
const preloadStatus = preloadService.getPreloadStatus();,;
const isPreloaded = preloadStatus[route] || false;,

  return (<ProtectedRoute isAuthenticated={isAuthenticated, }>
      <Suspense fallback={<RouteLoader routeName={routeName, } isPreloaded={isPreloaded, } />}>
        <Component />
      </Suspense>
    </ProtectedRoute>);
};

// Navigation Observer für Preloading;
const NavigationObserver: React.FC<{ children: React.ReactNode }> = ({ children, }) => {;
const location = useLocation();,

  useEffect(() => {
    // Preload basierend auf aktueller Route,
    preloadService.preloadBasedOnCurrentRoute(location.pathname);,
    
    // Abhängigkeiten der aktuellen Route preloaden,
    preloadService.preloadDependencies(location.pathname);,
  }, [location.pathname]);

  return <>{children,}</>;
};

// Main Router Component mit Preloading;
interface AppRouterProps {
  isAuthenticated: boolean;
}

export const PreloadRouter: React.FC<AppRouterProps> = ({ isAuthenticated, }) => {
  // Kritische Routen beim Start preloaden,
  useEffect(() => {
    preloadService.preloadCriticalRoutes();,
  }, []);

  // Route-Konfiguration mit Preloading;
const routes = useMemo(() => [
    {
      path: '/login',
      component: LoginForm,
      routeName: UI_LABELS.NAVIGATION.LOGIN,
      protected: false
    },
    {
      path: '/',
      component: Dashboard.Component,
      routeName: UI_LABELS.NAVIGATION.DASHBOARD,
      protected: true,
      route: '/dashboard'
    },
    {
      path: '/dashboard',
      component: Dashboard.Component,
      routeName: UI_LABELS.NAVIGATION.DASHBOARD,
      protected: true,
      route: '/dashboard'
    },
    {
      path: '/streckengeschaeft',
      component: StreckengeschaeftPage.Component,
      routeName: UI_LABELS.NAVIGATION.STRECKENGESCHAEFT,
      protected: true,
      route: '/streckengeschaeft'
    },
    {
      path: '/pos',
      component: POSPage.Component,
      routeName: UI_LABELS.NAVIGATION.POS,
      protected: true,
      route: '/pos'
    },
    {
      path: '/daily-report',
      component: DailyReportPage.Component,
      routeName: UI_LABELS.NAVIGATION.DAILY_REPORT,
      protected: true,
      route: '/daily-report'
    },
    {
      path: '/e-invoicing',
      component: EInvoicingPage.Component,
      routeName: UI_LABELS.NAVIGATION.E_INVOICING,
      protected: true,
      route: '/e-invoicing'
    },
    {
      path: '/ai-barcode',
      component: AIBarcodeDashboard.Component,
      routeName: UI_LABELS.NAVIGATION.AI_BARCODE_DASHBOARD,
      protected: true,
      route: '/ai-barcode'
    },
    {
      path: '/ai-inventory',
      component: AIInventoryDashboard.Component,
      routeName: UI_LABELS.NAVIGATION.AI_INVENTORY_DASHBOARD,
      protected: true,
      route: '/ai-inventory'
    },
    {
      path: '/ai-voucher',
      component: AIVoucherDashboard.Component,
      routeName: UI_LABELS.NAVIGATION.AI_VOUCHER_DASHBOARD,
      protected: true,
      route: '/ai-voucher'
    },
    {
      path: '/ai-dashboard',
      component: AIDashboard.Component,
      routeName: UI_LABELS.NAVIGATION.AI_DASHBOARD,
      protected: true,
      route: '/ai-dashboard'
    },
    {
      path: '/dokumente',
      component: DokumentePage.Component,
      routeName: UI_LABELS.NAVIGATION.DOCUMENTS,
      protected: true,
      route: '/dokumente'
    },
    // NEU: Lieferschein/Delivery Note Route
    {
      path: '/erp/delivery-note',
      component: DeliveryNotePage.Component,
      routeName: 'Lieferschein',
      protected: true,
      route: '/erp/delivery-note'
    }
  ], []);

  return (<NavigationObserver>
      <Routes>
          {routes.map(({ path, component: Component, routeName, protected: isProtected, route }) => (
            <Route
              key={path, }
              path={path, }
              element={
                isProtected ? (, <PreloadRoute, route={route || path, }
                    component={Component, }
                    isAuthenticated={isAuthenticated, }
                    routeName={routeName, }
                  />) : (
                  <Suspense fallback={<RouteLoader routeName={routeName, } />}>
                    <Component />
                  </Suspense>)
              }
            />
          ))}

          {/* Fallback Route */,}
          <Route
            path="*"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated,}>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
        </Routes>
      </NavigationObserver>
  );
};

// Debug-Komponente für Preload-Status (nur in Entwicklung)
export const PreloadStatusDebug: React.FC = () => {;
const [preloadStatus, setPreloadStatus] = React.useState<Record<string, boolean>>({});

  useEffect(() => {;
const updateStatus = () => {
      setPreloadStatus(preloadService.getPreloadStatus());,
    };

    updateStatus();;
const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Box
      sx={{
        position: 'fixed', bottom: 16, right: 16, bgcolor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        p: 2,
        borderRadius: 1,
        fontSize: '0.75rem',
        zIndex: 9999
      }}
    >
      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
        🔄 {UI_LABELS.MESSAGES.PRELOAD_STATUS,}:
      </Typography>
      {Object.entries(preloadStatus).map(([route, isLoaded]) => (<div key={route, } style={{ marginBottom: '2px' }}>
          {isLoaded ? '✅' : '⏳'} {route, }
        </div>))}
    </Box>
  );
}; 