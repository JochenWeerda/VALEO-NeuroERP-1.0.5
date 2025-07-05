import axios from 'axios';
import { API_BASE_URL } from '../config';
import api from './api';

// Enums, die mit dem Backend übereinstimmen
export enum NotificationType {
  EMAIL = "Email",
  SMS = "SMS",
  PUSH = "Push-Benachrichtigung",
  IN_APP = "In-App-Benachrichtigung"
}

export enum NotificationPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

// Typdefinitionen für Benachrichtigungseinstellungen
export interface NotificationSetting {
  id?: number;
  user_id: number;
  notification_type: 'Email' | 'SMS' | 'Push-Benachrichtigung' | 'In-App-Benachrichtigung';
  is_enabled: boolean;
  for_emergency_creation: boolean;
  for_emergency_update: boolean;
  for_emergency_escalation: boolean;
  for_emergency_resolution: boolean;
  minimum_severity: string;
  minimum_escalation_level: string;
  contact_information?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationSettingCreate {
  user_id: number;
  notification_type: NotificationType;
  is_enabled?: boolean;
  for_emergency_creation?: boolean;
  for_emergency_update?: boolean;
  for_emergency_escalation?: boolean;
  for_emergency_resolution?: boolean;
  minimum_severity?: string;
  minimum_escalation_level?: string;
  contact_information?: string;
}

export interface NotificationSettingUpdate {
  is_enabled?: boolean;
  for_emergency_creation?: boolean;
  for_emergency_update?: boolean;
  for_emergency_escalation?: boolean;
  for_emergency_resolution?: boolean;
  minimum_severity?: string;
  minimum_escalation_level?: string;
  contact_information?: string;
}

// Typdefinitionen für Benachrichtigungslogs
export interface NotificationLog {
  id: number;
  user_id: number;
  notification_type: string;
  content: string;
  priority: string;
  related_entity_type?: string;
  related_entity_id?: number;
  is_sent: boolean;
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

// Typdefinitionen für In-App-Benachrichtigungen
export interface InAppNotification {
  id: number;
  title: string;
  message: string;
  priority: string;
  related_entity_type?: string;
  related_entity_id?: number;
  is_read: boolean;
  created_at: string;
}

// Typdefinition für Benachrichtigungsstatistiken
export interface NotificationStats {
  total_count: number;
  sent_count: number;
  failed_count: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
  by_day: Array<{
    date: string;
    count: number;
  }>;
}

// Typdefinition für gruppierte Benachrichtigungen
export interface NotificationGroup {
  entity_type: string;
  entity_id: number;
  latest_notification: NotificationLog;
  count: number;
  latest_timestamp: string;
}

export interface EmailConfig {
  provider: string;
  smtp?: {
    server: string;
    port: number;
    username: string;
    password: string;
    use_tls: boolean;
    from_email: string;
    from_name: string;
  };
  sendgrid?: {
    api_key: string;
    from_email: string;
    from_name: string;
  };
  mailgun?: {
    api_key: string;
    domain: string;
    from_email: string;
    from_name: string;
  };
}

export interface SMSConfig {
  provider: string;
  twilio?: {
    account_sid: string;
    auth_token: string;
    from_number: string;
  };
  vonage?: {
    api_key: string;
    api_secret: string;
    from_number: string;
  };
  messagebird?: {
    api_key: string;
    from_number: string;
  };
}

// API-Service für Benachrichtigungen
class NotificationService {
  private baseUrl = `${API_BASE_URL}/api/v1/notifications`;

  // Benachrichtigungseinstellungen-Methoden
  async getNotificationSettings(params?: { user_id?: number; notification_type?: string; is_enabled?: boolean }) {
    return api.get('/api/v1/notifications/settings', { params });
  }

  async getNotificationSettingById(id: number) {
    return api.get(`/api/v1/notifications/settings/${id}`);
  }

  async createNotificationSetting(setting: NotificationSetting) {
    return api.post('/api/v1/notifications/settings', setting);
  }

  async updateNotificationSetting(id: number, setting: Partial<NotificationSetting>) {
    return api.put(`/api/v1/notifications/settings/${id}`, setting);
  }

  async deleteNotificationSetting(id: number) {
    return api.delete(`/api/v1/notifications/settings/${id}`);
  }

  // Benachrichtigungslogs-Methoden
  async getNotificationLogs(params?: { 
    user_id?: number; 
    notification_type?: string; 
    entity_type?: string;
    entity_id?: number;
    is_sent?: boolean;
    limit?: number;
    offset?: number;
  }) {
    return api.get('/api/v1/notifications/logs', { params });
  }

  async getNotificationLogById(id: number) {
    return api.get(`/api/v1/notifications/logs/${id}`);
  }

  // In-App-Benachrichtigungen-Methoden
  async getInAppNotifications(params: { 
    user_id: number; 
    unread_only?: boolean;
    limit?: number;
    offset?: number;
  }) {
    return api.get('/api/v1/notifications/in-app', { params });
  }

  async updateInAppNotification(id: number, data: { is_read?: boolean }) {
    return api.put(`/api/v1/notifications/in-app/${id}`, data);
  }

  async markAllNotificationsAsRead(user_id: number) {
    return api.post('/api/v1/notifications/in-app/mark-all-read', null, {
      params: { user_id }
    });
  }

  // Statistik-Methoden
  async getNotificationStats(params?: { user_id?: number; days?: number }) {
    return api.get('/api/v1/notifications/stats', { params });
  }

  // Gruppierungs-Methoden
  async getGroupedNotifications(params: { user_id: number; limit?: number }) {
    return api.get('/api/v1/notifications/grouped', { params });
  }

  // Test-Methoden
  async sendTestNotification(user_id: number, notification_type: string) {
    return api.post('/api/v1/notifications/test', { user_id, notification_type });
  }

  // E-Mail-Konfiguration
  async getEmailConfig() {
    return api.get<EmailConfig>('/api/v1/notifications/config/email');
  }

  async updateEmailConfig(config: EmailConfig) {
    return api.put<EmailConfig>('/api/v1/notifications/config/email', config);
  }

  async testEmailNotification(data: { to_email: string; subject?: string; body?: string }) {
    return api.post('/api/v1/notifications/test/email', data);
  }

  // SMS-Konfiguration
  async getSMSConfig() {
    return api.get<SMSConfig>('/api/v1/notifications/config/sms');
  }

  async updateSMSConfig(config: SMSConfig) {
    return api.put<SMSConfig>('/api/v1/notifications/config/sms', config);
  }

  async testSMSNotification(data: { to_number: string; message?: string; country_code?: string }) {
    return api.post('/api/v1/notifications/test/sms', data);
  }
}

export default new NotificationService(); 