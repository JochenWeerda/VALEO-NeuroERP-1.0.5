import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAllAnforderungen, deleteAnforderung, auditMockData } from '../../services/auditApi';
import type { AuditAnforderung } from '../../services/auditApi';

interface QSAuditAnforderungenProps {
  onBack?: () => void;
  onEdit?: (id: string) => void;
  onAdd?: () => void;
}

const QSAuditAnforderungen: React.FC<QSAuditAnforderungenProps> = ({
  onBack,
  onEdit,
  onAdd
}) => {
  const [anforderungen, setAnforderungen] = useState<AuditAnforderung[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [suchbegriff, setSuchbegriff] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('alle');
  const [kategorieFilter, setKategorieFilter] = useState<string>('alle');
  const [prioritaetFilter, setPrioritaetFilter] = useState<string>('alle');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnforderungId, setSelectedAnforderungId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In einer realen Anwendung würden wir hier die API aufrufen
        // const data = await getAllAnforderungen();
        // Für den Prototyp verwenden wir Mock-Daten
        const data = auditMockData.anforderungen;
        setAnforderungen(data);
        setError(null);
      } catch (err) {
        setError('Fehler beim Laden der Audit-Anforderungen.');
        console.error('Fehler beim Laden der Audit-Anforderungen:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id);
    } else {
      navigate(`/qualitaet/audit/anforderungen/${id}`);
    }
  };
  
  const handleAdd = () => {
    if (onAdd) {
      onAdd();
    } else {
      navigate('/qualitaet/audit/anforderungen/neu');
    }
  };
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/qualitaet/audit');
    }
  };
  
  const openDeleteDialog = (id: string) => {
    setSelectedAnforderungId(id);
    setDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!selectedAnforderungId) return;
    
    setLoading(true);
    try {
      // In einer realen Anwendung würden wir hier die API aufrufen
      // await deleteAnforderung(selectedAnforderungId);
      
      // Für den Prototyp filtern wir die lokalen Daten
      setAnforderungen(anforderungen.filter(a => a.id !== selectedAnforderungId));
      setError(null);
    } catch (err) {
      setError(`Fehler beim Löschen der Audit-Anforderung mit ID ${selectedAnforderungId}.`);
      console.error(`Fehler beim Löschen der Audit-Anforderung mit ID ${selectedAnforderungId}:`, err);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSelectedAnforderungId(null);
    }
  };
  
  const filteredAnforderungen = anforderungen.filter(a => {
    // Suchbegriff
    const suchbegriffMatch = 
      suchbegriff === '' || 
      a.titel.toLowerCase().includes(suchbegriff.toLowerCase()) ||
      a.beschreibung.toLowerCase().includes(suchbegriff.toLowerCase());
    
    // Status
    const statusMatch = statusFilter === 'alle' || a.status === statusFilter;
    
    // Kategorie
    const kategorieMatch = kategorieFilter === 'alle' || a.kategorie === kategorieFilter;
    
    // Priorität
    const prioritaetMatch = prioritaetFilter === 'alle' || a.prioritaet === prioritaetFilter;
    
    return suchbegriffMatch && statusMatch && kategorieMatch && prioritaetMatch;
  });
  
  // Pagination
  const paginatedAnforderungen = filteredAnforderungen.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  const renderStatusChip = (status: AuditAnforderung['status']) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    
    switch (status) {
      case 'offen':
        color = 'primary';
        break;
      case 'inBearbeitung':
        color = 'info';
        break;
      case 'abgeschlossen':
        color = 'success';
        break;
      case 'abgelehnt':
        color = 'error';
        break;
      case 'verschoben':
        color = 'warning';
        break;
      default:
        color = 'default';
    }
    
    return <Chip label={status} color={color} size="small" />;
  };
  
  const renderPrioritaetChip = (prioritaet: AuditAnforderung['prioritaet']) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    
    switch (prioritaet) {
      case 'niedrig':
        color = 'info';
        break;
      case 'mittel':
        color = 'primary';
        break;
      case 'hoch':
        color = 'warning';
        break;
      case 'kritisch':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return <Chip label={prioritaet} color={color} size="small" />;
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <IconButton onClick={handleBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h2">
              Audit-Anforderungen
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Neue Anforderung
          </Button>
        </Box>
        
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Suchen..."
              value={suchbegriff}
              onChange={(e) => setSuchbegriff(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box display="flex" gap={2}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="alle">Alle Status</MenuItem>
                  <MenuItem value="offen">Offen</MenuItem>
                  <MenuItem value="inBearbeitung">In Bearbeitung</MenuItem>
                  <MenuItem value="abgeschlossen">Abgeschlossen</MenuItem>
                  <MenuItem value="abgelehnt">Abgelehnt</MenuItem>
                  <MenuItem value="verschoben">Verschoben</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Kategorie</InputLabel>
                <Select
                  value={kategorieFilter}
                  label="Kategorie"
                  onChange={(e) => setKategorieFilter(e.target.value)}
                >
                  <MenuItem value="alle">Alle Kategorien</MenuItem>
                  <MenuItem value="QS">QS</MenuItem>
                  <MenuItem value="GMP">GMP</MenuItem>
                  <MenuItem value="IFS">IFS</MenuItem>
                  <MenuItem value="BIO">BIO</MenuItem>
                  <MenuItem value="Nachhaltigkeit">Nachhaltigkeit</MenuItem>
                  <MenuItem value="HACCP">HACCP</MenuItem>
                  <MenuItem value="Andere">Andere</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Priorität</InputLabel>
                <Select
                  value={prioritaetFilter}
                  label="Priorität"
                  onChange={(e) => setPrioritaetFilter(e.target.value)}
                >
                  <MenuItem value="alle">Alle Prioritäten</MenuItem>
                  <MenuItem value="niedrig">Niedrig</MenuItem>
                  <MenuItem value="mittel">Mittel</MenuItem>
                  <MenuItem value="hoch">Hoch</MenuItem>
                  <MenuItem value="kritisch">Kritisch</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titel</TableCell>
                <TableCell>Kategorie</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Verantwortlich</TableCell>
                <TableCell>Priorität</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAnforderungen.map((anforderung) => (
                <TableRow key={anforderung.id}>
                  <TableCell>{anforderung.titel}</TableCell>
                  <TableCell>{anforderung.kategorie}</TableCell>
                  <TableCell>{new Date(anforderung.deadline).toLocaleDateString('de-DE')}</TableCell>
                  <TableCell>
                    {/* In einer realen Anwendung würden wir hier den Mitarbeiter-Namen anzeigen */}
                    {anforderung.verantwortlicher === '4' ? 'Thomas Becker (QM)' : 
                     anforderung.verantwortlicher === '3' ? 'Klaus Weber (Anlagenführer)' : 
                     anforderung.verantwortlicher === '2' ? 'Petra Schmidt (Fahrerin)' : 
                     anforderung.verantwortlicher === '1' ? 'Hans Müller (Lagerist)' : 
                     anforderung.verantwortlicher}
                  </TableCell>
                  <TableCell>{renderPrioritaetChip(anforderung.prioritaet)}</TableCell>
                  <TableCell>{renderStatusChip(anforderung.status)}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(anforderung.id)}
                      title="Bearbeiten"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => openDeleteDialog(anforderung.id)}
                      title="Löschen"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              
              {paginatedAnforderungen.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Keine Anforderungen gefunden.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAnforderungen.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Zeilen pro Seite:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
        />
      </Paper>
      
      {/* Dialog zur Bestätigung des Löschens */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Anforderung löschen</DialogTitle>
        <DialogContent>
          Möchten Sie diese Audit-Anforderung wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QSAuditAnforderungen; 