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
  CircularProgress,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  LocationOn as LocationOnIcon,
  Category as CategoryIcon,
  Check as CheckIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import emergencyApi, { EmergencyContact } from '../../services/emergencyApi';

interface EmergencyContactsProps {
  filterType?: string;
}

const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ filterType }) => {
  // State für Kontakte und Ladevorgang
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State für Paginierung
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State für Dialog-Anzeige
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);
  
  // State für Formulardaten beim Erstellen/Bearbeiten
  const [formData, setFormData] = useState<Partial<EmergencyContact>>({
    name: '',
    organization: '',
    role: '',
    contact_type: 'internal',
    email: '',
    phone: '',
    alternative_phone: '',
    location: '',
    is_available_24_7: false
  });

  // Verfügbare Kontakttypen
  const contactTypes = [
    { value: 'internal', label: 'Intern' },
    { value: 'external', label: 'Extern' },
    { value: 'authority', label: 'Behörde' },
    { value: 'supplier', label: 'Lieferant' },
    { value: 'customer', label: 'Kunde' },
    { value: 'emergency_service', label: 'Notdienst' },
    { value: 'other', label: 'Sonstiges' }
  ];

  // Laden der Kontakte beim ersten Rendern
  useEffect(() => {
    fetchContacts();
  }, [filterType]);

  // Funktion zum Laden der Kontakte
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await emergencyApi.getContacts(filterType);
      setContacts(data);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden der Kontakte:', err);
      setError('Die Notfallkontakte konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
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
  const handleOpenDetails = (contact: EmergencyContact) => {
    setSelectedContact(contact);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedContact(null);
  };

  // Handler für das Erstellen eines neuen Kontakts
  const handleOpenCreateDialog = () => {
    setFormData({
      name: '',
      organization: '',
      role: '',
      contact_type: 'internal',
      email: '',
      phone: '',
      alternative_phone: '',
      location: '',
      is_available_24_7: false
    });
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  // Handler für das Bearbeiten eines Kontakts
  const handleOpenEditDialog = (contact: EmergencyContact) => {
    setSelectedContact(contact);
    setFormData({ ...contact });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedContact(null);
  };

  // Handler für Änderungen im Formular
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler für das Speichern eines neuen Kontakts
  const handleCreateContact = async () => {
    try {
      await emergencyApi.createContact(formData);
      handleCloseCreateDialog();
      fetchContacts();
    } catch (err) {
      console.error('Fehler beim Erstellen des Kontakts:', err);
      setError('Der Kontakt konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.');
    }
  };

  // Handler für das Aktualisieren eines Kontakts
  const handleUpdateContact = async () => {
    if (!selectedContact) return;
    
    try {
      await emergencyApi.updateContact(selectedContact.id, formData);
      handleCloseEditDialog();
      fetchContacts();
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Kontakts:', err);
      setError('Der Kontakt konnte nicht aktualisiert werden. Bitte versuchen Sie es später erneut.');
    }
  };

  // Hilfsfunktion für die Anzeige der Kontakttypen
  const getContactTypeLabel = (type: string): string => {
    const foundType = contactTypes.find(ct => ct.value === type);
    return foundType ? foundType.label : type;
  };

  // Hilfsfunktion für die Anzeige der Kontakttypen als Chip
  const getContactTypeChip = (type: string) => {
    let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
    
    switch(type) {
      case 'internal':
        color = "primary";
        break;
      case 'external':
        color = "secondary";
        break;
      case 'authority':
        color = "info";
        break;
      case 'emergency_service':
        color = "error";
        break;
      case 'supplier':
        color = "warning";
        break;
      default:
        color = "default";
    }
    
    return (
      <Chip 
        label={getContactTypeLabel(type)} 
        color={color}
        size="small" 
      />
    );
  };

  // Generiere Initialen für Avatar
  const getInitials = (name: string): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Notfallkontakte</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Neuen Kontakt hinzufügen
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
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Organisation</TableCell>
                  <TableCell>Rolle</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Telefon</TableCell>
                  <TableCell>E-Mail</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((contact) => (
                    <TableRow key={contact.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 1, width: 32, height: 32, fontSize: '0.875rem' }}>
                            {getInitials(contact.name)}
                          </Avatar>
                          {contact.name}
                        </Box>
                      </TableCell>
                      <TableCell>{contact.organization || '-'}</TableCell>
                      <TableCell>{contact.role || '-'}</TableCell>
                      <TableCell>{getContactTypeChip(contact.contact_type)}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.email || '-'}</TableCell>
                      <TableCell>
                        <Tooltip title="Details anzeigen">
                          <IconButton size="small" onClick={() => handleOpenDetails(contact)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Bearbeiten">
                          <IconButton size="small" onClick={() => handleOpenEditDialog(contact)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                {contacts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        Keine Kontakte gefunden
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
            count={contacts.length}
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
        {selectedContact && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2 }}>
                  {getInitials(selectedContact.name)}
                </Avatar>
                <Typography variant="h6">{selectedContact.name}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <List>
                {selectedContact.organization && (
                  <ListItem>
                    <ListItemIcon>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Organisation"
                      secondary={selectedContact.organization}
                    />
                  </ListItem>
                )}

                {selectedContact.role && (
                  <ListItem>
                    <ListItemIcon>
                      <CategoryIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Rolle"
                      secondary={selectedContact.role}
                    />
                  </ListItem>
                )}

                <ListItem>
                  <ListItemIcon>
                    <GroupIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Kontakttyp"
                    secondary={getContactTypeLabel(selectedContact.contact_type)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Telefon"
                    secondary={
                      <>
                        {selectedContact.phone}
                        {selectedContact.is_available_24_7 && (
                          <Chip 
                            label="24/7 verfügbar" 
                            color="success" 
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </>
                    }
                  />
                </ListItem>

                {selectedContact.alternative_phone && (
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Alternative Telefonnummer"
                      secondary={selectedContact.alternative_phone}
                    />
                  </ListItem>
                )}

                {selectedContact.email && (
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="E-Mail"
                      secondary={selectedContact.email}
                    />
                  </ListItem>
                )}

                {selectedContact.location && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationOnIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Standort"
                      secondary={selectedContact.location}
                    />
                  </ListItem>
                )}
              </List>

              {selectedContact.notes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Notizen
                  </Typography>
                  <Typography variant="body2">
                    {selectedContact.notes}
                  </Typography>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Schließen</Button>
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                onClick={() => {
                  handleCloseDetails();
                  handleOpenEditDialog(selectedContact);
                }}
              >
                Bearbeiten
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog zum Erstellen eines neuen Kontakts */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Neuen Kontakt hinzufügen</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Name"
                fullWidth
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Organisation"
                fullWidth
                value={formData.organization}
                onChange={(e) => handleFormChange('organization', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Rolle"
                fullWidth
                value={formData.role}
                onChange={(e) => handleFormChange('role', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Kontakttyp</InputLabel>
                <Select
                  value={formData.contact_type}
                  label="Kontakttyp"
                  onChange={(e) => handleFormChange('contact_type', e.target.value)}
                >
                  {contactTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Telefon"
                fullWidth
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Alternative Telefonnummer"
                fullWidth
                value={formData.alternative_phone}
                onChange={(e) => handleFormChange('alternative_phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="E-Mail"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Standort"
                fullWidth
                value={formData.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset" variant="standard">
                <Chip
                  icon={formData.is_available_24_7 ? <CheckIcon /> : undefined}
                  label="24/7 verfügbar" 
                  color={formData.is_available_24_7 ? "success" : "default"}
                  onClick={() => handleFormChange('is_available_24_7', !formData.is_available_24_7)}
                  sx={{ cursor: 'pointer' }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notizen"
                multiline
                rows={3}
                fullWidth
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Zusätzliche Informationen zum Kontakt..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Abbrechen</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateContact}
            disabled={!formData.name || !formData.phone}
          >
            Kontakt hinzufügen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog zum Bearbeiten eines Kontakts */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Kontakt bearbeiten</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Name"
                fullWidth
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Organisation"
                fullWidth
                value={formData.organization}
                onChange={(e) => handleFormChange('organization', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Rolle"
                fullWidth
                value={formData.role}
                onChange={(e) => handleFormChange('role', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Kontakttyp</InputLabel>
                <Select
                  value={formData.contact_type}
                  label="Kontakttyp"
                  onChange={(e) => handleFormChange('contact_type', e.target.value)}
                >
                  {contactTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Telefon"
                fullWidth
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Alternative Telefonnummer"
                fullWidth
                value={formData.alternative_phone}
                onChange={(e) => handleFormChange('alternative_phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="E-Mail"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Standort"
                fullWidth
                value={formData.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset" variant="standard">
                <Chip
                  icon={formData.is_available_24_7 ? <CheckIcon /> : undefined}
                  label="24/7 verfügbar" 
                  color={formData.is_available_24_7 ? "success" : "default"}
                  onClick={() => handleFormChange('is_available_24_7', !formData.is_available_24_7)}
                  sx={{ cursor: 'pointer' }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notizen"
                multiline
                rows={3}
                fullWidth
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Zusätzliche Informationen zum Kontakt..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Abbrechen</Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateContact}
            disabled={!formData.name || !formData.phone}
          >
            Änderungen speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyContacts; 