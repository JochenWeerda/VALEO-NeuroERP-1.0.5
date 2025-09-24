import { create ,} from 'zustand';
import { devtools ,} from 'zustand/middleware';

// App State Types für VALEO NeuroERP;
interface AppState {
  // UI State,
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  loadingOverlay: boolean;
  currentPage: string;
  
  // Feature Flags,
  features: {
    aiAssistant: boolean;
    advancedAnalytics: boolean;
    realTimeNotifications: boolean;
    darkMode: boolean;
    multiLanguage: boolean;
  };
  
  // System State
  isOnline: boolean;
  lastSync: Date | null;
  maintenanceMode: boolean;
};
interface AppStore extends AppState {
  // Actions,
  toggleSidebar: () => void;
  setSidebarOpen: (open: _boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: _boolean) => void;
  setLoadingOverlay: (loading: _boolean) => void;
  setCurrentPage: (page: _string) => void;
  toggleFeature: (feature: keyof AppState['features']) => void;
  setFeature: (feature: keyof AppState['features'], enabled: _boolean) => void;
  setOnlineStatus: (online: _boolean) => void;
  setLastSync: (date: _Date) => void;
  setMaintenanceMode: (mode: _boolean) => void;
  resetAppState: () => void;
}

// Default App State;
const defaultAppState: AppState = {
  sidebarOpen: true,
  mobileMenuOpen: false,
  loadingOverlay: false,
  currentPage: 'dashboard',
  features: {
    aiAssistant: true,
    advancedAnalytics: true,
    realTimeNotifications: true,
    darkMode: true,
    multiLanguage: true
  },
  isOnline: navigator.onLine,
  lastSync: null,
  maintenanceMode: false
};

export const useAppStore = create<AppStore>()(devtools(
    (set, get) => ({
      ...defaultAppState, // Actions, toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },
      
      setSidebarOpen: (_open) => {
        set({ sidebarOpen: open });
      },
      
      toggleMobileMenu: () => {
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen }));
      },
      
      setMobileMenuOpen: (_open) => {
        set({ mobileMenuOpen: open });
      },
      
      setLoadingOverlay: (_loading) => {
        set({ loadingOverlay: loading });
      },
      
      setCurrentPage: (_page) => {
        set({ currentPage: page });
      },
      
      toggleFeature: (_feature) => {
        set((state) => ({
          features: {
            ...state.features, [feature]: !state.features[feature]
          }
        }));
      },
      
      setFeature: (_feature, _enabled) => {
        set((state) => ({
          features: {
            ...state.features, [feature]: enabled
          }
        }));
      },
      
      setOnlineStatus: (_online) => {
        set({ isOnline: online });
      },
      
      setLastSync: (_date) => {
        set({ lastSync: date });
      },
      
      setMaintenanceMode: (_mode) => {
        set({ maintenanceMode: mode });
      },
      
      resetAppState: () => {
        set(defaultAppState);,
      }
    }),
    { name: 'app-store' }
  )
);

// Online/Offline Event Listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAppStore.getState().setOnlineStatus(true);,
  });
  
  window.addEventListener('offline', () => {
    useAppStore.getState().setOnlineStatus(false);,
  });
} 