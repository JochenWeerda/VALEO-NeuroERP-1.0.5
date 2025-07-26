import React, { useState } from 'react';
import {
  Card,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Divider,
  Alert,
  Chip,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { DatePicker } from 'antd';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Print as PrintIcon, 
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import dayjs from 'dayjs';

// TypeScript Interfaces
export interface SupplierOfferData {
  id: string;
  creditorAccountNumber: string;
  supplier: string;
  supplierMaster: string;
  inquiryNumber: string;
  operator: string;
  contactPerson: {
    name?: string;
    salutation?: string;
  };
  supplierOfferNumber: string;
  latestDeliveryDate: string;
  loadingDeadline: string;
  loadingDate: string;
  deliveryAddress: string;
  billingAddress: string;
  paymentTerms: string;
  currency: string;
  positions: SupplierOfferPosition[];
  totalNetAmount: number;
  totalGrossAmount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierOfferPosition {
  id: string;
  position: number;
  articleNumber: string;
  description: string;
  quantity: number;
  unit: string;
  netPrice: number;
  netAmount: number;
  discount: number;
  discountPercent: number;
  grossAmount: number;
  deliveryDate: string;
  warehouse: string;
  storageLocation: string;
}

export interface SupplierOfferProps {
  onOfferCreate: (offer: SupplierOfferData) => void;
  onOfferUpdate: (id: string, offer: Partial<SupplierOfferData>) => void;
  onOfferDelete: (id: string) => void;
}

// Validierungsschema
const offerSchema = yup.object({
  creditorAccountNumber: yup.string().required('Kreditor-Kontonummer ist erforderlich'),
  supplier: yup.string().required('Lieferant ist erforderlich'),
  inquiryNumber: yup.string().required('Anfragenummer ist erforderlich'),
  operator: yup.string().required('Bearbeiter ist erforderlich'),
  contactPerson: yup.object({
    name: yup.string().required('Kontaktperson Name ist erforderlich'),
    salutation: yup.string().required('Anrede ist erforderlich')
  }),
  supplierOfferNumber: yup.string().required('Lieferanten-Angebotsnummer ist erforderlich')
});

// Mock-Daten
const suppliers = ['Dell GmbH', 'HP Deutschland', 'Lenovo Deutschland', 'Apple Deutschland'];
const salutations = ['Herr', 'Frau', 'Divers'];
const operators = ['Max Mustermann', 'Anna Schmidt', 'Peter Müller'];

export const SupplierOffer: React.FC<SupplierOfferProps> = ({
  mode,
  initialData,
  onSave,
  onCancel
}) => {
  const { control, handleSubmit, formState: { errors }, watch } = useForm<SupplierOfferData>({
    resolver: yupResolver(offerSchema),
    defaultValues: initialData || {
      inquiryDate: new Date(),
      latestDeliveryDate: new Date(),
      loadingDeadline: new Date(),
      loadingDate: new Date(),
      offerDate: new Date(),
      orderDate: new Date(),
      completed: false,
      contactPerson: {
        name: '',
        salutation: 'Herr'
      },
      text1: '',
      text2: ''
    }
  });

  const watchedData = watch();

  const onSubmit = (data: SupplierOfferData) => {
    const offerData: SupplierOfferData = {
      ...data,
      inquiryDate: data.inquiryDate || new Date(),
      latestDeliveryDate: data.latestDeliveryDate || new Date(),
      loadingDeadline: data.loadingDeadline || new Date(),
      loadingDate: data.loadingDate || new Date(),
      offerDate: data.offerDate || new Date(),
      orderDate: data.orderDate || new Date()
    };
    onSave(offerData);
  };

  return (
    <div className="space-y-6">
      {/* Kopfbereich */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5">
            {mode === 'create' ? 'Neues Lieferanten-Angebot' : 
             mode === 'edit' ? 'Lieferanten-Angebot bearbeiten' : 'Lieferanten-Angebot anzeigen'}
          </Typography>
          <div className="flex space-x-2">
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              disabled={mode === 'create'}
            >
              Drucken
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              disabled={mode === 'create'}
            >
              Löschen
            </Button>
          </div>
        </div>

        <Grid container spacing={3}>
          {/* Kreditor-Kontonummer */}
          <Grid item xs={12} md={3}>
            <Controller
              name="creditorAccountNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Kreditor-Kontonummer"
                  error={!!errors.creditorAccountNumber}
                  helperText={errors.creditorAccountNumber?.message}
                  disabled={mode === 'view'}
                />
              )}
            />
          </Grid>
          
          {/* Lieferant */}
          <Grid item xs={12} md={6}>
            <Controller
              name="supplier"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.supplier}>
                  <InputLabel>Lieferant</InputLabel>
                  <Select {...field} label="Lieferant" disabled={mode === 'view'}>
                    {suppliers.map(supplier => (
                      <MenuItem key={supplier} value={supplier}>{supplier}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          
          {/* Lieferanten-Stamm */}
          <Grid item xs={12} md={3}>
            <Controller
              name="supplierMaster"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Lieferanten-Stamm"
                  disabled={mode === 'view'}
                />
              )}
            />
          </Grid>
          
          {/* Spätester Liefertermin */}
          <Grid item xs={12} md={6}>
            <Controller
              name="latestDeliveryDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  placeholder="Spätester Liefertermin"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.toDate())}
                  disabled={mode === 'view'}
                  style={{ width: '100%' }}
                />
              )}
            />
          </Grid>
          
          {/* Lade-Frist */}
          <Grid item xs={12} md={3}>
            <Controller
              name="loadingDeadline"
              control={control}
              render={({ field }) => (
                <DatePicker
                  placeholder="Lade-Frist"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.toDate())}
                  disabled={mode === 'view'}
                  style={{ width: '100%' }}
                />
              )}
            />
          </Grid>
          
          {/* Lade-Datum */}
          <Grid item xs={12} md={3}>
            <Controller
              name="loadingDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  placeholder="Lade-Datum"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.toDate())}
                  disabled={mode === 'view'}
                  style={{ width: '100%' }}
                />
              )}
            />
          </Grid>
          
          {/* Anfragenummer */}
          <Grid item xs={12} md={3}>
            <Controller
              name="inquiryNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Anfragenummer"
                  error={!!errors.inquiryNumber}
                  helperText={errors.inquiryNumber?.message}
                  disabled={mode === 'view'}
                />
              )}
            />
          </Grid>
          
          {/* Anfrage-Datum */}
          <Grid item xs={12} md={3}>
            <Controller
              name="inquiryDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  placeholder="Anfrage-Datum"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.toDate())}
                  disabled={mode === 'view'}
                  style={{ width: '100%' }}
                />
              )}
            />
          </Grid>
          
          {/* Bearbeiter */}
          <Grid item xs={12} md={6}>
            <Controller
              name="operator"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.operator}>
                  <InputLabel>Bearbeiter</InputLabel>
                  <Select {...field} label="Bearbeiter" disabled={mode === 'view'}>
                    {operators.map(operator => (
                      <MenuItem key={operator} value={operator}>{operator}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          
          {/* Abgeschlossen */}
          <Grid item xs={12} md={6}>
            <Controller
              name="completed"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={mode === 'view'}
                    />
                  }
                  label="Abgeschlossen"
                />
              )}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Kontaktperson */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <PersonIcon className="mr-2" />
          <Typography variant="h6">Kontaktperson</Typography>
        </div>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Controller
              name="contactPerson.salutation"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.contactPerson?.salutation}>
                  <InputLabel>Anrede</InputLabel>
                  <Select {...field} label="Anrede" disabled={mode === 'view'}>
                    {salutations.map(salutation => (
                      <MenuItem key={salutation} value={salutation}>{salutation}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Controller
              name="contactPerson.name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Name der Kontaktperson"
                  error={!!errors.contactPerson?.name}
                  helperText={errors.contactPerson?.name?.message}
                  disabled={mode === 'view'}
                />
              )}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Dokumenten-Informationen */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <DescriptionIcon className="mr-2" />
          <Typography variant="h6">Dokumenten-Informationen</Typography>
        </div>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="supplierOfferNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Lieferanten-Angebotsnummer"
                  error={!!errors.supplierOfferNumber}
                  helperText={errors.supplierOfferNumber?.message}
                  disabled={mode === 'view'}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Controller
              name="supplierOrderNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Lieferanten-Auftragsnummer"
                  disabled={mode === 'view'}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Controller
              name="offerDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  placeholder="Angebots-Datum"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.toDate())}
                  disabled={mode === 'view'}
                  style={{ width: '100%' }}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Controller
              name="orderDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  placeholder="Auftrags-Datum"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.toDate())}
                  disabled={mode === 'view'}
                  style={{ width: '100%' }}
                />
              )}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Text-Bereich */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <BusinessIcon className="mr-2" />
          <Typography variant="h6">Zusatzinformationen</Typography>
        </div>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="text1"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Kommissions-Name"
                  multiline
                  rows={3}
                  disabled={mode === 'view'}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Controller
              name="text2"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Bsp. Liefertermin"
                  multiline
                  rows={3}
                  disabled={mode === 'view'}
                />
              )}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Status-Anzeige */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Chip 
              label={watchedData.completed ? 'Abgeschlossen' : 'In Bearbeitung'} 
              color={watchedData.completed ? 'success' : 'warning'}
            />
            <Typography variant="body2" color="textSecondary">
              Erstellt von: {watchedData.operator || 'Nicht zugewiesen'}
            </Typography>
          </div>
          
          <div className="flex items-center space-x-2">
            <Typography variant="body2" color="textSecondary">
              Anfragenummer:
            </Typography>
            <Chip label={watchedData.inquiryNumber || 'Nicht gesetzt'} variant="outlined" />
          </div>
        </div>
      </Card>

      {/* Aktions-Buttons */}
      {mode !== 'view' && (
        <Card className="p-4">
          <div className="flex justify-end space-x-2">
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onCancel}
            >
              Abbrechen
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSubmit(onSubmit)}
            >
              Speichern
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SupplierOffer; 