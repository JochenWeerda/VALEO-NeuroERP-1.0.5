import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
    loginStart,
    loginSuccess,
    loginFailure,
    logout
} from '../slices/authSlice';
import transactionReducer, {
    fetchTransactionsStart,
    fetchTransactionsSuccess,
    fetchTransactionsFailure
} from '../slices/transactionSlice';
import uiReducer, {
    setTheme,
    addNotification,
    openModal
} from '../slices/uiSlice';

describe('Redux Store', () => {
    const store = configureStore({
        reducer: {
            auth: authReducer,
            transactions: transactionReducer,
            ui: uiReducer
        }
    });
    
    describe('Auth Slice', () => {
        it('should handle login flow', () => {
            // Initial State
            expect(store.getState().auth.loading).toBe(false);
            expect(store.getState().auth.user).toBeNull();
            expect(store.getState().auth.error).toBeNull();
            
            // Login Start
            store.dispatch(loginStart());
            expect(store.getState().auth.loading).toBe(true);
            expect(store.getState().auth.error).toBeNull();
            
            // Login Success
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
                role: 'user'
            };
            store.dispatch(loginSuccess({
                user: mockUser,
                token: 'test-token'
            }));
            expect(store.getState().auth.loading).toBe(false);
            expect(store.getState().auth.user).toEqual(mockUser);
            expect(store.getState().auth.token).toBe('test-token');
            expect(store.getState().auth.error).toBeNull();
            
            // Logout
            store.dispatch(logout());
            expect(store.getState().auth.user).toBeNull();
            expect(store.getState().auth.token).toBeNull();
            expect(store.getState().auth.error).toBeNull();
        });
        
        it('should handle login failure', () => {
            store.dispatch(loginStart());
            store.dispatch(loginFailure('Invalid credentials'));
            
            expect(store.getState().auth.loading).toBe(false);
            expect(store.getState().auth.error).toBe('Invalid credentials');
            expect(store.getState().auth.user).toBeNull();
        });
    });
    
    describe('Transaction Slice', () => {
        it('should handle fetch transactions flow', () => {
            // Initial State
            expect(store.getState().transactions.loading).toBe(false);
            expect(store.getState().transactions.items).toEqual([]);
            
            // Fetch Start
            store.dispatch(fetchTransactionsStart());
            expect(store.getState().transactions.loading).toBe(true);
            expect(store.getState().transactions.error).toBeNull();
            
            // Fetch Success
            const mockTransactions = [
                {
                    id: '1',
                    amount: 100,
                    description: 'Test Transaction',
                    category: 'test',
                    date: '2024-01-01',
                    status: 'completed'
                }
            ];
            store.dispatch(fetchTransactionsSuccess({
                items: mockTransactions,
                total: 1
            }));
            expect(store.getState().transactions.loading).toBe(false);
            expect(store.getState().transactions.items).toEqual(mockTransactions);
            expect(store.getState().transactions.pagination.total).toBe(1);
            
            // Fetch Failure
            store.dispatch(fetchTransactionsStart());
            store.dispatch(fetchTransactionsFailure('Network error'));
            expect(store.getState().transactions.loading).toBe(false);
            expect(store.getState().transactions.error).toBe('Network error');
        });
    });
    
    describe('UI Slice', () => {
        it('should handle theme changes', () => {
            const mockTheme = {
                mode: 'dark' as const,
                primaryColor: '#000000',
                secondaryColor: '#ffffff'
            };
            
            store.dispatch(setTheme(mockTheme));
            expect(store.getState().ui.theme).toEqual(mockTheme);
        });
        
        it('should handle notifications', () => {
            const mockNotification = {
                id: '1',
                type: 'success' as const,
                message: 'Test notification'
            };
            
            store.dispatch(addNotification(mockNotification));
            expect(store.getState().ui.notifications).toContainEqual(
                mockNotification
            );
        });
        
        it('should handle modal state', () => {
            store.dispatch(openModal({
                type: 'test-modal',
                data: { test: true }
            }));
            
            expect(store.getState().ui.modal.isOpen).toBe(true);
            expect(store.getState().ui.modal.type).toBe('test-modal');
            expect(store.getState().ui.modal.data).toEqual({ test: true });
        });
    });
}); 