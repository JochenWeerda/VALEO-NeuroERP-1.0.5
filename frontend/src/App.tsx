import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import './App.css';

// Komponenten importieren
import { UserInterfaceComponent } from './components/UserInterfaceComponent';
import Layout from './components/Layout';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';
import Notification from './components/Notification';
import ChatPanel from './components/dashboard/ChatPanel';

// Seiten importieren
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import ReportsPage from './pages/ReportsPage';
import InventoryPage from './pages/InventoryPage';
import DocumentsPage from './pages/DocumentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import MobileUploadPage from './pages/mobile/MobileUploadPage';

// Kontext importieren
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Services importieren
import { checkAuthStatus } from './services/authService';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await checkAuthStatus();
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Fehler beim Überprüfen des Authentifizierungsstatus:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Lade VALEO-NeuroERP...</p>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="app">
              <ChatPanel isOpen={isChatOpen} onToggle={() => setIsChatOpen(o => !o)} />
              <Routes>
                <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
                
                <Route path="/" element={<Layout onChatToggle={() => setIsChatOpen(o => !o)} isChatOpen={isChatOpen} />}>
                  <Route index element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  } />
                  <Route path="/transactions" element={
                    <PrivateRoute>
                      <TransactionsPage />
                    </PrivateRoute>
                  } />
                  <Route path="/reports" element={
                    <PrivateRoute>
                      <ReportsPage />
                    </PrivateRoute>
                  } />
                  <Route path="/inventory" element={
                    <PrivateRoute>
                      <InventoryPage />
                    </PrivateRoute>
                  } />
                  <Route path="/documents" element={
                    <PrivateRoute>
                      <DocumentsPage />
                    </PrivateRoute>
                  } />
                  <Route path="/analytics" element={
                    <PrivateRoute>
                      <AnalyticsPage />
                    </PrivateRoute>
                  } />
                  <Route path="/settings" element={
                    <PrivateRoute>
                      <SettingsPage />
                    </PrivateRoute>
                  } />
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  } />
                  <Route path="/mobile-upload" element={<MobileUploadPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 