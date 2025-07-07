import React, { useState, useCallback, useMemo } from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Paper,
    Grid,
    Snackbar,
    Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useMutation, useQueryClient } from 'react-query';
import { createTransaction } from '../api/transactions';
import { useCache } from '../hooks/useCache';

const validationSchema = yup.object({
    amount: yup
        .number()
        .required('Betrag ist erforderlich')
        .min(0.01, 'Betrag muss größer als 0 sein'),
    description: yup
        .string()
        .required('Beschreibung ist erforderlich')
        .min(3, 'Beschreibung muss mindestens 3 Zeichen lang sein'),
    category: yup
        .string()
        .required('Kategorie ist erforderlich'),
    date: yup
        .date()
        .required('Datum ist erforderlich')
});

const categories = [
    'Einkauf',
    'Verkauf',
    'Dienstleistung',
    'Material',
    'Personal',
    'Sonstiges'
];

export const TransactionForm: React.FC = () => {
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });
    
    const queryClient = useQueryClient();
    const cache = useCache();
    
    const createTransactionMutation = useMutation(
        createTransaction,
        {
            onSuccess: async () => {
                // Cache invalidieren
                await cache.delete('transactions');
                // Query Client aktualisieren
                queryClient.invalidateQueries('transactions');
                
                setSnackbar({
                    open: true,
                    message: 'Transaktion erfolgreich erstellt',
                    severity: 'success'
                });
                
                formik.resetForm();
            },
            onError: (error: any) => {
                setSnackbar({
                    open: true,
                    message: `Fehler: ${error.message}`,
                    severity: 'error'
                });
            }
        }
    );
    
    const formik = useFormik({
        initialValues: {
            amount: '',
            description: '',
            category: '',
            date: new Date()
        },
        validationSchema,
        onSubmit: async (values) => {
            await createTransactionMutation.mutateAsync(values);
        }
    });
    
    const handleSnackbarClose = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);
    
    const isSubmitDisabled = useMemo(() => {
        return (
            !formik.values.amount ||
            !formik.values.description ||
            !formik.values.category ||
            !formik.values.date ||
            Object.keys(formik.errors).length > 0
        );
    }, [formik.values, formik.errors]);
    
    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Neue Transaktion
            </Typography>
            
            <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            id="amount"
                            name="amount"
                            label="Betrag"
                            type="number"
                            value={formik.values.amount}
                            onChange={formik.handleChange}
                            error={formik.touched.amount && Boolean(formik.errors.amount)}
                            helperText={formik.touched.amount && formik.errors.amount}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel id="category-label">Kategorie</InputLabel>
                            <Select
                                labelId="category-label"
                                id="category"
                                name="category"
                                value={formik.values.category}
                                onChange={formik.handleChange}
                                error={formik.touched.category && Boolean(formik.errors.category)}
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="description"
                            name="description"
                            label="Beschreibung"
                            multiline
                            rows={3}
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            error={formik.touched.description && Boolean(formik.errors.description)}
                            helperText={formik.touched.description && formik.errors.description}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <DatePicker
                            label="Datum"
                            value={formik.values.date}
                            onChange={(newValue) => {
                                formik.setFieldValue('date', newValue);
                            }}
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={isSubmitDisabled}
                                sx={{ minWidth: 200 }}
                            >
                                Transaktion erstellen
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
            
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
}; 