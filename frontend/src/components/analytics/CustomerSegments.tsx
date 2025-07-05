import React, { useState, useEffect } from 'react';
import { Card, Spin, Alert, Table, Tag, Row, Col, Statistic } from 'antd';
import { Pie } from '@ant-design/charts';
import { UserOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Segment {
  segment_id: number;
  anzahl_kunden: number;
  durchschnittlicher_jahresumsatz: number;
  durchschnittliche_bestellhaeufigkeit: number;
  durchschnittlicher_bestellwert: number;
}

interface SegmentData {
  segments: Segment[];
  total_customers: number;
}

const segmentColors = ['#1890ff', '#52c41a', '#faad14', '#f5222d'];
const segmentNames = ['Premium', 'Standard', 'Gelegentlich', 'Selten'];

export const CustomerSegments: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [segmentData, setSegmentData] = useState<SegmentData | null>(null);

  const fetchSegmentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/analytics/customer-segments');
      setSegmentData(response.data);
    } catch (err) {
      setError('Fehler beim Laden der Kundensegmente');
      console.error('Error fetching segment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegmentData();
  }, []);

  if (error) {
    return <Alert message={error} type="error" />;
  }

  const columns = [
    {
      title: 'Segment',
      dataIndex: 'segment_id',
      key: 'segment_id',
      render: (id: number) => (
        <Tag color={segmentColors[id]}>{segmentNames[id]}</Tag>
      ),
    },
    {
      title: 'Anzahl Kunden',
      dataIndex: 'anzahl_kunden',
      key: 'anzahl_kunden',
      sorter: (a: Segment, b: Segment) => a.anzahl_kunden - b.anzahl_kunden,
    },
    {
      title: 'Ø Jahresumsatz',
      dataIndex: 'durchschnittlicher_jahresumsatz',
      key: 'jahresumsatz',
      render: (value: number) => `€${value.toFixed(2)}`,
      sorter: (a: Segment, b: Segment) => 
        a.durchschnittlicher_jahresumsatz - b.durchschnittlicher_jahresumsatz,
    },
    {
      title: 'Ø Bestellhäufigkeit',
      dataIndex: 'durchschnittliche_bestellhaeufigkeit',
      key: 'bestellhaeufigkeit',
      render: (value: number) => value.toFixed(1),
      sorter: (a: Segment, b: Segment) => 
        a.durchschnittliche_bestellhaeufigkeit - b.durchschnittliche_bestellhaeufigkeit,
    },
    {
      title: 'Ø Bestellwert',
      dataIndex: 'durchschnittlicher_bestellwert',
      key: 'bestellwert',
      render: (value: number) => `€${value.toFixed(2)}`,
      sorter: (a: Segment, b: Segment) => 
        a.durchschnittlicher_bestellwert - b.durchschnittlicher_bestellwert,
    },
  ];

  const pieData = segmentData?.segments.map((segment, index) => ({
    type: segmentNames[segment.segment_id],
    value: segment.anzahl_kunden,
    color: segmentColors[index],
  })) || [];

  return (
    <div className="customer-segments">
      <Card title="Kundensegmentierung">
        <Spin spinning={loading}>
          <Row gutter={16} className="mb-4">
            <Col span={12}>
              <Card>
                <Statistic
                  title="Gesamtanzahl Kunden"
                  value={segmentData?.total_customers || 0}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic
                  title="Aktive Segmente"
                  value={segmentData?.segments.length || 0}
                  prefix={<ShoppingCartOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Card title="Segmentverteilung">
                <Pie
                  data={pieData}
                  angleField="value"
                  colorField="type"
                  radius={0.8}
                  label={{
                    type: 'outer',
                    content: '{name} {percentage}',
                  }}
                  interactions={[
                    {
                      type: 'element-active',
                    },
                  ]}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Segmentdetails">
                <Table
                  dataSource={segmentData?.segments || []}
                  columns={columns}
                  size="small"
                  pagination={false}
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      </Card>
    </div>
  );
};

export default CustomerSegments; 