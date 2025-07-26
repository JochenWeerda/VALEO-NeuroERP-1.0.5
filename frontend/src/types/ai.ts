// KI-Barcode-Typen
export interface BarcodeSuggestion {
  id: string;
  product_name: string;
  suggested_barcode: string;
  confidence_score: number;
  reasoning: string;
  category: string;
  similar_products: string[];
  market_trends: {
    demand_trend: string;
    price_trend: string;
    seasonality: string;
  };
  created_at: string;
}

export interface AIBarcodeStats {
  total_suggestions: number;
  high_confidence: number;
  medium_confidence: number;
  low_confidence: number;
  categories: { name: string; count: number }[];
  confidence_trend: { date: string; avg_confidence: number }[];
  top_categories: { category: string; count: number }[];
}

export interface BarcodeOptimizationParams {
  product_name?: string;
  category?: string;
}

// KI-Inventur-Typen
export interface InventorySuggestion {
  id: string;
  product_id: string;
  product_name: string;
  current_stock: number;
  suggested_quantity: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  demand_forecast: number;
  seasonal_factor: number;
  cost_impact: number;
  reason: string;
  created_at: string;
}

export interface InventoryStats {
  total_suggestions: number;
  high_urgency_count: number;
  total_cost_impact: number;
  average_confidence: number;
  demand_forecast_total: number;
  seasonal_adjustment: number;
}

export interface InventoryOptimizationParams {
  min_stock_threshold: number;
  max_stock_threshold: number;
  urgency_weight: number;
  cost_weight: number;
  seasonal_weight: number;
}

// KI-Voucher-Typen
export interface VoucherOptimization {
  id: string;
  voucher_type: string;
  discount_percentage: number;
  target_segment: string;
  predicted_revenue: number;
  risk_score: number;
  confidence_score: number;
  seasonal_factor: number;
  customer_segments: string[];
  optimization_reason: string;
  created_at: string;
}

export interface VoucherStats {
  total_optimizations: number;
  average_revenue_prediction: number;
  average_risk_score: number;
  top_segments: Array<{
    segment: string;
    count: number;
    avg_revenue: number;
  }>;
  revenue_trends: Array<{
    month: string;
    actual: number;
    predicted: number;
  }>;
  segment_distribution: Array<{
    segment: string;
    percentage: number;
  }>;
}

export interface VoucherOptimizationParams {
  min_discount: number;
  max_discount: number;
  target_revenue: number;
  risk_tolerance: number;
  seasonal_weight: number;
  segment_weight: number;
}

// Generische API-Response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
} 