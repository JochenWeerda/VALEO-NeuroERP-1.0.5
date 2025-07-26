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
import { Table, Input, Space, Tag, DatePicker } from 'antd';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Print as PrintIcon, 
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  LocalShipping as ShippingIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import dayjs from 'dayjs';

// TypeScript Interfaces
interface DeliveryNoteData {
  // Kopfbereich
  deliveryNoteNumber: string;
  date: Date;
  time: string;
  customerNumber: string;
  deliveryAddress: string;
  billingAddress: string;
  debtorNumber: string;
  invoicedInvoiceNumber: string;
  referenceNumber: string;
  
  // Checkboxen
  selfPickup: boolean;
  externalCompany: boolean;
  returnDelivery: boolean;
  freeHouse: boolean;
  info: boolean;
  printed: boolean;
  invoiced: boolean;
  
  // Positionen
  positions: DeliveryPosition[];
}

interface DeliveryPosition {
  position: number;
  articleNumber: string;
  description: string;
  quantity: number;
  unit: string;
  discount: number;
  discountPercent: number;
  netPrice: number;
  netAmount: number;
  serialNumber: string;
  warehouse: string;
  storageLocation: string;
}

interface DeliveryNoteProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: DeliveryNoteData;
  onSave: (delivery: DeliveryNoteData) => void;
  onCancel: () => void;
}

// Validierungsschema
const deliverySchema = yup.object({
  deliveryNoteNumber: yup.string().required('Lieferschein-Nummer ist erforderlich'),
  customerNumber: yup.string().required('Kundennummer ist erforderlich'),
  debtorNumber: yup.string().required('Debitoren-Nummer ist erforderlich'),
  deliveryAddress: yup.string().required('Lieferanschrift ist erforderlich'),
  billingAddress: yup.string().required('Rechnungsanschrift ist erforderlich')
});

// Mock-Daten
const mockPositions: DeliveryPosition[] = [
  {
    position: 1,
    articleNumber: 'ART-001',
    description: 'Laptop Dell XPS 13',
    quantity: 2,
    unit: 'Stück',
    discount: 0,
    discountPercent: 0,
    netPrice: 1299.99,
    netAmount: 2599.98,
    serialNumber: 'SN-001-2024',
    warehouse: 'Hauptlager',
    storageLocation: 'A-01-01'
  },
  {
    position: 2,
    articleNumber: 'ART-002',
    description: 'Drucker HP LaserJet',
    quantity: 1,
    unit: 'Stück',
    discount: 50,
    discountPercent: 5,
    netPrice: 299.99,
    netAmount: 284.99,
    serialNumber: 'SN-002-2024',
    warehouse: 'Hauptlager',
    storageLocation: 'B-02-03'
  }
];

const customers = ['Kunde A GmbH', 'Kunde B AG', 'Kunde C KG'];
const debtors = ['DEB-001', 'DEB-002', 'DEB-003'];
const warehouses = ['Hauptlager', 'Niederlassung Nord', 'Niederlassung Süd'];
const units = ['Stück', 'kg', 'm', 'l'];

export const DeliveryNote: React.FC<DeliveryNoteProps> = ({
  mode,
  initialData,
  onSave,
  onCancel
}) => {
  const [positions, setPositions] = useState<DeliveryPosition[]>(
    initialData?.positions || mockPositions
  );
  const [editingPosition, setEditingPosition] = useState<number | null>(null);

  const { control, handleSubmit, formState: { errors }, watch } = useForm<DeliveryNoteData>({
    resolver: yupResolver(deliverySchema),
    defaultValues: initialData || {
      date: new Date(),
      time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      selfPickup: false,
      externalCompany: false,
      returnDelivery: false,
      freeHouse: false,
      info: false,
      printed: false,
      invoiced: false,
      positions: mockPositions
    }
  });

  const watchedData = watch();

  // Ant Design Table Spalten für Positionen
  const positionColumns = [
    {
      title: 'Pos.',
      dataIndex: 'position',
      key: 'position',
      width: 60,
      render: (text: number) => <strong>{text}</strong>
    },
    {
      title: 'Artikel-Nr.',
      dataIndex: 'articleNumber',
      key: 'articleNumber',
      render: (text: string, record: DeliveryPosition) => (
        editingPosition === record.position ? (
          <Input 
            defaultValue={text}
            onPressEnter={(e) => {
              const newPositions = positions.map(p => 
                p.position === record.position 
                  ? { ...p, articleNumber: (e.target as HTMLInputElement).value }
                  : p
              );
              setPositions(newPositions);
              setEditingPosition(null);
            }}
          />
        ) : (
          <span 
            className="cursor-pointer hover:text-blue-600"
            onClick={() => setEditingPosition(record.position)}
          >
            {text}
          </span>
        )
      )
    },
    {
      title: 'Beschreibung',
      dataIndex: 'description',
      key: 'description',
      render: (text: string, record: DeliveryPosition) => (
        editingPosition === record.position ? (
          <Input 
            defaultValue={text}
            onPressEnter={(e) => {
              const newPositions = positions.map(p => 
                p.position === record.position 
                  ? { ...p, description: (e.target as HTMLInputElement).value }
                  : p
              );
              setPositions(newPositions);
              setEditingPosition(null);
            }}
          />
        ) : (
          <span 
            className="cursor-pointer hover:text-blue-600"
            onClick={() => setEditingPosition(record.position)}
          >
            {text}
          </span>
        )
      )
    },
    {
      title: 'Menge',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value: number, record: DeliveryPosition) => (
        editingPosition === record.position ? (
          <Input 
            type="number"
            defaultValue={value}
            onPressEnter={(e) => {
              const newPositions = positions.map(p => 
                p.position === record.position 
                  ? { ...p, quantity: Number((e.target as HTMLInputElement).value) }
                  : p
              );
              setPositions(newPositions);
              setEditingPosition(null);
            }}
          />
        ) : (
          <span 
            className="cursor-pointer hover:text-blue-600"
            onClick={() => setEditingPosition(record.position)}
          >
            {value}
          </span>
        )
      )
    },
    {
      title: 'Einheit',
      dataIndex: 'unit',
      key: 'unit',
      render: (text: string, record: DeliveryPosition) => (
        editingPosition === record.position ? (
          <Select
            defaultValue={text}
            style={{ width: '100%' }}
            onChange={(value) => {
              const newPositions = positions.map(p => 
                p.position === record.position 
                  ? { ...p, unit: value }
                  : p
              );
              setPositions(newPositions);
              setEditingPosition(null);
            }}
          >
            {units.map(unit => (
              <Select.Option key={unit} value={unit}>{unit}</Select.Option>
            ))}
          </Select>
        ) : (
          <Chip label={text} size="small" />
        )
      )
    },
    {
      title: 'Netto-Preis',
      dataIndex: 'netPrice',
      key: 'netPrice',
      render: (value: number, record: DeliveryPosition) => (
        editingPosition === record.position ? (
          <Input 
            type="number"
            step="0.01"
            defaultValue={value}
            onPressEnter={(e) => {
              const newPositions = positions.map(p => 
                p.position === record.position 
                  ? { ...p, netPrice: Number((e.target as HTMLInputElement).value) }
                  : p
              );
              setPositions(newPositions);
              setEditingPosition(null);
            }}
          />
        ) : (
          <span 
            className="cursor-pointer hover:text-blue-600"
            onClick={() => setEditingPosition(record.position)}
          >
            €{value.toFixed(2)}
          </span>
        )
      )
    },
    {
      title: 'Rabatt %',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      render: (value: number, record: DeliveryPosition) => (
        editingPosition === record.position ? (
          <Input 
            type="number"
            step="0.01"
            defaultValue={value}
            onPressEnter={(e) => {
              const newPositions = positions.map(p => 
                p.position === record.position 
                  ? { ...p, discountPercent: Number((e.target as HTMLInputElement).value) }
                  : p
              );
              setPositions(newPositions);
              setEditingPosition(null);
            }}
          />
        ) : (
          <span 
            className="cursor-pointer hover:text-blue-600"
            onClick={() => setEditingPosition(record.position)}
          >
            {value}%
          </span>
        )
      )
    },
    {
      title: 'Netto-Betrag',
      key: 'netAmount',
      render: (record: DeliveryPosition) => (
        <strong>€{record.netAmount.toFixed(2)}</strong>
      )
    },
    {
      title: 'Aktionen',
      key: 'actions',
      width: 120,
      render: (record: DeliveryPosition) => (
        <Space>
          {editingPosition === record.position ? (
            <Button
              size="small"
              onClick={() => setEditingPosition(null)}
            >
              Speichern
            </Button>
          ) : (
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setEditingPosition(record.position)}
            >
              Bearbeiten
            </Button>
          )}
          <Button
            size="small"
            color="error"
            onClick={() => {
              setPositions(positions.filter(p => p.position !== record.position));
            }}
          >
            Löschen
          </Button>
        </Space>
      )
    }
  ];

  const handleAddPosition = () => {
    const newPosition: DeliveryPosition = {
      position: Math.max(...positions.map(p => p.position)) + 1,
      articleNumber: '',
      description: '',
      quantity: 1,
      unit: 'Stück',
      discount: 0,
      discountPercent: 0,
      netPrice: 0,
      netAmount: 0,
      serialNumber: '',
      warehouse: 'Hauptlager',
      storageLocation: ''
    };
    setPositions([...positions, newPosition]);
    setEditingPosition(newPosition.position);
  };

  const onSubmit = (data: DeliveryNoteData) => {
    const deliveryData: DeliveryNoteData = {
      ...data,
      positions,
      date: data.date || new Date()
    };
    onSave(deliveryData);
  };

  const totalAmount = positions.reduce((sum, pos) => sum + pos.netAmount, 0);

  return (
    <div className="space-y-6">
      {/* Kopfbereich */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5">
            {mode === 'create' ? 'Neuer Lieferschein' : 
             mode === 'edit' ? 'Lieferschein bearbeiten' : 'Lieferschein anzeigen'}
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
          {/* Lieferschein-Nummer */}
          <Grid item xs={12} md={3}>
            <Controller
              name="deliveryNoteNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Lieferschein-Nummer"
                  error={!!errors.deliveryNoteNumber}
                  helperText={errors.deliveryNoteNumber?.message}
                  disabled={mode === 'view'}
                />
              )}
            />
          </Grid>
          
          {/* Datum */}
          <Grid item xs={12} md={3}>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  placeholder="Datum"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.toDate())}
                  disabled={mode === 'view'}
                  style={{ width: '100%' }}
                />
              )}
            />
          </Grid>
          
          {/* Zeit */}
          <Grid item xs={12} md={3}>
            <Controller
              name="time"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Zeit"
                  type="time"
                  disabled={mode === 'view'}
                />
              )}
            />
          </Grid>
          
          {/* Kundennummer */}
          <Grid item xs={12} md={3}>
            <Controller
              name="customerNumber"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.customerNumber}>
                  <InputLabel>Kundennummer</InputLabel>
                  <Select {...field} label="Kundennummer" disabled={mode === 'view'}>
                    {customers.map(customer => (
                      <MenuItem key={customer} value={customer}>{customer}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          
          {/* Debitoren-Nummer */}
          <Grid item xs={12} md={6}>
            <Controller
              name="debtorNumber"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.debtorNumber}>
                  <InputLabel>Debitoren-Nummer</InputLabel>
                  <Select {...field} label="Debitoren-Nummer" disabled={mode === 'view'}>
                    {debtors.map(debtor => (
                      <MenuItem key={debtor} value={debtor}>{debtor}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          
          {/* Referenznummer */}
          <Grid item xs={12} md={6}>
            <Controller
              name="referenceNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Referenznummer"
                  disabled={mode === 'view'}
                />
              )}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Adressen */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <LocationIcon className="mr-2" />
          <Typography variant="h6">Adressen</Typography>
        </div>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="deliveryAddress"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Lieferanschrift"
                  multiline
                  rows={4}
                  error={!!errors.deliveryAddress}
                  helperText={errors.deliveryAddress?.message}
                  disabled={mode === 'view'}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Controller
              name="billingAddress"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Rechnungsanschrift"
                  multiline
                  rows={4}
                  error={!!errors.billingAddress}
                  helperText={errors.billingAddress?.message}
                  disabled={mode === 'view'}
                />
              )}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Lieferoptionen */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <ShippingIcon className="mr-2" />
          <Typography variant="h6">Lieferoptionen</Typography>
        </div>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Controller
              name="selfPickup"
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
                  label="Selbstabholung"
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Controller
              name="externalCompany"
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
                  label="Externe Firma"
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Controller
              name="returnDelivery"
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
                  label="Rücksendung"
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Controller
              name="freeHouse"
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
                  label="Frei Haus"
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Controller
              name="info"
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
                  label="Info"
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Controller
              name="printed"
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
                  label="Gedruckt"
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Controller
              name="invoiced"
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
                  label="Fakturiert"
                />
              )}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Positionen */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Lieferpositionen</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddPosition}
            disabled={mode === 'view'}
          >
            Position hinzufügen
          </Button>
        </div>
        
        <Table
          columns={positionColumns}
          dataSource={positions}
          rowKey="position"
          pagination={false}
          scroll={{ x: 1400 }}
        />
        
        <div className="flex justify-end mt-4">
          <Typography variant="h6">
            Gesamtbetrag: €{totalAmount.toFixed(2)}
          </Typography>
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

export default DeliveryNote; 