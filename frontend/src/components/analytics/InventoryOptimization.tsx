import React, { useState, useEffect } from 'react';
import { Card, Spin, Alert, Table, Tag, Progress, Row, Col, Statistic } from 'antd';
import { WarningOutlined, CheckCircleOutlined, InboxOutlined } from '@ant-design/icons';
import axios from 'axios';

interface InventoryItem {
  artikel_id: string;
  artikelname: string;
  importance_score: number;
  optimal_order_quantity: number;
  current_stock: number;
  recommendation: 'nachbestellen' | 'ausreichend';
}

interface InventoryData {
  recommendations: InventoryItem[];
  total_items: number;
}

export const InventoryOptimization: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/analytics/inventory-optimization');
      setInventoryData(response.data);
    } catch (err) {
      setError('Fehler beim Laden der Lagerbestandsdaten');
      console.error('Error fetching inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  if (error) {
    return <Alert message={error} type="error" />;
  }

  const getStockStatus = (item: InventoryItem) => {
    const ratio = item.current_stock / item.optimal_order_quantity;
    if (ratio < 0.5) return 'error';
    if (ratio < 0.8) return 'warning';
    return 'success';
  };

  const columns = [
    {
      title: 'Artikel',
      dataIndex: 'artikelname',
      key: 'artikelname',
      width: '20%',
    },
    {
      title: 'Wichtigkeit',
      dataIndex: 'importance_score',
      key: 'importance_score',
      width: '15%',
      render: (score: number) => (
        <Progress
          percent={score * 100}
          size="small"
          status={score > 0.7 ? 'exception' : 'active'}
        />
      ),
      sorter: (a: InventoryItem, b: InventoryItem) => 
        a.importance_score - b.importance_score,
    },
    {
      title: 'Aktueller Bestand',
      dataIndex: 'current_stock',
      key: 'current_stock',
      width: '15%',
      render: (stock: number, record: InventoryItem) => (
        <Statistic
          value={stock}
          suffix={`/ ${Math.round(record.optimal_order_quantity)}`}
          valueStyle={{ 
            color: getStockStatus(record) === 'error' ? '#cf1322' : 
                   getStockStatus(record) === 'warning' ? '#faad14' : '#3f8600',
            fontSize: '14px'
          }}
        />
      ),
      sorter: (a: InventoryItem, b: InventoryItem) => 
        a.current_stock - b.current_stock,
    },
    {
      title: 'Optimale Bestellmenge',
      dataIndex: 'optimal_order_quantity',
      key: 'optimal_order_quantity',
      width: '15%',
      render: (value: number) => Math.round(value),
      sorter: (a: InventoryItem, b: InventoryItem) => 
        a.optimal_order_quantity - b.optimal_order_quantity,
    },
    {
      title: 'Status',
      dataIndex: 'recommendation',
      key: 'recommendation',
      width: '15%',
      render: (recommendation: string) => (
        <Tag color={recommendation === 'nachbestellen' ? 'error' : 'success'}>
          {recommendation === 'nachbestellen' ? (
            <><WarningOutlined /> Nachbestellen</>
          ) : (
            <><CheckCircleOutlined /> Ausreichend</>
          )}
        </Tag>
      ),
      filters: [
        { text: 'Nachbestellen', value: 'nachbestellen' },
        { text: 'Ausreichend', value: 'ausreichend' },
      ],
      onFilter: (value: string, record: InventoryItem) => 
        record.recommendation === value,
    },
  ];

  const criticalItems = inventoryData?.recommendations.filter(
    item => item.recommendation === 'nachbestellen'
  ) || [];

  return (
    <div className="inventory-optimization">
      <Card title="Lagerbestandsoptimierung">
        <Spin spinning={loading}>
          <Row gutter={16} className="mb-4">
            <Col span={8}>
              <Card>
                <Statistic
                  title="Gesamtartikel"
                  value={inventoryData?.total_items || 0}
                  prefix={<InboxOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Kritische Artikel"
                  value={criticalItems.length}
                  valueStyle={{ color: criticalItems.length > 0 ? '#cf1322' : '#3f8600' }}
                  prefix={<WarningOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Optimierungspotenzial"
                  value={criticalItems.length / (inventoryData?.total_items || 1) * 100}
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Artikelübersicht">
            <Table
              dataSource={inventoryData?.recommendations || []}
              columns={columns}
              size="middle"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </Card>
        </Spin>
      </Card>
    </div>
  );
};

export default InventoryOptimization; 