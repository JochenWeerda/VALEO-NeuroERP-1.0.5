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
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  Chip
} from '@mui/material';
import { Table, Input, Space, Tag, DatePicker } from 'antd';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Print as PrintIcon, 
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import dayjs from 'dayjs';

// TypeScript Interfaces
export interface PurchaseOrderData {
  // Kopfbereich
  creditorAccountNumber: string;
  branch: string;
  costCenter: string;
  commission: string;
  supplier: string;
  latestDeliveryDate: Date;
  loadingDeadline: Date;
  loadingDate: Date;
  orderNumber: string;
  orderDate: Date;
  operator: string;
  completed: boolean;
  
  // Positionen
  positions: PurchaseOrderPosition[];
  
  // Registerkarten
  references: DocumentReference[];
  paymentTerms: PaymentTerms;
  additionalInfo: string;
}

export interface PurchaseOrderPosition {
  position: number;
  articleNumber: string;
  supplier: string;
  description: string;
  quantity: number;
  packageQuantity: number;
  packageUnit: string;
  stock: number;
  price: number;
  contract: string;
}

export interface DocumentReference {
  id: string;
  type: string;
  number: string;
  date: string;
  description: string;
}

export interface PaymentTerms {
  code: string;
  description: string;
  days: number;
}

export interface PurchaseOrderProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: PurchaseOrderData;
  onSave: (order: PurchaseOrderData) => void;
  onCancel: () => void;
  onOrderCreate?: (order: PurchaseOrderData) => void;
  onOrderUpdate?: (id: string, order: Partial<PurchaseOrderData>) => void;
  onOrderDelete?: (id: string) => void;
}

// Validierungsschema
const orderSchema = yup.object({
  creditorAccountNumber: yup.string().required('Kreditor-Kontonummer ist erforderlich'),
  branch: yup.string().required('Niederlassung ist erforderlich'),
  costCenter: yup.string().required('Kostenstelle ist erforderlich'),
  supplier: yup.string().required('Lieferant ist erforderlich'),
  orderNumber: yup.string().required('Bestellnummer ist erforderlich'),
  operator: yup.string().required('Bearbeiter ist erforderlich')
});

// Mock-Daten
const mockPositions: PurchaseOrderPosition[] = [
  {
    position: 1,
    articleNumber: 'ART-001',
    supplier: 'Dell GmbH',
    description: 'Laptop Dell XPS 13',
    quantity: 10,
    packageQuantity: 1,
    packageUnit: 'Stück',
    stock: 5,
    price: 1299.99,
    contract: 'CTR-2024-001'
  },
  {
    position: 2,
    articleNumber: 'ART-002',
    supplier: 'HP Deutschland',
    description: 'Drucker HP LaserJet',
    quantity: 5,
    packageQuantity: 1,
    packageUnit: 'Stück',
    stock: 2,
    price: 299.99,
    contract: 'CTR-2024-002'
  }
];

const branches = ['Hauptniederlassung', 'Niederlassung Nord', 'Niederlassung Süd'];
const costCenters = ['CC-IT', 'CC-BUERO', 'CC-PRODUKTION'];
const commissions = ['KOM-IT', 'KOM-EINKAUF', 'KOM-VERTRIEB'];

export const PurchaseOrder: React.FC<PurchaseOrderProps> = ({
  mode,
  initialData,
  onSave,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [positions, setPositions] = useState<PurchaseOrderPosition[]>(
    initialData?.positions || mockPositions
  );
  const [editingPosition, setEditingPosition] = useState<number | null>(null);

  const { control, handleSubmit, formState: { errors }, watch   } = useForm({
    resolver: yupResolver(orderSchema),
    defaultValues: initialData || {
      orderDate: new Date(),
      latestDeliveryDate: new Date(),
      loadingDeadline: new Date(),
      loadingDate: new Date(),
      completed: false,
      positions: mockPositions,
      references: [],
      paymentTerms: {
        paymentMethod: 'Überweisung',
        discountDays: 14,
        discountPercent: 2,
        dueDays: 30,
        bankAccount: 'DE89370400440532013000'
      },
      additionalInfo: ''
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
      render: (text: string, record: PurchaseOrderPosition) => (
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
      title: 'Lieferant',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (text: string, record: PurchaseOrderPosition) => (
        editingPosition === record.position ? (
          <Input 
            defaultValue={text}
            onPressEnter={(e) => {
              const newPositions = positions.map(p => 
                p.position === record.position 
                  ? { ...p, supplier: (e.target as HTMLInputElement).value }
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
      render: (text: string, record: PurchaseOrderPosition) => (
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
      render: (value: number, record: PurchaseOrderPosition) => (
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
      title: 'Preis',
      dataIndex: 'price',
      key: 'price',
      render: (value: number, record: PurchaseOrderPosition) => (
        editingPosition === record.position ? (
          <Input 
            type="number"
            step="0.01"
            defaultValue={value}
            onPressEnter={(e) => {
              const newPositions = positions.map(p => 
                p.position === record.position 
                  ? { ...p, price: Number((e.target as HTMLInputElement).value) }
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
      title: 'Gesamt',
      key: 'total',
      render: (record: PurchaseOrderPosition) => (
        <strong>€{(record.quantity * record.price).toFixed(2)}</strong>
      )
    },
    {
      title: 'Aktionen',
      key: 'actions',
      width: 120,
      render: (record: PurchaseOrderPosition) => (
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
    const newPosition: PurchaseOrderPosition = {
      position: Math.max(...positions.map(p => p.position)) + 1,
      articleNumber: '',
      supplier: '',
      description: '',
      quantity: 1,
      packageQuantity: 1,
      packageUnit: 'Stück',
      stock: 0,
      price: 0,
      contract: ''
    };
    setPositions([...positions, newPosition]);
    setEditingPosition(newPosition.position);
  };

  const onSubmit = (data: PurchaseOrderData) => {
    const orderData: PurchaseOrderData = {
      ...data,
      positions,
      orderDate: data.orderDate || new Date(),
      latestDeliveryDate: data.latestDeliveryDate || new Date(),
      loadingDeadline: data.loadingDeadline || new Date(),
      loadingDate: data.loadingDate || new Date()
    };
    onSave(orderData);
  };

  const totalAmount = positions.reduce((sum, pos) => sum + (pos.quantity * pos.price), 0);

  return (
    <div className="space-y-6">
      {/* Kopfbereich */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5">
            {mode === 'create' ? 'Neue Bestellung' : 
             mode === 'edit' ? 'Bestellung bearbeiten' : 'Bestellung anzeigen'}
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
          
          <Grid item xs={12} md={3}>
            <Controller
              name="branch"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.branch}>
                  <InputLabel>Niederlassung</InputLabel>
                  <Select {...field} label="Niederlassung" disabled={mode === 'view'}>
                    {branches.map(branch => (
                      <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Controller
              name="costCenter"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.costCenter}>
                  <InputLabel>Kostenstelle</InputLabel>
                  <Select {...field} label="Kostenstelle" disabled={mode === 'view'}>
                    {costCenters.map(cc => (
                      <MenuItem key={cc} value={cc}>{cc}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Controller
              name="commission"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Kommission</InputLabel>
                  <Select {...field} label="Kommission" disabled={mode === 'view'}>
                    {commissions.map(com => (
                      <MenuItem key={com} value={com}>{com}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Controller
              name="supplier"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Lieferant"
                  error={!!errors.supplier}
                  helperText={errors.supplier?.message}
                  disabled={mode === 'view'}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Controller
              name="orderNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Bestellnummer"
                  error={!!errors.orderNumber}
                  helperText={errors.orderNumber?.message}
                  disabled={mode === 'view'}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Controller
              name="orderDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  placeholder="Bestelldatum"
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
          
          <Grid item xs={12} md={6}>
            <Controller
              name="operator"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Bearbeiter"
                  error={!!errors.operator}
                  helperText={errors.operator?.message}
                  disabled={mode === 'view'}
                />
              )}
            />
          </Grid>
          
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

      {/* Registerkarten */}
      <Card>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Positionen" />
          <Tab label="Referenzen" />
          <Tab label="Zahlungsbedingungen" />
          <Tab label="Zusatzangaben" />
        </Tabs>
        
        <Box className="p-6">
          {/* Positionen Tab */}
          {activeTab === 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Typography variant="h6">Bestellpositionen</Typography>
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
                scroll={{ x: 1200 }}
              />
              
              <div className="flex justify-end">
                <Typography variant="h6">
                  Gesamtbetrag: €{totalAmount.toFixed(2)}
                </Typography>
              </div>
            </div>
          )}
          
          {/* Referenzen Tab */}
          {activeTab === 1 && (
            <div>
              <Typography variant="h6" className="mb-4">Dokumenten-Referenzen</Typography>
              <Alert severity="info">
                Referenzen können hier hinzugefügt werden.
              </Alert>
            </div>
          )}
          
          {/* Zahlungsbedingungen Tab */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <Typography variant="h6">Zahlungsbedingungen</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="paymentTerms.paymentMethod"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Zahlungsart"
                        disabled={mode === 'view'}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="paymentTerms.bankAccount"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Bankkonto"
                        disabled={mode === 'view'}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </div>
          )}
          
          {/* Zusatzangaben Tab */}
          {activeTab === 3 && (
            <div className="space-y-4">
              <Typography variant="h6">Zusatzangaben</Typography>
              <Controller
                name="additionalInfo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Zusätzliche Informationen"
                    disabled={mode === 'view'}
                  />
                )}
              />
            </div>
          )}
        </Box>
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

export default PurchaseOrder; 