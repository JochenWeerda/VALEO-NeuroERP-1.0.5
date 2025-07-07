import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import transactionReducer from './slices/transactionSlice';
import uiReducer from './slices/uiSlice';
import { apiMiddleware } from './middleware/api';
import { errorMiddleware } from './middleware/error';
import { loggerMiddleware } from './middleware/logger';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        transactions: transactionReducer,
        ui: uiReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat([
            apiMiddleware,
            errorMiddleware,
            loggerMiddleware
        ])
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed Hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 