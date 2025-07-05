import axios from 'axios';
import {
    ComplianceType,
    ComplianceRecord,
    MonitoringStatus,
    MonitoringParameter,
    Measurement,
    Alert,
    AlertSettings,
    AlertSubscription,
    AlertStatistics,
    ChargenDaten,
    QualitaetsDaten,
    GMPDaten,
    EURegulatoryDaten,
    ComplianceReport,
    ComplianceParameter,
    ComplianceAlert,
    ParameterStatistics
} from '../types/compliance';

const API_BASE_URL = '/api/v1/compliance';

class ComplianceService {
    async validateBatch(
        batchId: string,
        batchData: Record<string, any>,
        complianceTypes: ComplianceType[],
        responsiblePerson: string,
        digitalSignature: string
    ): Promise<ComplianceRecord[]> {
        const response = await axios.post(`${API_BASE_URL}/batch/validate`, {
            batch_id: batchId,
            batch_data: batchData,
            compliance_types: complianceTypes,
            responsible_person: responsiblePerson,
            digital_signature: digitalSignature
        });
        return response.data;
    }
    
    async getValidationSummary(batchId: string): Promise<Record<string, any>> {
        const response = await axios.get(`${API_BASE_URL}/batch/${batchId}/summary`);
        return response.data;
    }
    
    async startMonitoring(
        batchId: string,
        parameters: Record<string, MonitoringParameter>
    ): Promise<MonitoringStatus> {
        const response = await axios.post(`${API_BASE_URL}/monitoring/start`, {
            batch_id: batchId,
            parameters
        });
        return response.data;
    }
    
    async stopMonitoring(batchId: string): Promise<void> {
        await axios.post(`${API_BASE_URL}/monitoring/${batchId}/stop`);
    }
    
    async getMonitoringStatus(batchId: string): Promise<MonitoringStatus> {
        const response = await axios.get(`${API_BASE_URL}/monitoring/${batchId}/status`);
        return response.data;
    }
    
    async addMeasurement(
        batchId: string,
        parameter: string,
        value: number
    ): Promise<Measurement> {
        const response = await axios.post(
            `${API_BASE_URL}/monitoring/${batchId}/measurement`,
            {
                parameter,
                value
            }
        );
        return response.data;
    }
    
    async configureAlerts(
        batchId: string,
        settings: AlertSettings
    ): Promise<void> {
        await axios.post(`${API_BASE_URL}/alerts/settings/${batchId}`, settings);
    }
    
    async subscribeToAlerts(
        batchId: string,
        subscription: AlertSubscription
    ): Promise<void> {
        await axios.post(`${API_BASE_URL}/alerts/subscribe/${batchId}`, subscription);
    }
    
    async getActiveAlerts(batchId: string): Promise<Alert[]> {
        const response = await axios.get(`${API_BASE_URL}/alerts/${batchId}/active`);
        return response.data;
    }
    
    async resolveAlert(
        batchId: string,
        alertId: string,
        resolvedBy: string
    ): Promise<void> {
        await axios.post(
            `${API_BASE_URL}/alerts/${batchId}/${alertId}/resolve`,
            { resolved_by: resolvedBy }
        );
    }
    
    async getAlertStatistics(batchId: string): Promise<AlertStatistics> {
        const response = await axios.get(`${API_BASE_URL}/alerts/${batchId}/statistics`);
        return response.data;
    }

    // Validierung
    validateCharge: async (daten: ChargenDaten): Promise<ComplianceReport> => {
        const response = await axios.post(`${API_BASE_URL}/validate/charge`, daten);
        return response.data;
    },

    validateQualitaet: async (daten: QualitaetsDaten): Promise<ComplianceReport> => {
        const response = await axios.post(`${API_BASE_URL}/validate/qualitaet`, daten);
        return response.data;
    },

    validateGMP: async (daten: GMPDaten): Promise<ComplianceReport> => {
        const response = await axios.post(`${API_BASE_URL}/validate/gmp`, daten);
        return response.data;
    },

    validateEURegulatory: async (daten: EURegulatoryDaten): Promise<ComplianceReport> => {
        const response = await axios.post(`${API_BASE_URL}/validate/eu`, daten);
        return response.data;
    },

    // Monitoring
    addParameterMonitoring: async (parameter: ComplianceParameter): Promise<void> => {
        await axios.post(`${API_BASE_URL}/monitor/parameter`, parameter);
    },

    getMonitoringStatus: async (): Promise<MonitoringStatus> => {
        const response = await axios.get(`${API_BASE_URL}/monitor/status`);
        return response.data;
    },

    getActiveAlerts: async (): Promise<ComplianceAlert[]> => {
        const response = await axios.get(`${API_BASE_URL}/monitor/alerts/active`);
        return response.data;
    },

    getAlertHistory: async (): Promise<ComplianceAlert[]> => {
        const response = await axios.get(`${API_BASE_URL}/monitor/alerts/history`);
        return response.data;
    },

    getParameterStatistics: async (parameterName: string): Promise<ParameterStatistics> => {
        const response = await axios.get(`${API_BASE_URL}/monitor/statistics/${parameterName}`);
        return response.data;
    },

    clearAlert: async (alertKey: string): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/monitor/alerts/${alertKey}`);
    },

    startParameterMonitoring: async (parameterName: string, interval: number = 1.0): Promise<void> => {
        await axios.post(`${API_BASE_URL}/monitor/start/${parameterName}`, { interval });
    },

    stopMonitoring: async (): Promise<void> => {
        await axios.post(`${API_BASE_URL}/monitor/stop`);
    }
};

export const complianceService = new ComplianceService(); 