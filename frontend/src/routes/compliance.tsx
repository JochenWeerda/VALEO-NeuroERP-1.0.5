import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ComplianceValidation from '../components/compliance/ComplianceValidation';
import BatchMonitoring from '../components/compliance/BatchMonitoring';
import ComplianceStatistics from '../components/compliance/ComplianceStatistics';
import AlertManagement from '../components/compliance/AlertManagement';

const ComplianceRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="validation" element={<ComplianceValidation />} />
            <Route path="monitoring/:batchId" element={<BatchMonitoring />} />
            <Route path="statistics/:batchId" element={<ComplianceStatistics />} />
            <Route path="alerts/:batchId" element={<AlertManagement />} />
        </Routes>
    );
};

export default ComplianceRoutes; 