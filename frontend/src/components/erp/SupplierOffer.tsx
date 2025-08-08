import React, { useState } from 'react';
import {
  Card,
  Typography,
  Grid,
  Box,
  Divider,
  Chip,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { DatePicker } from 'antd';
import { 
  Person as PersonIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import dayjs from 'dayjs';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { 
  StandardTextField, 
  StandardSelectField, 
  StandardButton, 
  FormActions, 
  FormMessage 
} from '../forms/FormStandardization';
import { UI_LABELS, StatusChip } from '../ui/UIStandardization';

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

export const SupplierOffer: React.FC<SupplierOfferProps> = ({
  onOfferCreate,
  onOfferUpdate,
  onOfferDelete
}) => {
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<SupplierOfferData>({
    resolver: yupResolver(offerSchema) as any,
    defaultValues: {
      creditorAccountNumber: '',
      supplier: '',
      inquiryNumber: '',
      operator: '',
      contactPerson: {
        name: '',
        salutation: ''
      },
      supplierOfferNumber: '',
      latestDeliveryDate: '',
      loadingDeadline: '',
      loadingDate: '',
      deliveryAddress: '',
      billingAddress: '',
      paymentTerms: '',
      currency: 'EUR',
      positions: [],
      totalNetAmount: 0,
      totalGrossAmount: 0,
      status: 'draft'
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const offerData: SupplierOfferData = {
        id: Date.now().toString(),
        creditorAccountNumber: data.creditorAccountNumber,
        supplier: data.supplier,
        supplierMaster: data.supplierMaster || '',
        inquiryNumber: data.inquiryNumber,
        operator: data.operator,
        contactPerson: {
          name: data.contactPerson?.name || '',
          salutation: data.contactPerson?.salutation || ''
        },
        supplierOfferNumber: data.supplierOfferNumber,
        latestDeliveryDate: data.latestDeliveryDate || '',
        loadingDeadline: data.loadingDeadline || '',
        loadingDate: data.loadingDate || '',
        deliveryAddress: data.deliveryAddress || '',
        billingAddress: data.billingAddress || '',
        paymentTerms: data.paymentTerms || '',
        currency: data.currency || 'EUR',
        positions: data.positions || [],
        totalNetAmount: data.totalNetAmount || 0,
        totalGrossAmount: data.totalGrossAmount || 0,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      onOfferCreate(offerData);
    } catch (error) {
      console.error('Fehler beim Erstellen des Angebots:', error);
    }
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Lieferantenangebot
      </Typography>
      
      {/* ✅ REFAKTORIERT: Error-Message mit StandardMessage */}
      {error && (
        <FormMessage
          type="error"
          message={error}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* ✅ REFAKTORIERT: Standardisierte Formularfelder */}
          <Grid item xs={12} md={6}>
            <StandardTextField
              name="creditorAccountNumber"
              label="Kreditor-Kontonummer"
              required={true}
              helperText={errors.creditorAccountNumber?.message}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <StandardSelectField
              name="supplier"
              label="Lieferant"
              options={suppliers.map(supplier => ({ value: supplier, label: supplier }))}
              required={true}
              helperText={errors.supplier?.message}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <StandardTextField
              name="inquiryNumber"
              label={UI_LABELS.ERP.INQUIRY_NUMBER}
              required={true}
              helperText={errors.inquiryNumber?.message}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <StandardTextField
              name="operator"
              label={UI_LABELS.ERP.OPERATOR}
              required={true}
              helperText={errors.operator?.message}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <StandardSelectField
              name="contactPerson.salutation"
              label={UI_LABELS.FORMS.SALUTATION}
              options={salutations.map(salutation => ({ value: salutation, label: salutation }))}
              required={true}
              helperText={errors.contactPerson?.salutation?.message}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <StandardTextField
              name="contactPerson.name"
              label={UI_LABELS.FORMS.NAME}
              required={true}
              helperText={errors.contactPerson?.name?.message}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <StandardTextField
              name="supplierOfferNumber"
              label={UI_LABELS.ERP.SUPPLIER_OFFER_NUMBER}
              required={true}
              helperText={errors.supplierOfferNumber?.message}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* ✅ REFAKTORIERT: FormActions mit standardisierten Labels */}
        <FormActions
          onSave={handleSubmit(onSubmit)}
          onCancel={handleCancel}
          saveText={UI_LABELS.ACTIONS.SAVE}
          cancelText={UI_LABELS.ACTIONS.CANCEL}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </form>
    </Card>
  );
}; 