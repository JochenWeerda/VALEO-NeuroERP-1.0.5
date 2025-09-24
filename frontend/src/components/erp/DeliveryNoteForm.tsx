import React from 'react';
import { Box, Card, Typography, TextField, Checkbox, FormControlLabel, Button, CircularProgress, Autocomplete } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { DeliveryNoteMasterData, DeliveryNotePosition } from '../../types/erp';
import { Supplier } from '../../types/crm';
import { neuroFlowColors, neuroFlowTypography } from '../../design-system/NeuroFlowTheme';

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
  // NeuroFlow Border Radius Standards
  const neuroFlowBorderRadius = {
    small: '4px',
    medium: '6px', 
    large: '8px',
    xlarge: '12px'
  };

  // NeuroFlow Form Styles
  const neuroFlowFormStyles = {
    '& .MuiTextField-root, & .MuiAutocomplete-root': {
      '& .MuiOutlinedInput-root': {
        borderRadius: neuroFlowBorderRadius.large,
        backgroundColor: neuroFlowColors.surface.primary,
        '&:hover': {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: neuroFlowColors.primary[300]
          }
        },
        '&.Mui-focused': {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: neuroFlowColors.primary[500]
          }
        }
      },
      '& .MuiInputLabel-root': {
        color: neuroFlowColors.neutral[600],
        fontFamily: neuroFlowTypography.fontFamily,
        fontSize: neuroFlowTypography.body1.fontSize,
        fontWeight: neuroFlowTypography.body1.fontWeight
      }
    },
    '& .MuiDataGrid-root': {
      border: `1px solid ${neuroFlowColors.neutral[200]}`,
      borderRadius: neuroFlowBorderRadius.large,
      '& .MuiDataGrid-cell': {
        borderBottom: `1px solid ${neuroFlowColors.neutral[200]}`,
        fontFamily: neuroFlowTypography.fontFamily,
        fontSize: neuroFlowTypography.body2.fontSize
      },
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: neuroFlowColors.neutral[50],
        borderBottom: `2px solid ${neuroFlowColors.neutral[200]}`,
        '& .MuiDataGrid-columnHeader': {
          fontFamily: neuroFlowTypography.fontFamily,
          fontSize: neuroFlowTypography.body1.fontSize,
          fontWeight: neuroFlowTypography.body1.fontWeight,
          color: neuroFlowColors.neutral[800]
        }
      }
    }
  };

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
    <Card 
      sx={{
        padding: '24px',
        maxWidth: '1200px',
        margin: '24px auto',
        borderRadius: neuroFlowBorderRadius.xlarge,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: `1px solid ${neuroFlowColors.neutral[200]}`
      }}
    >
      <Typography 
        variant="h6" 
        sx={{
          marginBottom: '24px',
          fontFamily: neuroFlowTypography.fontFamily,
          fontSize: neuroFlowTypography.h6.fontSize,
          fontWeight: neuroFlowTypography.h6.fontWeight,
          color: neuroFlowColors.neutral[800],
          borderBottom: `2px solid ${neuroFlowColors.primary[200]}`,
          paddingBottom: '12px'
        }}
      >
        Lieferanten-Lieferschein
      </Typography>
      
      {error && (
        <Box sx={{ marginBottom: '16px' }}>
          <Typography 
            color="error"
            sx={{
              fontFamily: neuroFlowTypography.fontFamily,
              fontSize: neuroFlowTypography.body2.fontSize,
              backgroundColor: neuroFlowColors.error[50],
              padding: '12px',
              borderRadius: neuroFlowBorderRadius.medium,
              border: `1px solid ${neuroFlowColors.error[200]}`
            }}
          >
            {error}
          </Typography>
        </Box>
      )}
      
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '160px' 
        }}>
          <CircularProgress sx={{ color: neuroFlowColors.primary[500] }} />
        </Box>
      ) : (
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {/* Stammdaten */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: '16px' 
          }}>
            <Autocomplete
              options={suppliers}
              getOptionLabel={option => option.name}
              value={masterData.lieferant}
              onChange={(_, newValue) => handleMasterChange('lieferant', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Lieferant"
                  required
                  inputProps={{
                    ...params.inputProps,
                    'aria-label': 'Lieferant auswählen',
                    'aria-describedby': 'lieferant-helper-text'
                  }}
                  FormHelperTextProps={{
                    id: 'lieferant-helper-text'
                  }}
                />
              )}
            />
            
            <TextField
              fullWidth
              label="Lieferschein-Nummer"
              value={masterData.lieferscheinNr}
              onChange={(e) => handleMasterChange('lieferscheinNr', e.target.value)}
              inputProps={{
                'aria-label': 'Lieferschein-Nummer eingeben',
                'aria-describedby': 'lieferschein-nr-helper-text'
              }}
              FormHelperTextProps={{
                id: 'lieferschein-nr-helper-text'
              }}
              required
            />
            
            <TextField
              fullWidth
              label="Lieferdatum"
              type="date"
              value={masterData.lieferdatum}
              onChange={(e) => handleMasterChange('lieferdatum', e.target.value)}
              inputProps={{
                'aria-label': 'Lieferdatum eingeben',
                'aria-describedby': 'lieferdatum-helper-text'
              }}
              FormHelperTextProps={{
                id: 'lieferdatum-helper-text'
              }}
              required
            />
            
            <TextField
              fullWidth
              label="Empfänger"
              value={masterData.empfaenger}
              onChange={(e) => handleMasterChange('empfaenger', e.target.value)}
              inputProps={{
                'aria-label': 'Empfänger eingeben',
                'aria-describedby': 'empfaenger-helper-text'
              }}
              FormHelperTextProps={{
                id: 'empfaenger-helper-text'
              }}
            />
          </Box>

          {/* Positionen */}
          <Box sx={{ marginTop: '24px' }}>
            <Typography 
              variant="h6"
              sx={{
                marginBottom: '16px',
                fontFamily: neuroFlowTypography.fontFamily,
                fontSize: neuroFlowTypography.h6.fontSize,
                fontWeight: neuroFlowTypography.h6.fontWeight,
                color: neuroFlowColors.neutral[800]
              }}
            >
              Positionen
            </Typography>
            
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={positions}
                columns={columns}
                onRowUpdate={handleRowEdit}
                sx={neuroFlowFormStyles}
                aria-label="Lieferschein-Positionen Tabelle"
              />
            </Box>
          </Box>

          {/* Aktionen */}
          <Box sx={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: `1px solid ${neuroFlowColors.neutral[200]}`
          }}>
            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                sx={{
                  borderRadius: neuroFlowBorderRadius.medium,
                  borderColor: neuroFlowColors.neutral[400],
                  color: neuroFlowColors.neutral[700],
                  '&:hover': {
                    borderColor: neuroFlowColors.neutral[600],
                    backgroundColor: neuroFlowColors.neutral[50]
                  }
                }}
              >
                Abbrechen
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: neuroFlowBorderRadius.medium,
                backgroundColor: neuroFlowColors.primary[500],
                '&:hover': {
                  backgroundColor: neuroFlowColors.primary[600]
                }
              }}
            >
              Speichern
            </Button>
          </Box>
        </form>
      )}
    </Card>
  );
}; 