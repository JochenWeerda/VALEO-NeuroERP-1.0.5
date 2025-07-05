import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/alerts`
});

// Alert-Management
export const getActiveAlerts = async () => {
  const response = await api.get('/active');
  return response.data;
};

export const resolveAlert = async (alertId: string) => {
  const response = await api.post(`/${alertId}/resolve`);
  return response.data;
};

export const updateAlertSettings = async (settings: {
  temperature: {
    min: number;
    max: number;
  };
  humidity: {
    min: number;
    max: number;
  };
  notification_method: string;
  emergency_contact: string;
}) => {
  const response = await api.put('/settings', settings);
  return response.data;
};

export const getAlertHistory = async (params?: {
  batch_id?: string;
  start_date?: Date;
  end_date?: Date;
  severity?: string;
}) => {
  const response = await api.get('/history', { params });
  return response.data;
};

export const subscribeToAlerts = async (subscription: {
  email?: string;
  phone?: string;
  notification_types: string[];
}) => {
  const response = await api.post('/subscriptions', subscription);
  return response.data;
};

export const unsubscribeFromAlerts = async (subscriptionId: string) => {
  const response = await api.delete(`/subscriptions/${subscriptionId}`);
  return response.data;
};

export const getAlertStatistics = async (params?: {
  start_date?: Date;
  end_date?: Date;
  batch_id?: string;
}) => {
  const response = await api.get('/statistics', { params });
  return response.data;
}; 