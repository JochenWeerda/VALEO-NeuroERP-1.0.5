import React, { useState } from 'react';
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
  Divider
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { EmergencyCase, EmergencyStatus, EmergencyType, EmergencySeverity } from '../../services/emergencyApi';

interface EmergencyCaseListProps {
  cases: EmergencyCase[];
}

const EmergencyCaseList: React.FC<EmergencyCaseListProps> = ({ cases }) => {
  // State für Paginierung
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State für Dialog-Anzeige
  const [selectedCase, setSelectedCase] = useState<EmergencyCase | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // State für Formular beim Erstellen eines neuen Notfalls
  const [newCase, setNewCase] = useState<Partial<EmergencyCase>>({
    title: '',
    description: '',
    emergency_type: EmergencyType.OTHER,
    severity: EmergencySeverity.MEDIUM,
    status: EmergencyStatus.NEW,
    location: ''
  });

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
  const handleOpenDetails = (emergencyCase: EmergencyCase) => {
    setSelectedCase(emergencyCase);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedCase(null);
  };

  // Handler für das Erstellen eines neuen Notfalls
  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setNewCase({
      title: '',
      description: '',
      emergency_type: EmergencyType.OTHER,
      severity: EmergencySeverity.MEDIUM,
      status: EmergencyStatus.NEW,
      location: ''
    });
  };

  const handleCreateCase = () => {
    // Hier würde normalerweise der API-Aufruf stattfinden
    console.log('Neuer Notfall:', newCase);
    handleCloseCreateDialog();
    // Nach Erstellung sollten die Daten neu geladen werden
  };

  // Handler für Änderungen im Formular
  const handleNewCaseChange = (field: string, value: string) => {
    setNewCase(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Statusfarbe basierend auf Status
  const getStatusColor = (status: EmergencyStatus): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch(status) {
      case EmergencyStatus.NEW:
        return "error";
      case EmergencyStatus.IN_PROGRESS:
        return "warning";
      case EmergencyStatus.CONTAINED:
        return "info";
      case EmergencyStatus.RESOLVED:
      case EmergencyStatus.CLOSED:
        return "success";
      case EmergencyStatus.POST_ANALYSIS:
        return "secondary";
      default:
        return "default";
    }
  };

  // Schweregrad-Farbe basierend auf Schweregrad
  const getSeverityColor = (severity: EmergencySeverity): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch(severity) {
      case EmergencySeverity.CRITICAL:
        return "error";
      case EmergencySeverity.HIGH:
        return "warning";
      case EmergencySeverity.MEDIUM:
        return "info";
      case EmergencySeverity.LOW:
        return "success";
      default:
        return "default";
    }
  };

  // Formatieren des Zeitstempels
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Aktive Notfälle</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Neuen Notfall melden
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Titel</TableCell>
              <TableCell>Typ</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Schweregrad</TableCell>
              <TableCell>Ort</TableCell>
              <TableCell>Gemeldet am</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cases.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((emergencyCase) => (
              <TableRow key={emergencyCase.id} hover>
                <TableCell>{emergencyCase.title}</TableCell>
                <TableCell>
                  <Chip label={emergencyCase.emergency_type} size="small" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={emergencyCase.status} 
                    color={getStatusColor(emergencyCase.status)}
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={emergencyCase.severity} 
                    color={getSeverityColor(emergencyCase.severity)}
                    size="small" 
                  />
                </TableCell>
                <TableCell>{emergencyCase.location || 'Nicht angegeben'}</TableCell>
                <TableCell>{formatDate(emergencyCase.created_at)}</TableCell>
                <TableCell>
                  <Tooltip title="Details anzeigen">
                    <IconButton size="small" onClick={() => handleOpenDetails(emergencyCase)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Bearbeiten">
                    <IconButton size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {cases.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    Keine Notfälle gefunden
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
        count={cases.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Zeilen pro Seite:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
      />

      {/* Details-Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedCase && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedCase.title}</Typography>
                <Chip 
                  label={selectedCase.status} 
                  color={getStatusColor(selectedCase.status)}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Notfalltyp
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedCase.emergency_type}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Schweregrad
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <Chip 
                      label={selectedCase.severity} 
                      color={getSeverityColor(selectedCase.severity)}
                      size="small" 
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Gemeldet am
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedCase.created_at)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Zuletzt aktualisiert
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedCase.updated_at)}
                  </Typography>
                </Grid>
                {selectedCase.location && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body1" gutterBottom>
                        {selectedCase.location}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {selectedCase.assigned_to_id && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body1" gutterBottom>
                        Zugewiesen an: ID {selectedCase.assigned_to_id}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Beschreibung
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedCase.description || 'Keine Beschreibung verfügbar.'}
              </Typography>

              {selectedCase.affected_areas && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Betroffene Bereiche
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedCase.affected_areas}
                  </Typography>
                </>
              )}

              {selectedCase.potential_impact && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Potenzielle Auswirkungen
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedCase.potential_impact}
                  </Typography>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Maßnahmen und Updates
              </Typography>
              
              {selectedCase.actions && selectedCase.actions.length > 0 ? (
                <Box sx={{ mb: 2 }}>
                  {selectedCase.actions.map((action) => (
                    <Box key={action.id} sx={{ mb: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">
                          {action.description}
                        </Typography>
                        <Chip 
                          icon={action.is_completed ? <CheckIcon /> : <CloseIcon />} 
                          label={action.is_completed ? "Erledigt" : "Offen"} 
                          size="small"
                          color={action.is_completed ? "success" : "default"}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {action.due_date ? `Fällig am: ${new Date(action.due_date).toLocaleDateString()}` : 'Kein Fälligkeitsdatum'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Keine Maßnahmen definiert.
                </Typography>
              )}

              {selectedCase.updates && selectedCase.updates.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Status-Updates
                  </Typography>
                  {selectedCase.updates.map((update) => (
                    <Box key={update.id} sx={{ mb: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="body2">
                        {update.update_text}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(update.created_at)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Schließen</Button>
              <Button variant="outlined" startIcon={<EditIcon />}>Bearbeiten</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog zum Erstellen eines neuen Notfalls */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Neuen Notfall melden</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Titel"
                fullWidth
                value={newCase.title}
                onChange={(e) => handleNewCaseChange('title', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Notfalltyp</InputLabel>
                <Select
                  value={newCase.emergency_type}
                  label="Notfalltyp"
                  onChange={(e) => handleNewCaseChange('emergency_type', e.target.value)}
                >
                  {Object.values(EmergencyType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Schweregrad</InputLabel>
                <Select
                  value={newCase.severity}
                  label="Schweregrad"
                  onChange={(e) => handleNewCaseChange('severity', e.target.value)}
                >
                  {Object.values(EmergencySeverity).map((severity) => (
                    <MenuItem key={severity} value={severity}>
                      {severity}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Ort"
                fullWidth
                value={newCase.location}
                onChange={(e) => handleNewCaseChange('location', e.target.value)}
                placeholder="z.B. Produktionshalle A, Lager 2"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Beschreibung"
                multiline
                rows={4}
                fullWidth
                value={newCase.description}
                onChange={(e) => handleNewCaseChange('description', e.target.value)}
                placeholder="Bitte beschreiben Sie den Notfall so genau wie möglich..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Betroffene Bereiche"
                fullWidth
                value={newCase.affected_areas}
                onChange={(e) => handleNewCaseChange('affected_areas', e.target.value)}
                placeholder="z.B. Produktion, IT-Systeme, Lieferkette"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Potenzielle Auswirkungen"
                multiline
                rows={2}
                fullWidth
                value={newCase.potential_impact}
                onChange={(e) => handleNewCaseChange('potential_impact', e.target.value)}
                placeholder="z.B. Produktionsausfall, Datenverlust, Lieferverzögerungen"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Abbrechen</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateCase}
            disabled={!newCase.title || !newCase.emergency_type || !newCase.severity}
          >
            Notfall melden
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyCaseList; 