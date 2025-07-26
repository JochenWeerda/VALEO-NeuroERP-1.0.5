import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ApiProvider, useApi } from '../ApiContext';
import { apiService } from '../../services/ApiService';

// Mock für ApiService
jest.mock('../../services/ApiService', () => ({
  apiService: {
    isAuthenticated: jest.fn(),
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getTransactions: jest.fn(),
    createTransaction: jest.fn(),
    getSystemStatus: jest.fn(),
    getInventory: jest.fn(),
    createInventoryItem: jest.fn(),
    updateInventoryItem: jest.fn(),
    getDocuments: jest.fn(),
    uploadDocument: jest.fn(),
    getReports: jest.fn(),
    createReport: jest.fn(),
    getNotifications: jest.fn(),
    markNotificationRead: jest.fn(),
    middlewareHealthCheck: jest.fn(),
    getMiddlewareData: jest.fn(),
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Test-Komponente für API-Hooks
const TestComponent: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    transactions,
    inventory,
    documents,
    reports,
    notifications,
    systemStatus,
    login, 
    logout, 
    getTransactions, 
    createTransaction,
    getInventory,
    createInventoryItem,
    getDocuments,
    getReports,
    getNotifications,
    refreshSystemStatus,
    middlewareHealthCheck
  } = useApi();

  return (
    <div>
      <div data-testid="user">{user?.username || 'no-user'}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="transactions-count">{transactions.length}</div>
      <div data-testid="inventory-count">{inventory.length}</div>
      <div data-testid="documents-count">{documents.length}</div>
      <div data-testid="reports-count">{reports.length}</div>
      <div data-testid="notifications-count">{notifications.length}</div>
      <div data-testid="system-status">{systemStatus?.backend ? 'healthy' : 'no-status'}</div>
      
      <button onClick={() => login({ username: 'testuser', password: 'password' })}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => getTransactions()}>Get Transactions</button>
      <button onClick={() => createTransaction({ 
        type: 'income', 
        amount: 100, 
        date: new Date().toISOString(),
        user_id: 'user123',
        status: 'pending'
      })}>Create Transaction</button>
      <button onClick={() => getInventory()}>Get Inventory</button>
      <button onClick={() => createInventoryItem({
        name: 'Test Item',
        quantity: 10,
        unit_price: 25.99,
        category: 'electronics',
        sku: 'TEST-001',
        status: 'in_stock'
      })}>Create Inventory Item</button>
      <button onClick={() => getDocuments()}>Get Documents</button>
      <button onClick={() => getReports()}>Get Reports</button>
      <button onClick={() => getNotifications()}>Get Notifications</button>
      <button onClick={() => refreshSystemStatus()}>Refresh System Status</button>
      <button onClick={() => middlewareHealthCheck()}>Middleware Health Check</button>
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ApiProvider>
        {component}
      </ApiProvider>
    </BrowserRouter>
  );
};

describe('ApiContext', () => {
  beforeEach(() => {
    // Reset alle Mocks
    jest.clearAllMocks();
    
    // Standard-Mock-Implementierungen
    (apiService.isAuthenticated as jest.Mock).mockReturnValue(false);
    (apiService.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Not authenticated'));
    (apiService.getSystemStatus as jest.Mock).mockResolvedValue({
      success: true,
      data: { 
        backend: true, 
        middleware: true, 
        database: true, 
        cache: true, 
        timestamp: new Date().toISOString() 
      }
    });
    (apiService.login as jest.Mock).mockResolvedValue({
      success: true,
      data: { 
        user: { id: '1', username: 'testuser', email: 'test@example.com', disabled: false },
        token: 'mock-token'
      }
    });
    (apiService.logout as jest.Mock).mockResolvedValue({ success: true });
    (apiService.getTransactions as jest.Mock).mockResolvedValue({
      success: true,
      data: []
    });
    (apiService.createTransaction as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: '1', type: 'income', amount: 100, date: new Date().toISOString() }
    });
    (apiService.getInventory as jest.Mock).mockResolvedValue({
      success: true,
      data: []
    });
    (apiService.createInventoryItem as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: '1', name: 'Test Item', quantity: 10, unit_price: 25.99, sku: 'TEST-001', category: 'electronics', status: 'in_stock' }
    });
    (apiService.getDocuments as jest.Mock).mockResolvedValue({
      success: true,
      data: []
    });
    (apiService.getReports as jest.Mock).mockResolvedValue({
      success: true,
      data: []
    });
    (apiService.getNotifications as jest.Mock).mockResolvedValue({
      success: true,
      data: []
    });
    (apiService.middlewareHealthCheck as jest.Mock).mockResolvedValue({
      success: true,
      data: { status: 'healthy' }
    });
  });

  test('rendert initial mit Standardwerten', async () => {
    renderWithProviders(<TestComponent />);
    
    // Warte bis der initiale Loading-State vorbei ist
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('transactions-count')).toHaveTextContent('0');
    expect(screen.getByTestId('inventory-count')).toHaveTextContent('0');
    expect(screen.getByTestId('documents-count')).toHaveTextContent('0');
    expect(screen.getByTestId('reports-count')).toHaveTextContent('0');
    expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
    expect(screen.getByTestId('system-status')).toHaveTextContent('healthy');
  });

  test('zeigt alle UI-Elemente korrekt an', () => {
    renderWithProviders(<TestComponent />);
    
    // Prüfe alle erwarteten UI-Elemente
    expect(screen.getByTestId('user')).toBeInTheDocument();
    expect(screen.getByTestId('authenticated')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByTestId('transactions-count')).toBeInTheDocument();
    expect(screen.getByTestId('inventory-count')).toBeInTheDocument();
    expect(screen.getByTestId('documents-count')).toBeInTheDocument();
    expect(screen.getByTestId('reports-count')).toBeInTheDocument();
    expect(screen.getByTestId('notifications-count')).toBeInTheDocument();
    expect(screen.getByTestId('system-status')).toBeInTheDocument();
  });

  test('zeigt alle Buttons an', () => {
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('Get Transactions')).toBeInTheDocument();
    expect(screen.getByText('Create Transaction')).toBeInTheDocument();
    expect(screen.getByText('Get Inventory')).toBeInTheDocument();
    expect(screen.getByText('Create Inventory Item')).toBeInTheDocument();
    expect(screen.getByText('Get Documents')).toBeInTheDocument();
    expect(screen.getByText('Get Reports')).toBeInTheDocument();
    expect(screen.getByText('Get Notifications')).toBeInTheDocument();
    expect(screen.getByText('Refresh System Status')).toBeInTheDocument();
    expect(screen.getByText('Middleware Health Check')).toBeInTheDocument();
  });

  test('Login-Funktionalität funktioniert', async () => {
    renderWithProviders(<TestComponent />);
    
    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      fireEvent.click(loginButton);
    });
    
    // Prüfe, dass der API-Service aufgerufen wurde
    expect(apiService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password'
    });
  });

  test('Logout-Funktionalität funktioniert', async () => {
    renderWithProviders(<TestComponent />);
    
    const logoutButton = screen.getByText('Logout');
    
    await act(async () => {
      fireEvent.click(logoutButton);
    });
    
    // Prüfe, dass der API-Service aufgerufen wurde
    expect(apiService.logout).toHaveBeenCalled();
  });

  test('Get Transactions funktioniert', async () => {
    renderWithProviders(<TestComponent />);
    
    const getTransactionsButton = screen.getByText('Get Transactions');
    
    await act(async () => {
      fireEvent.click(getTransactionsButton);
    });
    
    // Prüfe, dass der API-Service aufgerufen wurde
    expect(apiService.getTransactions).toHaveBeenCalled();
  });

  test('Create Transaction funktioniert', async () => {
    renderWithProviders(<TestComponent />);
    
    const createTransactionButton = screen.getByText('Create Transaction');
    
    await act(async () => {
      fireEvent.click(createTransactionButton);
    });
    
    // Prüfe, dass der API-Service aufgerufen wurde
    expect(apiService.createTransaction).toHaveBeenCalledWith({
      type: 'income',
      amount: 100,
      date: expect.any(String),
      user_id: 'user123',
      status: 'pending'
    });
  });

  test('Get Inventory funktioniert', async () => {
    renderWithProviders(<TestComponent />);
    
    const getInventoryButton = screen.getByText('Get Inventory');
    
    await act(async () => {
      fireEvent.click(getInventoryButton);
    });
    
    // Prüfe, dass der API-Service aufgerufen wurde
    expect(apiService.getInventory).toHaveBeenCalled();
  });

  test('Create Inventory Item funktioniert', async () => {
    renderWithProviders(<TestComponent />);
    
    const createInventoryItemButton = screen.getByText('Create Inventory Item');
    
    await act(async () => {
      fireEvent.click(createInventoryItemButton);
    });
    
    // Prüfe, dass der API-Service aufgerufen wurde
    expect(apiService.createInventoryItem).toHaveBeenCalledWith({
      name: 'Test Item',
      quantity: 10,
      unit_price: 25.99,
      category: 'electronics',
      sku: 'TEST-001',
      status: 'in_stock'
    });
  });

  test('Get Documents funktioniert', async () => {
    renderWithProviders(<TestComponent />);
    
    const getDocumentsButton = screen.getByText('Get Documents');
    
    await act(async () => {
      fireEvent.click(getDocumentsButton);
    });
    
    // Prüfe, dass der API-Service aufgerufen wurde
    expect(apiService.getDocuments).toHaveBeenCalled();
  });

  test('Get Reports funktioniert', async () => {
    renderWithProviders(<TestComponent />);
    
    const getReportsButton = screen.getByText('Get Reports');
    
    await act(async () => {
      fireEvent.click(getReportsButton);
    });
    
    // Prüfe, dass der API-Service aufgerufen wurde
    expect(apiService.getReports).toHaveBeenCalled();
  });

  test('Get Notifications funktioniert', async () => {
    renderWithProviders(<TestComponent />);
    
    const getNotificationsButton = screen.getByText('Get Notifications');
    
    await act(async () => {
      fireEvent.click(getNotificationsButton);
    });
    
    // Prüfe, dass der API-Service aufgerufen wurde
    expect(apiService.getNotifications).toHaveBeenCalled();
  });

  test('Refresh System Status funktioniert', async () => {
    renderWithProviders(<TestComponent />);
    
    const refreshSystemStatusButton = screen.getByText('Refresh System Status');
    
    await act(async () => {
      fireEvent.click(refreshSystemStatusButton);
    });
    
    // Prüfe, dass der API-Service aufgerufen wurde
    expect(apiService.getSystemStatus).toHaveBeenCalled();
  });

  test('Middleware Health Check funktioniert', async () => {
    renderWithProviders(<TestComponent />);
    
    const middlewareHealthCheckButton = screen.getByText('Middleware Health Check');
    
    await act(async () => {
      fireEvent.click(middlewareHealthCheckButton);
    });
    
    // Prüfe, dass der API-Service aufgerufen wurde
    expect(apiService.middlewareHealthCheck).toHaveBeenCalled();
  });

  test('behandelt API-Fehler korrekt', async () => {
    // Mock API-Fehler
    (apiService.getSystemStatus as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    renderWithProviders(<TestComponent />);
    
    // Warte bis der initiale Loading-State vorbei ist
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    
    // Prüfe, dass ein Fehler angezeigt wird
    const errorElement = screen.getByTestId('error');
    expect(errorElement).toBeInTheDocument();
  });

  test('behandelt erfolgreiche Authentifizierung', async () => {
    // Mock erfolgreiche Authentifizierung
    (apiService.isAuthenticated as jest.Mock).mockReturnValue(true);
    (apiService.getCurrentUser as jest.Mock).mockResolvedValue({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      disabled: false
    });
    
    renderWithProviders(<TestComponent />);
    
    // Warte bis der initiale Loading-State vorbei ist
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    
    // Prüfe, dass der Benutzer korrekt gesetzt wurde
    expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  test('Context Provider wirft Fehler ohne Provider', () => {
    // Test ohne Provider sollte Fehler werfen
    const TestComponentWithoutProvider = () => {
      const api = useApi();
      return <div>{api.user?.username || 'no-user'}</div>;
    };

    // Erwarte, dass ein Fehler geworfen wird
    expect(() => {
      render(<TestComponentWithoutProvider />);
    }).toThrow('useApi must be used within an ApiProvider');
  });
}); 