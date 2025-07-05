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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  Timeline as TimelineIcon,
  Done as DoneIcon,
  Build as BuildIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import emergencyApi, { 
  EmergencyPlan, 
  EmergencyType 
} from '../../services/emergencyApi';

interface EmergencyPlansProps {
  filterType?: EmergencyType;
}

const EmergencyPlans: React.FC<EmergencyPlansProps> = ({ filterType }) => {
  // State für Pläne und Ladevorgang
  const [plans, setPlans] = useState<EmergencyPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State für Paginierung
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // State für Dialog-Anzeige
  const [selectedPlan, setSelectedPlan] = useState<EmergencyPlan | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [emergencyIdToApply, setEmergencyIdToApply] = useState<number | null>(null);

  // Laden der Pläne beim ersten Rendern oder wenn sich der Filter ändert
  useEffect(() => {
    fetchPlans();
  }, [filterType]);

  // Funktion zum Laden der Pläne
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await emergencyApi.getEmergencyPlans(filterType);
      setPlans(data);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden der Notfallpläne:', err);
      setError('Die Notfallpläne konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
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
  const handleOpenDetails = (plan: EmergencyPlan) => {
    setSelectedPlan(plan);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedPlan(null);
  };

  // Handler für das Anwenden eines Plans auf einen Notfall
  const handleOpenApplyDialog = (plan: EmergencyPlan) => {
    setSelectedPlan(plan);
    setApplyDialogOpen(true);
  };

  const handleCloseApplyDialog = () => {
    setApplyDialogOpen(false);
    setEmergencyIdToApply(null);
  };

  const handleApplyPlan = async () => {
    if (!selectedPlan || !emergencyIdToApply) return;
    
    try {
      await emergencyApi.applyPlanToEmergency(emergencyIdToApply, selectedPlan.id);
      handleCloseApplyDialog();
      // Erfolgsmeldung anzeigen
    } catch (err) {
      console.error('Fehler beim Anwenden des Plans:', err);
      // Fehlermeldung anzeigen
    }
  };

  // Formatieren des Zeitstempels
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Render-Funktion für die Pläne-Tabelle
  const renderPlansTable = () => {
    return (
      <>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Notfalltyp</TableCell>
                <TableCell>Erforderliche Ressourcen</TableCell>
                <TableCell>Letzte Aktualisierung</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plans
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((plan) => (
                  <TableRow key={plan.id} hover>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell>
                      <Chip label={plan.emergency_type} size="small" color="primary" />
                    </TableCell>
                    <TableCell>{plan.required_resources?.length || 0}</TableCell>
                    <TableCell>{formatDate(plan.updated_at)}</TableCell>
                    <TableCell>
                      <Chip 
                        icon={plan.is_active ? <CheckIcon /> : undefined} 
                        label={plan.is_active ? "Aktiv" : "Inaktiv"} 
                        color={plan.is_active ? "success" : "default"}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Details anzeigen">
                        <IconButton size="small" onClick={() => handleOpenDetails(plan)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Auf Notfall anwenden">
                        <IconButton size="small" onClick={() => handleOpenApplyDialog(plan)}>
                          <PlayArrowIcon fontSize="small" />
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
              {plans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      Keine Notfallpläne gefunden
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
          count={plans.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Zeilen pro Seite:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
        />
      </>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Notfallpläne</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Neuen Plan erstellen
        </Button>
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
        renderPlansTable()
      )}

      {/* Details-Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedPlan && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedPlan.name}</Typography>
                <Chip 
                  icon={selectedPlan.is_active ? <CheckIcon /> : undefined}
                  label={selectedPlan.is_active ? "Aktiv" : "Inaktiv"} 
                  color={selectedPlan.is_active ? "success" : "default"}
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
                    <Chip label={selectedPlan.emergency_type} color="primary" size="small" />
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Erstellt am
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedPlan.created_at)}
                  </Typography>
                </Grid>
              </Grid>

              {selectedPlan.description && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>
                    Beschreibung
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedPlan.description}
                  </Typography>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Schritte des Plans */}
              <Typography variant="subtitle1" gutterBottom>
                Maßnahmen und Schritte
              </Typography>
              
              {selectedPlan.steps && selectedPlan.steps.length > 0 ? (
                <List>
                  {selectedPlan.steps.map((step: any, index: number) => (
                    <ListItem key={index} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}>
                      <ListItemIcon>
                        <Chip label={index + 1} size="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={step.title}
                        secondary={
                          <>
                            {step.description}
                            {step.responsible && (
                              <Typography variant="caption" display="block">
                                Verantwortlich: {step.responsible}
                              </Typography>
                            )}
                            {step.estimated_duration && (
                              <Typography variant="caption" display="block">
                                Geschätzte Dauer: {step.estimated_duration} Minuten
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Keine Schritte definiert.
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Benötigte Ressourcen */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Benötigte Ressourcen
                  </Typography>
                  
                  {selectedPlan.required_resources && selectedPlan.required_resources.length > 0 ? (
                    <List dense>
                      {selectedPlan.required_resources.map((resourceId: number) => (
                        <ListItem key={resourceId}>
                          <ListItemIcon>
                            <BuildIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={`Ressource ID: ${resourceId}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Keine Ressourcen definiert.
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Benötigte Kontakte
                  </Typography>
                  
                  {selectedPlan.required_contacts && selectedPlan.required_contacts.length > 0 ? (
                    <List dense>
                      {selectedPlan.required_contacts.map((contactId: number) => (
                        <ListItem key={contactId}>
                          <ListItemIcon>
                            <PeopleIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={`Kontakt ID: ${contactId}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Keine Kontakte definiert.
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Schließen</Button>
              <Button 
                variant="outlined" 
                startIcon={<PlayArrowIcon />}
                onClick={() => {
                  handleCloseDetails();
                  handleOpenApplyDialog(selectedPlan);
                }}
              >
                Auf Notfall anwenden
              </Button>
              <Button variant="outlined" startIcon={<EditIcon />}>
                Bearbeiten
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog zum Anwenden eines Plans auf einen Notfall */}
      <Dialog
        open={applyDialogOpen}
        onClose={handleCloseApplyDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Plan auf Notfall anwenden</DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Sie sind dabei, den Plan "{selectedPlan.name}" auf einen Notfall anzuwenden.
              </Typography>
              
              <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
                Bitte geben Sie die ID des Notfalls ein:
              </Typography>
              
              <TextField
                label="Notfall-ID"
                type="number"
                fullWidth
                value={emergencyIdToApply || ''}
                onChange={(e) => setEmergencyIdToApply(Number(e.target.value))}
                margin="normal"
                helperText="Die ID finden Sie in der Notfallliste"
              />
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Durch das Anwenden werden die im Plan definierten Maßnahmen dem Notfall hinzugefügt und der Notfallstatus auf "In Bearbeitung" gesetzt.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApplyDialog}>Abbrechen</Button>
          <Button 
            variant="contained" 
            onClick={handleApplyPlan}
            disabled={!emergencyIdToApply}
            color="primary"
            startIcon={<PlayArrowIcon />}
          >
            Plan anwenden
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyPlans; 