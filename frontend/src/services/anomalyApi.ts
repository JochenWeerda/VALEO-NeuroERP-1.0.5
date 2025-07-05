import axios from 'axios';

// Basisadresse für die API
const API_BASE_URL = '/api/v1/anomaly';

// Typdefinitionen
export interface AnomalyModel {
  id: string;
  module: string;
  data_type: string;
  created_at: string;
  updated_at: string;
  accuracy: number;
  parameters: Record<string, any>;
  is_active: boolean;
}

export interface AnomalyDetectionResult {
  anomaly_indices: number[];
  anomaly_scores: number[];
  anomalies: Record<string, any>[];
  detection_time: string;
  model_id: string;
}

export interface AnomalyHistory {
  id: string;
  module: string;
  data_type: string;
  detected_at: string;
  anomaly_score: number;
  data: Record<string, any>;
  resolved: boolean;
  resolution_notes?: string;
}

export interface AnomalyStats {
  total_anomalies: number;
  anomalies_by_module: Record<string, number>;
  anomalies_by_severity: Record<string, number>;
  anomalies_over_time: {
    date: string;
    count: number;
  }[];
  average_anomaly_score: number;
  top_anomalies: AnomalyHistory[];
}

export interface TrainingParams {
  module: string;
  data_type: string;
  parameters?: Record<string, any>;
}

export interface DetectionParams {
  module: string;
  data_type: string;
  data?: Record<string, any>[];
}

export interface BatchDetectionParams {
  module: string;
  data_type: string;
  start_date?: string;
  end_date?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  severity_threshold: number;
  modules: string[];
}

export interface ExportParams {
  format: 'pdf' | 'csv' | 'excel' | 'json';
  module?: string;
  start_date?: string;
  end_date?: string;
  include_details: boolean;
}

export interface RealtimeSubscription {
  id: string;
  module: string;
  callback: (data: AnomalyHistory) => void;
}

// Service-Funktionen
const anomalyApi = {
  // Modellverwaltung
  trainModel: async (params: TrainingParams) => {
    const response = await axios.post(`${API_BASE_URL}/train`, params);
    return response.data;
  },

  listModels: async (module?: string) => {
    const url = module ? `${API_BASE_URL}/models?module=${module}` : `${API_BASE_URL}/models`;
    const response = await axios.get(url);
    return response.data as AnomalyModel[];
  },

  deleteModel: async (module: string, dataType: string) => {
    const response = await axios.delete(`${API_BASE_URL}/models/${module}/${dataType}`);
    return response.data;
  },

  // Anomalieerkennung
  detectAnomalies: async (params: DetectionParams) => {
    const response = await axios.post(`${API_BASE_URL}/detect`, params);
    return response.data as AnomalyDetectionResult;
  },

  batchDetectAnomalies: async (params: BatchDetectionParams) => {
    const response = await axios.post(`${API_BASE_URL}/batch-detect`, params);
    return response.data as AnomalyDetectionResult;
  },

  // Anomaliehistorie
  getAnomalyHistory: async (module?: string, startDate?: string, endDate?: string, limit: number = 100) => {
    let url = `${API_BASE_URL}/history?limit=${limit}`;
    if (module) url += `&module=${module}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    
    const response = await axios.get(url);
    return response.data as AnomalyHistory[];
  },

  // Statistiken
  getAnomalyStats: async (module?: string, days: number = 30) => {
    let url = `${API_BASE_URL}/stats?days=${days}`;
    if (module) url += `&module=${module}`;
    
    const response = await axios.get(url);
    return response.data as AnomalyStats;
  },

  // Schwellenwerte
  setDetectionThreshold: async (module: string, dataType: string, threshold: number) => {
    const response = await axios.post(`${API_BASE_URL}/set-threshold`, {
      module,
      data_type: dataType,
      threshold
    });
    return response.data;
  },

  // Modul-Konfiguration
  getModuleConfig: async (module: string) => {
    const response = await axios.get(`${API_BASE_URL}/module-config/${module}`);
    return response.data;
  },

  setModuleConfig: async (module: string, config: Record<string, any>) => {
    const response = await axios.post(`${API_BASE_URL}/module-config/${module}`, { config });
    return response.data;
  },

  // Ursachenanalyse
  analyzeRootCause: async (anomalyId: string, additionalData?: Record<string, any>) => {
    const response = await axios.post(`${API_BASE_URL}/analyze-root-cause`, {
      anomaly_id: anomalyId,
      additional_data: additionalData
    });
    return response.data;
  },

  // Echtzeitbenachrichtigungen und Websocket-Verbindung
  subscriptions: new Map<string, RealtimeSubscription>(),
  
  // Websocket-Verbindung herstellen und aufrechterhalten
  connectToRealtimeUpdates: () => {
    // In einer realen Implementierung würde hier eine WebSocket-Verbindung hergestellt
    // Da wir keine echte WebSocket-Verbindung implementieren können, simulieren wir das Verhalten
    console.log('Realtime-Verbindung hergestellt');
    
    // Polling als Fallback, falls WebSockets nicht verfügbar sind
    setInterval(async () => {
      try {
        const latestAnomalies = await anomalyApi.getAnomalyHistory(undefined, undefined, undefined, 5);
        anomalyApi.subscriptions.forEach(subscription => {
          const relevantAnomalies = latestAnomalies.filter(
            anomaly => subscription.module === 'all' || anomaly.module === subscription.module
          );
          relevantAnomalies.forEach(anomaly => subscription.callback(anomaly));
        });
      } catch (error) {
        console.error('Fehler beim Abrufen von Echtzeit-Updates:', error);
      }
    }, 30000); // Alle 30 Sekunden prüfen
  },
  
  // Auf Echtzeit-Anomaliebenachrichtigungen abonnieren
  subscribeToRealtimeUpdates: (module: string, callback: (data: AnomalyHistory) => void): string => {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    anomalyApi.subscriptions.set(subscriptionId, { id: subscriptionId, module, callback });
    return subscriptionId;
  },
  
  // Abonnement kündigen
  unsubscribeFromRealtimeUpdates: (subscriptionId: string): boolean => {
    return anomalyApi.subscriptions.delete(subscriptionId);
  },

  // Benachrichtigungseinstellungen verwalten
  getNotificationSettings: async () => {
    const response = await axios.get(`${API_BASE_URL}/notification-settings`);
    return response.data as NotificationSettings;
  },
  
  updateNotificationSettings: async (settings: Partial<NotificationSettings>) => {
    const response = await axios.post(`${API_BASE_URL}/notification-settings`, settings);
    return response.data;
  },
  
  // Exportfunktionen
  exportAnomalyData: async (params: ExportParams) => {
    const response = await axios.post(`${API_BASE_URL}/export`, params, {
      responseType: 'blob'
    });
    
    // Dateinamen aus Header extrahieren oder generieren
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'anomaly-data';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch.length > 1) filename = filenameMatch[1];
    } else {
      // Dateinamen basierend auf Format und Datum generieren
      const date = new Date().toISOString().split('T')[0];
      filename = `anomaly-data-${date}.${params.format}`;
    }
    
    // Blob-URL erstellen und Download auslösen
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true, filename };
  },
  
  // Dashboard-Funktionen für Vorhersagemodelle
  getModelPerformanceMetrics: async (modelId: string) => {
    const response = await axios.get(`${API_BASE_URL}/model-metrics/${modelId}`);
    return response.data;
  },
  
  getModelPredictions: async (modelId: string, days: number = 7) => {
    const response = await axios.get(`${API_BASE_URL}/model-predictions/${modelId}?days=${days}`);
    return response.data;
  }
};

// Initialisiere die Echtzeitverbindung
setTimeout(() => {
  anomalyApi.connectToRealtimeUpdates();
}, 1000);

export default anomalyApi; 