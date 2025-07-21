import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';

// API-Konfiguration
const API_CONFIG = {
  BACKEND_BASE_URL: 'http://localhost:8000',
  MIDDLEWARE_BASE_URL: 'http://localhost:8001',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Response-Typen
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Auth-Typen
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    role: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  disabled: boolean;
}

// Business-Typen
export interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  description?: string;
  user_id: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  location?: string;
  category: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface Document {
  id: string;
  name: string;
  type: string;
  content: string;
  created_at: string;
  user_id: string;
  size: number;
  mime_type: string;
}

export interface Report {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
  created_at: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  recipient_id: string;
  read: boolean;
  created_at: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

// System-Status-Typen
export interface SystemStatus {
  backend: boolean;
  middleware: boolean;
  database: boolean;
  cache: boolean;
  timestamp: string;
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    [key: string]: {
      status: 'up' | 'down';
      response_time: number;
      last_check: string;
    };
  };
  timestamp: string;
}

// API-Service Klasse
class ApiService {
  private backendApi: AxiosInstance;
  private middlewareApi: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    // Backend API-Client
    this.backendApi = axios.create({
      baseURL: API_CONFIG.BACKEND_BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Middleware API-Client
    this.middlewareApi = axios.create({
      baseURL: API_CONFIG.MIDDLEWARE_BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request Interceptors
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Backend Request Interceptor
    this.backendApi.interceptors.request.use(
      (config: any) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Middleware Request Interceptor
    this.middlewareApi.interceptors.request.use(
      (config: any) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response Interceptors
    this.backendApi.interceptors.response.use(
      (response: any) => response,
      this.handleResponseError.bind(this)
    );

    this.middlewareApi.interceptors.response.use(
      (response: any) => response,
      this.handleResponseError.bind(this)
    );
  }

  private handleResponseError(error: AxiosError): Promise<never> {
    if (error.response?.status === 401) {
      // Token abgelaufen oder ungültig
      this.clearAuthToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }

  // Auth-Methoden
  public setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('authToken', token);
  }

  public getAuthToken(): string | null {
    if (!this.authToken) {
      this.authToken = localStorage.getItem('authToken');
    }
    return this.authToken;
  }

  public clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('authToken');
  }

  public isAuthenticated(): boolean {
    // Für Demo-Zwecke immer als authentifiziert betrachten
    return true;
  }

  // Auth-API
  public async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    // Mock-Login für Demo-Zwecke
    const mockUser = await this.getCurrentUser();
    const mockLoginResponse: LoginResponse = {
      access_token: 'mock_token_123',
      token_type: 'bearer',
      user: mockUser,
    };

    this.setAuthToken('mock_token_123');

    return {
      success: true,
      data: mockLoginResponse,
    };
  }

  public async logout(): Promise<ApiResponse> {
    // Mock-Logout für Demo-Zwecke
    this.clearAuthToken();
    return { success: true, message: 'Erfolgreich abgemeldet' };
  }

  public async getCurrentUser(): Promise<User> {
    // Mock-Daten für Demo-Zwecke
    return {
      id: '1',
      username: 'demo_user',
      email: 'demo@valeo-neuroerp.com',
      full_name: 'Max Mustermann',
      role: 'admin',
      disabled: false
    };
  }

  // System-Status-API
  public async getSystemStatus(): Promise<ApiResponse<SystemStatus>> {
    // Mock-Daten für Demo-Zwecke
    const mockSystemStatus: SystemStatus = {
      backend: true,
      middleware: true,
      database: true,
      cache: true,
      timestamp: new Date().toISOString()
    };

    return {
      success: true,
      data: mockSystemStatus
    };
  }

  public async healthCheck(): Promise<ApiResponse<HealthCheck>> {
    // Mock-Daten für Demo-Zwecke
    const mockHealthCheck: HealthCheck = {
      status: 'healthy',
      services: {
        backend: { status: 'up', response_time: 50, last_check: new Date().toISOString() },
        middleware: { status: 'up', response_time: 30, last_check: new Date().toISOString() },
        database: { status: 'up', response_time: 20, last_check: new Date().toISOString() }
      },
      timestamp: new Date().toISOString()
    };

    return {
      success: true,
      data: mockHealthCheck
    };
  }

  // Transaktions-API
  public async getTransactions(params?: {
    skip?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<ApiResponse<Transaction[]>> {
    // Mock-Daten für Demo-Zwecke
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'sale',
        amount: 1500.00,
        date: new Date().toISOString(),
        description: 'Verkauf von Getreide',
        user_id: '1',
        status: 'completed'
      },
      {
        id: '2',
        type: 'purchase',
        amount: 800.00,
        date: new Date().toISOString(),
        description: 'Einkauf von Dünger',
        user_id: '1',
        status: 'pending'
      },
      {
        id: '3',
        type: 'sale',
        amount: 2200.00,
        date: new Date().toISOString(),
        description: 'Verkauf von Mais',
        user_id: '1',
        status: 'completed'
      }
    ];

    return {
      success: true,
      data: mockTransactions
    };
  }

  public async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<ApiResponse<Transaction>> {
    // Mock-Erfolg für Demo-Zwecke
    const mockTransaction: Transaction = {
      id: Date.now().toString(),
      ...transaction
    };

    return {
      success: true,
      data: mockTransaction
    };
  }

  public async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
    // Mock-Daten für Demo-Zwecke
    const mockTransaction: Transaction = {
      id,
      type: 'sale',
      amount: 1500.00,
      date: new Date().toISOString(),
      description: 'Verkauf von Getreide',
      user_id: '1',
      status: 'completed'
    };

    return {
      success: true,
      data: mockTransaction
    };
  }

  // Inventar-API
  public async getInventory(params?: {
    skip?: number;
    limit?: number;
    category?: string;
    status?: string;
  }): Promise<ApiResponse<InventoryItem[]>> {
    // Mock-Daten für Demo-Zwecke
    const mockInventory: InventoryItem[] = [
      {
        id: '1',
        name: 'Weizen',
        sku: 'WH-001',
        quantity: 1000,
        unit_price: 250.00,
        location: 'Lager A',
        category: 'Getreide',
        status: 'in_stock'
      },
      {
        id: '2',
        name: 'Mais',
        sku: 'MA-001',
        quantity: 500,
        unit_price: 180.00,
        location: 'Lager B',
        category: 'Getreide',
        status: 'low_stock'
      },
      {
        id: '3',
        name: 'Gerste',
        sku: 'GE-001',
        quantity: 750,
        unit_price: 200.00,
        location: 'Lager C',
        category: 'Getreide',
        status: 'in_stock'
      },
      {
        id: '4',
        name: 'Dünger NPK',
        sku: 'DU-001',
        quantity: 200,
        unit_price: 45.00,
        location: 'Lager D',
        category: 'Dünger',
        status: 'in_stock'
      }
    ];

    return {
      success: true,
      data: mockInventory
    };
  }

  public async createInventoryItem(item: Omit<InventoryItem, 'id'>): Promise<ApiResponse<InventoryItem>> {
    // Mock-Erfolg für Demo-Zwecke
    const mockItem: InventoryItem = {
      id: Date.now().toString(),
      ...item
    };

    return {
      success: true,
      data: mockItem
    };
  }

  public async updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
    // Mock-Erfolg für Demo-Zwecke
    const mockItem: InventoryItem = {
      id,
      name: item.name || 'Mock Item',
      sku: item.sku || 'MOCK-001',
      quantity: item.quantity || 0,
      unit_price: item.unit_price || 0,
      location: item.location || 'Mock Location',
      category: item.category || 'Mock Category',
      status: item.status || 'in_stock'
    };

    return {
      success: true,
      data: mockItem
    };
  }

  // Dokumenten-API
  public async getDocuments(params?: {
    skip?: number;
    limit?: number;
    type?: string;
  }): Promise<ApiResponse<Document[]>> {
    // Mock-Daten für Demo-Zwecke
    const mockDocuments: Document[] = [
      {
        id: '1',
        name: 'Rechnung_2024_001.pdf',
        type: 'invoice',
        content: 'Mock content',
        created_at: new Date().toISOString(),
        user_id: '1',
        size: 1024,
        mime_type: 'application/pdf'
      },
      {
        id: '2',
        name: 'Vertrag_Lieferant_2024.docx',
        type: 'contract',
        content: 'Mock content',
        created_at: new Date().toISOString(),
        user_id: '1',
        size: 2048,
        mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      },
      {
        id: '3',
        name: 'Lieferschein_2024_015.pdf',
        type: 'delivery_note',
        content: 'Mock content',
        created_at: new Date().toISOString(),
        user_id: '1',
        size: 512,
        mime_type: 'application/pdf'
      }
    ];

    return {
      success: true,
      data: mockDocuments
    };
  }

  public async uploadDocument(file: File, metadata: Partial<Document>): Promise<ApiResponse<Document>> {
    // Mock-Erfolg für Demo-Zwecke
    const mockDocument: Document = {
      id: Date.now().toString(),
      name: file.name,
      type: metadata.type || 'unknown',
      content: 'Mock content',
      created_at: new Date().toISOString(),
      user_id: '1',
      size: file.size,
      mime_type: file.type
    };

    return {
      success: true,
      data: mockDocument
    };
  }

  // Berichte-API
  public async getReports(params?: {
    skip?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<ApiResponse<Report[]>> {
    // Mock-Daten für Demo-Zwecke
    const mockReports: Report[] = [
      {
        id: '1',
        name: 'Monatsbericht Januar 2024',
        type: 'monthly',
        parameters: { month: 1, year: 2024 },
        created_at: new Date().toISOString(),
        user_id: '1',
        status: 'completed'
      },
      {
        id: '2',
        name: 'Lagerbestand Report',
        type: 'inventory',
        parameters: { location: 'all' },
        created_at: new Date().toISOString(),
        user_id: '1',
        status: 'processing'
      },
      {
        id: '3',
        name: 'Umsatzanalyse Q1 2024',
        type: 'quarterly',
        parameters: { quarter: 1, year: 2024 },
        created_at: new Date().toISOString(),
        user_id: '1',
        status: 'completed'
      }
    ];

    return {
      success: true,
      data: mockReports
    };
  }

  public async createReport(report: Omit<Report, 'id' | 'created_at'>): Promise<ApiResponse<Report>> {
    // Mock-Erfolg für Demo-Zwecke
    const mockReport: Report = {
      id: Date.now().toString(),
      ...report,
      created_at: new Date().toISOString()
    };

    return {
      success: true,
      data: mockReport
    };
  }

  // Benachrichtigungen-API
  public async getNotifications(): Promise<ApiResponse<Notification[]>> {
    // Mock-Daten für Demo-Zwecke
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'System-Update verfügbar',
        message: 'Ein neues Update für VALEO NeuroERP ist verfügbar.',
        recipient_id: '1',
        read: false,
        created_at: new Date().toISOString(),
        type: 'info'
      },
      {
        id: '2',
        title: 'Neue Aufgabe zugewiesen',
        message: 'Ihnen wurde eine neue Aufgabe im Projekt "Q1-Abschluss" zugewiesen.',
        recipient_id: '1',
        read: false,
        created_at: new Date().toISOString(),
        type: 'warning'
      },
      {
        id: '3',
        title: 'Backup erfolgreich',
        message: 'Das tägliche Backup wurde erfolgreich abgeschlossen.',
        recipient_id: '1',
        read: true,
        created_at: new Date().toISOString(),
        type: 'success'
      },
      {
        id: '4',
        title: 'Lagerbestand niedrig',
        message: 'Der Bestand von "Mais" ist unter den Mindestbestand gefallen.',
        recipient_id: '1',
        read: false,
        created_at: new Date().toISOString(),
        type: 'warning'
      }
    ];

    return {
      success: true,
      data: mockNotifications
    };
  }

  public async markNotificationRead(id: string): Promise<ApiResponse> {
    // Mock-Erfolg für Demo-Zwecke
    return {
      success: true,
      message: 'Benachrichtigung als gelesen markiert'
    };
  }

  // Middleware-spezifische APIs
  public async middlewareHealthCheck(): Promise<ApiResponse> {
    // Mock-Erfolg für Demo-Zwecke
    return {
      success: true,
      data: { status: 'healthy', timestamp: new Date().toISOString() }
    };
  }

  public async getMiddlewareData(endpoint: string, params?: any): Promise<ApiResponse> {
    // Mock-Daten für Demo-Zwecke
    return {
      success: true,
      data: { message: 'Mock-Daten für Demo-Zwecke', endpoint, params }
    };
  }

  // Hilfsmethoden
  private handleError(error: any, defaultMessage: string): ApiResponse {
    console.error('API Error:', error);
    
    let errorMessage = defaultMessage;
    
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton-Instanz
export const apiService = new ApiService();

// Hook für React-Komponenten
export const useApiService = () => apiService;

export default apiService; 