import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ApiProvider } from './contexts/ApiContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PersonalManagement from './pages/PersonalManagement';
import FinanceManagement from './pages/FinanceManagement';
import AssetManagement from './pages/AssetManagement';
import ProductionManagement from './pages/ProductionManagement';
import WarehouseManagement from './pages/WarehouseManagement';
import PurchasingManagement from './pages/PurchasingManagement';
import SalesManagement from './pages/SalesManagement';
import QualityManagement from './pages/QualityManagement';
import CustomerManagement from './pages/CustomerManagement';
import ProjectManagement from './pages/ProjectManagement';
import DocumentManagement from './pages/DocumentManagement';
import ReportingAnalytics from './pages/ReportingAnalytics';

// Theme erstellen
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ApiProvider>
        <Router>
          <Routes>
            {/* Landing Page als Startseite */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Dashboard und ERP Module mit Layout */}
            <Route path="/dashboard" element={
              <Layout>
                <Dashboard />
              </Layout>
            } />
            <Route path="/personal" element={
              <Layout>
                <PersonalManagement />
              </Layout>
            } />
            <Route path="/finance" element={
              <Layout>
                <FinanceManagement />
              </Layout>
            } />
            <Route path="/assets" element={
              <Layout>
                <AssetManagement />
              </Layout>
            } />
            <Route path="/production" element={
              <Layout>
                <ProductionManagement />
              </Layout>
            } />
            <Route path="/warehouse" element={
              <Layout>
                <WarehouseManagement />
              </Layout>
            } />
            <Route path="/purchasing" element={
              <Layout>
                <PurchasingManagement />
              </Layout>
            } />
            <Route path="/sales" element={
              <Layout>
                <SalesManagement />
              </Layout>
            } />
            <Route path="/quality" element={
              <Layout>
                <QualityManagement />
              </Layout>
            } />
            <Route path="/customers" element={
              <Layout>
                <CustomerManagement />
              </Layout>
            } />
            <Route path="/projects" element={
              <Layout>
                <ProjectManagement />
              </Layout>
            } />
            <Route path="/documents" element={
              <Layout>
                <DocumentManagement />
              </Layout>
            } />
            <Route path="/reporting" element={
              <Layout>
                <ReportingAnalytics />
              </Layout>
            } />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ApiProvider>
    </ThemeProvider>
  );
}

export default App;
