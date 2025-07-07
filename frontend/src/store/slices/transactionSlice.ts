import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    status: 'pending' | 'completed' | 'failed';
}

export interface TransactionFilter {
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
}

export interface TransactionPagination {
    page: number;
    limit: number;
    total: number;
}

export interface TransactionState {
    items: Transaction[];
    selectedTransaction: Transaction | null;
    filter: TransactionFilter;
    pagination: TransactionPagination;
    loading: boolean;
    error: string | null;
}

const initialState: TransactionState = {
    items: [],
    selectedTransaction: null,
    filter: {},
    pagination: {
        page: 1,
        limit: 10,
        total: 0
    },
    loading: false,
    error: null
};

export const transactionSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        fetchTransactionsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchTransactionsSuccess: (
            state,
            action: PayloadAction<{
                items: Transaction[];
                total: number;
            }>
        ) => {
            state.loading = false;
            state.items = action.payload.items;
            state.pagination.total = action.payload.total;
            state.error = null;
        },
        fetchTransactionsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        setSelectedTransaction: (
            state,
            action: PayloadAction<Transaction | null>
        ) => {
            state.selectedTransaction = action.payload;
        },
        updateFilter: (state, action: PayloadAction<TransactionFilter>) => {
            state.filter = { ...state.filter, ...action.payload };
            state.pagination.page = 1; // Reset page when filter changes
        },
        updatePagination: (
            state,
            action: PayloadAction<Partial<TransactionPagination>>
        ) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        createTransactionStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        createTransactionSuccess: (
            state,
            action: PayloadAction<Transaction>
        ) => {
            state.loading = false;
            state.items.unshift(action.payload);
            state.pagination.total += 1;
            state.error = null;
        },
        createTransactionFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateTransactionStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateTransactionSuccess: (
            state,
            action: PayloadAction<Transaction>
        ) => {
            state.loading = false;
            const index = state.items.findIndex(
                item => item.id === action.payload.id
            );
            if (index !== -1) {
                state.items[index] = action.payload;
            }
            if (
                state.selectedTransaction?.id === action.payload.id
            ) {
                state.selectedTransaction = action.payload;
            }
            state.error = null;
        },
        updateTransactionFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        deleteTransactionStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        deleteTransactionSuccess: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.items = state.items.filter(
                item => item.id !== action.payload
            );
            state.pagination.total -= 1;
            if (
                state.selectedTransaction?.id === action.payload
            ) {
                state.selectedTransaction = null;
            }
            state.error = null;
        },
        deleteTransactionFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        clearTransactionError: (state) => {
            state.error = null;
        }
    }
});

export const {
    fetchTransactionsStart,
    fetchTransactionsSuccess,
    fetchTransactionsFailure,
    setSelectedTransaction,
    updateFilter,
    updatePagination,
    createTransactionStart,
    createTransactionSuccess,
    createTransactionFailure,
    updateTransactionStart,
    updateTransactionSuccess,
    updateTransactionFailure,
    deleteTransactionStart,
    deleteTransactionSuccess,
    deleteTransactionFailure,
    clearTransactionError
} = transactionSlice.actions;

export default transactionSlice.reducer; 