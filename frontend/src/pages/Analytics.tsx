import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import { 
  LineChartOutlined, 
  UserOutlined, 
  InboxOutlined,
  RiseOutlined,
  MessageOutlined,
  AlertOutlined
} from '@ant-design/icons';
import SalesAnalytics from '../components/analytics/SalesAnalytics';
import CustomerSegments from '../components/analytics/CustomerSegments';
import InventoryOptimization from '../components/analytics/InventoryOptimization';
import SalesPrediction from '../components/analytics/SalesPrediction';
import CustomerFeedback from '../components/analytics/CustomerFeedback';
import AnomalyDetection from '../components/analytics/AnomalyDetection';

const { TabPane } = Tabs;

export const Analytics: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1');

  return (
    <div className="analytics-page">
      <Card title="VALEO NeuroERP Analytics" className="analytics-container">
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          type="card"
          size="large"
          className="analytics-tabs"
        >
          <TabPane
            tab={
              <span>
                <LineChartOutlined />
                Verkaufsanalyse
              </span>
            }
            key="1"
          >
            <SalesAnalytics />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <UserOutlined />
                Kundensegmente
              </span>
            }
            key="2"
          >
            <CustomerSegments />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <InboxOutlined />
                Lageroptimierung
              </span>
            }
            key="3"
          >
            <InventoryOptimization />
          </TabPane>

          <TabPane
            tab={
              <span>
                <RiseOutlined />
                Verkaufsprognose
              </span>
            }
            key="4"
          >
            <SalesPrediction />
          </TabPane>

          <TabPane
            tab={
              <span>
                <MessageOutlined />
                Kundenfeedback
              </span>
            }
            key="5"
          >
            <CustomerFeedback />
          </TabPane>

          <TabPane
            tab={
              <span>
                <AlertOutlined />
                Anomalieerkennung
              </span>
            }
            key="6"
          >
            <AnomalyDetection />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Analytics; 