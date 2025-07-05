import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Print,
  FileDownload,
  Search,
  Refresh,
  MoreVert,
  ContentCopy,
  QrCode,
  Download
} from '@mui/icons-material';
import inventurService, { InventurZaehlliste as IInventurZaehlliste, InventurFilter } from '../../services/inventurService';
import lagerService from '../../services/lagerService';

interface InventurZaehlisteProps {
  inventurId: string;
  onGenerateSuccess?: (anzahlArtikel: number) => void;
}

const InventurZaehlliste: React.FC<InventurZaehlisteProps> = ({ inventurId, onGenerateSuccess }) => {
  const [filter, setFilter] = useState<InventurFilter>({
    nullBestaendeUnterdruecken: true,
    auchGesperrteArtikel: false,
    auchChargenNummern: true
  });
  
  const [zaehlliste, setZaehlliste] = useState<IInventurZaehlliste[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [niederlassungen, setNiederlassungen] = useState<string[]>([]);
  const [lagerhallen, setLagerhallen] = useState<string[]>([]);
  const [artikelgruppen, setArtikelgruppen] = useState<string[]>([]);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<IInventurZaehlliste | null>(null);
  const [suchbegriff, setSuchbegriff] = useState('');
  const [filteredZaehlliste, setFilteredZaehlliste] = useState<IInventurZaehlliste[]>([]);
  
  // Daten beim Laden der Komponente initialisieren
  useEffect(() => {
    loadFilterOptions();
  }, []);
  
  // Gefilterte Zählliste bei Änderungen aktualisieren
  useEffect(() => {
    if (suchbegriff) {
      const lowerSuchbegriff = suchbegriff.toLowerCase();
      setFilteredZaehlliste(zaehlliste.filter(item => 
        item.artikel_nr.toLowerCase().includes(lowerSuchbegriff) ||
        item.artikel_bezeichnung.toLowerCase().includes(lowerSuchbegriff) ||
        item.lagerhalle.toLowerCase().includes(lowerSuchbegriff) ||
        item.artikel_gruppe.toLowerCase().includes(lowerSuchbegriff)
      ));
    } else {
      setFilteredZaehlliste(zaehlliste);
    }
  }, [zaehlliste, suchbegriff]);

  const loadFilterOptions = async () => {
    try {
      // Niederlassungen laden
      const lagerorte = await lagerService.getLagerorte();
      const niederlassungenSet = new Set<string>();
      const lagerhallenSet = new Set<string>();
      
      lagerorte.forEach(lagerort => {
        niederlassungenSet.add(lagerort.lager_bezeichnung);
        lagerhallenSet.add(lagerort.bezeichnung);
      });
      
      setNiederlassungen(Array.from(niederlassungenSet));
      setLagerhallen(Array.from(lagerhallenSet));
      
      // Artikelgruppen laden (hier als Beispiel statisch)
      setArtikelgruppen([
        'Futtermittel',
        'Düngemittel',
        'Saatgut',
        'Pflanzenschutz',
        'Sonstiges'
      ]);
      
    } catch (error) {
      console.error('Fehler beim Laden der Filter-Optionen:', error);
      setError('Fehler beim Laden der Filter-Optionen');
    }
  };

  const handleFilterChange = (field: keyof InventurFilter, value: any) => {
    setFilter(prevFilter => ({
      ...prevFilter,
      [field]: value
    }));
  };

  const handleGenerateZaehlliste = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await inventurService.generateZaehlliste(inventurId, filter);
      setZaehlliste(result);
      setPage(0); // Zurück zur ersten Seite
      
      if (onGenerateSuccess) {
        onGenerateSuccess(result.length);
      }
    } catch (error) {
      console.error('Fehler beim Generieren der Zählliste:', error);
      setError('Die Zählliste konnte nicht generiert werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportZaehlliste = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const blob = await inventurService.exportZaehlliste(inventurId, selectedExportFormat);
      
      // Blob als Datei herunterladen
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Zählliste_${inventurId}_${new Date().toISOString().split('T')[0]}.${selectedExportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setExportDialogOpen(false);
    } catch (error) {
      console.error('Fehler beim Exportieren der Zählliste:', error);
      setError('Die Zählliste konnte nicht exportiert werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: IInventurZaehlliste) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedRow(null);
  };

  const handlePrintZaehlliste = () => {
    setPrintDialogOpen(true);
  };

  const handleExportDialog = () => {
    setExportDialogOpen(true);
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filter für Zählliste
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={niederlassungen}
              value={filter.niederlassung || null}
              onChange={(event, newValue) => handleFilterChange('niederlassung', newValue)}
              renderInput={(params) => <TextField {...params} label="Niederlassung" fullWidth margin="normal" />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={lagerhallen}
              value={filter.vonLagerhalle || null}
              onChange={(event, newValue) => handleFilterChange('vonLagerhalle', newValue)}
              renderInput={(params) => <TextField {...params} label="Von Lagerhalle" fullWidth margin="normal" />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={lagerhallen}
              value={filter.bisLagerhalle || null}
              onChange={(event, newValue) => handleFilterChange('bisLagerhalle', newValue)}
              renderInput={(params) => <TextField {...params} label="Bis Lagerhalle" fullWidth margin="normal" />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={artikelgruppen}
              value={filter.vonArtikelgruppe || null}
              onChange={(event, newValue) => handleFilterChange('vonArtikelgruppe', newValue)}
              renderInput={(params) => <TextField {...params} label="Von Artikelgruppe" fullWidth margin="normal" />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={artikelgruppen}
              value={filter.bisArtikelgruppe || null}
              onChange={(event, newValue) => handleFilterChange('bisArtikelgruppe', newValue)}
              renderInput={(params) => <TextField {...params} label="Bis Artikelgruppe" fullWidth margin="normal" />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!filter.nullBestaendeUnterdruecken}
                    onChange={(e) => handleFilterChange('nullBestaendeUnterdruecken', e.target.checked)}
                  />
                }
                label="Null-Bestände unterdrücken"
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!filter.auchGesperrteArtikel}
                    onChange={(e) => handleFilterChange('auchGesperrteArtikel', e.target.checked)}
                  />
                }
                label="Auch gesperrte Artikel"
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!filter.auchChargenNummern}
                    onChange={(e) => handleFilterChange('auchChargenNummern', e.target.checked)}
                  />
                }
                label="Auch Chargen-Nr. drucken"
              />
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateZaehlliste}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <Refresh />}
          >
            Zählliste generieren
          </Button>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={handlePrintZaehlliste}
              disabled={zaehlliste.length === 0 || isLoading}
              sx={{ mr: 1 }}
            >
              Drucken
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={handleExportDialog}
              disabled={zaehlliste.length === 0 || isLoading}
            >
              Exportieren
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Zählliste {zaehlliste.length > 0 ? `(${zaehlliste.length} Artikel)` : ''}
          </Typography>
          
          <TextField
            placeholder="Suchen..."
            variant="outlined"
            size="small"
            value={suchbegriff}
            onChange={(e) => setSuchbegriff(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <Divider />
        
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Artikel-Nr.</TableCell>
                <TableCell>Bezeichnung</TableCell>
                <TableCell>Lagerhalle</TableCell>
                <TableCell>Gruppe</TableCell>
                <TableCell align="right">Soll-Menge</TableCell>
                <TableCell>Einheit</TableCell>
                <TableCell align="right">Zählung</TableCell>
                <TableCell align="center">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredZaehlliste.length > 0 ? (
                filteredZaehlliste
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.artikel_nr}</TableCell>
                      <TableCell>{row.artikel_bezeichnung}</TableCell>
                      <TableCell>{row.lagerhalle}</TableCell>
                      <TableCell>{row.artikel_gruppe}</TableCell>
                      <TableCell align="right">{row.soll_menge.toLocaleString('de-DE')}</TableCell>
                      <TableCell>{row.einheit}</TableCell>
                      <TableCell align="right">
                        <Box 
                          sx={{ 
                            border: '1px solid #ccc', 
                            borderRadius: 1, 
                            p: 1, 
                            minWidth: 80, 
                            textAlign: 'center',
                            minHeight: '2rem',
                            bgcolor: '#f9f9f9'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, row)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {isLoading ? (
                      <CircularProgress size={24} sx={{ my: 2 }} />
                    ) : (
                      <Typography variant="body2" sx={{ py: 2 }}>
                        {zaehlliste.length === 0
                          ? 'Keine Zählliste generiert. Bitte wählen Sie Filter aus und klicken Sie auf "Zählliste generieren".'
                          : 'Keine Artikel gefunden, die den Suchkriterien entsprechen.'}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredZaehlliste.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Zeilen pro Seite:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
        />
      </Paper>
      
      {/* Dialog für Druckoptionen */}
      <Dialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
      >
        <DialogTitle>Zählliste drucken</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Möchten Sie die generierte Zählliste drucken?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Es werden {filteredZaehlliste.length} Artikel gedruckt.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrintDialogOpen(false)}>Abbrechen</Button>
          <Button
            variant="contained"
            onClick={() => {
              setPrintDialogOpen(false);
              window.print();
            }}
          >
            Drucken
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog für Exportoptionen */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
      >
        <DialogTitle>Zählliste exportieren</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Wählen Sie das Exportformat:
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant={selectedExportFormat === 'pdf' ? 'contained' : 'outlined'}
                  onClick={() => setSelectedExportFormat('pdf')}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Download sx={{ mb: 1 }} />
                  PDF
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant={selectedExportFormat === 'excel' ? 'contained' : 'outlined'}
                  onClick={() => setSelectedExportFormat('excel')}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Download sx={{ mb: 1 }} />
                  Excel
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant={selectedExportFormat === 'csv' ? 'contained' : 'outlined'}
                  onClick={() => setSelectedExportFormat('csv')}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: 2 }}
                >
                  <Download sx={{ mb: 1 }} />
                  CSV
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Abbrechen</Button>
          <Button
            variant="contained"
            onClick={handleExportZaehlliste}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Exportieren'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Kontextmenü für Tabellenzeilen */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Print fontSize="small" />
          </ListItemIcon>
          <ListItemText>Einzeln drucken</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Barcode-Etikett</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <QrCode fontSize="small" />
          </ListItemIcon>
          <ListItemText>QR-Code anzeigen</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default InventurZaehlliste; 