import React, { useState, useEffect } from 'react';
import {
  Card,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Typography,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Print as PrintIcon,
  FileCopy as FileCopyIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useErpStore } from '../../store/erpStore';
import { 
  PurchaseOrderData, 
  PurchaseOrderPosition, 
  DocumentReference,
  PaymentTerms,
  UnitType,
  PaymentMethod
} from '../../types/erpTypes';

// Validierungsschema für Bestellung
const purchaseOrderSchema: yup.ObjectSchema<PurchaseOrderData> = yup.object({
  creditorAccountNumber: yup.string().required('Kreditor-Konto-Nr. ist erforderlich'),
  branch: yup.string().required('Niederlassung ist erforderlich'),
  costCenter: yup.string().required('Kostenträger ist erforderlich'),
  commission: yup.string().required('Kommission ist erforderlich'),
  supplier: yup.string().required('Lieferant ist erforderlich'),
  latestDeliveryDate: yup.date().required('Lieferdatum ist erforderlich'),
  loadingDeadline: yup.date().required('Lade-Termin ist erforderlich'),
  loadingDate: yup.date().required('Lade-Datum ist erforderlich'),
  orderNumber: yup.string().required('Bestell-Nr. ist erforderlich'),
  orderDate: yup.date().required('Bestell-Datum ist erforderlich'),
  operator: yup.string().required('Bediener ist erforderlich'),
  completed: yup.boolean(),
  additionalInfo: yup.string()
}) as yup.ObjectSchema<PurchaseOrderData>;

// Validierungsschema für Position
const positionSchema = yup.object({
  articleNumber: yup.string().required('Artikel-Nr. ist erforderlich'),
  supplier: yup.string().required('Lieferant ist erforderlich'),
  description: yup.string().required('Bezeichnung ist erforderlich'),
  quantity: yup.number().positive('Menge muss größer als 0 sein').required('Menge ist erforderlich'),
  packageQuantity: yup.number().positive('Gebindemenge muss größer als 0 sein').required('Gebindemenge ist erforderlich'),
  packageUnit: yup.string().required('Gebindeeinheit ist erforderlich'),
  stock: yup.number().min(0, 'Bestand darf nicht negativ sein').required('Bestand ist erforderlich'),
  price: yup.number().positive('Preis muss größer als 0 sein').required('Preis ist erforderlich'),
  contract: yup.string().required('Kontrakt ist erforderlich')
});

interface PurchaseOrderProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: PurchaseOrderData;
  onSave?: (order: PurchaseOrderData) => void;
  onCancel?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`purchase-order-tabpanel-${index}`}
      aria-labelledby={`purchase-order-tab-${index}`}
      {...other}
    >
      {value === index && <div className="py-4">{children}</div>}
    </div>
  );
}

export const PurchaseOrder: React.FC<PurchaseOrderProps> = ({
  mode,
  initialData,
  onSave,
  onCancel
}) => {
  const {
    currentPurchaseOrder,
    purchaseOrderLoading,
    purchaseOrderError,
    createPurchaseOrder,
    updatePurchaseOrder,
    addPurchaseOrderPosition,
    updatePurchaseOrderPosition,
    deletePurchaseOrderPosition
  } = useErpStore();

  const [tabValue, setTabValue] = useState(0);
  const [positions, setPositions] = useState<PurchaseOrderPosition[]>(initialData?.positions || []);
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PurchaseOrderPosition | null>(null);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>(
    initialData?.paymentTerms || {
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentDeadline: 30,
      discountDays: 14,
      discountPercent: 2,
      notes: ''
    }
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<PurchaseOrderData>({
    resolver: yupResolver(purchaseOrderSchema),
    defaultValues: {
      creditorAccountNumber: initialData?.creditorAccountNumber || '',
      branch: initialData?.branch || '',
      costCenter: initialData?.costCenter || '',
      commission: initialData?.commission || '',
      supplier: initialData?.supplier || '',
      latestDeliveryDate: initialData?.latestDeliveryDate || new Date(),
      loadingDeadline: initialData?.loadingDeadline || new Date(),
      loadingDate: initialData?.loadingDate || new Date(),
      orderNumber: initialData?.orderNumber || `BO-${Date.now()}`,
      orderDate: initialData?.orderDate || new Date(),
      operator: initialData?.operator || '',
      completed: initialData?.completed || false,
      additionalInfo: initialData?.additionalInfo || '',
      references: initialData?.references || [],
      totalAmount: initialData?.totalAmount || 0,
      netAmount: initialData?.netAmount || 0,
      vatAmount: initialData?.vatAmount || 0
    }
  });

  // Position-Form
  const {
    control: positionControl,
    handleSubmit: handlePositionSubmit,
    reset: resetPosition,
    formState: { errors: positionErrors }
  } = useForm({
    resolver: yupResolver(positionSchema)
  });

  // Tab-Handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Position hinzufügen
  const handleAddPosition = () => {
    setEditingPosition(null);
    resetPosition({
      position: positions.length + 1,
      articleNumber: '',
      supplier: '',
      description: '',
      quantity: 0,
      packageQuantity: 0,
      packageUnit: UnitType.PIECE,
      stock: 0,
      price: 0,
      contract: '',
      netAmount: 0
    } as any);
    setPositionDialogOpen(true);
  };

  // Position bearbeiten
  const handleEditPosition = (position: PurchaseOrderPosition) => {
    setEditingPosition(position);
    resetPosition(position);
    setPositionDialogOpen(true);
  };

  // Position löschen
  const handleDeletePosition = (positionId: string) => {
    setPositions(prev => prev.filter(p => p.id !== positionId));
  };

  // Position speichern
  const handleSavePosition = (positionData: PurchaseOrderPosition) => {
    const positionWithId = {
      ...positionData,
      id: editingPosition?.id || `pos-${Date.now()}-${Math.random()}`
    };
    
    if (editingPosition) {
      // Position aktualisieren
      setPositions(prev => prev.map(p => p.id === editingPosition.id ? positionWithId : p));
    } else {
      // Neue Position hinzufügen
      setPositions(prev => [...prev, positionWithId]);
    }
    setPositionDialogOpen(false);
    setEditingPosition(null);
  };

  // Gesamtbeträge berechnen
  const calculateTotals = () => {
    const netAmount = positions.reduce((sum, pos) => sum + (pos.quantity * pos.price), 0);
    const vatAmount = netAmount * 0.19; // 19% MwSt
    const totalAmount = netAmount + vatAmount;
    
    // Diese Felder sind nicht Teil des Hauptforms, daher verwenden wir setValue nicht
    // Stattdessen speichern wir sie im State
    (setValue as any)('netAmount', netAmount);
    (setValue as any)('vatAmount', vatAmount);
    (setValue as any)('totalAmount', totalAmount);
  };

  // Bestellung speichern
  const onSubmit = async (data: PurchaseOrderData) => {
    try {
      const orderData = {
        ...data,
        positions: positions,
        paymentTerms: paymentTerms
      };

      if (mode === 'create') {
        await createPurchaseOrder(orderData);
      } else if (mode === 'edit' && initialData?.id) {
        await updatePurchaseOrder(initialData.id, orderData);
      }

      if (onSave) {
        onSave(orderData);
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Bestellung:', error);
    }
  };

  // Bestellung drucken
  const handlePrint = async () => {
    try {
      // TODO: Implementiere Druck-Funktionalität
      console.log('Drucke Bestellung...');
    } catch (error) {
      console.error('Fehler beim Drucken:', error);
    }
  };

  // Bestellung kopieren
  const handleCopy = () => {
    const copiedOrder = {
      ...initialData,
      id: undefined,
      orderNumber: `BO-${Date.now()}`,
      orderDate: new Date(),
      positions: positions.map(pos => ({ ...pos, id: `pos-${Date.now()}-${Math.random()}` }))
    };
    // Verwende die reset Funktion aus dem useForm Hook
    (reset as any)(copiedOrder as PurchaseOrderData);
  };

  return (
    <Card className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" className="text-gray-800">
          {mode === 'create' ? 'Bestellung erstellen' : 
           mode === 'edit' ? 'Bestellung bearbeiten' : 'Bestellung anzeigen'}
        </Typography>
        
        <div className="flex space-x-2">
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={mode === 'create'}
          >
            Drucken
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileCopyIcon />}
            onClick={handleCopy}
            disabled={mode === 'create'}
          >
            Kopieren
          </Button>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={onCancel}
          >
            Abbrechen
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit(onSubmit)}
            disabled={mode === 'view'}
            data-testid="save-button"
          >
            Speichern
          </Button>
        </div>
      </div>

      {/* Fehler-Anzeige */}
      {purchaseOrderError && (
        <Alert severity="error" className="mb-4">
          {purchaseOrderError}
        </Alert>
      )}

      {/* Lade-Indikator */}
      {purchaseOrderLoading && (
        <div className="flex justify-center items-center py-8">
          <CircularProgress />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Kopfbereich */}
        <Paper className="p-4 mb-6">
          <Typography variant="h6" className="mb-4">
            Bestelldaten
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="creditorAccountNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Kreditor-Konto-Nr."
                    fullWidth
                    required
                    error={!!errors.creditorAccountNumber}
                    helperText={errors.creditorAccountNumber?.message}
                    disabled={mode === 'view'}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="branch"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Niederlassung"
                    fullWidth
                    required
                    error={!!errors.branch}
                    helperText={errors.branch?.message}
                    disabled={mode === 'view'}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="costCenter"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Kostenträger"
                    fullWidth
                    required
                    error={!!errors.costCenter}
                    helperText={errors.costCenter?.message}
                    disabled={mode === 'view'}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="commission"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Kommission"
                    fullWidth
                    required
                    error={!!errors.commission}
                    helperText={errors.commission?.message}
                    disabled={mode === 'view'}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="supplier"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Lieferant"
                    fullWidth
                    required
                    error={!!errors.supplier}
                    helperText={errors.supplier?.message}
                    disabled={mode === 'view'}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="latestDeliveryDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="spät. Liefer-Datum"
                    type="date"
                    fullWidth
                    required
                    error={!!errors.latestDeliveryDate}
                    helperText={errors.latestDeliveryDate?.message}
                    disabled={mode === 'view'}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="loadingDeadline"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Lade-Termin bis"
                    type="date"
                    fullWidth
                    required
                    error={!!errors.loadingDeadline}
                    helperText={errors.loadingDeadline?.message}
                    disabled={mode === 'view'}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="loadingDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Lade-Datum"
                    type="date"
                    fullWidth
                    required
                    error={!!errors.loadingDate}
                    helperText={errors.loadingDate?.message}
                    disabled={mode === 'view'}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="orderNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bestell-Nr."
                    fullWidth
                    required
                    error={!!errors.orderNumber}
                    helperText={errors.orderNumber?.message}
                    disabled={mode === 'view'}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="orderDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bestell-Datum"
                    type="date"
                    fullWidth
                    required
                    error={!!errors.orderDate}
                    helperText={errors.orderDate?.message}
                    disabled={mode === 'view'}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="operator"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bediener"
                    fullWidth
                    required
                    error={!!errors.operator}
                    helperText={errors.operator?.message}
                    disabled={mode === 'view'}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="completed"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={mode === 'view'}
                      />
                    }
                    label="Erledigt"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Registerkarten */}
        <Paper className="mb-6">
          <Tabs value={tabValue} onChange={handleTabChange} className="border-b">
            <Tab label="Positionen" />
            <Tab label="Anfrage / Angebot / Auftrag" />
            <Tab label="Zahlungsbedingungen" />
            <Tab label="Zusätzliche Angaben" />
          </Tabs>

          {/* Positionen Tab */}
          <TabPanel value={tabValue} index={0}>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6">
                Bestellpositionen ({positions.length})
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddPosition}
                disabled={mode === 'view'}
                className="bg-blue-50 hover:bg-blue-100"
              >
                Position hinzufügen
              </Button>
            </div>

            {positions.length === 0 ? (
              <Alert severity="info">
                Keine Positionen vorhanden. Klicken Sie auf "Position hinzufügen" um eine neue Position zu erstellen.
              </Alert>
            ) : (
              <Table className="w-full border-collapse">
                <TableHead>
                  <TableRow className="bg-gray-100">
                    <TableCell className="font-semibold">Pos</TableCell>
                    <TableCell className="font-semibold">Artikel-Nr.</TableCell>
                    <TableCell className="font-semibold">Lieferant</TableCell>
                    <TableCell className="font-semibold">Bezeichnung</TableCell>
                    <TableCell className="font-semibold">Menge</TableCell>
                    <TableCell className="font-semibold">Geb.-Menge</TableCell>
                    <TableCell className="font-semibold">Geb.-Einheit</TableCell>
                    <TableCell className="font-semibold">Bestand</TableCell>
                    <TableCell className="font-semibold">Preis</TableCell>
                    <TableCell className="font-semibold">Kontrakt</TableCell>
                    <TableCell className="font-semibold">Nettobetrag</TableCell>
                    <TableCell className="font-semibold">Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {positions.map((position, index) => (
                    <TableRow key={position.id} className="hover:bg-gray-50">
                      <TableCell>{position.position}</TableCell>
                      <TableCell className="font-mono">{position.articleNumber}</TableCell>
                      <TableCell>{position.supplier}</TableCell>
                      <TableCell>{position.description}</TableCell>
                      <TableCell className="text-right">{position.quantity}</TableCell>
                      <TableCell className="text-right">{position.packageQuantity}</TableCell>
                      <TableCell>{position.packageUnit}</TableCell>
                      <TableCell className="text-right">{position.stock}</TableCell>
                      <TableCell className="text-right">{position.price.toFixed(2)} €</TableCell>
                      <TableCell>{position.contract}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {(position.quantity * position.price).toFixed(2)} €
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Tooltip title="Bearbeiten">
                            <IconButton
                              size="small"
                              onClick={() => handleEditPosition(position)}
                              disabled={mode === 'view'}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Löschen">
                            <IconButton
                              size="small"
                              onClick={() => handleDeletePosition(position.id)}
                              disabled={mode === 'view'}
                              className="text-red-600"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Summen */}
            {positions.length > 0 && (
              <Paper className="p-4 mt-4 bg-gray-50">
                <Grid container spacing={2} className="text-right">
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6">
                      Nettobetrag: {positions.reduce((sum, pos) => sum + (pos.quantity * pos.price), 0).toFixed(2)} €
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6">
                      MwSt. (19%): {(positions.reduce((sum, pos) => sum + (pos.quantity * pos.price), 0) * 0.19).toFixed(2)} €
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h5" className="font-bold text-blue-600">
                      Gesamtbetrag: {(positions.reduce((sum, pos) => sum + (pos.quantity * pos.price), 0) * 1.19).toFixed(2)} €
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </TabPanel>

          {/* Anfrage / Angebot / Auftrag Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" className="mb-4">
              Referenzdokumente
            </Typography>
            <Alert severity="info">
              Hier können Sie Referenzdokumente wie Anfragen, Angebote oder Aufträge verknüpfen.
            </Alert>
          </TabPanel>

          {/* Zahlungsbedingungen Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" className="mb-4">
              Zahlungsbedingungen
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Zahlungsmethode"
                  fullWidth
                  select
                  value={paymentTerms.paymentMethod}
                  onChange={(e) => setPaymentTerms(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  disabled={mode === 'view'}
                >
                  {Object.values(PaymentMethod).map((method) => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Zahlungsziel (Tage)"
                  type="number"
                  fullWidth
                  value={paymentTerms.paymentDeadline}
                  onChange={(e) => setPaymentTerms(prev => ({ ...prev, paymentDeadline: parseInt(e.target.value) || 0 }))}
                  disabled={mode === 'view'}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Zusätzliche Angaben Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" className="mb-4">
              Zusätzliche Angaben
            </Typography>
            <Controller
              name="additionalInfo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Zusätzliche Informationen"
                  fullWidth
                  multiline
                  rows={4}
                  disabled={mode === 'view'}
                />
              )}
            />
          </TabPanel>
        </Paper>
      </form>

      {/* Position-Dialog */}
      <Dialog 
        open={positionDialogOpen} 
        onClose={() => setPositionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPosition ? 'Position bearbeiten' : 'Neue Position hinzufügen'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handlePositionSubmit(handleSavePosition)}>
            <Grid container spacing={3} className="mt-2">
              <Grid item xs={12} sm={6}>
                <Controller
                  name="articleNumber"
                  control={positionControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Artikel-Nr."
                      fullWidth
                      required
                      error={!!positionErrors.articleNumber}
                      helperText={positionErrors.articleNumber?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="supplier"
                  control={positionControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Lieferant"
                      fullWidth
                      required
                      error={!!positionErrors.supplier}
                      helperText={positionErrors.supplier?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={positionControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Bezeichnung"
                      fullWidth
                      required
                      error={!!positionErrors.description}
                      helperText={positionErrors.description?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="quantity"
                  control={positionControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Menge"
                      type="number"
                      fullWidth
                      required
                      error={!!positionErrors.quantity}
                      helperText={positionErrors.quantity?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="packageQuantity"
                  control={positionControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Gebindemenge"
                      type="number"
                      fullWidth
                      required
                      error={!!positionErrors.packageQuantity}
                      helperText={positionErrors.packageQuantity?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="packageUnit"
                  control={positionControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Gebindeeinheit"
                      fullWidth
                      required
                      select
                      error={!!positionErrors.packageUnit}
                      helperText={positionErrors.packageUnit?.message}
                    >
                      {Object.values(UnitType).map((unit) => (
                        <MenuItem key={unit} value={unit}>
                          {unit}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="stock"
                  control={positionControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Bestand"
                      type="number"
                      fullWidth
                      required
                      error={!!positionErrors.stock}
                      helperText={positionErrors.stock?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="price"
                  control={positionControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Preis"
                      type="number"
                      fullWidth
                      required
                      error={!!positionErrors.price}
                      helperText={positionErrors.price?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="contract"
                  control={positionControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kontrakt"
                      fullWidth
                      required
                      error={!!positionErrors.contract}
                      helperText={positionErrors.contract?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPositionDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handlePositionSubmit(handleSavePosition)}
            variant="contained"
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}; 