import React, { useState } from 'react';
import {
  Card,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Grid,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// TypeScript Interfaces
interface OrderFormProps {
  mode: 'offer' | 'order' | 'delivery' | 'invoice';
  initialData?: Partial<OrderData>;
  onSave: (data: OrderData) => void;
  onCancel: () => void;
}

interface OrderData {
  // Belegdaten
  customerNumber: string;
  debtorNumber: string;
  documentDate: Date;
  contactPerson: string;
  
  // Positionen
  positions: OrderPosition[];
  
  // Summen
  netAmount: number;
  vatAmount: number;
  totalAmount: number;
}

interface OrderPosition {
  id: string;
  articleNumber: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  netPrice: number;
}

// Validierungsschema
const orderSchema = yup.object({
  customerNumber: yup.string().required('Auftragsnummer ist erforderlich'),
  debtorNumber: yup.string().required('Kunde ist erforderlich'),
  documentDate: yup.date().required('Datum ist erforderlich'),
  contactPerson: yup.string().required('Ansprechpartner ist erforderlich'),
  positions: yup.array().of(
    yup.object({
      id: yup.string().required(),
      articleNumber: yup.string().required('Artikel-Nr. ist erforderlich'),
      description: yup.string().required('Beschreibung ist erforderlich'),
      quantity: yup.number().positive('Menge muss größer als 0 sein').required('Menge ist erforderlich'),
      unit: yup.string().required('Einheit ist erforderlich'),
      unitPrice: yup.number().positive('Preis muss größer als 0 sein').required('Preis ist erforderlich'),
      discount: yup.number().min(0, 'Rabatt darf nicht negativ sein').max(100, 'Rabatt darf maximal 100% sein').required(),
      netPrice: yup.number().positive('Nettopreis muss größer als 0 sein').required('Nettopreis ist erforderlich')
    })
  ).min(1, 'Mindestens eine Position ist erforderlich'),
  netAmount: yup.number().min(0).required('Nettobetrag ist erforderlich'),
  vatAmount: yup.number().min(0).required('MwSt. ist erforderlich'),
  totalAmount: yup.number().min(0).required('Gesamtbetrag ist erforderlich')
}) as yup.ObjectSchema<OrderData>;

export const OrderForm: React.FC<OrderFormProps> = ({
  mode,
  initialData,
  onSave,
  onCancel
}) => {
  const [positions, setPositions] = useState<OrderPosition[]>(
    initialData?.positions || []
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<OrderData>({
    resolver: yupResolver(orderSchema),
    defaultValues: {
      customerNumber: initialData?.customerNumber || '',
      debtorNumber: initialData?.debtorNumber || '',
      documentDate: initialData?.documentDate || new Date(),
      contactPerson: initialData?.contactPerson || '',
      positions: initialData?.positions || [],
      netAmount: initialData?.netAmount || 0,
      vatAmount: initialData?.vatAmount || 0,
      totalAmount: initialData?.totalAmount || 0
    }
  });

  // Berechne Summen basierend auf Positionen
  const calculateTotals = (positions: OrderPosition[]) => {
    const netAmount = positions.reduce((sum, pos) => sum + pos.netPrice, 0);
    const vatAmount = netAmount * 0.19; // 19% MwSt
    const totalAmount = netAmount + vatAmount;
    
    setValue('netAmount', netAmount);
    setValue('vatAmount', vatAmount);
    setValue('totalAmount', totalAmount);
  };

  // Neue Position hinzufügen
  const addPosition = () => {
    const newPosition: OrderPosition = {
      id: Date.now().toString(),
      articleNumber: '',
      description: '',
      quantity: 1,
      unit: 'Stück',
      unitPrice: 0,
      discount: 0,
      netPrice: 0
    };
    
    const updatedPositions = [...positions, newPosition];
    setPositions(updatedPositions);
    setValue('positions', updatedPositions);
    calculateTotals(updatedPositions);
  };

  // Position löschen
  const removePosition = (id: string) => {
    const updatedPositions = positions.filter(pos => pos.id !== id);
    setPositions(updatedPositions);
    setValue('positions', updatedPositions);
    calculateTotals(updatedPositions);
  };

  // Position aktualisieren
  const updatePosition = (id: string, field: keyof OrderPosition, value: any) => {
    const updatedPositions = positions.map(pos => {
      if (pos.id === id) {
        const updatedPos = { ...pos, [field]: value };
        
        // Berechne Nettopreis
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
          const quantity = field === 'quantity' ? value : pos.quantity;
          const unitPrice = field === 'unitPrice' ? value : pos.unitPrice;
          const discount = field === 'discount' ? value : pos.discount;
          
          const grossPrice = quantity * unitPrice;
          const discountAmount = grossPrice * (discount / 100);
          updatedPos.netPrice = grossPrice - discountAmount;
        }
        
        return updatedPos;
      }
      return pos;
    });
    
    setPositions(updatedPositions);
    setValue('positions', updatedPositions);
    calculateTotals(updatedPositions);
  };

  // Formular absenden
  const onSubmit = (data: OrderData) => {
    const orderData: OrderData = {
      ...data,
      positions: positions,
      netAmount: data.netAmount,
      vatAmount: data.vatAmount,
      totalAmount: data.totalAmount
    };
    
    onSave(orderData);
  };

  const modeLabels = {
    offer: 'Angebot',
    order: 'Auftrag',
    delivery: 'Lieferung',
    invoice: 'Rechnung'
  };

  return (
    <Card className="p-6 max-w-6xl mx-auto">
      <Typography variant="h5" className="mb-6 text-gray-800">
        {modeLabels[mode]} erfassen
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Belegdaten */}
        <Paper className="p-4 mb-6">
          <Typography variant="h6" className="mb-4 text-gray-700">
            Belegdaten
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="customerNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Kundennummer"
                    variant="outlined"
                    fullWidth
                    error={!!errors.customerNumber}
                    helperText={errors.customerNumber?.message}
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="debtorNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Debitoren-Nr."
                    variant="outlined"
                    fullWidth
                    error={!!errors.debtorNumber}
                    helperText={errors.debtorNumber?.message}
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="documentDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Datum"
                    type="date"
                    variant="outlined"
                    fullWidth
                    error={!!errors.documentDate}
                    helperText={errors.documentDate?.message}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="contactPerson"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ansprechpartner"
                    variant="outlined"
                    fullWidth
                    error={!!errors.contactPerson}
                    helperText={errors.contactPerson?.message}
                    required
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Positionen */}
        <Paper className="p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6" className="text-gray-700">
              Positionen
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addPosition}
              color="primary"
            >
              Position hinzufügen
            </Button>
          </div>

          {positions.length === 0 ? (
            <Alert severity="info" className="mb-4">
              Keine Positionen vorhanden. Fügen Sie mindestens eine Position hinzu.
            </Alert>
          ) : (
            <Table className="mb-4">
              <TableHead>
                <TableRow>
                  <TableCell>Artikel-Nr.</TableCell>
                  <TableCell>Beschreibung</TableCell>
                  <TableCell>Menge</TableCell>
                  <TableCell>Einheit</TableCell>
                  <TableCell>Preis</TableCell>
                  <TableCell>Rabatt %</TableCell>
                  <TableCell>Nettopreis</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {positions.map((position, index) => (
                  <TableRow key={position.id}>
                    <TableCell>
                      <TextField
                        value={position.articleNumber}
                        onChange={(e) => updatePosition(position.id, 'articleNumber', e.target.value)}
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="Artikel-Nr."
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={position.description}
                        onChange={(e) => updatePosition(position.id, 'description', e.target.value)}
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="Beschreibung"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={position.quantity}
                        onChange={(e) => updatePosition(position.id, 'quantity', parseFloat(e.target.value) || 0)}
                        variant="outlined"
                        size="small"
                        type="number"
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={position.unit}
                        onChange={(e) => updatePosition(position.id, 'unit', e.target.value)}
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="Stück"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={position.unitPrice}
                        onChange={(e) => updatePosition(position.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        variant="outlined"
                        size="small"
                        type="number"
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={position.discount}
                        onChange={(e) => updatePosition(position.id, 'discount', parseFloat(e.target.value) || 0)}
                        variant="outlined"
                        size="small"
                        type="number"
                        inputProps={{ min: 0, max: 100, step: 0.01 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="font-medium">
                        {position.netPrice.toFixed(2)} €
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => removePosition(position.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        {/* Summen */}
        <Paper className="p-4 mb-6">
          <Typography variant="h6" className="mb-4 text-gray-700">
            Summen
          </Typography>
          
          <Grid container spacing={3} className="text-right">
            <Grid item xs={12} md={4}>
              <Typography variant="body1" className="text-gray-600">
                Nettobetrag:
              </Typography>
              <Typography variant="h6" className="font-medium">
                {watch('netAmount').toFixed(2)} €
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="body1" className="text-gray-600">
                MwSt. (19%):
              </Typography>
              <Typography variant="h6" className="font-medium">
                {watch('vatAmount').toFixed(2)} €
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="body1" className="text-gray-600">
                Gesamtbetrag:
              </Typography>
              <Typography variant="h5" className="font-bold text-primary">
                {watch('totalAmount').toFixed(2)} €
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Aktionen */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isSubmitting || positions.length === 0}
            color="primary"
          >
            {isSubmitting ? 'Speichere...' : 'Speichern'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export { OrderForm as ZvooveOrderForm }; 