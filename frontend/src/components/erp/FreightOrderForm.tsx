import React from 'react';
import { Box, Card, Typography, TextField, Button, CircularProgress, Autocomplete, Chip } from '@mui/material';
import { FreightOrderHeader } from '../../types/erp';
import { Customer } from '../../types/crm';

/**
 * Props für das Frachtauftrag-Formular
 */
export interface FreightOrderFormProps {
  header: FreightOrderHeader;
  customers: Customer[];
  loading?: boolean;
  error?: string;
  onChangeHeader: (header: Partial<FreightOrderHeader>) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

/**
 * Frachtauftrag-Formular
 * - Kopfbereich mit Spediteur, Terminen, Kunden
 * - Error-Handling, Loading-State, responsive
 */
export const FreightOrderForm: React.FC<FreightOrderFormProps> = ({
  header,
  customers,
  loading = false,
  error,
  onChangeHeader,
  onSubmit,
  onCancel,
}) => {
  // Handler für Header-Änderungen
  const handleHeaderChange = (field: keyof FreightOrderHeader, value: any) => {
    onChangeHeader({ [field]: value });
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto mt-6 shadow-md">
      <Typography variant="h6" className="mb-4 text-gray-800">
        Frachtauftrag
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
          {/* Spediteur und Termine */}
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              label="Spediteur-Nr."
              value={header.spediteurNr}
              onChange={e => handleHeaderChange('spediteurNr', e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Liefer-Termin"
              type="date"
              value={header.lieferTermin}
              onChange={e => handleHeaderChange('lieferTermin', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              label="Lade-Datum"
              type="date"
              value={header.ladeDatum}
              onChange={e => handleHeaderChange('ladeDatum', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
          </Box>

          {/* Kunden-Auswahl */}
          <Box>
            <Typography variant="subtitle1" className="mb-2 text-gray-700">
              Auswahl Kunden
            </Typography>
            <Autocomplete
              multiple
              options={customers}
              getOptionLabel={option => `${option.name} (${option.customerNumber})`}
              value={header.kunden}
              onChange={(_, value) => handleHeaderChange('kunden', value)}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Kunden auswählen"
                  placeholder="Kunden hinzufügen..."
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={`${option.name} (${option.customerNumber})`}
                    {...getTagProps({ index })}
                    key={option.id}
                  />
                ))
              }
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <div>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {option.customerNumber} • {option.address.zipCode} {option.address.city}
                    </Typography>
                  </div>
                </Box>
              )}
            />
          </Box>

          {/* Debitoren-Filter */}
          <Box>
            <Typography variant="subtitle1" className="mb-2 text-gray-700">
              Debitoren-Filter
            </Typography>
            <TextField
              label="Debitoren-Filter"
              value={header.debitorenFilter || ''}
              onChange={e => handleHeaderChange('debitorenFilter', e.target.value)}
              placeholder="Filter für Debitoren eingeben..."
              fullWidth
              helperText="Optional: Filter für bestimmte Debitoren-Gruppen"
            />
          </Box>

          {/* Zusammenfassung */}
          <Box className="bg-gray-50 p-4 rounded">
            <Typography variant="subtitle2" className="mb-2 text-gray-700">
              Zusammenfassung
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Spediteur-Nr.:</span> {header.spediteurNr}
              </div>
              <div>
                <span className="font-medium">Liefer-Termin:</span> {header.lieferTermin}
              </div>
              <div>
                <span className="font-medium">Lade-Datum:</span> {header.ladeDatum}
              </div>
              <div>
                <span className="font-medium">Anzahl Kunden:</span> {header.kunden.length}
              </div>
              {header.debitorenFilter && (
                <div className="md:col-span-2">
                  <span className="font-medium">Debitoren-Filter:</span> {header.debitorenFilter}
                </div>
              )}
            </div>
          </Box>

          {/* Aktionen */}
          <Box className="flex space-x-4">
            <Button type="submit" variant="contained" color="primary">
              Frachtauftrag erstellen
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