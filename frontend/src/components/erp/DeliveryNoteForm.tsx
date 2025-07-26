import React from 'react';
import { Box, Card, Typography, TextField, Checkbox, FormControlLabel, Button, CircularProgress, Autocomplete } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { DeliveryNoteMasterData, DeliveryNotePosition } from '../../types/erp';
import { Supplier } from '../../types/crm';

/**
 * Props für das Lieferanten-Lieferschein-Formular
 */
export interface DeliveryNoteFormProps {
  masterData: DeliveryNoteMasterData;
  positions: DeliveryNotePosition[];
  suppliers: Supplier[];
  loading?: boolean;
  error?: string;
  onChangeMasterData: (data: Partial<DeliveryNoteMasterData>) => void;
  onChangePositions: (positions: DeliveryNotePosition[]) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

/**
 * Lieferanten-Lieferschein-Formular
 * - Stammdaten (oben)
 * - Positionen (Tabelle)
 * - Error-Handling, Loading-State, responsive
 */
export const DeliveryNoteForm: React.FC<DeliveryNoteFormProps> = ({
  masterData,
  positions,
  suppliers,
  loading = false,
  error,
  onChangeMasterData,
  onChangePositions,
  onSubmit,
  onCancel,
}) => {
  // Spalten für die Positions-Tabelle
  const columns: GridColDef[] = [
    { field: 'posNr', headerName: 'Pos.-Nr.', width: 80, editable: false },
    { field: 'artikelNr', headerName: 'Artikel-Nr.', width: 120, editable: true },
    { field: 'lieferantenArtNr', headerName: 'Lieferanten-Art.-Nr.', width: 140, editable: true },
    { field: 'artikelbezeichnung', headerName: 'Artikelbezeichnung', width: 180, editable: true },
    { field: 'gebindeNr', headerName: 'Gebinde-Nr.', width: 120, editable: true },
    { field: 'gebinde', headerName: 'Gebinde', width: 100, editable: true },
    { field: 'menge', headerName: 'Menge', width: 90, editable: true, type: 'number' },
    { field: 'einheit', headerName: 'Einheit', width: 90, editable: true },
    { field: 'ekPreis', headerName: 'EK-Preis', width: 100, editable: true, type: 'number' },
    { field: 'niederlassung', headerName: 'Niederl.', width: 100, editable: true },
    { field: 'lagerhalle', headerName: 'Lagerhalle', width: 110, editable: true },
    { field: 'lagerfach', headerName: 'Lagerfach', width: 100, editable: true },
    { field: 'charge', headerName: 'Charge', width: 100, editable: true },
    { field: 'serienNr', headerName: 'Serien-Nr.', width: 120, editable: true },
    { field: 'kontakt', headerName: 'Kontakt', width: 120, editable: true },
    { field: 'preiscode', headerName: 'Preiscode', width: 100, editable: true },
    { field: 'masterNr', headerName: 'Master-Nr.', width: 120, editable: true },
  ];

  // Handler für Inline-Editing in der DataGrid
  const handleRowEdit = (params: any) => {
    const updated = positions.map((row) =>
      row.posNr === params.id ? { ...row, ...params } : row
    );
    onChangePositions(updated);
  };

  // Handler für Stammdaten-Änderungen
  const handleMasterChange = (field: keyof DeliveryNoteMasterData, value: any) => {
    onChangeMasterData({ [field]: value });
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto mt-6 shadow-md">
      <Typography variant="h6" className="mb-4 text-gray-800">
        Lieferanten-Lieferschein
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
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-6"
        >
          {/* Stammdaten */}
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Autocomplete
              options={suppliers}
              getOptionLabel={option => option.name}
              value={masterData.lieferant}
              onChange={(_, value) => handleMasterChange('lieferant', value)}
              renderInput={params => (
                <TextField {...params} label="Lieferant" required fullWidth />
              )}
            />
            <TextField
              label="ZW-Händler"
              value={masterData.zwHaendler}
              onChange={e => handleMasterChange('zwHaendler', e.target.value)}
              fullWidth
            />
            <TextField
              label="LS-Referenz-Nr."
              value={masterData.lsReferenzNr}
              onChange={e => handleMasterChange('lsReferenzNr', e.target.value)}
              fullWidth
            />
            <TextField
              label="Bearbeiter"
              value={masterData.bearbeiter}
              onChange={e => handleMasterChange('bearbeiter', e.target.value)}
              fullWidth
            />
            <TextField
              label="Datum"
              type="date"
              value={masterData.datum}
              onChange={e => handleMasterChange('datum', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={masterData.erledigt}
                  onChange={e => handleMasterChange('erledigt', e.target.checked)}
                />
              }
              label="Erledigt"
            />
            <TextField
              label="LS-Nr."
              value={masterData.lsNr}
              onChange={e => handleMasterChange('lsNr', e.target.value)}
              fullWidth
            />
          </Box>

          {/* Positionen */}
          <div className="mt-8">
            <Typography variant="subtitle1" className="mb-2 text-gray-700">
              Positionen
            </Typography>
            <div className="bg-white rounded shadow border">
              <DataGrid
                autoHeight
                rows={positions as GridRowsProp}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 5 },
                  },
                }}
                pageSizeOptions={[5, 10, 20]}
                disableRowSelectionOnClick
                onRowEditStop={params => handleRowEdit(params)}
                getRowId={row => row.posNr}
                className="min-h-[300px]"
              />
            </div>
          </div>

          {/* Aktionen */}
          <Box className="flex space-x-4 mt-6">
            <Button type="submit" variant="contained" color="primary">
              Speichern
            </Button>
            {onCancel && (
              <Button variant="outlined" onClick={onCancel}>
                Abbrechen
              </Button>
            )}
          </Box>
        </form>
      )}
    </Card>
  );
}; 