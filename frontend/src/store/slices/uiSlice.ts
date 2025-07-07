import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
}

export interface ModalState {
    isOpen: boolean;
    type: string | null;
    data?: any;
}

export interface Theme {
    mode: 'light' | 'dark';
    primaryColor: string;
    secondaryColor: string;
}

export interface UIState {
    theme: Theme;
    notifications: Notification[];
    modal: ModalState;
    sidebarOpen: boolean;
    loading: {
        [key: string]: boolean;
    };
}

const initialState: UIState = {
    theme: {
        mode: 'light',
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e'
    },
    notifications: [],
    modal: {
        isOpen: false,
        type: null,
        data: null
    },
    sidebarOpen: true,
    loading: {}
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<Theme>) => {
            state.theme = action.payload;
        },
        toggleThemeMode: (state) => {
            state.theme.mode = state.theme.mode === 'light' ? 'dark' : 'light';
        },
        addNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications.push(action.payload);
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(
                notification => notification.id !== action.payload
            );
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
        openModal: (
            state,
            action: PayloadAction<{ type: string; data?: any }>
        ) => {
            state.modal = {
                isOpen: true,
                type: action.payload.type,
                data: action.payload.data
            };
        },
        closeModal: (state) => {
            state.modal = {
                isOpen: false,
                type: null,
                data: null
            };
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.sidebarOpen = action.payload;
        },
        setLoading: (
            state,
            action: PayloadAction<{ key: string; loading: boolean }>
        ) => {
            state.loading[action.payload.key] = action.payload.loading;
        }
    }
});

export const {
    setTheme,
    toggleThemeMode,
    addNotification,
    removeNotification,
    clearNotifications,
    openModal,
    closeModal,
    toggleSidebar,
    setSidebarOpen,
    setLoading
} = uiSlice.actions;

export default uiSlice.reducer; 