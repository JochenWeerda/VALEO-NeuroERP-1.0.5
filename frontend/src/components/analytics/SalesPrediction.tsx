import React, { useState, useEffect } from 'react';
import { Card, Select, Spin, Alert } from 'antd';
import { Line } from '@ant-design/charts';
import axios from 'axios';

const { Option } = Select;

interface SalesPrediction {
  date: string;
  predicted_sales: number;
}

interface ModelMetrics {
  r2_score: number;
  rmse: number;
}

interface PredictionResponse {
  forecast: SalesPrediction[];
  model_metrics: ModelMetrics;
}

export const SalesPrediction: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [predictions, setPredictions] = useState<PredictionResponse | null>(null);

  useEffect(() => {
    // Produkte laden
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
      } catch (err) {
        setError('Fehler beim Laden der Produkte');
      }
    };
    fetchProducts();
  }, []);

  const fetchPredictions = async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<PredictionResponse>(
        `/api/analytics/sales-prediction/${productId}`
      );
      setPredictions(response.data);
    } catch (err) {
      setError('Fehler beim Laden der Prognosen');
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (value: string) => {
    setSelectedProduct(value);
    fetchPredictions(value);
  };

  const config = {
    data: predictions?.forecast || [],
    xField: 'date',
    yField: 'predicted_sales',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  return (
    <div className="sales-prediction">
      <Card title="Verkaufsprognose" className="prediction-card">
        <div className="product-selector">
          <Select
            placeholder="Produkt auswählen"
            style={{ width: 300, marginBottom: 20 }}
            onChange={handleProductChange}
            value={selectedProduct}
          >
            {products.map((product) => (
              <Option key={product.id} value={product.id}>
                {product.name}
              </Option>
            ))}
          </Select>
        </div>

        {error && (
          <Alert
            message="Fehler"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          predictions && (
            <>
              <Card
                type="inner"
                title="Modell-Metriken"
                style={{ marginBottom: 20 }}
              >
                <div className="metrics-container">
                  <div className="metric">
                    <span className="metric-label">R² Score:</span>
                    <span className="metric-value">
                      {(predictions.model_metrics.r2_score * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">RMSE:</span>
                    <span className="metric-value">
                      {predictions.model_metrics.rmse.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>

              <Card type="inner" title="Prognosediagramm">
                <Line {...config} />
              </Card>
            </>
          )
        )}
      </Card>
    </div>
  );
}; 