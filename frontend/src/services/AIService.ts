/**
 * AI Service für VALEO NeuroERP Frontend
 * Mock-Implementierung für Demo-Zwecke
 */

import {
  BarcodeSuggestion,
  AIBarcodeStats,
  BarcodeOptimizationParams,
  InventorySuggestion,
  InventoryStats,
  InventoryOptimizationParams,
  VoucherOptimization,
  VoucherStats,
  VoucherOptimizationParams,
  ApiResponse
} from '../types/ai';

export interface TransactionData {
  date: string;
  amount: number;
  type: string;
  description: string;
}

export interface InventoryData {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  category: string;
}

export interface DemandHistory {
  date: string;
  quantity: number;
  item_id: string;
}

export interface UserBehaviorData {
  user_id: string;
  login_count: number;
  last_login: string;
  features_used: string[];
}

export interface PredictionResult {
  predictions: number[];
  dates: string[];
  metrics: {
    mae: number;
    mse: number;
    rmse: number;
  };
  confidence: number;
}

export interface AnomalyResult {
  anomalies: any[];
  normal_count: number;
  anomaly_count: number;
  anomaly_percentage: number;
  severity: string;
}

export interface InventoryOptimizationResult {
  recommendations: Array<{
    item_id: string;
    item_name: string;
    current_stock: number;
    optimal_stock: number;
    action: string;
    urgency: string;
    predicted_demand: number;
    safety_stock: number;
  }>;
  predicted_demand: number;
  confidence: number;
}

export interface UserBehaviorResult {
  total_users: number;
  active_users: number;
  inactive_users: number;
  engagement_rate: number;
  feature_usage: Record<string, number>;
  user_segments: {
    power_users: number;
    regular_users: number;
    casual_users: number;
  };
}

export interface Insight {
  type: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  confidence: number;
}

export interface AIHealth {
  status: string;
  models_loaded: number;
  anomaly_detector_ready: boolean;
  last_update: string;
  version: string;
}

export interface AIModelStatus {
  transaction_forecast: string;
  inventory_optimization: string;
  anomaly_detection: string;
  overall_status: string;
  last_update: string;
}

export interface AIAnalyticsDashboard {
  ai_health: AIHealth;
  recent_predictions: {
    transaction_accuracy: number;
    inventory_optimization_score: number;
    anomaly_detection_rate: number;
  };
  active_models: string[];
  last_insights: Insight[];
}

class AIService {
  private baseUrl = '/ai';

  // Mock health check
  async getHealth(): Promise<{ success: boolean; data: AIHealth }> {
    return {
      success: true,
      data: {
        status: 'healthy',
        models_loaded: 3,
        anomaly_detector_ready: true,
        last_update: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  // Mock transaction prediction
  async predictTransactionTrends(
    historicalData: TransactionData[]
  ): Promise<{ success: boolean; data: PredictionResult; message: string }> {
    return {
      success: true,
      data: {
        predictions: [1000, 1200, 1100, 1300, 1400],
        dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'],
        metrics: {
          mae: 150.5,
          mse: 22500.25,
          rmse: 150.0
        },
        confidence: 0.85
      },
      message: 'Vorhersage erfolgreich erstellt'
    };
  }

  // Mock anomaly detection
  async detectAnomalies(
    data: any[],
    dataType: string = 'transactions'
  ): Promise<{ success: boolean; data: AnomalyResult; message: string }> {
    return {
      success: true,
      data: {
        anomalies: [
          { id: 1, value: 5000, date: '2024-01-15', severity: 'high' },
          { id: 2, value: 300, date: '2024-01-20', severity: 'medium' }
        ],
        normal_count: 98,
        anomaly_count: 2,
        anomaly_percentage: 2.0,
        severity: 'medium'
      },
      message: 'Anomalie-Erkennung abgeschlossen'
    };
  }

  // Mock inventory optimization
  async optimizeInventory(
    inventoryData: InventoryData[],
    demandHistory: DemandHistory[]
  ): Promise<{ success: boolean; data: InventoryOptimizationResult; message: string }> {
    return {
      success: true,
      data: {
        recommendations: [
          {
            item_id: '1',
            item_name: 'Getreide Weizen',
            current_stock: 150,
            optimal_stock: 200,
            action: 'Nachbestellen',
            urgency: 'medium',
            predicted_demand: 180,
            safety_stock: 50
          }
        ],
        predicted_demand: 180,
        confidence: 0.92
      },
      message: 'Lageroptimierung abgeschlossen'
    };
  }

  // Mock user behavior analysis
  async analyzeUserBehavior(
    userData: UserBehaviorData[]
  ): Promise<{ success: boolean; data: UserBehaviorResult; message: string }> {
    return {
      success: true,
      data: {
        total_users: 150,
        active_users: 120,
        inactive_users: 30,
        engagement_rate: 0.8,
        feature_usage: {
          'finance': 85,
          'warehouse': 70,
          'sales': 60
        },
        user_segments: {
          power_users: 25,
          regular_users: 80,
          casual_users: 45
        }
      },
      message: 'Benutzerverhalten analysiert'
    };
  }

  // Mock insights generation
  async generateInsights(dataTypes: string[] = ['transactions', 'inventory', 'performance']): Promise<{
    success: boolean;
    data: {
      insights: Insight[];
      generated_at: string;
      data_types: string[];
    };
    message: string;
  }> {
    return {
      success: true,
      data: {
        insights: [
          {
            type: 'trend',
            title: 'Steigende Umsätze',
            description: 'Umsätze sind in den letzten 3 Monaten um 15% gestiegen',
            severity: 'success',
            confidence: 0.95
          },
          {
            type: 'anomaly',
            title: 'Ungewöhnliche Lagerbewegung',
            description: 'Erhöhte Aktivität im Lagerbereich A',
            severity: 'warning',
            confidence: 0.78
          }
        ],
        generated_at: new Date().toISOString(),
        data_types: dataTypes
      },
      message: 'Insights erfolgreich generiert'
    };
  }

  // Mock model status
  async getModelsStatus(): Promise<{ success: boolean; data: AIModelStatus }> {
    return {
      success: true,
      data: {
        transaction_forecast: 'ready',
        inventory_optimization: 'ready',
        anomaly_detection: 'ready',
        overall_status: 'healthy',
        last_update: new Date().toISOString()
      }
    };
  }

  // Mock model retraining
  async retrainModels(): Promise<{
    success: boolean;
    message: string;
    data: {
      status: string;
      started_at: string;
    };
  }> {
    return {
      success: true,
      message: 'Modelle werden neu trainiert',
      data: {
        status: 'training',
        started_at: new Date().toISOString()
      }
    };
  }

  // Mock analytics dashboard
  async getAnalyticsDashboard(): Promise<{ success: boolean; data: AIAnalyticsDashboard }> {
    return {
      success: true,
      data: {
        ai_health: {
          status: 'healthy',
          models_loaded: 3,
          anomaly_detector_ready: true,
          last_update: new Date().toISOString(),
          version: '1.0.0'
        },
        recent_predictions: {
          transaction_accuracy: 0.92,
          inventory_optimization_score: 0.88,
          anomaly_detection_rate: 0.95
        },
        active_models: ['transaction_forecast', 'inventory_optimization', 'anomaly_detection'],
        last_insights: [
          {
            type: 'trend',
            title: 'Positive Entwicklung',
            description: 'Alle KPIs zeigen positive Trends',
            severity: 'success',
            confidence: 0.90
          }
        ]
      }
    };
  }

  // Mock data methods
  getMockData() {
    return {
      transactions: [
        { date: '2024-01-01', amount: 1000, type: 'income', description: 'Verkauf' },
        { date: '2024-01-02', amount: 500, type: 'expense', description: 'Einkauf' }
      ],
      inventory: [
        { id: '1', name: 'Getreide Weizen', quantity: 150, unit_price: 250, category: 'Rohstoffe' },
        { id: '2', name: 'Dünger NPK', quantity: 25, unit_price: 800, category: 'Chemikalien' }
      ]
    };
  }

  getMockTransactionForecast() {
    return {
      predictions: [1000, 1200, 1100, 1300, 1400],
      dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'],
      confidence: 0.85
    };
  }

  getMockAnomalies() {
    return {
      anomalies: [
        { id: 1, value: 5000, date: '2024-01-15', severity: 'high' },
        { id: 2, value: 300, date: '2024-01-20', severity: 'medium' }
      ],
      normal_count: 98,
      anomaly_count: 2
    };
  }

  getMockInventoryOptimization() {
    return {
      recommendations: [
        {
          item_id: '1',
          item_name: 'Getreide Weizen',
          current_stock: 150,
          optimal_stock: 200,
          action: 'Nachbestellen',
          urgency: 'medium'
        }
      ]
    };
  }
}

// Barcode
export async function fetchBarcodeSuggestions(): Promise<BarcodeSuggestion[]> {
  const res = await fetch('/api/ai/barcode/suggestions');
  if (!res.ok) throw new Error('Fehler beim Laden der Barcode-Vorschläge');
  const data: ApiResponse<BarcodeSuggestion[]> = await res.json();
  return data.data;
}

export async function fetchBarcodeStats(): Promise<AIBarcodeStats> {
  const res = await fetch('/api/ai/barcode/stats');
  if (!res.ok) throw new Error('Fehler beim Laden der Barcode-Statistiken');
  const data: ApiResponse<AIBarcodeStats> = await res.json();
  return data.data;
}

export async function optimizeBarcode(id: string, params: BarcodeOptimizationParams): Promise<void> {
  const res = await fetch(`/api/ai/barcode/optimize/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Fehler bei der Barcode-Optimierung');
}

export async function retrainBarcodeModel(): Promise<void> {
  const res = await fetch('/api/ai/barcode/retrain', { method: 'POST' });
  if (!res.ok) throw new Error('Fehler beim Neuladen des Barcode-Modells');
}

// Inventory
export async function fetchInventorySuggestions(): Promise<InventorySuggestion[]> {
  const res = await fetch('/api/ai/inventory/suggestions');
  if (!res.ok) throw new Error('Fehler beim Laden der Inventur-Vorschläge');
  const data: ApiResponse<InventorySuggestion[]> = await res.json();
  return data.data;
}

export async function fetchInventoryStats(): Promise<InventoryStats> {
  const res = await fetch('/api/ai/inventory/stats');
  if (!res.ok) throw new Error('Fehler beim Laden der Inventur-Statistiken');
  const data: ApiResponse<InventoryStats> = await res.json();
  return data.data;
}

export async function optimizeInventory(params: InventoryOptimizationParams): Promise<void> {
  const res = await fetch('/api/ai/inventory/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Fehler bei der Inventur-Optimierung');
}

export async function retrainInventoryModel(): Promise<void> {
  const res = await fetch('/api/ai/inventory/retrain', { method: 'POST' });
  if (!res.ok) throw new Error('Fehler beim Neuladen des Inventur-Modells');
}

// Voucher
export async function fetchVoucherOptimizations(): Promise<VoucherOptimization[]> {
  const res = await fetch('/api/ai/voucher/optimizations');
  if (!res.ok) throw new Error('Fehler beim Laden der Voucher-Optimierungen');
  const data: ApiResponse<VoucherOptimization[]> = await res.json();
  return data.data;
}

export async function fetchVoucherStats(): Promise<VoucherStats> {
  const res = await fetch('/api/ai/voucher/stats');
  if (!res.ok) throw new Error('Fehler beim Laden der Voucher-Statistiken');
  const data: ApiResponse<VoucherStats> = await res.json();
  return data.data;
}

export async function optimizeVoucher(params: VoucherOptimizationParams): Promise<void> {
  const res = await fetch('/api/ai/voucher/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Fehler bei der Voucher-Optimierung');
}

export async function retrainVoucherModel(): Promise<void> {
  const res = await fetch('/api/ai/voucher/retrain', { method: 'POST' });
  if (!res.ok) throw new Error('Fehler beim Neuladen des Voucher-Modells');
}

export const aiService = new AIService();
export default aiService; 