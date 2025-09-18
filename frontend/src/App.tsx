import React, { useEffect } from 'react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PreloadRouter } from './components/PreloadRouter';
import { Navigation } from './components/Navigation';
import { PreloadIndicator } from './components/Navigation';
import { ErrorBoundary } from './components/ErrorBoundary';
import OfflineStatusBar from './components/OfflineStatusBar';
import { ChatSidebar } from './components/ChatSidebar';

// Query Client erstellen
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading Component
const LoadingSpinner: React.FC = () => (
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
      <div style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.5rem' }}>
        VALEO NeuroERP lädt...
      </div>
      <div style={{ fontSize: '0.9rem', color: '#666' }}>
        Bitte warten Sie einen Moment
      </div>
    </Box>
  </Box>
);

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

const AppContentInner: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkFirstRun = async () => {
      if (!isAuthenticated) return;
      try {
        const apiBase: string = (window as any).__VALEO_API_BASE__ || '';
        const res = await fetch(`${apiBase}/settings`);
        if (!res.ok) return;
        const json = await res.json();
        const s = json?.data || {};
        if (s.firstRunCompleted === false) {
          navigate('/first-run', { replace: true });
        }
      } catch {
        // ignore
      }
    };
    checkFirstRun();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div data-testid="app-shell">
      <Navigation />
      <PreloadRouter isAuthenticated={isAuthenticated} />
      <PreloadIndicator />
      <OfflineStatusBar />
      <ChatSidebar />
    </div>
  );
};

const AppContent: React.FC = () => {
  return (
    <AppContentInner />
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
