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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Create as CreateIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useErpStore } from '../../store/erpStore';
import { OrderSuggestionData, OrderSuggestionFilters } from '../../types/erpTypes';

// Validierungsschema für Filter
const filterSchema: yup.ObjectSchema<OrderSuggestionFilters> = yup.object({
  articleGroup: yup.string().optional(),
  branch: yup.string().optional(),
  matchcode: yup.string().optional(),
  minStock: yup.number().min(0, 'Mindestbestand muss größer oder gleich 0 sein').optional(),
  maxStock: yup.number().min(0, 'Maximalbestand muss größer oder gleich 0 sein').optional()
}) as yup.ObjectSchema<OrderSuggestionFilters>;

interface OrderSuggestionProps {
  onSuggestionSelect?: (suggestion: OrderSuggestionData) => void;
  onOrderCreate?: (order: any) => void;
}

export const OrderSuggestion: React.FC<OrderSuggestionProps> = ({
  onSuggestionSelect,
  onOrderCreate
}) => {
  const {
    orderSuggestions,
    orderSuggestionFilters,
    orderSuggestionLoading,
    orderSuggestionError,
    fetchOrderSuggestions,
    createOrderFromSuggestion
  } = useErpStore();

  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<OrderSuggestionFilters>({
    resolver: yupResolver(filterSchema)
  });

  // Initial laden
  useEffect(() => {
    fetchOrderSuggestions({});
  }, [fetchOrderSuggestions]);

  // Filter anwenden
  const onSubmitFilters = (filters: OrderSuggestionFilters) => {
    fetchOrderSuggestions(filters);
  };

  // Filter zurücksetzen
  const handleResetFilters = () => {
    reset();
    fetchOrderSuggestions({});
  };

  // Vorschlag auswählen
  const handleSuggestionSelect = (suggestion: OrderSuggestionData) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  // Bestellung aus Vorschlag erstellen
  const handleCreateOrder = async (suggestion: OrderSuggestionData) => {
    try {
      await createOrderFromSuggestion(suggestion);
      if (onOrderCreate) {
        onOrderCreate(suggestion);
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Bestellung:', error);
    }
  };

  // Mehrere Vorschläge auswählen
  const handleSelectSuggestion = (articleNumber: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(articleNumber) 
        ? prev.filter(id => id !== articleNumber)
        : [...prev, articleNumber]
    );
  };

  // Alle ausgewählten Vorschläge zu Bestellung
  const handleCreateOrderFromSelected = async () => {
    const selectedSuggestionsData = orderSuggestions.filter(s => 
      selectedSuggestions.includes(s.articleNumber)
    );
    
    for (const suggestion of selectedSuggestionsData) {
      await handleCreateOrder(suggestion);
    }
    
    setSelectedSuggestions([]);
  };

  return (
    <Card className="p-6 max-w-7xl mx-auto">
      <Typography variant="h5" className="mb-6 text-gray-800">
        Bestellvorschlag / Bestellung / Lieferantenstamm
      </Typography>

      {/* Filter-Bereich */}
      <Paper className="p-4 mb-6 bg-gray-50">
        <Typography variant="h6" className="mb-4">
          Filter
        </Typography>
        
        <form onSubmit={handleSubmit(onSubmitFilters)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="articleGroup"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Artikel-Gruppe"
                    fullWidth
                    variant="outlined"
                    size="small"
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
                    variant="outlined"
                    size="small"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="matchcode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Matchcode"
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="minStock"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Min.-Bestand"
                    type="number"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={!!errors.minStock}
                    helperText={errors.minStock?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="maxStock"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Max.-Bestand"
                    type="number"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={!!errors.maxStock}
                    helperText={errors.maxStock?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SearchIcon />}
                  size="small"
                >
                  Suchen
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  size="small"
                  onClick={handleResetFilters}
                >
                  Zurücksetzen
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Aktions-Buttons */}
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h6">
          Bestellvorschlagsliste ({orderSuggestions.length} Einträge)
        </Typography>
        
        <div className="flex space-x-2">
          {selectedSuggestions.length > 0 && (
            <Button
              variant="contained"
              startIcon={<CreateIcon />}
              onClick={handleCreateOrderFromSelected}
              className="bg-green-600 hover:bg-green-700"
            >
              Bestellung aus {selectedSuggestions.length} Vorschlägen erstellen
            </Button>
          )}
        </div>
      </div>

      {/* Fehler-Anzeige */}
      {orderSuggestionError && (
        <Alert severity="error" className="mb-4">
          {orderSuggestionError}
        </Alert>
      )}

      {/* Lade-Indikator */}
      {orderSuggestionLoading && (
        <div className="flex justify-center items-center py-8">
          <CircularProgress />
        </div>
      )}

      {/* Tabelle */}
      {!orderSuggestionLoading && (
        <Table className="w-full border-collapse">
          <TableHead>
            <TableRow className="bg-gray-100">
              <TableCell className="font-semibold">Auswahl</TableCell>
              <TableCell className="font-semibold">Lager</TableCell>
              <TableCell className="font-semibold">Artikel-Nr.</TableCell>
              <TableCell className="font-semibold">Bezeichnung</TableCell>
              <TableCell className="font-semibold">Bestand</TableCell>
              <TableCell className="font-semibold">Min.-Best.</TableCell>
              <TableCell className="font-semibold">Max.-Best.</TableCell>
              <TableCell className="font-semibold">Verkauf</TableCell>
              <TableCell className="font-semibold">Vorschlag</TableCell>
              <TableCell className="font-semibold">Einkauf</TableCell>
              <TableCell className="font-semibold">Matchcode</TableCell>
              <TableCell className="font-semibold">Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orderSuggestions.map((suggestion) => (
              <TableRow 
                key={suggestion.articleNumber}
                className="hover:bg-gray-50"
              >
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedSuggestions.includes(suggestion.articleNumber)}
                    onChange={() => handleSelectSuggestion(suggestion.articleNumber)}
                    className="w-4 h-4"
                  />
                </TableCell>
                <TableCell>{suggestion.warehouse}</TableCell>
                <TableCell className="font-mono">{suggestion.articleNumber}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{suggestion.description1}</div>
                    {suggestion.description2 && (
                      <div className="text-sm text-gray-600">{suggestion.description2}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">{suggestion.stock}</TableCell>
                <TableCell className="text-right">{suggestion.minStock}</TableCell>
                <TableCell className="text-right">{suggestion.maxStock}</TableCell>
                <TableCell className="text-right">{suggestion.sales}</TableCell>
                <TableCell className="text-right font-semibold text-blue-600">
                  {suggestion.suggestion}
                </TableCell>
                <TableCell className="text-right">{suggestion.purchase}</TableCell>
                <TableCell className="font-mono text-sm">{suggestion.matchcode}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Tooltip title="Vorschlag auswählen">
                      <IconButton
                        size="small"
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="text-blue-600"
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Bestellung erstellen">
                      <IconButton
                        size="small"
                        onClick={() => handleCreateOrder(suggestion)}
                        className="text-green-600"
                      >
                        <CreateIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Keine Daten */}
      {!orderSuggestionLoading && orderSuggestions.length === 0 && (
        <Alert severity="info" className="mt-4">
          Keine Bestellvorschläge gefunden. Passen Sie die Filter an oder erstellen Sie neue Vorschläge.
        </Alert>
      )}

      {/* Zusätzliche Informationen */}
      <Paper className="p-4 mt-6 bg-blue-50">
        <Typography variant="h6" className="mb-2 text-blue-800">
          Informationen
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
          <div>
            <strong>Artikel-Gruppe:</strong> Gruppierung der Artikel nach Kategorien
          </div>
          <div>
            <strong>Niederlassung:</strong> Standort/Zweigstelle
          </div>
          <div>
            <strong>Matchcode:</strong> Suchcode für schnelle Artikelfindung
          </div>
          <div>
            <strong>Min.-Bestand:</strong> Mindestbestand für automatische Bestellvorschläge
          </div>
          <div>
            <strong>Max.-Bestand:</strong> Maximalbestand für Lageroptimierung
          </div>
          <div>
            <strong>Vorschlag:</strong> Automatisch berechnete Bestellmenge
          </div>
        </div>
      </Paper>
    </Card>
  );
}; 