import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Button,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GetAppIcon from '@mui/icons-material/GetApp';
import FilterListIcon from '@mui/icons-material/FilterList';

import {
  QSFuttermittelCharge,
  QSFuttermittelChargeFilter,
  QSStatus,
  getQSFuttermittelChargen,
  generatePDFProtokoll,
  exportCSV
} from '../../services/qsApi';

// Import Mock-Daten
import {
  getMockQSFuttermittelChargen,
  generateMockPDFProtokoll,
  exportMockCSV
} from '../../services/mockQsApi';

interface QSFuttermittelChargeListProps {
  onView: (charge: QSFuttermittelCharge) => void;
  onEdit: (charge: QSFuttermittelCharge) => void;
  onDelete: (id: number) => void;
}

const getStatusColor = (status: QSStatus) => {
  switch (status) {
    case QSStatus.NEU:
      return 'default';
    case QSStatus.IN_PRUEFUNG:
      return 'info';
    case QSStatus.FREIGEGEBEN:
      return 'success';
    case QSStatus.GESPERRT:
      return 'error';
    case QSStatus.VERWENDUNG:
      return 'warning';
    case QSStatus.ARCHIVIERT:
      return 'secondary';
    default:
      return 'default';
  }
};

const QSFuttermittelChargeList: React.FC<QSFuttermittelChargeListProps> = ({
  onView,
  onEdit,
  onDelete
}) => {
  const [charges, setCharges] = useState<QSFuttermittelCharge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filter, setFilter] = useState<QSFuttermittelChargeFilter>({});
  const [useMockData, setUseMockData] = useState<boolean>(false);

  const fetchCharges = async (page: number, rowsPerPage: number, filter?: QSFuttermittelChargeFilter) => {
    setLoading(true);
    try {
      const response = await getQSFuttermittelChargen(page + 1, rowsPerPage, filter);
      setCharges(response.items);
      setTotal(response.total);
      setTotalPages(response.total_pages);
      setUseMockData(false);
    } catch (error) {
      console.error('Fehler beim Laden der QS-Futtermittelchargen:', error);
      // Bei Fehlern Mock-Daten verwenden
      const mockResponse = getMockQSFuttermittelChargen(page + 1, rowsPerPage, filter);
      setCharges(mockResponse.items);
      setTotal(mockResponse.total);
      setTotalPages(mockResponse.total_pages);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges(page, rowsPerPage, filter);
  }, [page, rowsPerPage, filter]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (name: keyof QSFuttermittelChargeFilter, value: any) => {
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };

  const resetFilters = () => {
    setFilter({});
    setPage(0);
  };

  const handleDownloadPDF = async (chargeId: number) => {
    try {
      const blob = useMockData 
        ? await generateMockPDFProtokoll(chargeId)
        : await generatePDFProtokoll(chargeId);
        
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QS-Protokoll-${chargeId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Fehler beim Herunterladen des PDF-Protokolls:', error);
      // In einer echten Anwendung würde hier eine Fehlermeldung angezeigt werden
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = useMockData
        ? await exportMockCSV(filter)
        : await exportCSV(filter);
        
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'QS-Futtermittelchargen.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Fehler beim Exportieren der CSV-Datei:', error);
      // In einer echten Anwendung würde hier eine Fehlermeldung angezeigt werden
    }
  };

  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6" component="div">
              QS-Futtermittelchargen
              {useMockData && (
                <Chip 
                  label="Test-Daten" 
                  color="warning" 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              )}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ mr: 1 }}
            >
              {showFilters ? 'Filter ausblenden' : 'Filter anzeigen'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<GetAppIcon />}
              onClick={handleExportCSV}
            >
              CSV exportieren
            </Button>
          </Grid>
        </Grid>
      </Box>

      {showFilters && (
        <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Chargennummer"
                value={filter.chargennummer || ''}
                onChange={(e) => handleFilterChange('chargennummer', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Produkt"
                value={filter.produkt || ''}
                onChange={(e) => handleFilterChange('produkt', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  value={filter.status || ''}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">Alle</MenuItem>
                  <MenuItem value={QSStatus.NEU}>Neu</MenuItem>
                  <MenuItem value={QSStatus.IN_PRUEFUNG}>In Prüfung</MenuItem>
                  <MenuItem value={QSStatus.FREIGEGEBEN}>Freigegeben</MenuItem>
                  <MenuItem value={QSStatus.GESPERRT}>Gesperrt</MenuItem>
                  <MenuItem value={QSStatus.VERWENDUNG}>In Verwendung</MenuItem>
                  <MenuItem value={QSStatus.ARCHIVIERT}>Archiviert</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Erstelldatum von"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filter.erstelltVon || ''}
                onChange={(e) => handleFilterChange('erstelltVon', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Erstelldatum bis"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filter.erstelltBis || ''}
                onChange={(e) => handleFilterChange('erstelltBis', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filter.nurFreigegeben || false}
                    onChange={(e) => handleFilterChange('nurFreigegeben', e.target.checked)}
                  />
                }
                label="Nur freigegebene Chargen"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={resetFilters}>
                  Filter zurücksetzen
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      <TableContainer>
        <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Charge-ID</TableCell>
              <TableCell>Produktbezeichnung</TableCell>
              <TableCell>Herstellungsdatum</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Spülcharge</TableCell>
              <TableCell>Monitoring</TableCell>
              <TableCell align="right">Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Lädt...</TableCell>
              </TableRow>
            ) : charges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Keine Daten gefunden</TableCell>
              </TableRow>
            ) : (
              charges.map((charge) => (
                <TableRow
                  key={charge.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {charge.charge_id}
                  </TableCell>
                  <TableCell>{charge.produktbezeichnung}</TableCell>
                  <TableCell>{format(parseISO(charge.herstellungsdatum), 'dd.MM.yyyy')}</TableCell>
                  <TableCell>
                    <Chip
                      label={charge.qs_status.charAt(0).toUpperCase() + charge.qs_status.slice(1).replace('_', ' ')}
                      color={getStatusColor(charge.qs_status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{charge.ist_spuelcharge ? 'Ja' : 'Nein'}</TableCell>
                  <TableCell>{charge.monitoringpflicht ? 'Ja' : 'Nein'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="ansehen"
                      onClick={() => onView(charge)}
                      size="small"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label="bearbeiten"
                      onClick={() => onEdit(charge)}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label="löschen"
                      onClick={() => onDelete(charge.id!)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label="PDF herunterladen"
                      onClick={() => handleDownloadPDF(charge.id!)}
                      size="small"
                      color="primary"
                    >
                      <GetAppIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Zeilen pro Seite:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
      />
    </Paper>
  );
};

export default QSFuttermittelChargeList; 