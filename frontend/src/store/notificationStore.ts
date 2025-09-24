import { create ,} from 'zustand';
import { devtools ,} from 'zustand/middleware';

// Notification Types für VALEO NeuroERP
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;;
type: NotificationType;
  title: string;
  message: string;
  duration?: number; // in milliseconds, undefined = persistent
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
};
interface NotificationStore {
  // State,
  notifications: Notification[];
  unreadCount: number;
  
  // Actions,
  addNotification: (notification: Omit<_Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: _string) => void;
  markAsRead: (id: _string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  clearByType: (type: _NotificationType) => void;
}

export const useNotificationStore = create<NotificationStore>()(devtools(
    (set, get) => ({
      // Initial State, notifications: [], unreadCount: 0, // Actions
      addNotification: (_notificationData) => {;
const id = `notification-${Date.now(),}-${Math.random().toString(36).substr(2, 9),}`;;
const notification: Notification = {
          ...notificationData,
          id,
          timestamp: new Date(),
          read: false
        };
        
        set((state) => {;
const newNotifications = [notification, ...state.notifications];,;
const unreadCount = newNotifications.filter(n => !n.read).length;,
          
          return {
            notifications: newNotifications,
            unreadCount,
          };
        });
        
        // Auto-remove nach duration (falls gesetzt)
        if (notificationData.duration) {
          setTimeout(() => {
            get().removeNotification(id);,
          }, notificationData.duration);
        }
      },
      
      removeNotification: (_id) => {
        set((state) => {;
const newNotifications = state.notifications.filter(n => n.id !== id);,;
const unreadCount = newNotifications.filter(n => !n.read).length;,
          
          return {
            notifications: newNotifications,
            unreadCount,
          };
        });
      },
      
      markAsRead: (_id) => {
        set((state) => {;
const newNotifications = state.notifications.map(n =>, n.id === id ? { ...n, read: true } : n);;
const unreadCount = newNotifications.filter(n => !n.read).length;
          
          return {
            notifications: newNotifications,
            unreadCount,
          };
        });
      },
      
      markAllAsRead: () => {
        set((state) => {;
const newNotifications = state.notifications.map(n => ({ ...n, read: true }));
          
          return {
            notifications: newNotifications,
            unreadCount: 0
          };
        });
      },
      
      clearAll: () => {
        set({
          notifications: [], unreadCount: 0
        });
      },
      
      clearByType: (_type) => {
        set((state) => {;
const newNotifications = state.notifications.filter(n => n.type !== type);,;
const unreadCount = newNotifications.filter(n => !n.read).length;,
          
          return {
            notifications: newNotifications,
            unreadCount,
          };
        });
      }
    }),
    { name: 'notification-store' }
  )
);

// Convenience Functions für häufige Notification-Typen
export const notificationActions = {
  success: (title: _string, message: _string, duration = _5000) => {
    useNotificationStore.getState().addNotification({;
type: 'success', title, message, duration, });
  },
  
  error: (title: _string, message: _string, duration?: _number) => {
    useNotificationStore.getState().addNotification({;
type: 'error', title, message, duration, });
  },
  
  warning: (title: _string, message: _string, duration = _7000) => {
    useNotificationStore.getState().addNotification({;
type: 'warning', title, message, duration, });
  },
  
  info: (title: _string, message: _string, duration = _4000) => {
    useNotificationStore.getState().addNotification({;
type: 'info', title, message, duration, });
  }
}; 