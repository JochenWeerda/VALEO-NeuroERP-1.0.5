import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Divider,
  Menu
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  CalendarToday as CalendarTodayIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import anomalyApi, { AnomalyHistory, ExportParams } from '../../services/anomalyApi';
import { format, parse } from 'date-fns';
import { de } from 'date-fns/locale';

interface AnomalyHistoryPanelProps {
  selectedModule: string;
}

const AnomalyHistoryPanel: React.FC<AnomalyHistoryPanelProps> = ({ selectedModule }) => {
  // State für die Anomaliehistorie
  const [anomalyHistory, setAnomalyHistory] = useState<AnomalyHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State für Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State für Filter
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showResolved, setShowResolved] = useState<boolean>(true);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  
  // State für Detailansicht
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyHistory | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false);
  
  // State für Resolution-Dialog
  const [resolutionDialogOpen, setResolutionDialogOpen] = useState<boolean>(false);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  // State für Export-Menü
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  // Laden der Anomaliehistorie
  useEffect(() => {
    fetchAnomalyHistory();
  }, [selectedModule]);

  const fetchAnomalyHistory = async () => {
    setLoading(true);
    try {
      const moduleParam = selectedModule === 'all' ? undefined : selectedModule;
      const startDateParam = startDate ? startDate.toISOString() : undefined;
      const endDateParam = endDate ? endDate.toISOString() : undefined;
      
      const data = await anomalyApi.getAnomalyHistory(
        moduleParam, 
        startDateParam, 
        endDateParam, 
        100
      );
      
      // Filter nach Status (resolved)
      const filteredData = showResolved ? data : data.filter(item => !item.resolved);
      
      setAnomalyHistory(filteredData);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden der Anomaliehistorie:', err);
      setError('Die Anomaliehistorie konnte nicht geladen werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Handler für Paginierung
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handler für Detaildialog
  const handleOpenDetails = (anomaly: AnomalyHistory) => {
    setSelectedAnomaly(anomaly);
    setDetailDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailDialogOpen(false);
  };

  // Handler für Resolution-Dialog
  const handleOpenResolution = (anomaly: AnomalyHistory) => {
    setSelectedAnomaly(anomaly);
    setResolutionNotes(anomaly.resolution_notes || '');
    setResolutionDialogOpen(true);
  };

  const handleCloseResolution = () => {
    setResolutionDialogOpen(false);
  };

  const handleResolveAnomaly = async () => {
    if (!selectedAnomaly) return;
    
    try {
      // API-Aufruf zum Markieren der Anomalie als gelöst würde hier stehen
      // Da dieser Endpunkt im Backend nicht existiert, simulieren wir die Lösung lokal
      
      // Lokale Aktualisierung der Anomaliedaten
      const updatedHistory = anomalyHistory.map(item => {
        if (item.id === selectedAnomaly.id) {
          return {
            ...item,
            resolved: true,
            resolution_notes: resolutionNotes
          };
        }
        return item;
      });
      
      setAnomalyHistory(updatedHistory);
      setResolutionDialogOpen(false);
      setSelectedAnomaly(null);
      
    } catch (err) {
      console.error('Fehler beim Markieren der Anomalie als gelöst:', err);
      setError('Die Anomalie konnte nicht als gelöst markiert werden. Bitte versuchen Sie es später erneut.');
    }
  };

  // Handler für Filter
  const handleApplyFilter = () => {
    fetchAnomalyHistory();
    setFilterOpen(false);
  };

  const handleResetFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setShowResolved(true);
  };

  // Handler für Export-Menü
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'excel' | 'json') => {
    setExportLoading(true);
    try {
      const moduleParam = selectedModule === 'all' ? undefined : selectedModule;
      const startDateParam = startDate ? startDate.toISOString() : undefined;
      const endDateParam = endDate ? endDate.toISOString() : undefined;
      
      const exportParams: ExportParams = {
        format,
        module: moduleParam,
        start_date: startDateParam,
        end_date: endDateParam,
        include_details: true
      };
      
      await anomalyApi.exportAnomalyData(exportParams);
      handleExportMenuClose();
    } catch (err) {
      console.error(`Fehler beim Exportieren der Daten als ${format}:`, err);
      setError(`Die Daten konnten nicht als ${format} exportiert werden. Bitte versuchen Sie es später erneut.`);
    } finally {
      setExportLoading(false);
    }
  };

  // Render-Funktion für die Anomaliehistorie
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Anomaliehistorie
        </Typography>
        
        <Box>
          <Tooltip title="Daten exportieren">
            <IconButton onClick={handleExportMenuOpen} disabled={loading || anomalyHistory.length === 0}>
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Filter">
            <IconButton onClick={() => setFilterOpen(true)}>
              <Badge color="primary" variant="dot" invisible={!startDate && !endDate && showResolved}>
                <FilterListIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Aktualisieren">
            <IconButton onClick={fetchAnomalyHistory} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Export-Menü */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportMenuClose}
      >
        <MenuItem onClick={() => handleExport('pdf')} disabled={exportLoading}>
          Als PDF exportieren
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')} disabled={exportLoading}>
          Als CSV exportieren
        </MenuItem>
        <MenuItem onClick={() => handleExport('excel')} disabled={exportLoading}>
          Als Excel exportieren
        </MenuItem>
        <MenuItem onClick={() => handleExport('json')} disabled={exportLoading}>
          Als JSON exportieren
        </MenuItem>
      </Menu>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {anomalyHistory.length === 0 ? (
            <Alert severity="info">
              Keine Anomalien in der Historie gefunden.
            </Alert>
          ) : (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Modul</TableCell>
                      <TableCell>Datentyp</TableCell>
                      <TableCell>Erkannt am</TableCell>
                      <TableCell>Anomaliescore</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Aktionen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {anomalyHistory
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((anomaly) => (
                        <TableRow hover key={anomaly.id}>
                          <TableCell>{anomaly.id}</TableCell>
                          <TableCell>
                            <Chip 
                              label={anomaly.module} 
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{anomaly.data_type}</TableCell>
                          <TableCell>{new Date(anomaly.detected_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip 
                              label={anomaly.anomaly_score.toFixed(3)} 
                              color={anomaly.anomaly_score < -0.5 ? "error" : "warning"}
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            {anomaly.resolved ? (
                              <Chip 
                                icon={<CheckCircleIcon />} 
                                label="Gelöst" 
                                color="success"
                                size="small" 
                              />
                            ) : (
                              <Chip 
                                icon={<WarningIcon />} 
                                label="Offen" 
                                color="error"
                                size="small" 
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Details anzeigen">
                              <IconButton size="small" onClick={() => handleOpenDetails(anomaly)}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {!anomaly.resolved && (
                              <Tooltip title="Als gelöst markieren">
                                <IconButton size="small" onClick={() => handleOpenResolution(anomaly)}>
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={anomalyHistory.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Einträge pro Seite:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
              />
            </Paper>
          )}
        </>
      )}

      {/* Filter-Dialog */}
      <Dialog 
        open={filterOpen} 
        onClose={() => setFilterOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Startdatum"
                type="date"
                value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setStartDate(value ? parse(value, 'yyyy-MM-dd', new Date()) : null);
                }}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Enddatum"
                type="date"
                value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setEndDate(value ? parse(value, 'yyyy-MM-dd', new Date()) : null);
                }}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="resolved-filter-label">Status</InputLabel>
                <Select
                  labelId="resolved-filter-label"
                  id="resolved-filter"
                  value={showResolved ? "all" : "open"}
                  label="Status"
                  onChange={(e) => setShowResolved(e.target.value === "all")}
                >
                  <MenuItem value="all">Alle Anomalien</MenuItem>
                  <MenuItem value="open">Nur offene Anomalien</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetFilter} startIcon={<DeleteIcon />}>
            Zurücksetzen
          </Button>
          <Button onClick={handleApplyFilter} variant="contained" startIcon={<FilterListIcon />}>
            Filter anwenden
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail-Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Anomaliedetails
        </DialogTitle>
        <DialogContent>
          {selectedAnomaly && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Allgemeine Informationen
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>ID:</strong> {selectedAnomaly.id}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Modul:</strong> {selectedAnomaly.module}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Datentyp:</strong> {selectedAnomaly.data_type}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Erkannt am:</strong> {new Date(selectedAnomaly.detected_at).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Anomaliescore:</strong> {selectedAnomaly.anomaly_score.toFixed(3)}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Status:</strong> {selectedAnomaly.resolved ? 'Gelöst' : 'Offen'}
                      </Typography>
                      {selectedAnomaly.resolved && selectedAnomaly.resolution_notes && (
                        <Typography variant="body2" gutterBottom>
                          <strong>Lösungsnotizen:</strong> {selectedAnomaly.resolution_notes}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Anomaliedaten
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <pre style={{ 
                        fontSize: '0.8rem', 
                        backgroundColor: '#f5f5f5', 
                        padding: '8px', 
                        borderRadius: '4px',
                        maxHeight: '300px',
                        overflow: 'auto'
                      }}>
                        {JSON.stringify(selectedAnomaly.data, null, 2)}
                      </pre>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>
            Schließen
          </Button>
          {selectedAnomaly && !selectedAnomaly.resolved && (
            <Button 
              onClick={() => {
                handleCloseDetails();
                handleOpenResolution(selectedAnomaly);
              }} 
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
            >
              Als gelöst markieren
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Resolution-Dialog */}
      <Dialog 
        open={resolutionDialogOpen} 
        onClose={handleCloseResolution}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Anomalie als gelöst markieren
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Fügen Sie Notizen hinzu, um zu beschreiben, wie diese Anomalie gelöst wurde.
          </Typography>
          
          <TextField
            label="Lösungsnotizen"
            multiline
            rows={4}
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResolution}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleResolveAnomaly} 
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
          >
            Als gelöst markieren
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnomalyHistoryPanel; 