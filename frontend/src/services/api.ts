import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';
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

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
      headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    // Log error for debugging
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.error?.message || error.message,
      url: error.config?.url,
      method: error.config?.method,
    });

    return Promise.reject(error);
  }
);

// Generic API methods
export const api = {
  // GET request
  get: async <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.get<ApiResponse<T>>(url, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiResponse>);
    }
  },

  // POST request
  post: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.post<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiResponse>);
    }
  },

  // PUT request
  put: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.put<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiResponse>);
    }
  },

  // DELETE request
  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.delete<ApiResponse<T>>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiResponse>);
    }
  },

  // PATCH request
  patch: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.patch<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiResponse>);
    }
  },

  // File upload
  upload: async <T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> => {
    try {
    const formData = new FormData();
    formData.append('file', file);
    
      const response = await apiClient.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiResponse>);
    }
  },
};

// Error handler
function handleApiError(error: AxiosError<ApiResponse>): Error {
  if (error.response?.data?.error) {
    const apiError = error.response.data.error;
    return new Error(apiError.message || 'Ein unbekannter Fehler ist aufgetreten');
  }
  
  if (error.code === 'ECONNABORTED') {
    return new Error('Zeitüberschreitung bei der Anfrage');
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return new Error('Netzwerkfehler - Überprüfen Sie Ihre Internetverbindung');
  }
  
  return new Error(error.message || 'Ein Fehler ist aufgetreten');
}

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health');
    return response.data.status === 'OK';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

// Database status check
export const databaseStatus = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/db-test');
    return response.data.status === 'connected';
  } catch (error) {
    console.error('Database status check failed:', error);
    return false;
  }
};

export default api; 