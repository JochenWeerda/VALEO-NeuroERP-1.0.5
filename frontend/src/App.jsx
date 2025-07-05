import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Komponenten importieren
import { UserInterfaceComponent } from './components/UserInterfaceComponent';
import Layout from './components/Layout';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Notification from './components/Notification';

// Seiten importieren (Platzhalter, müssen noch erstellt werden)
const LoginPage = () => <div>Login Seite</div>;
const DashboardPage = () => <div>Dashboard Seite</div>;
const TransactionsPage = () => <div>Transaktionen Seite</div>;
const ReportsPage = () => <div>Berichte Seite</div>;
const InventoryPage = () => <div>Inventar Seite</div>;
const DocumentsPage = () => <div>Dokumente Seite</div>;
const AnalyticsPage = () => <div>Analyse Seite</div>;
const SettingsPage = () => <div>Einstellungen Seite</div>;
const ProfilePage = () => <div>Profil Seite</div>;
const NotFoundPage = () => <div>404 - Seite nicht gefunden</div>;

// Privater Routen-Wrapper
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Authentifizierungs-Kontext
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: user !== null
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Benachrichtigungs-Kontext
const NotificationContext = React.createContext();

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    setNotifications([...notifications, notification]);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const value = {
    notifications,
    addNotification,
    markAsRead
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

// Service für Authentifizierungsstatus
const checkAuthStatus = () => {
  const token = localStorage.getItem('token');
  return Promise.resolve(token !== null);
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
              
              <Route path="/" element={<Layout />}>
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
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
