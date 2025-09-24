import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { initializeCriticalPreloading } from './utils/preloading';

// QueryClient für React Query konfigurieren
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 Minuten
    },
    mutations: {
      retry: 1,
    },
  },
})

// Globale API-Basis setzen (z.B. http://localhost:8000/api)
if (typeof window !== 'undefined') {
  (window as any).__VALEO_API_BASE__ = (import.meta as any).env?.VITE_API_BASE || (window as any).__VALEO_API_BASE__ || 'http://localhost:8000/api';
}

// Preloading für kritische Routen initialisieren
initializeCriticalPreloading();

// SPA-Fallback: Weiterleitung vom 404-Fallback zurück zur ursprünglichen Deep-Link-Route
if (typeof window !== 'undefined') {
  const pendingPath = sessionStorage.getItem('spa:fallback:path');
  if (pendingPath) {
    sessionStorage.removeItem('spa:fallback:path');
    try {
      const current = window.location.pathname + window.location.search + window.location.hash;
      if (current === '/' || current === '/index.html') {
        // Nur umleiten, wenn wir gerade auf der Root sind
        window.history.replaceState({}, '', pendingPath);
      }
    } catch (error) {
      // Ignore navigation errors during SPA fallback
      console.warn('SPA fallback navigation failed:', error);
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </Router>
    </QueryClientProvider>
  </React.StrictMode>,
)
