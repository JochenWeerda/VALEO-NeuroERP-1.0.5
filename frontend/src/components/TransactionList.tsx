import React, { useState, useCallback, useMemo } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { getTransactions, deleteTransaction } from '../api/transactions';
import { useCache } from '../hooks/useCache';
import { Transaction } from '../types/transaction';

const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
        'Einkauf': 'primary',
        'Verkauf': 'success',
        'Dienstleistung': 'info',
        'Material': 'warning',
        'Personal': 'secondary',
        'Sonstiges': 'default'
    };
    return colors[category] || 'default';
};

export const TransactionList: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const queryClient = useQueryClient();
    const cache = useCache();
    
    const {
        data: transactions = [],
        isLoading,
        error
    } = useQuery<Transaction[]>(
        ['transactions', page, rowsPerPage],
        () => getTransactions({ page, limit: rowsPerPage }),
        {
            keepPreviousData: true,
            staleTime: 30000 // 30 Sekunden
        }
    );
    
    const deleteTransactionMutation = useMutation(
        deleteTransaction,
        {
            onSuccess: async () => {
                // Cache invalidieren
                await cache.delete('transactions');
                // Query Client aktualisieren
                queryClient.invalidateQueries('transactions');
            }
        }
    );
    
    const handleChangePage = useCallback((
        event: unknown,
        newPage: number
    ) => {
        setPage(newPage);
    }, []);
    
    const handleChangeRowsPerPage = useCallback((
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);
    
    const handleDelete = useCallback(async (id: string) => {
        if (window.confirm('Möchten Sie diese Transaktion wirklich löschen?')) {
            await deleteTransactionMutation.mutateAsync(id);
        }
    }, [deleteTransactionMutation]);
    
    const formattedTransactions = useMemo(() => {
        return transactions.map(tx => ({
            ...tx,
            formattedDate: format(new Date(tx.date), 'PPP', { locale: de }),
            formattedAmount: new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR'
            }).format(tx.amount)
        }));
    }, [transactions]);
    
    if (isLoading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 400
            }}>
                <CircularProgress />
            </Box>
        );
    }
    
    if (error) {
        return (
            <Typography color="error" align="center">
                Fehler beim Laden der Transaktionen
            </Typography>
        );
    }
    
    return (
        <Paper elevation={3}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Datum</TableCell>
                            <TableCell>Beschreibung</TableCell>
                            <TableCell>Kategorie</TableCell>
                            <TableCell align="right">Betrag</TableCell>
                            <TableCell align="center">Aktionen</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {formattedTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>{transaction.formattedDate}</TableCell>
                                <TableCell>{transaction.description}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={transaction.category}
                                        color={getCategoryColor(transaction.category) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    {transaction.formattedAmount}
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Details">
                                        <IconButton size="small">
                                            <InfoIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Bearbeiten">
                                        <IconButton size="small">
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Löschen">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(transaction.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            
            <TablePagination
                component="div"
                count={-1}  // Unbekannte Gesamtanzahl
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelDisplayedRows={({ from, to }) => `${from}-${to}`}
                labelRowsPerPage="Zeilen pro Seite:"
            />
        </Paper>
    );
}; 