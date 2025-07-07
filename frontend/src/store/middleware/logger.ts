import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Logger Middleware
export const loggerMiddleware: Middleware<{}, RootState> = store => next => action => {
    // Nur im Development Mode loggen
    if (process.env.NODE_ENV === 'development') {
        console.group(`Action: ${action.type}`);
        
        // Vorheriger State
        console.log('Previous State:', store.getState());
        
        // Action
        console.log('Action:', action);
        
        // Action ausführen
        const result = next(action);
        
        // Neuer State
        console.log('Next State:', store.getState());
        
        console.groupEnd();
        
        return result;
    }
    
    return next(action);
}; 