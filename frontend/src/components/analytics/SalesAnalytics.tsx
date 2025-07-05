import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Spin, Alert, Row, Col, Statistic } from 'antd';
import { Line } from '@ant-design/charts';
import { EuroOutlined, ShoppingOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { RangePicker } = DatePicker;

interface SalesData {
  zeitreihe: Array<{
    _id: { year: number; month: number };
    umsatz: number;
    anzahl: number;
  }>;
  gesamt_umsatz: number;
  durchschnitt_pro_monat: number;
}

export const SalesAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [dateRange, setDateRange] = useState([
    moment().subtract(6, 'months'),
    moment()
  ]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/analytics/sales', {
        params: {
          start_date: dateRange[0].toISOString(),
          end_date: dateRange[1].toISOString()
        }
      });
      
      setSalesData(response.data);
    } catch (err) {
      setError('Fehler beim Laden der Verkaufsdaten');
      console.error('Error fetching sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [dateRange]);

  if (error) {
    return <Alert message={error} type="error" />;
  }

  const chartData = salesData?.zeitreihe.map(item => ({
    datum: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    umsatz: item.umsatz,
    anzahl: item.anzahl
  })) || [];

  return (
    <div className="sales-analytics">
      <Card title="Verkaufsanalyse" extra={
        <RangePicker 
          value={dateRange}
          onChange={(dates) => dates && setDateRange(dates)}
        />
      }>
        <Spin spinning={loading}>
          <Row gutter={16} className="mb-4">
            <Col span={12}>
              <Card>
                <Statistic
                  title="Gesamtumsatz"
                  value={salesData?.gesamt_umsatz || 0}
                  prefix={<EuroOutlined />}
                  precision={2}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic
                  title="Durchschnittlicher Monatsumsatz"
                  value={salesData?.durchschnitt_pro_monat || 0}
                  prefix={<ShoppingOutlined />}
                  precision={2}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Umsatzentwicklung">
            <Line
              data={chartData}
              xField="datum"
              yField="umsatz"
              seriesField="type"
              point={{
                size: 5,
                shape: 'diamond',
              }}
              label={{
                style: {
                  fill: '#aaa',
                },
              }}
            />
          </Card>
        </Spin>
      </Card>
    </div>
  );
};

export default SalesAnalytics; 