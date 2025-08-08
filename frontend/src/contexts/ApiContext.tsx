import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/ApiService';

// Typen definieren (da sie nicht aus ApiService exportiert werden)
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface SystemStatus {
  status: string;
  version: string;
  uptime: number;
  backend?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type?: 'income' | 'expense';
  user_id?: string;
  status?: 'pending' | 'completed' | 'cancelled';
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  sku?: string;
  unit_price?: number;
  location?: string;
  category?: string;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  created_at?: string;
  user_id?: string;
}

interface Report {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
}

// Context-Typen
interface ApiContextType {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<ApiResponse<LoginResponse>>;
  logout: () => Promise<ApiResponse>;
  getCurrentUser: () => Promise<User>;

  // System Status
  systemStatus: SystemStatus | null;
  isLoading: boolean;
  error: string | null;
  refreshSystemStatus: () => Promise<void>;

  // Business Data
  transactions: Transaction[];
  inventory: InventoryItem[];
  documents: Document[];
  reports: Report[];
  notifications: Notification[];

  // API Methods
  getTransactions: (params?: any) => Promise<ApiResponse<Transaction[]>>;
  createTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<ApiResponse<Transaction>>;
  getInventory: (params?: any) => Promise<ApiResponse<InventoryItem[]>>;
  createInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<ApiResponse<InventoryItem>>;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => Promise<ApiResponse<InventoryItem>>;
  getDocuments: (params?: any) => Promise<ApiResponse<Document[]>>;
  uploadDocument: (file: File, metadata: Partial<Document>) => Promise<ApiResponse<Document>>;
  getReports: (params?: any) => Promise<ApiResponse<Report[]>>;
  createReport: (report: Omit<Report, 'id' | 'created_at'>) => Promise<ApiResponse<Report>>;
  getNotifications: () => Promise<ApiResponse<Notification[]>>;
  markNotificationRead: (id: string) => Promise<ApiResponse>;

  // Middleware
  middlewareHealthCheck: () => Promise<ApiResponse>;
  getMiddlewareData: (endpoint: string, params?: any) => Promise<ApiResponse>;
}

// Context erstellen
const ApiContext = createContext<ApiContextType | undefined>(undefined);

// Provider Props
interface ApiProviderProps {
  children: ReactNode;
}

// Provider Komponente
export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Business Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initialisierung
  useEffect(() => {
    initializeApi();
  }, []);

  const initializeApi = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock-Implementierung für Authentifizierung
      const mockUser: User = {
        id: '1',
        name: 'demo_user',
        email: 'demo@valeo-neuroerp.com',
        role: 'admin'
      };
      setUser(mockUser);

      // Mock-Implementierung für System-Status
      const mockSystemStatus: SystemStatus = {
        status: 'online',
        version: '2.0.0',
        uptime: 3600
      };
      setSystemStatus(mockSystemStatus);

      // Mock-Implementierung für Benachrichtigungen
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'System-Update',
          message: 'Neue Version verfügbar',
          read: false
        }
      ];
      setNotifications(mockNotifications);

      // Mock-Implementierung für Transaktionen
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          amount: 1000,
          description: 'Test-Transaktion',
          date: new Date().toISOString()
        }
      ];
      setTransactions(mockTransactions);

      // Mock-Implementierung für Inventar
      const mockInventory: InventoryItem[] = [
        {
          id: '1',
          name: 'Test-Artikel',
          quantity: 10,
          price: 100
        }
      ];
      setInventory(mockInventory);

      // Mock-Implementierung für Dokumente
      const mockDocuments: Document[] = [
        {
          id: '1',
          name: 'Test-Dokument',
          type: 'pdf',
          size: 1024
        }
      ];
      setDocuments(mockDocuments);

      // Mock-Implementierung für Berichte
      const mockReports: Report[] = [
        {
          id: '1',
          title: 'Test-Bericht',
          content: 'Test-Inhalt',
          created_at: new Date().toISOString()
        }
      ];
      setReports(mockReports);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unbekannter Fehler');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSystemStatus = async () => {
    try {
      const mockSystemStatus: SystemStatus = {
        status: 'online',
        version: '2.0.0',
        uptime: 3600
      };
      setSystemStatus(mockSystemStatus);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Laden des System-Status');
    }
  };

  const login = async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    try {
      // Mock-Implementierung
      const mockUser: User = {
        id: '1',
        name: credentials.email,
        email: credentials.email,
        role: 'admin'
      };
      
      const mockResponse: ApiResponse<LoginResponse> = {
        success: true,
        data: {
          user: mockUser,
          token: 'mock-token'
        }
      };
      
      setUser(mockUser);
      return mockResponse;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login fehlgeschlagen'
      };
    }
  };

  const logout = async (): Promise<ApiResponse> => {
    try {
      setUser(null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout fehlgeschlagen'
      };
    }
  };

  const getCurrentUser = async (): Promise<User> => {
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }
    return user;
  };

  // Business Data Methods
  const getTransactions = async (params?: any): Promise<ApiResponse<Transaction[]>> => {
    try {
      // Mock-Implementierung
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          amount: 1000,
          description: 'Test-Transaktion',
          date: new Date().toISOString()
        }
      ];
      setTransactions(mockTransactions);
      return { success: true, data: mockTransactions };
    } catch (err) {
      return {
        success: false,
        error: 'Transaktionen konnten nicht abgerufen werden'
      };
    }
  };

  const createTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<ApiResponse<Transaction>> => {
    try {
      // Mock-Implementierung
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        ...transaction
      };
      setTransactions(prev => [...prev, newTransaction]);
      return { success: true, data: newTransaction };
    } catch (err) {
      return {
        success: false,
        error: 'Transaktion konnte nicht erstellt werden'
      };
    }
  };

  const getInventory = async (params?: any): Promise<ApiResponse<InventoryItem[]>> => {
    try {
      // Mock-Implementierung
      const mockInventory: InventoryItem[] = [
        {
          id: '1',
          name: 'Test-Artikel',
          quantity: 10,
          price: 100
        }
      ];
      setInventory(mockInventory);
      return { success: true, data: mockInventory };
    } catch (err) {
      return {
        success: false,
        error: 'Inventar konnte nicht abgerufen werden'
      };
    }
  };

  const createInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<ApiResponse<InventoryItem>> => {
    try {
      // Mock-Implementierung
      const newItem: InventoryItem = {
        id: `inv-${Date.now()}`,
        ...item
      };
      setInventory(prev => [...prev, newItem]);
      return { success: true, data: newItem };
    } catch (err) {
      return {
        success: false,
        error: 'Artikel konnte nicht erstellt werden'
      };
    }
  };

  const updateInventoryItem = async (id: string, item: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> => {
    try {
      // Mock-Implementierung
      const updatedItem: InventoryItem = {
        id,
        name: item.name || 'Unknown',
        quantity: item.quantity || 0,
        price: item.price || 0
      };
      setInventory(prev => prev.map(i => i.id === id ? updatedItem : i));
      return { success: true, data: updatedItem };
    } catch (err) {
      return {
        success: false,
        error: 'Artikel konnte nicht aktualisiert werden'
      };
    }
  };

  const getDocuments = async (params?: any): Promise<ApiResponse<Document[]>> => {
    try {
      // Mock-Implementierung
      const mockDocuments: Document[] = [
        {
          id: '1',
          name: 'Test-Dokument',
          type: 'pdf',
          size: 1024
        }
      ];
      setDocuments(mockDocuments);
      return { success: true, data: mockDocuments };
    } catch (err) {
      return {
        success: false,
        error: 'Dokumente konnten nicht abgerufen werden'
      };
    }
  };

  const uploadDocument = async (file: File, metadata: Partial<Document>): Promise<ApiResponse<Document>> => {
    try {
      // Mock-Implementierung
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        name: metadata.name || file.name,
        type: metadata.type || 'unknown',
        size: metadata.size || file.size
      };
      setDocuments(prev => [...prev, newDocument]);
      return { success: true, data: newDocument };
    } catch (err) {
      return {
        success: false,
        error: 'Dokument konnte nicht hochgeladen werden'
      };
    }
  };

  const getReports = async (params?: any): Promise<ApiResponse<Report[]>> => {
    try {
      // Mock-Implementierung
      const mockReports: Report[] = [
        {
          id: '1',
          title: 'Test-Bericht',
          content: 'Test-Inhalt',
          created_at: new Date().toISOString()
        }
      ];
      setReports(mockReports);
      return { success: true, data: mockReports };
    } catch (err) {
      return {
        success: false,
        error: 'Berichte konnten nicht abgerufen werden'
      };
    }
  };

  const createReport = async (report: Omit<Report, 'id' | 'created_at'>): Promise<ApiResponse<Report>> => {
    try {
      // Mock-Implementierung
      const newReport: Report = {
        id: `report-${Date.now()}`,
        ...report,
        created_at: new Date().toISOString()
      };
      setReports(prev => [...prev, newReport]);
      return { success: true, data: newReport };
    } catch (err) {
      return {
        success: false,
        error: 'Bericht konnte nicht erstellt werden'
      };
    }
  };

  const getNotifications = async (): Promise<ApiResponse<Notification[]>> => {
    try {
      // Mock-Implementierung
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'System-Update',
          message: 'Neue Version verfügbar',
          read: false
        }
      ];
      setNotifications(mockNotifications);
      return { success: true, data: mockNotifications };
    } catch (err) {
      return {
        success: false,
        error: 'Benachrichtigungen konnten nicht abgerufen werden'
      };
    }
  };

  const markNotificationRead = async (id: string): Promise<ApiResponse> => {
    try {
      // Mock-Implementierung
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: 'Benachrichtigung konnte nicht als gelesen markiert werden'
      };
    }
  };

  // Middleware Methods
  const middlewareHealthCheck = async (): Promise<ApiResponse> => {
    try {
      // Mock-Implementierung
      return { success: true, data: { status: 'healthy' } };
    } catch (err) {
      return {
        success: false,
        error: 'Middleware-Health-Check fehlgeschlagen'
      };
    }
  };

  const getMiddlewareData = async (endpoint: string, params?: any): Promise<ApiResponse> => {
    try {
      // Mock-Implementierung
      return { success: true, data: { endpoint, params } };
    } catch (err) {
      return {
        success: false,
        error: 'Middleware-Daten konnten nicht abgerufen werden'
      };
    }
  };

  // Context Value
  const contextValue: ApiContextType = {
    // Auth
    user,
    isAuthenticated: !!user,
    login,
    logout,
    getCurrentUser,

    // System Status
    systemStatus,
    isLoading,
    error,
    refreshSystemStatus,

    // Business Data
    transactions,
    inventory,
    documents,
    reports,
    notifications,

    // API Methods
    getTransactions,
    createTransaction,
    getInventory,
    createInventoryItem,
    updateInventoryItem,
    getDocuments,
    uploadDocument,
    getReports,
    createReport,
    getNotifications,
    markNotificationRead,

    // Middleware
    middlewareHealthCheck,
    getMiddlewareData
  };

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
};

// Hook für die Verwendung des Contexts
export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export default ApiContext; 