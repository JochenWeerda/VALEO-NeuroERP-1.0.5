import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { neuralTheme } from '../../themes/NeuroFlowTheme';
import { ApiProvider } from '../../contexts/ApiContext';
import App from '../../App';

/**
 * E2E User Flow Tests für VALEO NeuroERP Frontend
 *
 * ZIELSETZUNG:
 * - Testen vollständiger Benutzer-Workflows mit echten Server-Verbindungen
 * - Validierung der End-to-End Funktionalität vor produktivem Einsatz
 * - Sicherstellung der korrekten Authentifizierung und Datenübertragung
 *
 * KONTEXT:
 * Diese Tests sind Teil der IMPLEMENT-Phase und testen gegen echte laufende Server
 * für realistische E2E-Tests vor dem produktiven Einsatz.
 *
 * VORAUSSETZUNGEN:
 * - Backend-Server läuft auf http://localhost:8000
 * - Frontend-Server läuft auf http://localhost:3000
 * - Test-Datenbank ist verfügbar
 */

// Echte API-Funktionen für Server-Verbindungen
const makeApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = 'http://localhost:8000';
  const url = `${baseUrl}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch (error) {
    console.error(`API Request failed: ${url}`, error);
    throw error;
  }
};

const checkServerAvailability = async (): Promise<boolean> => {
  try {
    const response = await makeApiRequest('/health');
    return response.ok;
  } catch (error) {
    console.log('Backend-Server nicht erreichbar:', error);
    return false;
  }
};

// Mock für localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={neuralTheme}>
        <ApiProvider>
          {component}
        </ApiProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('End-to-End User Flows (Echte Server)', () => {
  let serverAvailable: boolean = false;
  
  beforeAll(async () => {
    serverAvailable = await checkServerAvailability();
    console.log(`Backend-Server verfügbar für E2E-Tests: ${serverAvailable}`);
  });

  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  describe('Vollständiger Login-Workflow', () => {
    test('Benutzer kann sich erfolgreich anmelden und durch die App navigieren', async () => {
      // ZIEL: Testen der echten Benutzer-Authentifizierung gegen laufende Server
      // KONTEXT: Dieser Test prüft den vollständigen Login-Workflow mit echten API-Calls

      if (!serverAvailable) {
        console.log('Test übersprungen - Backend-Server nicht verfügbar');
        console.log('Hinweis: Starte den Backend-Server mit "npm run dev" im backend-Verzeichnis');
        return; // Graceful Skip statt Failure
      }

      const user = userEvent.setup();

      renderWithProviders(<App />);

      // Login-Formular ausfüllen (mit echten Credentials)
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/passwort/i);
      const loginButton = screen.getByText(/anmelden/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      // Warte auf erfolgreiche Anmeldung (echte API-Response)
      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
      }, { timeout: 10000 }); // Längerer Timeout für echte API-Calls

      // Prüfe ob Token gespeichert wurde (echter Token)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', expect.any(String));

      // Navigiere zum Dashboard
      await waitFor(() => {
        expect(screen.getByText(/valeo neuroerp/i)).toBeInTheDocument();
      });
    });

    test('Benutzer wird bei ungültigen Anmeldedaten abgewiesen', async () => {
      // ZIEL: Testen der echten Authentifizierungs-Validierung
      // KONTEXT: Dieser Test prüft die Fehlerbehandlung bei ungültigen Credentials

      if (!serverAvailable) {
        console.log('Test übersprungen - Backend-Server nicht verfügbar');
        return;
      }

      const user = userEvent.setup();

      renderWithProviders(<App />);

      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/passwort/i);
      const loginButton = screen.getByText(/anmelden/i);

      await user.type(emailInput, 'invalid@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/anmeldung fehlgeschlagen/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    });
  });

  describe('Transaktions-Management-Workflow', () => {
    test('Benutzer kann vollständigen Transaktions-Workflow durchführen', async () => {
      // ZIEL: Testen des echten Transaktions-Management-Workflows
      // KONTEXT: Dieser Test prüft die vollständige Transaktions-Erstellung mit echten API-Calls

      if (!serverAvailable) {
        console.log('Test übersprungen - Backend-Server nicht verfügbar');
        return;
      }

      const user = userEvent.setup();

      renderWithProviders(<App />);

      // Login
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/passwort/i);
      const loginButton = screen.getByText(/anmelden/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
      }, { timeout: 10000 });

      // Navigiere zu Transaktionen
      const menuButton = screen.getByLabelText(/menü/i);
      await user.click(menuButton);

      const transactionsLink = screen.getByText(/transaktionen/i);
      await user.click(transactionsLink);

      await waitFor(() => {
        expect(screen.getByText(/transaktionsübersicht/i)).toBeInTheDocument();
      }, { timeout: 10000 });

      // Erstelle neue Transaktion (echte API-Call)
      const addButton = screen.getByText(/neue transaktion/i);
      await user.click(addButton);

      const amountInput = screen.getByLabelText(/betrag/i);
      const descriptionInput = screen.getByLabelText(/beschreibung/i);
      const saveButton = screen.getByText(/speichern/i);

      await user.type(amountInput, '2000');
      await user.type(descriptionInput, 'New Transaction');
      await user.click(saveButton);

      // Warte auf erfolgreiche Transaktions-Erstellung
      await waitFor(() => {
        expect(screen.getByText(/transaktion erfolgreich erstellt/i)).toBeInTheDocument();
      }, { timeout: 15000 });
    });
  });

  describe('Dashboard-Navigation-Workflow', () => {
    test('Benutzer kann durch verschiedene Dashboard-Bereiche navigieren', async () => {
      // ZIEL: Testen der echten Dashboard-Navigation
      // KONTEXT: Dieser Test prüft die Navigation zwischen verschiedenen Dashboard-Bereichen

      if (!serverAvailable) {
        console.log('Test übersprungen - Backend-Server nicht verfügbar');
        return;
      }

      const user = userEvent.setup();

      renderWithProviders(<App />);

      // Login
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/passwort/i);
      const loginButton = screen.getByText(/anmelden/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
      }, { timeout: 10000 });

      // Navigiere zu verschiedenen Dashboard-Bereichen
      const analyticsLink = screen.getByText(/analytics/i);
      await user.click(analyticsLink);

      await waitFor(() => {
        expect(screen.getByText(/analytics dashboard/i)).toBeInTheDocument();
      }, { timeout: 10000 });

      // Navigiere zurück zum Haupt-Dashboard
      const dashboardLink = screen.getByText(/dashboard/i);
      await user.click(dashboardLink);

      await waitFor(() => {
        expect(screen.getByText(/valeo neuroerp dashboard/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    });
  });

  describe('Error-Handling-Workflow', () => {
    test('App behandelt Server-Fehler korrekt', async () => {
      // ZIEL: Testen der echten Fehlerbehandlung bei Server-Problemen
      // KONTEXT: Dieser Test prüft die Robustheit der App bei API-Fehlern

      if (!serverAvailable) {
        console.log('Test übersprungen - Backend-Server nicht verfügbar');
        return;
      }

      const user = userEvent.setup();

      renderWithProviders(<App />);

      // Versuche Login mit ungültigen Credentials
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/passwort/i);
      const loginButton = screen.getByText(/anmelden/i);

      await user.type(emailInput, 'invalid@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);

      // Prüfe Fehlerbehandlung
      await waitFor(() => {
        expect(screen.getByText(/anmeldung fehlgeschlagen/i)).toBeInTheDocument();
      }, { timeout: 10000 });

      // Prüfe ob Fehlermeldung korrekt angezeigt wird
      expect(screen.getByText(/bitte überprüfen sie ihre eingaben/i)).toBeInTheDocument();
    });
  });
}); 