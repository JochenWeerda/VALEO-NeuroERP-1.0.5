import { Streckengeschaeft, StreckengeschaeftFilter, StreckengeschaeftSummen } from '../types/streckengeschaeft';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// API Endpoints
const ENDPOINTS = {
  STECKENGESCHAEFT: '/streckengeschaeft',
  STECKENGESCHAEFT_SUMMEN: '/streckengeschaeft/summen',
  STECKENGESCHAEFT_EXPORT: '/streckengeschaeft/export',
  STECKENGESCHAEFT_PRINT: '/streckengeschaeft/print',
  STECKENGESCHAEFT_EMAIL: '/streckengeschaeft/email',
  STECKENGESCHAEFT_WHATSAPP: '/streckengeschaeft/whatsapp',
  PRINTERS: '/system/printers',
  CONVERT: '/system/convert',
} as const;

// HTTP Client mit Error Handling
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text() as T;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // GET Request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint;
    
    return this.request<T>(url, { method: 'GET' });
  }

  // POST Request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT Request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE Request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File Upload
  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }
}

// API Client Instance
const apiClient = new ApiClient(API_BASE_URL);

// Streckengeschäft API Service
export class StreckengeschaeftApi {
  // CRUD Operations
  static async getAll(filter?: StreckengeschaeftFilter): Promise<Streckengeschaeft[]> {
    return apiClient.get<Streckengeschaeft[]>(ENDPOINTS.STECKENGESCHAEFT, filter);
  }

  static async getById(id: string): Promise<Streckengeschaeft> {
    return apiClient.get<Streckengeschaeft>(`${ENDPOINTS.STECKENGESCHAEFT}/${id}`);
  }

  static async create(data: Omit<Streckengeschaeft, 'streckeNr'>): Promise<Streckengeschaeft> {
    return apiClient.post<Streckengeschaeft>(ENDPOINTS.STECKENGESCHAEFT, data);
  }

  static async update(id: string, data: Partial<Streckengeschaeft>): Promise<Streckengeschaeft> {
    return apiClient.put<Streckengeschaeft>(`${ENDPOINTS.STECKENGESCHAEFT}/${id}`, data);
  }

  static async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${ENDPOINTS.STECKENGESCHAEFT}/${id}`);
  }

  // Summen und Berechnungen
  static async getSummen(filter?: StreckengeschaeftFilter): Promise<StreckengeschaeftSummen> {
    return apiClient.get<StreckengeschaeftSummen>(ENDPOINTS.STECKENGESCHAEFT_SUMMEN, filter);
  }

  // Export Funktionen
  static async exportToExcel(filter?: StreckengeschaeftFilter): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.STECKENGESCHAEFT_EXPORT}/excel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filter),
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    return response.blob();
  }

  static async exportToPDF(filter?: StreckengeschaeftFilter): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.STECKENGESCHAEFT_EXPORT}/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filter),
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    return response.blob();
  }

  static async exportToLibreOffice(filter?: StreckengeschaeftFilter, format: 'odt' | 'ods' = 'ods'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.STECKENGESCHAEFT_EXPORT}/libreoffice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...filter, format }),
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    return response.blob();
  }

  // Drucker-Funktionen
  static async getAvailablePrinters(): Promise<Array<{
    name: string;
    id: string;
    isDefault: boolean;
    isNetwork: boolean;
    location?: string;
    status: 'ready' | 'offline' | 'error';
  }>> {
    return apiClient.get<Array<{
      name: string;
      id: string;
      isDefault: boolean;
      isNetwork: boolean;
      location?: string;
      status: 'ready' | 'offline' | 'error';
    }>>(ENDPOINTS.PRINTERS);
  }

  static async printStreckengeschaeft(
    id: string, 
    printerId?: string, 
    options?: {
      copies?: number;
      orientation?: 'portrait' | 'landscape';
      paperSize?: 'A4' | 'A3' | 'letter';
      includeSummen?: boolean;
    }
  ): Promise<{ success: boolean; jobId?: string; error?: string }> {
    return apiClient.post<{ success: boolean; jobId?: string; error?: string }>(
      `${ENDPOINTS.STECKENGESCHAEFT_PRINT}/${id}`,
      { printerId, options }
    );
  }

  static async printMultiple(
    ids: string[], 
    printerId?: string, 
    options?: {
      copies?: number;
      orientation?: 'portrait' | 'landscape';
      paperSize?: 'A4' | 'A3' | 'letter';
      includeSummen?: boolean;
    }
  ): Promise<{ success: boolean; jobIds?: string[]; errors?: string[] }> {
    return apiClient.post<{ success: boolean; jobIds?: string[]; errors?: string[] }>(
      `${ENDPOINTS.STECKENGESCHAEFT_PRINT}/multiple`,
      { ids, printerId, options }
    );
  }

  // E-Mail Funktionen
  static async sendEmail(
    id: string,
    emailData: {
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      message?: string;
      includeAttachment?: boolean;
      attachmentFormat?: 'pdf' | 'excel' | 'libreoffice';
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return apiClient.post<{ success: boolean; messageId?: string; error?: string }>(
      `${ENDPOINTS.STECKENGESCHAEFT_EMAIL}/${id}`,
      emailData
    );
  }

  // WhatsApp Integration
  static async sendWhatsApp(
    id: string,
    phoneNumber: string,
    message?: string,
    includeAttachment?: boolean
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return apiClient.post<{ success: boolean; messageId?: string; error?: string }>(
      `${ENDPOINTS.STECKENGESCHAEFT_WHATSAPP}/${id}`,
      { phoneNumber, message, includeAttachment }
    );
  }

  // Datei-Konvertierung
  static async convertFile(
    file: File,
    targetFormat: 'pdf' | 'excel' | 'word' | 'libreoffice' | 'html' | 'txt',
    options?: {
      quality?: 'low' | 'medium' | 'high';
      password?: string;
      watermark?: string;
    }
  ): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CONVERT}`, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: (() => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('targetFormat', targetFormat);
        if (options) {
          Object.entries(options).forEach(([key, value]) => {
            formData.append(key, value);
          });
        }
        return formData;
      })(),
    });
    
    if (!response.ok) {
      throw new Error(`Conversion failed: ${response.statusText}`);
    }
    
    return response.blob();
  }

  // Batch Operations
  static async batchUpdate(
    ids: string[],
    updates: Partial<Streckengeschaeft>
  ): Promise<{ success: boolean; updated: number; errors: string[] }> {
    return apiClient.post<{ success: boolean; updated: number; errors: string[] }>(
      `${ENDPOINTS.STECKENGESCHAEFT}/batch-update`,
      { ids, updates }
    );
  }

  static async batchDelete(ids: string[]): Promise<{ success: boolean; deleted: number; errors: string[] }> {
    return apiClient.post<{ success: boolean; deleted: number; errors: string[] }>(
      `${ENDPOINTS.STECKENGESCHAEFT}/batch-delete`,
      { ids }
    );
  }

  // Analytics und Reporting
  static async getAnalytics(filter?: StreckengeschaeftFilter): Promise<{
    totalCount: number;
    totalRevenue: number;
    totalProfit: number;
    averageProcessingTime: number;
    topSuppliers: Array<{ name: string; count: number; revenue: number }>;
    topCustomers: Array<{ name: string; count: number; revenue: number }>;
    monthlyTrends: Array<{ month: string; count: number; revenue: number }>;
  }> {
    return apiClient.get<{
      totalCount: number;
      totalRevenue: number;
      totalProfit: number;
      averageProcessingTime: number;
      topSuppliers: Array<{ name: string; count: number; revenue: number }>;
      topCustomers: Array<{ name: string; count: number; revenue: number }>;
      monthlyTrends: Array<{ month: string; count: number; revenue: number }>;
    }>(`${ENDPOINTS.STECKENGESCHAEFT}/analytics`, filter);
  }

  // Backup und Restore
  static async createBackup(): Promise<{ success: boolean; backupId: string; size: number }> {
    return apiClient.post<{ success: boolean; backupId: string; size: number }>(
      `${ENDPOINTS.STECKENGESCHAEFT}/backup`
    );
  }

  static async restoreBackup(backupId: string): Promise<{ success: boolean; restored: number }> {
    return apiClient.post<{ success: boolean; restored: number }>(
      `${ENDPOINTS.STECKENGESCHAEFT}/restore`,
      { backupId }
    );
  }
}

// Utility Functions
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 