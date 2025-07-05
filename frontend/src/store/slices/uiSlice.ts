import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  notifications: {
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  };
}

const initialState: UIState = {
  sidebarOpen: true,
  darkMode: false,
  notifications: {
    open: false,
    message: '',
    severity: 'info',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    showNotification: (
      state,
      action: PayloadAction<{
        message: string;
        severity: 'success' | 'info' | 'warning' | 'error';
      }>
    ) => {
      state.notifications = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity,
      };
    },
    hideNotification: (state) => {
      state.notifications.open = false;
    },
  },
});

export const {
  toggleSidebar,
  toggleDarkMode,
  showNotification,
  hideNotification,
} = uiSlice.actions;

export default uiSlice.reducer; 