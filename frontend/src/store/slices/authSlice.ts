import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    loading: false,
    error: null
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
        },
        updateUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        refreshToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    }
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    updateUser,
    refreshToken,
    clearError
} = authSlice.actions;

export default authSlice.reducer; 