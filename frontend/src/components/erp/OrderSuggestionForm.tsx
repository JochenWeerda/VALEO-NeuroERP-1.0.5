import React from 'react';
import { Box, Card, Typography, Button, CircularProgress, Autocomplete, TextField } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { OrderSuggestionLine } from '../../types/erp';
import { Supplier } from '../../types/crm';

/**
 * Props für das Bestellvorschlag/Bestellung-Formular
 */
export interface OrderSuggestionFormProps {
  orderLines: OrderSuggestionLine[];
  suppliers: Supplier[];
  loading?: boolean;
  error?: string;
  onChangeOrderLines: (lines: OrderSuggestionLine[]) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

/**
 * Bestellvorschlag/Bestellung-Formular
 * - Bestellzeilen als Tabelle
 * - Automatische Berechnung des Bestellwerts
 * - Error-Handling, Loading-State, responsive
 */
export const OrderSuggestionForm: React.FC<OrderSuggestionFormProps> = ({
  orderLines,
  suppliers,
  loading = false,
  error,
  onChangeOrderLines,
  onSubmit,
  onCancel,
}) => {
  // Spalten für die Bestellzeilen-Tabelle
  const columns: GridColDef[] = [
    { field: 'lagerNr', headerName: 'Lager-Nr.', width: 100, editable: true },
    { field: 'matchcode', headerName: 'Matchcode', width: 120, editable: true },
    { field: 'artikelbezeichnung', headerName: 'Artikelbezeichnung', width: 200, editable: true },
    { field: 'bestand', headerName: 'Bestand', width: 90, editable: false, type: 'number' },
    { field: 'mindestbestand', headerName: 'Mindestbestand', width: 120, editable: true, type: 'number' },
    { field: 'vorschlag', headerName: 'Vorschlag', width: 100, editable: true, type: 'number' },
    {
      field: 'lieferant',
      headerName: 'Lieferant',
      width: 150,
      editable: false,
      renderCell: (params) => params.value?.name || '',
    },
    { field: 'restmenge', headerName: 'Restmenge', width: 100, editable: false, type: 'number' },
    { field: 'einheit', headerName: 'Einheit', width: 80, editable: true },
    { field: 'ekPreis', headerName: 'EK-Preis', width: 100, editable: true, type: 'number' },
    { field: 'bestellwert', headerName: 'Bestellwert', width: 120, editable: false, type: 'number' },
  ];

  // Handler für Inline-Editing in der DataGrid
  const handleRowEdit = (params: any) => {
    const updated = orderLines.map((row) => {
      if (row.lagerNr === params.id) {
        const updatedRow = { ...row, ...params };
        // Automatische Berechnung des Bestellwerts
        updatedRow.bestellwert = (updatedRow.vorschlag || 0) * (updatedRow.ekPreis || 0);
        return updatedRow;
      }
      return row;
    });
    onChangeOrderLines(updated);
  };

  // Handler für Lieferanten-Auswahl
  const handleSupplierChange = (lagerNr: string, supplier: Supplier | null) => {
    const updated = orderLines.map((row) =>
      row.lagerNr === lagerNr ? { ...row, lieferant: supplier } : row
    );
    onChangeOrderLines(updated);
  };

  // Berechne Gesamtsumme
  const totalOrderValue = orderLines.reduce((sum, line) => sum + (line.bestellwert || 0), 0);

  return (
    <Card className="p-6 max-w-6xl mx-auto mt-6 shadow-md">
      <Typography variant="h6" className="mb-4 text-gray-800">
        Bestellvorschlag / Bestellung
      </Typography>
      {error && (
        <Box className="mb-4">
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      {loading ? (
        <Box className="flex justify-center items-center h-40">
          <CircularProgress />
        </Box>
      ) : (
        <div className="space-y-6">
          {/* Bestellzeilen */}
          <div>
            <Typography variant="subtitle1" className="mb-2 text-gray-700">
              Bestellzeilen
            </Typography>
            <div className="bg-white rounded shadow border">
              <DataGrid
                autoHeight
                rows={orderLines as GridRowsProp}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 },
                  },
                }}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
                onRowEditStop={params => handleRowEdit(params)}
                getRowId={row => row.lagerNr}
                className="min-h-[400px]"
              />
            </div>
          </div>

          {/* Lieferanten-Auswahl für ausgewählte Zeilen */}
          <div className="bg-gray-50 p-4 rounded">
            <Typography variant="subtitle2" className="mb-3 text-gray-700">
              Lieferanten-Auswahl
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orderLines.map((line) => (
                <Autocomplete
                  key={line.lagerNr}
                  options={suppliers}
                  getOptionLabel={option => option.name}
                  value={line.lieferant}
                  onChange={(_, value) => handleSupplierChange(line.lagerNr, value)}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={`${line.artikelbezeichnung} (${line.lagerNr})`}
                      size="small"
                    />
                  )}
                />
              ))}
            </div>
          </div>

          {/* Gesamtsumme */}
          <Box className="bg-blue-50 p-4 rounded">
            <Typography variant="h6" className="text-blue-800">
              Gesamtbestellwert: {totalOrderValue.toFixed(2)} €
            </Typography>
          </Box>

          {/* Aktionen */}
          <Box className="flex space-x-4">
            <Button variant="contained" color="primary" onClick={onSubmit}>
              Bestellung erstellen
            </Button>
            {onCancel && (
              <Button variant="outlined" onClick={onCancel}>
                Abbrechen
              </Button>
            )}
          </Box>
        </div>
      )}
    </Card>
  );
}; 