import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Visibility as PreviewIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useApi } from '../../hooks/useApiData';
import { toast } from 'react-toastify';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  required: boolean;
}

const ENTITY_TYPES = {
  articles: {
    label: 'Artikel',
    requiredFields: ['name', 'sku', 'price'],
    optionalFields: ['description', 'ean', 'category', 'stock', 'min_stock'],
    sampleData: {
      name: 'Beispielartikel',
      sku: 'ART-001',
      price: '19.99',
      description: 'Beschreibung',
      ean: '1234567890123',
    },
  },
  customers: {
    label: 'Kunden',
    requiredFields: ['name', 'email'],
    optionalFields: ['phone', 'address', 'city', 'postal_code', 'country', 'tax_id'],
    sampleData: {
      name: 'Musterfirma GmbH',
      email: 'info@musterfirma.de',
      phone: '+49 123 456789',
      address: 'Musterstraße 1',
      city: 'Berlin',
    },
  },
  suppliers: {
    label: 'Lieferanten',
    requiredFields: ['name', 'email'],
    optionalFields: ['phone', 'address', 'contact_person', 'payment_terms'],
    sampleData: {
      name: 'Lieferant AG',
      email: 'kontakt@lieferant.de',
      contact_person: 'Max Mustermann',
    },
  },
};

export const BulkImportExport: React.FC = () => {
  const api = useApi();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [entityType, setEntityType] = useState<keyof typeof ENTITY_TYPES>('articles');
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const steps = ['Datei auswählen', 'Felder zuordnen', 'Vorschau', 'Import'];

  // Datei hochladen
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const fileExtension = uploadedFile.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(uploadedFile, {
        complete: (result) => {
          setFileData(result.data as any[]);
          detectFieldMappings(result.data[0]);
          setActiveStep(1);
        },
        header: true,
        encoding: 'UTF-8',
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setFileData(jsonData);
        detectFieldMappings(jsonData[0]);
        setActiveStep(1);
      };
      reader.readAsBinaryString(uploadedFile);
    } else {
      toast.error('Bitte nur CSV oder Excel-Dateien hochladen');
    }
  };

  // Automatische Feld-Zuordnung
  const detectFieldMappings = (firstRow: any) => {
    if (!firstRow) return;

    const sourceFields = Object.keys(firstRow);
    const entity = ENTITY_TYPES[entityType];
    const mappings: FieldMapping[] = [];

    // Versuche automatische Zuordnung
    [...entity.requiredFields, ...entity.optionalFields].forEach((targetField) => {
      const matchingSource = sourceFields.find((source) =>
        source.toLowerCase().includes(targetField.toLowerCase()) ||
        targetField.toLowerCase().includes(source.toLowerCase())
      );

      if (matchingSource) {
        mappings.push({
          sourceField: matchingSource,
          targetField,
          required: entity.requiredFields.includes(targetField),
        });
      }
    });

    setFieldMappings(mappings);
  };

  // Import durchführen
  const performImport = async () => {
    setIsProcessing(true);
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    try {
      // Daten vorbereiten
      const preparedData = fileData.map((row, index) => {
        const mappedRow: any = {};
        fieldMappings.forEach((mapping) => {
          if (mapping.sourceField && mapping.targetField) {
            mappedRow[mapping.targetField] = row[mapping.sourceField];
          }
        });
        return mappedRow;
      });

      // Batch-Import
      const batchSize = 50;
      for (let i = 0; i < preparedData.length; i += batchSize) {
        const batch = preparedData.slice(i, i + batchSize);
        
        try {
          const response = await api.post(`/api/v2/${entityType}/bulk`, { items: batch });
          result.success += response.created || 0;
          result.failed += response.failed || 0;
          
          if (response.errors) {
            result.errors.push(...response.errors.map((err: any, idx: number) => ({
              row: i + idx + 1,
              error: err.message,
            })));
          }
        } catch (error) {
          result.failed += batch.length;
          result.errors.push({
            row: i + 1,
            error: 'Batch-Import fehlgeschlagen',
          });
        }
      }

      setImportResult(result);
      setActiveStep(4);
      
      if (result.success > 0) {
        toast.success(`${result.success} Datensätze erfolgreich importiert`);
      }
      if (result.failed > 0) {
        toast.error(`${result.failed} Datensätze fehlgeschlagen`);
      }
    } catch (error) {
      toast.error('Import fehlgeschlagen');
    } finally {
      setIsProcessing(false);
    }
  };

  // Export durchführen
  const performExport = async () => {
    setIsProcessing(true);

    try {
      const entity = ENTITY_TYPES[entityType];
      const fields = selectedFields.length > 0 
        ? selectedFields 
        : [...entity.requiredFields, ...entity.optionalFields];

      const response = await api.get(`/api/v2/${entityType}/export`, {
        params: { fields: fields.join(',') },
      });

      // Excel-Export
      const ws = XLSX.utils.json_to_sheet(response.items);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, entity.label);
      XLSX.writeFile(wb, `${entityType}_export_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast.success(`${response.items.length} Datensätze exportiert`);
    } catch (error) {
      toast.error('Export fehlgeschlagen');
    } finally {
      setIsProcessing(false);
    }
  };

  // Vorlage herunterladen
  const downloadTemplate = () => {
    const entity = ENTITY_TYPES[entityType];
    const template = [entity.sampleData];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vorlage');
    XLSX.writeFile(wb, `${entityType}_vorlage.xlsx`);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Daten Import/Export
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Datentyp</InputLabel>
            <Select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as keyof typeof ENTITY_TYPES)}
              label="Datentyp"
            >
              {Object.entries(ENTITY_TYPES).map(([key, config]) => (
                <MenuItem key={key} value={key}>
                  {config.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplate}
            >
              Vorlage herunterladen
            </Button>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Datei importieren
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DownloadIcon />}
              onClick={performExport}
              disabled={isProcessing}
            >
              Daten exportieren
            </Button>
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </CardContent>
      </Card>

      {/* Import-Prozess */}
      {file && (
        <Card>
          <CardContent>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Schritt 2: Feld-Zuordnung */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Felder zuordnen
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Ordnen Sie die Spalten aus Ihrer Datei den Systemfeldern zu
                </Alert>

                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Quelldatei</TableCell>
                        <TableCell>→</TableCell>
                        <TableCell>Systemfeld</TableCell>
                        <TableCell>Erforderlich</TableCell>
                        <TableCell>Aktion</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fieldMappings.map((mapping, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              size="small"
                              value={mapping.sourceField}
                              onChange={(e) => {
                                const newMappings = [...fieldMappings];
                                newMappings[index].sourceField = e.target.value;
                                setFieldMappings(newMappings);
                              }}
                              fullWidth
                            >
                              <MenuItem value="">-- Nicht zugeordnet --</MenuItem>
                              {Object.keys(fileData[0] || {}).map((field) => (
                                <MenuItem key={field} value={field}>
                                  {field}
                                </MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell>→</TableCell>
                          <TableCell>{mapping.targetField}</TableCell>
                          <TableCell>
                            {mapping.required && (
                              <Chip label="Pflichtfeld" color="primary" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setFieldMappings(fieldMappings.filter((_, i) => i !== index));
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={() => setActiveStep(0)}>Zurück</Button>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(2)}
                    disabled={!fieldMappings.some((m) => m.sourceField)}
                  >
                    Weiter zur Vorschau
                  </Button>
                </Box>
              </Box>
            )}

            {/* Schritt 3: Vorschau */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Datenvorschau (erste 5 Zeilen)
                </Typography>

                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        {fieldMappings
                          .filter((m) => m.sourceField)
                          .map((mapping) => (
                            <TableCell key={mapping.targetField}>
                              {mapping.targetField}
                            </TableCell>
                          ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fileData.slice(0, 5).map((row, index) => (
                        <TableRow key={index}>
                          {fieldMappings
                            .filter((m) => m.sourceField)
                            .map((mapping) => (
                              <TableCell key={mapping.targetField}>
                                {row[mapping.sourceField]}
                              </TableCell>
                            ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Alert severity="info" sx={{ mt: 2 }}>
                  Es werden {fileData.length} Datensätze importiert
                </Alert>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={() => setActiveStep(1)}>Zurück</Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={performImport}
                    disabled={isProcessing}
                  >
                    Import starten
                  </Button>
                </Box>
              </Box>
            )}

            {/* Schritt 4: Ergebnis */}
            {activeStep === 4 && importResult && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Import-Ergebnis
                </Typography>

                <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                  <Card sx={{ flex: 1 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckIcon color="success" />
                        <Typography variant="h4" color="success.main">
                          {importResult.success}
                        </Typography>
                      </Box>
                      <Typography variant="body2">Erfolgreich importiert</Typography>
                    </CardContent>
                  </Card>
                  <Card sx={{ flex: 1 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ErrorIcon color="error" />
                        <Typography variant="h4" color="error.main">
                          {importResult.failed}
                        </Typography>
                      </Box>
                      <Typography variant="body2">Fehlgeschlagen</Typography>
                    </CardContent>
                  </Card>
                </Box>

                {importResult.errors.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Fehlerdetails
                    </Typography>
                    <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Zeile</TableCell>
                            <TableCell>Fehler</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {importResult.errors.map((error, index) => (
                            <TableRow key={index}>
                              <TableCell>{error.row}</TableCell>
                              <TableCell>{error.error}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setActiveStep(0);
                      setFile(null);
                      setFileData([]);
                      setFieldMappings([]);
                      setImportResult(null);
                    }}
                  >
                    Neuer Import
                  </Button>
                </Box>
              </Box>
            )}

            {isProcessing && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  Verarbeitung läuft...
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};