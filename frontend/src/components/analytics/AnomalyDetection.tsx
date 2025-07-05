import React, { useState } from 'react';
import { Card, Select, InputNumber, Button, Table, Tag, Alert } from 'antd';
import axios from 'axios';

const { Option } = Select;

interface Anomaly {
  indices: number[];
  values: number[];
  z_scores: number[];
}

interface AnomalyResponse {
  data_type: string;
  anomalies_found: boolean;
  anomalies: Record<string, Anomaly>;
  threshold_used: number;
}

export const AnomalyDetection: React.FC = () => {
  const [dataType, setDataType] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(2.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnomalyResponse | null>(null);

  const dataTypes = [
    { value: 'sales', label: 'Verkaufsdaten' },
    { value: 'inventory', label: 'Lagerbestand' },
    { value: 'production', label: 'Produktion' }
  ];

  const detectAnomalies = async () => {
    if (!dataType) {
      setError('Bitte wählen Sie einen Datentyp aus');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<AnomalyResponse>(
        `/api/analytics/anomalies/${dataType}`,
        { params: { threshold } }
      );
      setResults(response.data);
    } catch (err) {
      setError('Fehler bei der Anomalieerkennung');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Metrik',
      dataIndex: 'metric',
      key: 'metric',
    },
    {
      title: 'Anzahl Anomalien',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Durchschnittlicher Z-Score',
      dataIndex: 'avgZScore',
      key: 'avgZScore',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Status',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        const color = severity === 'high' ? 'red' : severity === 'medium' ? 'orange' : 'green';
        return <Tag color={color}>{severity.toUpperCase()}</Tag>;
      },
    },
  ];

  const getTableData = () => {
    if (!results?.anomalies) return [];

    return Object.entries(results.anomalies).map(([metric, anomaly]) => {
      const avgZScore = anomaly.z_scores.reduce((a, b) => a + b, 0) / anomaly.z_scores.length;
      return {
        key: metric,
        metric,
        count: anomaly.indices.length,
        avgZScore,
        severity: avgZScore > 3 ? 'high' : avgZScore > 2 ? 'medium' : 'low',
      };
    });
  };

  return (
    <div className="anomaly-detection">
      <Card title="Anomalieerkennung" className="anomaly-card">
        <div className="controls" style={{ marginBottom: 20 }}>
          <Select
            placeholder="Datentyp auswählen"
            style={{ width: 200, marginRight: 20 }}
            value={dataType}
            onChange={setDataType}
          >
            {dataTypes.map(type => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>

          <InputNumber
            min={1}
            max={5}
            step={0.1}
            value={threshold}
            onChange={value => setThreshold(value || 2.0)}
            style={{ width: 120, marginRight: 20 }}
            placeholder="Schwellwert"
          />

          <Button
            type="primary"
            onClick={detectAnomalies}
            loading={loading}
          >
            Anomalien erkennen
          </Button>
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

        {results && (
          <div className="results">
            <Alert
              message={
                results.anomalies_found
                  ? 'Anomalien gefunden'
                  : 'Keine Anomalien gefunden'
              }
              type={results.anomalies_found ? 'warning' : 'success'}
              showIcon
              style={{ marginBottom: 20 }}
            />

            {results.anomalies_found && (
              <Table
                columns={columns}
                dataSource={getTableData()}
                pagination={false}
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}; 