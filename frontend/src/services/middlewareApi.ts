import { api, type ApiResponse } from './api';

export interface EdiMessage {
  id: string;
  typ: 'ORDERS' | 'DESADV' | 'INVOIC' | 'DELFOR' | 'DELJIT';
  partner: string;
  datum: string;
  status: 'empfangen' | 'verarbeitet' | 'fehler' | 'gesendet';
  inhalt: string;
  bemerkungen?: string;
}

export interface TseTransaction {
  id: string;
  transaktionsnummer: string;
  datum: string;
  betrag: number;
  steuerbetrag: number;
  gesamtbetrag: number;
  zahlungsart: string;
  status: 'erfolgreich' | 'fehler' | 'storniert';
  beleg?: string;
  signatur?: string;
}

export interface EmailMessage {
  id: string;
  von: string;
  an: string;
  betreff: string;
  inhalt: string;
  datum: string;
  status: 'gesendet' | 'empfangen' | 'fehler';
  anhaenge?: string[];
}

export interface Document {
  id: string;
  name: string;
  typ: string;
  groesse: number;
  datum: string;
  status: 'aktiv' | 'archiviert' | 'geloescht';
  pfad: string;
  metadata?: Record<string, any>;
}

class MiddlewareApiService {
  // EDI-Verwaltung
  async getEdiMessages(params?: { page?: number; limit?: number; typ?: string; status?: string }): Promise<ApiResponse<EdiMessage[]>> {
    return api.get<EdiMessage[]>('/middleware/edi', params);
  }

  async getEdiMessageById(id: string): Promise<ApiResponse<EdiMessage>> {
    return api.get<EdiMessage>(`/middleware/edi/${id}`);
  }

  async sendEdiMessage(message: Omit<EdiMessage, 'id' | 'datum' | 'status'>): Promise<ApiResponse<EdiMessage>> {
    return api.post<EdiMessage>('/middleware/edi/send', message);
  }

  async processEdiMessage(id: string): Promise<ApiResponse<void>> {
    return api.post<void>(`/middleware/edi/${id}/process`);
  }

  async getEdiStatus(): Promise<ApiResponse<any>> {
    return api.get<any>('/middleware/edi/status');
  }

  // TSE-Integration
  async getTseTransactions(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<TseTransaction[]>> {
    return api.get<TseTransaction[]>('/middleware/tse/transactions', params);
  }

  async getTseTransactionById(id: string): Promise<ApiResponse<TseTransaction>> {
    return api.get<TseTransaction>(`/middleware/tse/transactions/${id}`);
  }

  async createTseTransaction(transaction: Omit<TseTransaction, 'id' | 'transaktionsnummer' | 'datum' | 'status'>): Promise<ApiResponse<TseTransaction>> {
    return api.post<TseTransaction>('/middleware/tse/transactions', transaction);
  }

  async getTseReceipt(transactionId: string): Promise<ApiResponse<string>> {
    return api.get<string>(`/middleware/tse/transactions/${transactionId}/receipt`);
  }

  async getTseStatus(): Promise<ApiResponse<any>> {
    return api.get<any>('/middleware/tse/status');
  }

  // E-Mail-Integration
  async getEmails(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<EmailMessage[]>> {
    return api.get<EmailMessage[]>('/middleware/email', params);
  }

  async getEmailById(id: string): Promise<ApiResponse<EmailMessage>> {
    return api.get<EmailMessage>(`/middleware/email/${id}`);
  }

  async sendEmail(email: Omit<EmailMessage, 'id' | 'datum' | 'status'>): Promise<ApiResponse<EmailMessage>> {
    return api.post<EmailMessage>('/middleware/email/send', email);
  }

  async getEmailStatus(): Promise<ApiResponse<any>> {
    return api.get<any>('/middleware/email/status');
  }

  // Dokumentenmanagement
  async getDocuments(params?: { page?: number; limit?: number; typ?: string }): Promise<ApiResponse<Document[]>> {
    return api.get<Document[]>('/middleware/documents', params);
  }

  async getDocumentById(id: string): Promise<ApiResponse<Document>> {
    return api.get<Document>(`/middleware/documents/${id}`);
  }

  async uploadDocument(file: File, metadata?: Record<string, any>): Promise<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    return api.post<Document>('/middleware/documents/upload', formData);
  }

  async downloadDocument(id: string): Promise<ApiResponse<Blob>> {
    return api.get<Blob>(`/middleware/documents/${id}/download`);
  }

  async deleteDocument(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/middleware/documents/${id}`);
  }

  // System-Status
  async getSystemStatus(): Promise<ApiResponse<any>> {
    return api.get<any>('/middleware/status');
  }

  async getHealthCheck(): Promise<ApiResponse<any>> {
    return api.get<any>('/middleware/health');
  }

  // Logs
  async getLogs(params?: { page?: number; limit?: number; level?: string; service?: string }): Promise<ApiResponse<any[]>> {
    return api.get<any[]>('/middleware/logs', params);
  }

  // Konfiguration
  async getConfiguration(): Promise<ApiResponse<any>> {
    return api.get<any>('/middleware/config');
  }

  async updateConfiguration(config: Record<string, any>): Promise<ApiResponse<any>> {
    return api.put<any>('/middleware/config', config);
  }
}

export const middlewareApi = new MiddlewareApiService();
export default middlewareApi; 