import React, { Suspense, lazy, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { preloadService, CRITICAL_ROUTES, lazyWithPreload } from '../services/PreloadService';

// Lazy Loading mit Preloading-Unterstützung für kritische Routen
const Dashboard = lazyWithPreload(
  () => import('./neuroflow/NeuroFlowDashboard'),
  '/dashboard'
);

const LoginForm = lazy(() => import('./auth/LoginForm'));

const StreckengeschaeftPage = lazyWithPreload(
  () => import('../pages/StreckengeschaeftPage').then(module => ({ default: module.StreckengeschaeftPage })),
  '/streckengeschaeft'
);

const POSPage = lazyWithPreload(
  () => import('../pages/POS/POSPage'),
  '/pos'
);

const DailyReportPage = lazyWithPreload(
  () => import('../pages/POS/DailyReportPage'),
  '/daily-report'
);

const EInvoicingPage = lazyWithPreload(
  () => import('./e-invoicing/EInvoicingPage'),
  '/e-invoicing'
);

const AIBarcodeDashboard = lazyWithPreload(
  () => import('./ai/AIBarcodeDashboard'),
  '/ai-barcode'
);

const AIInventoryDashboard = lazyWithPreload(
  () => import('./ai/AIInventoryDashboard'),
  '/ai-inventory'
);

const AIVoucherDashboard = lazyWithPreload(
  () => import('./ai/AIVoucherDashboard'),
  '/ai-voucher'
);

const AIDashboard = lazyWithPreload(
  () => import('../pages/AIDashboard').then(module => ({ default: module.AIDashboard })),
  '/ai-dashboard'
);

// Loading Component für Routen mit Preload-Status
const RouteLoader: React.FC<{ routeName: string; isPreloaded?: boolean }> = ({ 
  routeName, 
  isPreloaded = false 
}) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      gap: 2
    }}
  >
    <CircularProgress size={60} />
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {routeName} wird geladen...
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Bitte warten Sie einen Moment
      </Typography>
      {isPreloaded && (
        <Typography variant="caption" color="success.main">
          ✓ Route wurde bereits vorbereitet
        </Typography>
      )}
    </Box>
  </Box>
);

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Route Component mit Preloading
interface PreloadRouteProps {
  route: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  isAuthenticated: boolean;
  routeName: string;
}

const PreloadRoute: React.FC<PreloadRouteProps> = ({ 
  route, 
  component: Component, 
  isAuthenticated, 
  routeName 
}) => {
  const preloadStatus = preloadService.getPreloadStatus();
  const isPreloaded = preloadStatus[route] || false;

  return (
    <ProtectedRoute isAuthenticated={isAuthenticated}>
      <Suspense fallback={<RouteLoader routeName={routeName} isPreloaded={isPreloaded} />}>
        <Component />
      </Suspense>
    </ProtectedRoute>
  );
};

// Navigation Observer für Preloading
const NavigationObserver: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Preload basierend auf aktueller Route
    preloadService.preloadBasedOnCurrentRoute(location.pathname);
    
    // Abhängigkeiten der aktuellen Route preloaden
    preloadService.preloadDependencies(location.pathname);
  }, [location.pathname]);

  return <>{children}</>;
};

// Main Router Component mit Preloading
interface AppRouterProps {
  isAuthenticated: boolean;
}

export const PreloadRouter: React.FC<AppRouterProps> = ({ isAuthenticated }) => {
  // Kritische Routen beim Start preloaden
  useEffect(() => {
    preloadService.preloadCriticalRoutes();
  }, []);

  // Route-Konfiguration mit Preloading
  const routes = useMemo(() => [
    {
      path: '/login',
      component: LoginForm,
      routeName: 'Login',
      protected: false
    },
    {
      path: '/',
      component: Dashboard.Component,
      routeName: 'Dashboard',
      protected: true,
      route: '/dashboard'
    },
    {
      path: '/dashboard',
      component: Dashboard.Component,
      routeName: 'Dashboard',
      protected: true,
      route: '/dashboard'
    },
    {
      path: '/streckengeschaeft',
      component: StreckengeschaeftPage.Component,
      routeName: 'Streckengeschäft',
      protected: true,
      route: '/streckengeschaeft'
    },
    {
      path: '/pos',
      component: POSPage.Component,
      routeName: 'POS-System',
      protected: true,
      route: '/pos'
    },
    {
      path: '/daily-report',
      component: DailyReportPage.Component,
      routeName: 'Tagesbericht',
      protected: true,
      route: '/daily-report'
    },
    {
      path: '/e-invoicing',
      component: EInvoicingPage.Component,
      routeName: 'E-Invoicing',
      protected: true,
      route: '/e-invoicing'
    },
    {
      path: '/ai-barcode',
      component: AIBarcodeDashboard.Component,
      routeName: 'AI Barcode Dashboard',
      protected: true,
      route: '/ai-barcode'
    },
    {
      path: '/ai-inventory',
      component: AIInventoryDashboard.Component,
      routeName: 'AI Inventory Dashboard',
      protected: true,
      route: '/ai-inventory'
    },
    {
      path: '/ai-voucher',
      component: AIVoucherDashboard.Component,
      routeName: 'AI Voucher Dashboard',
      protected: true,
      route: '/ai-voucher'
    },
    {
      path: '/ai-dashboard',
      component: AIDashboard.Component,
      routeName: 'AI Dashboard',
      protected: true,
      route: '/ai-dashboard'
    }
  ], []);

  return (
    <Router>
      <NavigationObserver>
        <Routes>
          {routes.map(({ path, component: Component, routeName, protected: isProtected, route }) => (
            <Route
              key={path}
              path={path}
              element={
                isProtected ? (
                  <PreloadRoute
                    route={route || path}
                    component={Component}
                    isAuthenticated={isAuthenticated}
                    routeName={routeName}
                  />
                ) : (
                  <Suspense fallback={<RouteLoader routeName={routeName} />}>
                    <Component />
                  </Suspense>
                )
              }
            />
          ))}

          {/* Fallback Route */}
          <Route
            path="*"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
        </Routes>
      </NavigationObserver>
    </Router>
  );
};

// Debug-Komponente für Preload-Status (nur in Entwicklung)
export const PreloadStatusDebug: React.FC = () => {
  const [preloadStatus, setPreloadStatus] = React.useState<Record<string, boolean>>({});

  useEffect(() => {
    const updateStatus = () => {
      setPreloadStatus(preloadService.getPreloadStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        bgcolor: 'rgba(0,0,0,0.8)',
        color: 'white',
        p: 2,
        borderRadius: 1,
        fontSize: '0.75rem',
        zIndex: 9999
      }}
    >
      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
        🔄 Preload Status:
      </Typography>
      {Object.entries(preloadStatus).map(([route, isLoaded]) => (
        <div key={route} style={{ marginBottom: '2px' }}>
          {isLoaded ? '✅' : '⏳'} {route}
        </div>
      ))}
    </Box>
  );
}; 