import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CalendarToday as CalendarTodayIcon,
  Error as ErrorIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import emergencyApi, { EmergencyResource } from '../../services/emergencyApi';

// Hauptkomponente für die Ressourcenverwaltung
const EmergencyResources: React.FC = () => {
  // State für Ressourcen und Ladevorgang
  const [resources, setResources] = useState<EmergencyResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State für Paginierung
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State für Dialog-Anzeige
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<EmergencyResource | null>(null);
  
  // State für Formulardaten beim Erstellen/Bearbeiten
  const [formData, setFormData] = useState<Partial<EmergencyResource>>({
    name: '',
    type: '',
    location: '',
    quantity: 1,
    notes: '',
    is_available: true
  });

  // State für Filter
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [resourceType, setResourceType] = useState<string>('all');

  // Verfügbare Ressourcentypen
  const resourceTypes = [
    { value: 'equipment', label: 'Ausrüstung' },
    { value: 'vehicles', label: 'Fahrzeuge' },
    { value: 'tools', label: 'Werkzeuge' },
    { value: 'first_aid', label: 'Erste Hilfe' },
    { value: 'safety', label: 'Sicherheitsausrüstung' },
    { value: 'communication', label: 'Kommunikation' },
    { value: 'power', label: 'Stromversorgung' },
    { value: 'it', label: 'IT-Ressourcen' },
    { value: 'other', label: 'Sonstiges' }
  ];

  // Laden der Ressourcen beim ersten Rendern
  useEffect(() => {
    fetchResources();
  }, [availableOnly, resourceType]);

  // Funktion zum Laden der Ressourcen
  const fetchResources = async () => {
    setLoading(true);
    try {
      const typeParam = resourceType === 'all' ? undefined : resourceType;
      const data = await emergencyApi.getResources(availableOnly, typeParam);
      setResources(data);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden der Ressourcen:', err);
      setError('Die Ressourcen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Handler für Seitenänderung
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handler für Änderung der Anzahl der Zeilen pro Seite
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Handler für Detailansicht
  const handleOpenDetails = (resource: EmergencyResource) => {
    setSelectedResource(resource);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedResource(null);
  };

  // Handler für das Erstellen einer neuen Ressource
  const handleOpenCreateDialog = () => {
    setFormData({
      name: '',
      type: 'equipment',
      location: '',
      quantity: 1,
      notes: '',
      is_available: true
    });
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  // Handler für das Bearbeiten einer Ressource
  const handleOpenEditDialog = (resource: EmergencyResource) => {
    setSelectedResource(resource);
    setFormData({ ...resource });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedResource(null);
  };

  // Handler für Änderungen im Formular
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler für das Speichern einer neuen Ressource
  const handleCreateResource = async () => {
    try {
      await emergencyApi.createResource(formData);
      handleCloseCreateDialog();
      fetchResources();
    } catch (err) {
      console.error('Fehler beim Erstellen der Ressource:', err);
      setError('Die Ressource konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.');
    }
  };

  // Handler für das Aktualisieren einer Ressource
  const handleUpdateResource = async () => {
    if (!selectedResource) return;
    
    try {
      await emergencyApi.updateResource(selectedResource.id, formData);
      handleCloseEditDialog();
      fetchResources();
    } catch (err) {
      console.error('Fehler beim Aktualisieren der Ressource:', err);
      setError('Die Ressource konnte nicht aktualisiert werden. Bitte versuchen Sie es später erneut.');
    }
  };

  // Formatieren des Zeitstempels
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Nicht angegeben';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Notfall-Ressourcen</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Neue Ressource hinzufügen
        </Button>
      </Box>

      {/* Filter-Optionen */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="resource-type-filter-label">Ressourcentyp</InputLabel>
          <Select
            labelId="resource-type-filter-label"
            id="resource-type-filter"
            value={resourceType}
            label="Ressourcentyp"
            onChange={(e) => setResourceType(e.target.value)}
          >
            <MenuItem value="all">Alle Typen</MenuItem>
            {resourceTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControlLabel
          control={
            <Switch 
              checked={availableOnly} 
              onChange={(e) => setAvailableOnly(e.target.checked)} 
            />
          }
          label="Nur verfügbare Ressourcen anzeigen"
        />
      </Box>

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
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Standort</TableCell>
                  <TableCell>Menge</TableCell>
                  <TableCell>Verfügbarkeit</TableCell>
                  <TableCell>Letzte Prüfung</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resources
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((resource) => (
                    <TableRow key={resource.id} hover>
                      <TableCell>{resource.name}</TableCell>
                      <TableCell>{resource.type}</TableCell>
                      <TableCell>{resource.location || 'Nicht angegeben'}</TableCell>
                      <TableCell>{resource.quantity}</TableCell>
                      <TableCell>
                        <Chip 
                          icon={resource.is_available ? <CheckIcon /> : <CloseIcon />} 
                          label={resource.is_available ? "Verfügbar" : "Nicht verfügbar"} 
                          color={resource.is_available ? "success" : "error"}
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {resource.last_checked ? formatDate(resource.last_checked) : 'Nie'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Details anzeigen">
                          <IconButton size="small" onClick={() => handleOpenDetails(resource)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Bearbeiten">
                          <IconButton size="small" onClick={() => handleOpenEditDialog(resource)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                {resources.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        Keine Ressourcen gefunden
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={resources.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Zeilen pro Seite:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
          />
        </>
      )}

      {/* Details-Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
      >
        {selectedResource && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BuildIcon sx={{ mr: 1 }} />
                <Typography variant="h6">{selectedResource.name}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Typ
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedResource.type}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Standort
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedResource.location || 'Nicht angegeben'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Menge
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedResource.quantity}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Verfügbarkeit
                  </Typography>
                  <Chip 
                    icon={selectedResource.is_available ? <CheckIcon /> : <CloseIcon />} 
                    label={selectedResource.is_available ? "Verfügbar" : "Nicht verfügbar"} 
                    color={selectedResource.is_available ? "success" : "error"}
                    size="small" 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Letzte Prüfung
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedResource.last_checked ? formatDate(selectedResource.last_checked) : 'Nie'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nächste Prüfung fällig
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedResource.next_check_due ? formatDate(selectedResource.next_check_due) : 'Nicht geplant'}
                  </Typography>
                </Grid>
                {selectedResource.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Notizen
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedResource.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Schließen</Button>
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                onClick={() => {
                  handleCloseDetails();
                  handleOpenEditDialog(selectedResource);
                }}
              >
                Bearbeiten
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog zum Erstellen einer neuen Ressource */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Neue Ressource hinzufügen</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                fullWidth
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Typ</InputLabel>
                <Select
                  value={formData.type}
                  label="Typ"
                  onChange={(e) => handleFormChange('type', e.target.value)}
                >
                  {resourceTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Standort"
                fullWidth
                value={formData.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
                placeholder="z.B. Lager A, Schrank 3"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Menge"
                type="number"
                fullWidth
                value={formData.quantity}
                onChange={(e) => handleFormChange('quantity', parseInt(e.target.value))}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={formData.is_available} 
                    onChange={(e) => handleFormChange('is_available', e.target.checked)} 
                  />
                }
                label="Ressource ist verfügbar"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notizen"
                multiline
                rows={3}
                fullWidth
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Zusätzliche Informationen zur Ressource..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Abbrechen</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateResource}
            disabled={!formData.name || !formData.type || !formData.quantity}
          >
            Ressource hinzufügen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog zum Bearbeiten einer Ressource */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Ressource bearbeiten</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                fullWidth
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Typ</InputLabel>
                <Select
                  value={formData.type}
                  label="Typ"
                  onChange={(e) => handleFormChange('type', e.target.value)}
                >
                  {resourceTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Standort"
                fullWidth
                value={formData.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
                placeholder="z.B. Lager A, Schrank 3"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Menge"
                type="number"
                fullWidth
                value={formData.quantity}
                onChange={(e) => handleFormChange('quantity', parseInt(e.target.value))}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Letzte Prüfung"
                type="date"
                fullWidth
                value={formData.last_checked ? new Date(formData.last_checked).toISOString().split('T')[0] : ''}
                onChange={(e) => handleFormChange('last_checked', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nächste Prüfung fällig"
                type="date"
                fullWidth
                value={formData.next_check_due ? new Date(formData.next_check_due).toISOString().split('T')[0] : ''}
                onChange={(e) => handleFormChange('next_check_due', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={formData.is_available} 
                    onChange={(e) => handleFormChange('is_available', e.target.checked)} 
                  />
                }
                label="Ressource ist verfügbar"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notizen"
                multiline
                rows={3}
                fullWidth
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Zusätzliche Informationen zur Ressource..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Abbrechen</Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateResource}
            disabled={!formData.name || !formData.type || !formData.quantity}
          >
            Änderungen speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyResources; 