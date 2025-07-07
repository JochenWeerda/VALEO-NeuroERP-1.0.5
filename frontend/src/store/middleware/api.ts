import { Middleware } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../index';
import { refreshToken, logout } from '../slices/authSlice';
import { addNotification } from '../slices/uiSlice';

// Axios Instance
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 10000
});

// API Middleware
export const apiMiddleware: Middleware<{}, RootState> = store => next => async action => {
    // Wenn keine API Action, weiterleiten
    if (!action.meta?.api) {
        return next(action);
    }
    
    const { url, method = 'GET', data, onSuccess, onError } = action.meta.api;
    const state = store.getState();
    
    try {
        // Token aus State holen
        const token = state.auth.token;
        
        // Request Headers
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        
        // API Request ausführen
        const response = await api.request({
            url,
            method,
            data,
            headers
        });
        
        // Success Action dispatchen
        if (onSuccess) {
            store.dispatch(onSuccess(response.data));
        }
        
        return response.data;
        
    } catch (error) {
        // Error handling
        if (axios.isAxiosError(error)) {
            // Token abgelaufen
            if (error.response?.status === 401) {
                try {
                    // Token erneuern
                    const refreshResponse = await api.post('/auth/refresh', {
                        token: state.auth.token
                    });
                    
                    // Neuen Token speichern
                    store.dispatch(refreshToken(refreshResponse.data.token));
                    
                    // Request wiederholen
                    const retryResponse = await api.request({
                        url,
                        method,
                        data,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${refreshResponse.data.token}`
                        }
                    });
                    
                    // Success Action dispatchen
                    if (onSuccess) {
                        store.dispatch(onSuccess(retryResponse.data));
                    }
                    
                    return retryResponse.data;
                    
                } catch (refreshError) {
                    // Bei Refresh Error ausloggen
                    store.dispatch(logout());
                    store.dispatch(addNotification({
                        id: Date.now().toString(),
                        type: 'error',
                        message: 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.'
                    }));
                }
            }
            
            // Error Action dispatchen
            if (onError) {
                store.dispatch(onError(error.response?.data?.message || 'Ein Fehler ist aufgetreten'));
            }
            
            // Error Notification anzeigen
            store.dispatch(addNotification({
                id: Date.now().toString(),
                type: 'error',
                message: error.response?.data?.message || 'Ein Fehler ist aufgetreten'
            }));
        }
        
        throw error;
    }
}; 