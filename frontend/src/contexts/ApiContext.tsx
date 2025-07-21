import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  apiService, 
  type ApiResponse, 
  type SystemStatus, 
  type User, 
  type LoginRequest, 
  type LoginResponse,
  type Transaction,
  type InventoryItem,
  type Document,
  type Report,
  type Notification
} from '../services/ApiService';

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
      // Prüfe Authentifizierung
      if (apiService.isAuthenticated()) {
        const currentUser = await apiService.getCurrentUser();
        setUser(currentUser);
      }

      // Lade System-Status
      await refreshSystemStatus();

      // Lade Mock-Benachrichtigungen
      const notificationsResponse = await apiService.getNotifications();
      if (notificationsResponse.success && notificationsResponse.data) {
        setNotifications(notificationsResponse.data);
      }

      // Lade Mock-Transaktionen
      const transactionsResponse = await apiService.getTransactions();
      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data);
      }

      // Lade Mock-Inventar
      const inventoryResponse = await apiService.getInventory();
      if (inventoryResponse.success && inventoryResponse.data) {
        setInventory(inventoryResponse.data);
      }

      // Lade Mock-Dokumente
      const documentsResponse = await apiService.getDocuments();
      if (documentsResponse.success && documentsResponse.data) {
        setDocuments(documentsResponse.data);
      }

      // Lade Mock-Berichte
      const reportsResponse = await apiService.getReports();
      if (reportsResponse.success && reportsResponse.data) {
        setReports(reportsResponse.data);
      }
    } catch (err) {
      console.error('API Initialization Error:', err);
      // Kein Fehler setzen für Demo-Zwecke
    } finally {
      setIsLoading(false);
    }
  };

  // System Status aktualisieren
  const refreshSystemStatus = async () => {
    try {
      const response = await apiService.getSystemStatus();
      if (response.success && response.data) {
        setSystemStatus(response.data);
      } else {
        console.warn('System-Status konnte nicht abgerufen werden:', response.error);
      }
    } catch (err) {
      console.error('System Status Error:', err);
      // Kein Fehler setzen für Demo-Zwecke
    }
  };

  // Auth-Methoden
  const login = async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.login(credentials);
      if (response.success && response.data) {
        // Füge die fehlende disabled-Property hinzu
        const userWithDisabled = {
          ...response.data.user,
          disabled: false
        };
        setUser(userWithDisabled);
        await refreshSystemStatus();
      } else {
        console.warn('Login fehlgeschlagen:', response.error);
      }
      return response;
    } catch (err) {
      console.error('Login Error:', err);
      const errorResponse = {
        success: false,
        error: 'Login fehlgeschlagen',
        timestamp: new Date().toISOString()
      };
      return errorResponse;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<ApiResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.logout();
      setUser(null);
      setSystemStatus(null);
      setTransactions([]);
      setInventory([]);
      setDocuments([]);
      setReports([]);
      setNotifications([]);
      return response;
    } catch (err) {
      console.error('Logout Error:', err);
      const errorResponse = {
        success: false,
        error: 'Logout fehlgeschlagen',
        timestamp: new Date().toISOString()
      };
      return errorResponse;
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUser = async (): Promise<User> => {
    try {
      const user = await apiService.getCurrentUser();
      setUser(user);
      return user;
    } catch (err) {
      console.error('Get Current User Error:', err);
      // Mock-User für Demo-Zwecke
      const mockUser: User = {
        id: '1',
        username: 'demo_user',
        email: 'demo@valeo-neuroerp.com',
        full_name: 'Max Mustermann',
        role: 'admin',
        disabled: false
      };
      setUser(mockUser);
      return mockUser;
    }
  };

  // Business Data Methods
  const getTransactions = async (params?: any): Promise<ApiResponse<Transaction[]>> => {
    try {
      const response = await apiService.getTransactions(params);
      if (response.success && response.data) {
        setTransactions(response.data);
      }
      return response;
    } catch (err) {
      console.error('Get Transactions Error:', err);
      return {
        success: false,
        error: 'Transaktionen konnten nicht abgerufen werden',
        timestamp: new Date().toISOString()
      };
    }
  };

  const createTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<ApiResponse<Transaction>> => {
    try {
      const response = await apiService.createTransaction(transaction);
      if (response.success && response.data) {
        setTransactions(prev => [...prev, response.data!]);
      }
      return response;
    } catch (err) {
      console.error('Create Transaction Error:', err);
      return {
        success: false,
        error: 'Transaktion konnte nicht erstellt werden',
        timestamp: new Date().toISOString()
      };
    }
  };

  const getInventory = async (params?: any): Promise<ApiResponse<InventoryItem[]>> => {
    try {
      const response = await apiService.getInventory(params);
      if (response.success && response.data) {
        setInventory(response.data);
      }
      return response;
    } catch (err) {
      console.error('Get Inventory Error:', err);
      return {
        success: false,
        error: 'Inventar konnte nicht abgerufen werden',
        timestamp: new Date().toISOString()
      };
    }
  };

  const createInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<ApiResponse<InventoryItem>> => {
    try {
      const response = await apiService.createInventoryItem(item);
      if (response.success && response.data) {
        setInventory(prev => [...prev, response.data!]);
      }
      return response;
    } catch (err) {
      console.error('Create Inventory Item Error:', err);
      return {
        success: false,
        error: 'Inventar-Item konnte nicht erstellt werden',
        timestamp: new Date().toISOString()
      };
    }
  };

  const updateInventoryItem = async (id: string, item: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> => {
    try {
      const response = await apiService.updateInventoryItem(id, item);
      if (response.success && response.data) {
        setInventory(prev => prev.map(inv => inv.id === id ? response.data! : inv));
      }
      return response;
    } catch (err) {
      console.error('Update Inventory Item Error:', err);
      return {
        success: false,
        error: 'Inventar-Item konnte nicht aktualisiert werden',
        timestamp: new Date().toISOString()
      };
    }
  };

  const getDocuments = async (params?: any): Promise<ApiResponse<Document[]>> => {
    try {
      const response = await apiService.getDocuments(params);
      if (response.success && response.data) {
        setDocuments(response.data);
      }
      return response;
    } catch (err) {
      console.error('Get Documents Error:', err);
      return {
        success: false,
        error: 'Dokumente konnten nicht abgerufen werden',
        timestamp: new Date().toISOString()
      };
    }
  };

  const uploadDocument = async (file: File, metadata: Partial<Document>): Promise<ApiResponse<Document>> => {
    try {
      const response = await apiService.uploadDocument(file, metadata);
      if (response.success && response.data) {
        setDocuments(prev => [...prev, response.data!]);
      }
      return response;
    } catch (err) {
      console.error('Upload Document Error:', err);
      return {
        success: false,
        error: 'Dokument konnte nicht hochgeladen werden',
        timestamp: new Date().toISOString()
      };
    }
  };

  const getReports = async (params?: any): Promise<ApiResponse<Report[]>> => {
    try {
      const response = await apiService.getReports(params);
      if (response.success && response.data) {
        setReports(response.data);
      }
      return response;
    } catch (err) {
      console.error('Get Reports Error:', err);
      return {
        success: false,
        error: 'Berichte konnten nicht abgerufen werden',
        timestamp: new Date().toISOString()
      };
    }
  };

  const createReport = async (report: Omit<Report, 'id' | 'created_at'>): Promise<ApiResponse<Report>> => {
    try {
      const response = await apiService.createReport(report);
      if (response.success && response.data) {
        setReports(prev => [...prev, response.data!]);
      }
      return response;
    } catch (err) {
      console.error('Create Report Error:', err);
      return {
        success: false,
        error: 'Bericht konnte nicht erstellt werden',
        timestamp: new Date().toISOString()
      };
    }
  };

  const getNotifications = async (): Promise<ApiResponse<Notification[]>> => {
    try {
      const response = await apiService.getNotifications();
      if (response.success && response.data) {
        setNotifications(response.data);
      }
      return response;
    } catch (err) {
      console.error('Get Notifications Error:', err);
      return {
        success: false,
        error: 'Benachrichtigungen konnten nicht abgerufen werden',
        timestamp: new Date().toISOString()
      };
    }
  };

  const markNotificationRead = async (id: string): Promise<ApiResponse> => {
    try {
      const response = await apiService.markNotificationRead(id);
      if (response.success) {
        setNotifications(prev => prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        ));
      }
      return response;
    } catch (err) {
      console.error('Mark Notification Read Error:', err);
      return {
        success: false,
        error: 'Benachrichtigung konnte nicht als gelesen markiert werden',
        timestamp: new Date().toISOString()
      };
    }
  };

  // Middleware Methods
  const middlewareHealthCheck = async (): Promise<ApiResponse> => {
    try {
      return await apiService.middlewareHealthCheck();
    } catch (err) {
      console.error('Middleware Health Check Error:', err);
      return {
        success: false,
        error: 'Middleware Health Check fehlgeschlagen',
        timestamp: new Date().toISOString()
      };
    }
  };

  const getMiddlewareData = async (endpoint: string, params?: any): Promise<ApiResponse> => {
    try {
      return await apiService.getMiddlewareData(endpoint, params);
    } catch (err) {
      console.error('Get Middleware Data Error:', err);
      return {
        success: false,
        error: 'Middleware-Daten konnten nicht abgerufen werden',
        timestamp: new Date().toISOString()
      };
    }
  };

  // Context Value
  const contextValue: ApiContextType = {
    // Auth
    user,
    isAuthenticated: true, // Für Demo-Zwecke immer authentifiziert
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
    getMiddlewareData,
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