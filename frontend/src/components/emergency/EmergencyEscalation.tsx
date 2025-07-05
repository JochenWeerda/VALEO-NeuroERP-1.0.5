import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Grid,
  Divider,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  PriorityHigh as PriorityHighIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { EmergencyCase, EmergencyEscalation, EscalationLevel, EmergencyContact } from '../../services/emergencyApi';
import emergencyApi from '../../services/emergencyApi';

interface EmergencyEscalationProps {
  emergencyCase: EmergencyCase;
  onEscalationCreated?: () => void;
  onEscalationUpdated?: () => void;
  readOnly?: boolean;
}

const EmergencyEscalationManager: React.FC<EmergencyEscalationProps> = ({
  emergencyCase,
  onEscalationCreated,
  onEscalationUpdated,
  readOnly = false
}) => {
  // States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [acknowledgeDialogOpen, setAcknowledgeDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [selectedEscalation, setSelectedEscalation] = useState<EmergencyEscalation | null>(null);
  
  // Formular-States
  const [newEscalation, setNewEscalation] = useState<Partial<EmergencyEscalation>>({
    escalation_level: EscalationLevel.LEVEL1,
    reason: '',
    escalation_recipients: [],
    acknowledgement_required: true
  });
  
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [formErrors, setFormErrors] = useState<{
    level?: string;
    reason?: string;
    recipients?: string;
  }>({});
  
  // Laden der Kontakte
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const contactsData = await emergencyApi.getContacts();
        setContacts(contactsData);
      } catch (error) {
        console.error('Fehler beim Laden der Kontakte:', error);
      }
    };
    
    loadContacts();
  }, []);
  
  // Dialog-Handler
  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };
  
  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setNewEscalation({
      escalation_level: EscalationLevel.LEVEL1,
      reason: '',
      escalation_recipients: [],
      acknowledgement_required: true
    });
    setFormErrors({});
  };
  
  const handleOpenDetailDialog = (escalation: EmergencyEscalation) => {
    setSelectedEscalation(escalation);
    setDetailDialogOpen(true);
  };
  
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedEscalation(null);
  };
  
  const handleOpenAcknowledgeDialog = (escalation: EmergencyEscalation) => {
    setSelectedEscalation(escalation);
    setAcknowledgeDialogOpen(true);
  };
  
  const handleCloseAcknowledgeDialog = () => {
    setAcknowledgeDialogOpen(false);
  };
  
  const handleOpenResolveDialog = (escalation: EmergencyEscalation) => {
    setSelectedEscalation(escalation);
    setResolveDialogOpen(true);
  };
  
  const handleCloseResolveDialog = () => {
    setResolveDialogOpen(false);
    setResolutionNotes('');
  };
  
  // Formularvalidierung
  const validateForm = (): boolean => {
    const errors: {
      level?: string;
      reason?: string;
      recipients?: string;
    } = {};
    
    if (!newEscalation.escalation_level) {
      errors.level = 'Bitte wählen Sie eine Eskalationsstufe aus';
    }
    
    if (!newEscalation.reason || newEscalation.reason.trim() === '') {
      errors.reason = 'Bitte geben Sie einen Grund für die Eskalation an';
    }
    
    if (!newEscalation.escalation_recipients || newEscalation.escalation_recipients.length === 0) {
      errors.recipients = 'Bitte wählen Sie mindestens einen Empfänger aus';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // API-Calls
  const handleCreateEscalation = async () => {
    if (!validateForm()) return;
    
    try {
      await emergencyApi.createEscalation(emergencyCase.id, newEscalation);
      handleCloseCreateDialog();
      if (onEscalationCreated) onEscalationCreated();
    } catch (error) {
      console.error('Fehler beim Erstellen der Eskalation:', error);
    }
  };
  
  const handleAcknowledgeEscalation = async () => {
    if (!selectedEscalation) return;
    
    try {
      await emergencyApi.acknowledgeEscalation(selectedEscalation.id);
      handleCloseAcknowledgeDialog();
      if (onEscalationUpdated) onEscalationUpdated();
    } catch (error) {
      console.error('Fehler beim Bestätigen der Eskalation:', error);
    }
  };
  
  const handleResolveEscalation = async () => {
    if (!selectedEscalation || !resolutionNotes.trim()) return;
    
    try {
      await emergencyApi.resolveEscalation(selectedEscalation.id, resolutionNotes);
      handleCloseResolveDialog();
      if (onEscalationUpdated) onEscalationUpdated();
    } catch (error) {
      console.error('Fehler beim Auflösen der Eskalation:', error);
    }
  };
  
  // Formulardaten-Handler
  const handleNewEscalationChange = (field: string, value: any) => {
    setNewEscalation(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Fehler zurücksetzen, wenn ein Feld korrigiert wird
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
  
  // Hilfsfunktionen
  const getEscalationLevelColor = (level: EscalationLevel): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch(level) {
      case EscalationLevel.LEVEL1:
        return "info";
      case EscalationLevel.LEVEL2:
        return "primary";
      case EscalationLevel.LEVEL3:
        return "warning";
      case EscalationLevel.LEVEL4:
      case EscalationLevel.LEVEL5:
        return "error";
      default:
        return "default";
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nicht angegeben';
    return new Date(dateString).toLocaleString();
  };
  
  const getContactNameById = (contactId: number) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? contact.name : `Kontakt ID: ${contactId}`;
  };
  
  const isEscalationResolved = (escalation: EmergencyEscalation) => {
    return !!escalation.resolved_at;
  };
  
  const isEscalationAcknowledged = (escalation: EmergencyEscalation) => {
    return !!escalation.acknowledgement_time;
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Eskalationsmanagement</Typography>
        {!readOnly && (
          <Button
            variant="contained"
            color="warning"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Eskalieren
          </Button>
        )}
      </Box>
      
      {emergencyCase.escalations && emergencyCase.escalations.length > 0 ? (
        <Paper sx={{ p: 2 }}>
          <List>
            {emergencyCase.escalations.map((escalation) => (
              <React.Fragment key={escalation.id}>
                <ListItem
                  button
                  onClick={() => handleOpenDetailDialog(escalation)}
                  sx={{
                    opacity: isEscalationResolved(escalation) ? 0.7 : 1,
                    bgcolor: isEscalationResolved(escalation) ? 'action.hover' : 'inherit'
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={escalation.escalation_level}
                          color={getEscalationLevelColor(escalation.escalation_level)}
                          size="small"
                        />
                        <Typography variant="body1">
                          {isEscalationResolved(escalation) ? (
                            <span style={{ textDecoration: 'line-through' }}>
                              {escalation.reason}
                            </span>
                          ) : (
                            escalation.reason
                          )}
                        </Typography>
                      </Box>
                    }
                    secondary={`Eskaliert am: ${formatDate(escalation.escalated_at)}`}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Details anzeigen">
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetailDialog(escalation);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    {!isEscalationAcknowledged(escalation) && !isEscalationResolved(escalation) && !readOnly && (
                      <Tooltip title="Bestätigen">
                        <IconButton
                          edge="end"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAcknowledgeDialog(escalation);
                          }}
                        >
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {isEscalationAcknowledged(escalation) && !isEscalationResolved(escalation) && !readOnly && (
                      <Tooltip title="Auflösen">
                        <IconButton
                          edge="end"
                          color="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenResolveDialog(escalation);
                          }}
                        >
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          Keine Eskalationen für diesen Notfall vorhanden.
        </Alert>
      )}
      
      {/* Dialog zum Erstellen einer Eskalation */}
      <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog} maxWidth="md" fullWidth>
        <DialogTitle>Notfall eskalieren</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.level}>
                <InputLabel id="escalation-level-label">Eskalationsstufe</InputLabel>
                <Select
                  labelId="escalation-level-label"
                  value={newEscalation.escalation_level || ''}
                  label="Eskalationsstufe"
                  onChange={(e) => handleNewEscalationChange('escalation_level', e.target.value)}
                >
                  {Object.values(EscalationLevel).map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.level && <FormHelperText>{formErrors.level}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Grund für die Eskalation"
                multiline
                rows={3}
                value={newEscalation.reason || ''}
                onChange={(e) => handleNewEscalationChange('reason', e.target.value)}
                error={!!formErrors.reason}
                helperText={formErrors.reason}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.recipients}>
                <InputLabel id="recipients-label">Empfänger</InputLabel>
                <Select
                  labelId="recipients-label"
                  multiple
                  value={newEscalation.escalation_recipients || []}
                  label="Empfänger"
                  onChange={(e) => handleNewEscalationChange('escalation_recipients', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as number[]).map((contactId) => (
                        <Chip key={contactId} label={getContactNameById(contactId)} />
                      ))}
                    </Box>
                  )}
                >
                  {contacts.map((contact) => (
                    <MenuItem key={contact.id} value={contact.id}>
                      {contact.name} {contact.role ? `(${contact.role})` : ''}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.recipients && <FormHelperText>{formErrors.recipients}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} color="inherit">
            Abbrechen
          </Button>
          <Button onClick={handleCreateEscalation} variant="contained" color="warning">
            Eskalieren
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog für Eskalationsdetails */}
      <Dialog open={detailDialogOpen} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
        {selectedEscalation && (
          <>
            <DialogTitle>
              <Typography variant="h6">
                Eskalationsdetails
                <Chip
                  label={selectedEscalation.escalation_level}
                  color={getEscalationLevelColor(selectedEscalation.escalation_level)}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Typography variant="body1">
                    {isEscalationResolved(selectedEscalation) ? (
                      <Chip label="Aufgelöst" color="success" size="small" />
                    ) : isEscalationAcknowledged(selectedEscalation) ? (
                      <Chip label="Bestätigt" color="primary" size="small" />
                    ) : (
                      <Chip label="Offen" color="warning" size="small" />
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Eskaliert am</Typography>
                  <Typography variant="body1">{formatDate(selectedEscalation.escalated_at)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Grund</Typography>
                  <Typography variant="body1">{selectedEscalation.reason}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Empfänger</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {selectedEscalation.escalation_recipients.map((contactId) => (
                      <Chip key={contactId} label={getContactNameById(contactId)} />
                    ))}
                  </Box>
                </Grid>
                
                {isEscalationAcknowledged(selectedEscalation) && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2">Bestätigt am</Typography>
                      <Typography variant="body1">{formatDate(selectedEscalation.acknowledgement_time)}</Typography>
                    </Grid>
                  </>
                )}
                
                {isEscalationResolved(selectedEscalation) && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2">Aufgelöst am</Typography>
                      <Typography variant="body1">{formatDate(selectedEscalation.resolved_at)}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Auflösungsnotizen</Typography>
                      <Typography variant="body1">{selectedEscalation.resolution_notes || 'Keine Notizen'}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetailDialog} color="primary">
                Schließen
              </Button>
              {!isEscalationAcknowledged(selectedEscalation) && !isEscalationResolved(selectedEscalation) && !readOnly && (
                <Button 
                  onClick={() => {
                    handleCloseDetailDialog();
                    handleOpenAcknowledgeDialog(selectedEscalation);
                  }} 
                  color="primary" 
                  variant="contained"
                >
                  Bestätigen
                </Button>
              )}
              {isEscalationAcknowledged(selectedEscalation) && !isEscalationResolved(selectedEscalation) && !readOnly && (
                <Button 
                  onClick={() => {
                    handleCloseDetailDialog();
                    handleOpenResolveDialog(selectedEscalation);
                  }} 
                  color="success" 
                  variant="contained"
                >
                  Auflösen
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Dialog für Eskalationsbestätigung */}
      <Dialog open={acknowledgeDialogOpen} onClose={handleCloseAcknowledgeDialog}>
        <DialogTitle>Eskalation bestätigen</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Möchten Sie bestätigen, dass Sie diese Eskalation erhalten haben und bearbeiten werden?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAcknowledgeDialog} color="inherit">
            Abbrechen
          </Button>
          <Button onClick={handleAcknowledgeEscalation} color="primary" variant="contained">
            Bestätigen
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog für Eskalationsauflösung */}
      <Dialog open={resolveDialogOpen} onClose={handleCloseResolveDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Eskalation auflösen</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Bitte geben Sie eine kurze Beschreibung der durchgeführten Maßnahmen und des Ergebnisses an.
          </Typography>
          <TextField
            fullWidth
            label="Auflösungsnotizen"
            multiline
            rows={4}
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResolveDialog} color="inherit">
            Abbrechen
          </Button>
          <Button 
            onClick={handleResolveEscalation} 
            color="success" 
            variant="contained"
            disabled={!resolutionNotes.trim()}
          >
            Auflösen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyEscalationManager; 