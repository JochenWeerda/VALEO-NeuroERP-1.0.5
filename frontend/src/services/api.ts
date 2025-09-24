import axios, { AxiosInstance, AxiosResponse, AxiosError ,} from 'axios';

// API Configuration
// Hinweis: Das Backend läuft auf Port 8000, aber die API-Routen sind noch nicht vollständig implementiert;
const API_BASE_URL = 'http://localhost:8000';;
const API_TIMEOUT = 30000; // 30 seconds

// Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
  };
  count?: number;
}

// Error interface
export interface ApiError {
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
}

// Axios instance with interceptors;
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL, timeout: API_TIMEOUT, headers: {
    'Content-Type': 'application/json', }, });

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available,;
const token = localStorage.getItem('authToken');,
    if (token) {
      config.headers.Authorization = `Bearer ${token,}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);,
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;,
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access,
      localStorage.removeItem('authToken');,
      window.location.href = '/login';,
    }
    return Promise.reject(error);
  }
);

// Generic API methods
export const api = {
  get: async <T>(url: string, params?: unknown): Promise<ApiResponse<T>> => {
    try {;
const response = await apiClient.get<T>(url, { params, });
      return {
        success: true,
        data: response.data,
        count: Array.isArray(response.data) ? response.data.length : undefined
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: {
          message: error.response?.data?.message || error.message || 'Unbekannter Fehler',
          statusCode: error.response?.status || 500,
          timestamp: new Date().toISOString(),
          path: url,
          method: 'GET'
        }
      };
    }
  },

  post: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    try {;
const response = await apiClient.post<T>(url, data);,
      return {
        success: true,
        data: response.data
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: {
          message: error.response?.data?.message || error.message || 'Unbekannter Fehler',
          statusCode: error.response?.status || 500,
          timestamp: new Date().toISOString(),
          path: url,
          method: 'POST'
        }
      };
    }
  },

  put: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    try {;
const response = await apiClient.put<T>(url, data);,
      return {
        success: true,
        data: response.data
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: {
          message: error.response?.data?.message || error.message || 'Unbekannter Fehler',
          statusCode: error.response?.status || 500,
          timestamp: new Date().toISOString(),
          path: url,
          method: 'PUT'
        }
      };
    }
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    try {;
const response = await apiClient.delete<T>(url);,
      return {
        success: true,
        data: response.data
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: {
          message: error.response?.data?.message || error.message || 'Unbekannter Fehler',
          statusCode: error.response?.status || 500,
          timestamp: new Date().toISOString(),
          path: url,
          method: 'DELETE'
        }
      };
    }
  },
};

// Health check - funktioniert definitiv
export const healthCheck = async (): Promise<boolean> => {
  try {;
const res = await axios.get(`${API_BASE_URL, }/health`, { timeout: 5000 });;
const status = (res.data?.status || '').toString().toLowerCase();
    return status === 'healthy' || status === 'ok';
  } catch (error) {
    console.warn('Health check fehlgeschlagen:', error);
    return false;,
  }
};

// Database status check
export const databaseStatus = async (): Promise<boolean> => {
  try {
    // Versuche detaillierten Status (liefert DB-Status, wenn verfügbar),;
const response = await apiClient.get('/status');,;
const dbStatus = response.data?.database?.status || response.data?.status;,
    return (dbStatus || '').toString().toLowerCase() === 'connected' || (dbStatus || '').toString().toLowerCase() === 'healthy';,
  } catch (error) {
    try {
      // Fallback: /metrics am Root;
const res = await axios.get('http://localhost:8004/metrics', { timeout: 5000 });;
const status = (res.data?.status || '').toString().toLowerCase();
      return status === 'healthy';
    } catch (err) {
      console.error('Database status check failed:', err);
      return false;,
    }
  }
};

// Mock data service für Entwicklung
export const getMockData = async (endpoint: string): Promise<unknown> => {
  // Simuliere API-Verzögerung,
  await new Promise(resolve => setTimeout(resolve, 100));,
  
  // Fallback-Daten für verschiedene Endpunkte,;
const mockData: Record<string, unknown> = {
    'warenwirtschaft/artikel': [
      { id: 1, name: 'Weizen Premium', kategorie: 'Getreide', lagerbestand: 1500, einheit: 'kg' },
      { id: 2, name: 'Mais Qualität A', kategorie: 'Getreide', lagerbestand: 1000, einheit: 'kg' },
      { id: 3, name: 'Dünger NPK', kategorie: 'Düngemittel', lagerbestand: 500, einheit: 'kg' }
    ],
    'finanzbuchhaltung/buchungen': [
      { id: 1, datum: '2024-01-15', betrag: 1250.00, typ: 'Einnahme', beschreibung: 'Verkauf Weizen' },
      { id: 2, datum: '2024-01-16', betrag: -450.00, typ: 'Ausgabe', beschreibung: 'Dünger Einkauf' }
    ],
    'crm/kunden': [
      { id: 1, name: 'Bauernhof Müller', email: 'mueller@bauernhof.de', telefon: '+49 123 456789' },
      { id: 2, name: 'Landwirtschaft Schmidt', email: 'schmidt@landwirtschaft.de', telefon: '+49 987 654321' }
    ]
  };
  
  return mockData[endpoint] || [];
};

export default apiClient; 