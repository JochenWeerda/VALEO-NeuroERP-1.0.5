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

// Temporär auskommentiert - wird später implementiert
export const SupplierOffer: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Supplier Offer</h1>
      <p className="text-gray-600">Diese Komponente wird später implementiert.</p>
    </div>
  );
}; 