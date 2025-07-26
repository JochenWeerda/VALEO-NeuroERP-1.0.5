import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Box,
  Typography,
  Chip,
  Alert
} from '@mui/material';
import { ContactPersonFormData, ContactRole, ContactPermission, getInitialContactFormData } from '../../../types/crm';
import { ContactWeekdaysEditor } from './ContactWeekdaysEditor';

interface ContactFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: ContactPersonFormData) => void;
  contact?: ContactPersonFormData | null;
  isLoading?: boolean;
  error?: string | null;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  open,
  onClose,
  onSubmit,
  contact = null,
  isLoading = false,
  error = null
}) => {
  const [formData, setFormData] = React.useState<ContactPersonFormData>(
    contact || getInitialContactFormData()
  );

  React.useEffect(() => {
    if (contact) {
      setFormData(contact);
    } else {
      setFormData(getInitialContactFormData());
    }
  }, [contact, open]);

  const handleInputChange = (field: keyof ContactPersonFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactScheduleChange = (weekday: string, contactTime: any) => {
    setFormData(prev => ({
      ...prev,
      contactSchedule: {
        ...prev.contactSchedule,
        [weekday]: contactTime
      }
    }));
  };

  const handlePermissionToggle = (permission: ContactPermission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getPermissionLabel = (permission: ContactPermission) => {
    const labels: Record<ContactPermission, string> = {
      [ContactPermission.VIEW_ORDERS]: 'Aufträge anzeigen',
      [ContactPermission.PLACE_ORDERS]: 'Aufträge erstellen',
      [ContactPermission.VIEW_INVOICES]: 'Rechnungen anzeigen',
      [ContactPermission.VIEW_DOCUMENTS]: 'Dokumente anzeigen',
      [ContactPermission.RECEIVE_COMMUNICATIONS]: 'Kommunikation erhalten',
      [ContactPermission.MANAGE_CONTACTS]: 'Kontakte verwalten'
    };
    return labels[permission];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {contact ? 'Kontakt bearbeiten' : 'Neuen Kontakt erstellen'}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            {/* Persönliche Daten */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Persönliche Daten
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Anrede</InputLabel>
                <Select
                  value={formData.salutation}
                  onChange={(e) => handleInputChange('salutation', e.target.value)}
                  label="Anrede"
                >
                  <MenuItem value="Herr">Herr</MenuItem>
                  <MenuItem value="Frau">Frau</MenuItem>
                  <MenuItem value="Divers">Divers</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4.5}>
              <TextField
                fullWidth
                size="small"
                label="Vorname"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4.5}>
              <TextField
                fullWidth
                size="small"
                label="Nachname"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Abteilung"
                value={formData.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Geburtsdatum"
                type="date"
                value={formData.birthDate || ''}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Rolle</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  label="Rolle"
                >
                  {Object.values(ContactRole).map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Kontaktdaten */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Kontaktdaten
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Telefon 1"
                value={formData.phone1}
                onChange={(e) => handleInputChange('phone1', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Telefon 2"
                value={formData.phone2 || ''}
                onChange={(e) => handleInputChange('phone2', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Mobil"
                value={formData.mobile || ''}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="WhatsApp"
                value={formData.whatsapp || ''}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="E-Mail"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Fax"
                value={formData.fax || ''}
                onChange={(e) => handleInputChange('fax', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Skype"
                value={formData.skype || ''}
                onChange={(e) => handleInputChange('skype', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="LinkedIn"
                value={formData.linkedin || ''}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Website"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </Grid>
            
            {/* Status und Berechtigungen */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Status und Berechtigungen
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isMainContact}
                    onChange={(e) => handleInputChange('isMainContact', e.target.checked)}
                  />
                }
                label="Hauptkontakt"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  />
                }
                label="Aktiv"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Berechtigungen
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {Object.values(ContactPermission).map((permission) => (
                  <Chip
                    key={permission}
                    label={getPermissionLabel(permission)}
                    onClick={() => handlePermissionToggle(permission)}
                    color={formData.permissions.includes(permission) ? 'primary' : 'default'}
                    variant={formData.permissions.includes(permission) ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
            
            {/* Notizen */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notizen"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </Grid>
            
            {/* Kontaktzeiten */}
            <Grid item xs={12}>
              <ContactWeekdaysEditor
                contactSchedule={formData.contactSchedule}
                onChange={handleContactScheduleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Abbrechen
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !formData.firstName || !formData.lastName || !formData.phone1}
          >
            {isLoading ? 'Speichere...' : (contact ? 'Aktualisieren' : 'Erstellen')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 