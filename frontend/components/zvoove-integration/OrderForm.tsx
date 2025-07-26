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
  email: string;
  
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
  email: yup.string()
    .email('Ungültige E-Mail-Adresse')
    .required('E-Mail ist erforderlich')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Bitte geben Sie eine gültige E-Mail-Adresse ein'
    ),
  positions: yup.array().of(
    yup.object({
      id: yup.string().required(),
      articleNumber: yup.string().required('Artikel-Nr. ist erforderlich'),
      description: yup.string().required('Beschreibung ist erforderlich'),
      quantity: yup.number()
        .positive('Menge muss größer als 0 sein')
        .required('Menge ist erforderlich')
        .typeError('Menge muss eine Zahl sein'),
      unit: yup.string().required('Einheit ist erforderlich'),
      unitPrice: yup.number()
        .positive('Preis muss größer als 0 sein')
        .required('Preis ist erforderlich')
        .typeError('Preis muss eine Zahl sein'),
      discount: yup.number()
        .min(0, 'Rabatt darf nicht negativ sein')
        .max(100, 'Rabatt darf maximal 100% sein')
        .required('Rabatt ist erforderlich')
        .typeError('Rabatt muss eine Zahl sein'),
      netPrice: yup.number()
        .positive('Nettopreis muss größer als 0 sein')
        .required('Nettopreis ist erforderlich')
        .typeError('Nettopreis muss eine Zahl sein')
    })
  ).min(1, 'Mindestens eine Position ist erforderlich'),
  netAmount: yup.number().min(0).required('Nettobetrag ist erforderlich'),
  vatAmount: yup.number().min(0).required('MwSt. ist erforderlich'),
  totalAmount: yup.number().min(0).required('Gesamtbetrag ist erforderlich')
}) as yup.ObjectSchema<OrderData>;

// Modus-spezifische Titel
const getModeTitle = (mode: string) => {
  switch (mode) {
    case 'offer': return 'Angebot erfassen';
    case 'order': return 'Auftrag erfassen';
    case 'delivery': return 'Lieferschein erfassen';
    case 'invoice': return 'Rechnung erfassen';
    default: return 'Dokument erfassen';
  }
};

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
    formState: { errors, isSubmitting, isValid, isDirty },
    watch,
    setValue,
    reset,
    trigger
  } = useForm<OrderData>({
    resolver: yupResolver(orderSchema),
    mode: 'onBlur', // Validierung beim Verlassen der Felder
    reValidateMode: 'onChange', // Re-Validierung bei Änderungen
    defaultValues: {
      customerNumber: initialData?.customerNumber || '',
      debtorNumber: initialData?.debtorNumber || '',
      documentDate: initialData?.documentDate || new Date(),
      contactPerson: initialData?.contactPerson || '',
      email: initialData?.email || '',
      positions: initialData?.positions || [],
      netAmount: initialData?.netAmount || 0,
      vatAmount: initialData?.vatAmount || 0,
      totalAmount: initialData?.totalAmount || 0
    }
  });

  // Summen berechnen
  const calculateTotals = (positions: OrderPosition[]) => {
    const netAmount = positions.reduce((sum, pos) => sum + pos.netPrice, 0);
    const vatAmount = netAmount * 0.19; // 19% MwSt
    const totalAmount = netAmount + vatAmount;
    
    setValue('netAmount', netAmount);
    setValue('vatAmount', vatAmount);
    setValue('totalAmount', totalAmount);
    
    return { netAmount, vatAmount, totalAmount };
  };

  // Position hinzufügen
  const addPosition = () => {
    const newPosition: OrderPosition = {
      id: `pos-${Date.now()}`,
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

  // Position entfernen
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
        
        // Nettopreis berechnen
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
          const quantity = field === 'quantity' ? value : pos.quantity;
          const unitPrice = field === 'unitPrice' ? value : pos.unitPrice;
          const discount = field === 'discount' ? value : pos.discount;
          const netPrice = quantity * unitPrice * (1 - discount / 100);
          updatedPos.netPrice = netPrice;
        }
        
        return updatedPos;
      }
      return pos;
    });
    
    setPositions(updatedPositions);
    setValue('positions', updatedPositions);
    calculateTotals(updatedPositions);
  };

  const onSubmit = async (data: OrderData) => {
    try {
      // Zusätzliche Validierung vor dem Speichern
      const isValid = await trigger();
      if (!isValid) {
        console.log('Formular-Validierung fehlgeschlagen:', errors);
        return;
      }

      const finalData = {
        ...data,
        positions: positions
      };
      onSave(finalData);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  return (
    <Card className="p-6 max-w-6xl mx-auto">
      <Typography variant="h5" className="mb-6 text-gray-800">
        {getModeTitle(mode)}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
                    label="Auftragsnummer"
                    fullWidth
                    required
                    error={!!errors.customerNumber}
                    helperText={errors.customerNumber?.message}
                    inputProps={{
                      'aria-describedby': errors.customerNumber ? 'customerNumber-error' : undefined
                    }}
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
                    label="Kunde"
                    fullWidth
                    required
                    error={!!errors.debtorNumber}
                    helperText={errors.debtorNumber?.message}
                    inputProps={{
                      'aria-describedby': errors.debtorNumber ? 'debtorNumber-error' : undefined
                    }}
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
                    label="Auftragsdatum"
                    type="date"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.documentDate}
                    helperText={errors.documentDate?.message}
                    inputProps={{
                      'aria-describedby': errors.documentDate ? 'documentDate-error' : undefined
                    }}
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
                    fullWidth
                    required
                    error={!!errors.contactPerson}
                    helperText={errors.contactPerson?.message}
                    inputProps={{
                      'aria-describedby': errors.contactPerson ? 'contactPerson-error' : undefined
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="E-Mail"
                    type="email"
                    fullWidth
                    required
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    inputProps={{
                      'aria-describedby': errors.email ? 'email-error' : undefined,
                      'aria-invalid': !!errors.email
                    }}
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
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addPosition}
              className="bg-blue-50 hover:bg-blue-100"
            >
              Position hinzufügen
            </Button>
          </div>

          {positions.length === 0 ? (
            <Alert severity="info" className="mb-4">
              Keine Positionen vorhanden. Klicken Sie auf "Position hinzufügen" um eine neue Position zu erstellen.
            </Alert>
          ) : (
            <Table className="mb-4">
              <TableHead>
                <TableRow>
                  <TableCell>Artikel-Nr.</TableCell>
                  <TableCell>Beschreibung</TableCell>
                  <TableCell>Menge</TableCell>
                  <TableCell>Einheit</TableCell>
                  <TableCell>Einzelpreis</TableCell>
                  <TableCell>Rabatt (%)</TableCell>
                  <TableCell>Gesamtpreis</TableCell>
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
                        placeholder="Artikel-Nr."
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={position.description}
                        onChange={(e) => updatePosition(position.id, 'description', e.target.value)}
                        placeholder="Beschreibung"
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={position.quantity}
                        onChange={(e) => updatePosition(position.id, 'quantity', parseFloat(e.target.value) || 0)}
                        type="number"
                        placeholder="Menge"
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={position.unit}
                        onChange={(e) => updatePosition(position.id, 'unit', e.target.value)}
                        placeholder="Einheit"
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={position.unitPrice}
                        onChange={(e) => updatePosition(position.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        type="number"
                        placeholder="Einzelpreis"
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={position.discount}
                        onChange={(e) => updatePosition(position.id, 'discount', parseFloat(e.target.value) || 0)}
                        type="number"
                        placeholder="Rabatt (%)"
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={position.netPrice.toFixed(2)}
                        placeholder="Gesamtpreis"
                        size="small"
                        fullWidth
                        InputProps={{ readOnly: true }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => removePosition(position.id)}
                        color="error"
                        size="small"
                        title="Entfernen"
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
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Controller
                name="netAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nettobetrag"
                    type="number"
                    fullWidth
                    InputProps={{ readOnly: true }}
                    value={field.value.toFixed(2)}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Controller
                name="vatAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="MwSt. (19%)"
                    type="number"
                    fullWidth
                    InputProps={{ readOnly: true }}
                    value={field.value.toFixed(2)}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Controller
                name="totalAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Gesamtbetrag"
                    type="number"
                    fullWidth
                    InputProps={{ readOnly: true }}
                    value={field.value.toFixed(2)}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Buttons */}
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
            data-testid="save-button"
          >
            Speichern
          </Button>
        </div>
      </form>
    </Card>
  );
}; 