/**
 * Zentraler API-Service für VALEO NeuroERP 2.0
 * Verwaltet alle API-Aufrufe mit Fehlerbehandlung und Authentifizierung
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

// Basis-URL aus Umgebungsvariablen
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v2';

// Typen
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// Axios-Instanz mit Interceptors
class ApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request Interceptor für Auth-Token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response Interceptor für Fehlerbehandlung
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const { response } = error;

        if (response) {
          switch (response.status) {
            case 401:
              // Unauthorized - Token abgelaufen oder ungültig
              this.clearAuthToken();
              window.location.href = '/login';
              toast.error('Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.');
              break;
            
            case 403:
              toast.error('Sie haben keine Berechtigung für diese Aktion.');
              break;
            
            case 404:
              toast.error('Die angeforderte Ressource wurde nicht gefunden.');
              break;
            
            case 422:
              // Validierungsfehler
              const validationErrors = response.data as any;
              if (validationErrors.detail?.errors) {
                Object.entries(validationErrors.detail.errors).forEach(([field, messages]) => {
                  (messages as string[]).forEach(msg => {
                    toast.error(`${field}: ${msg}`);
                  });
                });
              }
              break;
            
            case 500:
              toast.error('Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
              break;
            
            default:
              toast.error(`Fehler: ${response.statusText}`);
          }
        } else {
          toast.error('Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.');
        }

        return Promise.reject(error);
      }
    );
  }

  // Token-Verwaltung
  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  getAuthToken(): string | null {
    if (!this.authToken) {
      this.authToken = localStorage.getItem('auth_token');
    }
    return this.authToken;
  }

  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }

  // Generische HTTP-Methoden
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  // Spezifische API-Methoden

  // Authentifizierung
  async login(email: string, password: string) {
    const response = await this.post<{ access_token: string; user: any }>('/auth/login', {
      email,
      password,
    });
    this.setAuthToken(response.access_token);
    return response;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } finally {
      this.clearAuthToken();
    }
  }

  async getCurrentUser() {
    return this.get<any>('/auth/me');
  }

  // Kunden
  async getCustomers(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    city?: string;
    active?: boolean;
  }) {
    return this.get<PaginatedResponse<any>>('/customers', { params });
  }

  async getCustomer(id: number) {
    return this.get<any>(`/customers/${id}`);
  }

  async createCustomer(data: any) {
    return this.post<any>('/customers', data);
  }

  async updateCustomer(id: number, data: any) {
    return this.put<any>(`/customers/${id}`, data);
  }

  async deleteCustomer(id: number) {
    return this.delete<any>(`/customers/${id}`);
  }

  // Artikel
  async getArticles(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    category?: string;
    in_stock?: boolean;
    min_price?: number;
    max_price?: number;
  }) {
    return this.get<PaginatedResponse<any>>('/articles', { params });
  }

  async getArticle(id: number) {
    return this.get<any>(`/articles/${id}`);
  }

  async createArticle(data: any) {
    return this.post<any>('/articles', data);
  }

  async updateArticle(id: number, data: any) {
    return this.put<any>(`/articles/${id}`, data);
  }

  async deleteArticle(id: number) {
    return this.delete<any>(`/articles/${id}`);
  }

  async getArticleStockHistory(id: number, days: number = 30) {
    return this.get<any>(`/articles/${id}/stock-history`, { params: { days } });
  }

  // Rechnungen
  async getInvoices(params?: {
    page?: number;
    per_page?: number;
    customer_id?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
  }) {
    return this.get<PaginatedResponse<any>>('/invoices', { params });
  }

  async getInvoice(id: number) {
    return this.get<any>(`/invoices/${id}`);
  }

  async createInvoice(data: any) {
    return this.post<any>('/invoices', data);
  }

  async updateInvoice(id: number, data: any) {
    return this.put<any>(`/invoices/${id}`, data);
  }

  async generateInvoicePdf(id: number) {
    return this.get<any>(`/invoices/${id}/pdf`);
  }

  // Bestellungen
  async getOrders(params?: {
    page?: number;
    per_page?: number;
    customer_id?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
  }) {
    return this.get<PaginatedResponse<any>>('/orders', { params });
  }

  async getOrder(id: number) {
    return this.get<any>(`/orders/${id}`);
  }

  async createOrder(data: any) {
    return this.post<any>('/orders', data);
  }

  async updateOrder(id: number, data: any) {
    return this.put<any>(`/orders/${id}`, data);
  }

  // Dashboard
  async getDashboardStats(dateFrom?: string, dateTo?: string) {
    return this.get<any>('/dashboard/stats', {
      params: { date_from: dateFrom, date_to: dateTo },
    });
  }

  async getRevenueChart(period: 'week' | 'month' | 'year' = 'month') {
    return this.get<any>('/dashboard/revenue-chart', { params: { period } });
  }

  // Globale Suche
  async globalSearch(query: string, types?: string[]) {
    return this.get<any>('/search', {
      params: {
        q: query,
        types: types || ['customer', 'article', 'invoice'],
      },
    });
  }

  // File Upload
  async uploadFile(file: File, type: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.post<any>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Validierung
  async validateCustomer(data: any) {
    return this.post<any>('/validate/customer', data);
  }

  async validateArticle(data: any) {
    return this.post<any>('/validate/article', data);
  }

  async validateInvoice(data: any) {
    return this.post<any>('/validate/invoice', data);
  }
}

// Singleton-Instanz exportieren
export const apiService = new ApiService();

// Hooks für React
export const useApi = () => {
  return apiService;
}; 