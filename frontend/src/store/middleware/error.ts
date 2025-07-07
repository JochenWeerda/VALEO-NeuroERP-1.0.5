import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { addNotification } from '../slices/uiSlice';

// Error Actions identifizieren
const isErrorAction = (action: any): boolean => {
    return action.type.endsWith('Failure') || action.type.endsWith('Error');
};

// Error Middleware
export const errorMiddleware: Middleware<{}, RootState> = store => next => action => {
    // Wenn Error Action
    if (isErrorAction(action)) {
        // Error Message extrahieren
        const errorMessage = action.payload || 'Ein unbekannter Fehler ist aufgetreten';
        
        // Error Notification anzeigen
        store.dispatch(addNotification({
            id: Date.now().toString(),
            type: 'error',
            message: errorMessage,
            duration: 5000
        }));
        
        // Error loggen
        console.error('Error Action:', {
            type: action.type,
            payload: action.payload,
            timestamp: new Date().toISOString()
        });
    }
    
    return next(action);
}; 