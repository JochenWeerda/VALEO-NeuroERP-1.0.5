import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { PermissionWrapper } from '../components/permissions/PermissionWrapper';

// Lazy Loading für bessere Performance
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const CustomerList = React.lazy(() => import('../pages/customers/CustomerList'));
const CustomerForm = React.lazy(() => import('../pages/customers/CustomerForm'));
const ArticleList = React.lazy(() => import('../pages/articles/ArticleList'));
const ArticleForm = React.lazy(() => import('../pages/articles/ArticleForm'));
const InvoiceList = React.lazy(() => import('../pages/invoices/InvoiceList'));
const InvoiceForm = React.lazy(() => import('../pages/invoices/InvoiceForm'));
const SystemMonitoring = React.lazy(() => import('../pages/settings/SystemMonitoring'));
const BulkImportExport = React.lazy(() => import('../components/import-export/BulkImportExport'));
const MobileWarehouseApp = React.lazy(() => import('../components/warehouse/MobileWarehouseApp'));
const StockOpnameInterface = React.lazy(() => import('../components/inventory/StockOpnameInterface'));

// Layout Components
import { MainLayout } from '../layouts/MainLayout';
import { MobileLayout } from '../layouts/MobileLayout';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; permission?: string }> = ({ 
  children, 
  permission 
}) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (permission) {
    return (
      <PermissionWrapper permission={permission} showError={true}>
        {children}
      </PermissionWrapper>
    );
  }
  
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  // Mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  return (
    <React.Suspense fallback={<div>Lädt...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Mobile App Route */}
        {isMobile && (
          <Route path="/mobile/*" element={
            <ProtectedRoute>
              <MobileLayout>
                <MobileWarehouseApp />
              </MobileLayout>
            </ProtectedRoute>
          } />
        )}
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />
          
          {/* Customers */}
          <Route path="customers">
            <Route index element={
              <ProtectedRoute permission="customer.view">
                <CustomerList />
              </ProtectedRoute>
            } />
            <Route path="new" element={
              <ProtectedRoute permission="customer.create">
                <CustomerForm />
              </ProtectedRoute>
            } />
            <Route path=":id/edit" element={
              <ProtectedRoute permission="customer.update">
                <CustomerForm />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Articles */}
          <Route path="articles">
            <Route index element={
              <ProtectedRoute permission="article.view">
                <ArticleList />
              </ProtectedRoute>
            } />
            <Route path="new" element={
              <ProtectedRoute permission="article.create">
                <ArticleForm />
              </ProtectedRoute>
            } />
            <Route path=":id/edit" element={
              <ProtectedRoute permission="article.update">
                <ArticleForm />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Invoices */}
          <Route path="invoices">
            <Route index element={
              <ProtectedRoute permission="invoice.view">
                <InvoiceList />
              </ProtectedRoute>
            } />
            <Route path="new" element={
              <ProtectedRoute permission="invoice.create">
                <InvoiceForm />
              </ProtectedRoute>
            } />
            <Route path=":id/edit" element={
              <ProtectedRoute permission="invoice.update">
                <InvoiceForm />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Warehouse */}
          <Route path="warehouse">
            <Route path="inventory" element={
              <ProtectedRoute permission="stock.inventory">
                <StockOpnameInterface />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Data Management */}
          <Route path="data">
            <Route path="import-export" element={
              <ProtectedRoute permission="article.import">
                <BulkImportExport />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Settings */}
          <Route path="settings">
            <Route path="monitoring" element={
              <ProtectedRoute permission="monitoring.view">
                <SystemMonitoring />
              </ProtectedRoute>
            } />
          </Route>
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
};