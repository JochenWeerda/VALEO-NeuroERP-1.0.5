import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { UI_LABELS } from './ui/UIStandardization';

// Lazy Loading für alle Seiten
const Dashboard = lazy(() => import('./neuroflow/NeuroFlowDashboard'));
const LoginForm = lazy(() => import('./auth/LoginForm'));
const StreckengeschaeftPage = lazy(() => import('../pages/StreckengeschaeftPage').then(module => ({ default: module.StreckengeschaeftPage })));
const POSPage = lazy(() => import('../pages/POS/POSPage'));
const DailyReportPage = lazy(() => import('../pages/POS/DailyReportPage'));
const EInvoicingPage = lazy(() => import('./e-invoicing/EInvoicingPage'));

// Loading Component für Routen
const RouteLoader: React.FC<{ routeName: string }> = ({ routeName }) => (
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
        {routeName} {UI_LABELS.MESSAGES.LOADING}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {UI_LABELS.MESSAGES.PLEASE_WAIT}
      </Typography>
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

// Main Router Component
interface AppRouterProps {
  isAuthenticated: boolean;
}

export const AppRouter: React.FC<AppRouterProps> = ({ isAuthenticated }) => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<RouteLoader routeName={UI_LABELS.NAVIGATION.LOGIN} />}>
              <LoginForm />
            </Suspense>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Suspense fallback={<RouteLoader routeName={UI_LABELS.NAVIGATION.DASHBOARD} />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Suspense fallback={<RouteLoader routeName={UI_LABELS.NAVIGATION.DASHBOARD} />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/streckengeschaeft"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Suspense fallback={<RouteLoader routeName={UI_LABELS.NAVIGATION.STRECKENGESCHAEFT} />}>
                <StreckengeschaeftPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pos"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Suspense fallback={<RouteLoader routeName={UI_LABELS.NAVIGATION.POS} />}>
                <POSPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/daily-report"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Suspense fallback={<RouteLoader routeName={UI_LABELS.NAVIGATION.DAILY_REPORT} />}>
                <DailyReportPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/e-invoicing"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Suspense fallback={<RouteLoader routeName={UI_LABELS.NAVIGATION.E_INVOICING} />}>
                <EInvoicingPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

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
    </Router>
  );
}; 