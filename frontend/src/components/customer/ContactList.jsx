import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  FormControlLabel,
  Checkbox,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * Komponente zur Verwaltung von Kontakten eines Kunden
 */
const ContactList = ({ contacts = [], onChange }) => {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [contact, setContact] = useState({
    first_name: '',
    last_name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    mobile: '',
    is_primary: false
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditIndex(-1);
    setContact({
      first_name: '',
      last_name: '',
      position: '',
      department: '',
      email: '',
      phone: '',
      mobile: '',
      is_primary: false
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContact({
      ...contact,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = () => {
    // Validierung
    if (!contact.first_name || !contact.last_name) {
      alert('Vor- und Nachname sind erforderlich!');
      return;
    }

    const newContacts = [...contacts];
    const newContact = { ...contact };

    // Wenn ein primärer Kontakt gesetzt wird, alle anderen zurücksetzen
    if (newContact.is_primary) {
      newContacts.forEach(c => {
        c.is_primary = false;
      });
    }

    if (editIndex >= 0) {
      // Bestehenden Kontakt aktualisieren
      newContacts[editIndex] = { ...newContact, id: newContacts[editIndex].id };
    } else {
      // Neuen Kontakt hinzufügen
      newContacts.push({
        ...newContact,
        id: new Date().getTime() // Temporäre ID für neue Kontakte
      });
    }

    onChange(newContacts);
    handleClose();
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setContact({ ...contacts[index] });
    setOpen(true);
  };

  const handleDelete = (index) => {
    const newContacts = [...contacts];
    newContacts.splice(index, 1);
    onChange(newContacts);
  };

  const isPrimaryExists = contacts.some(c => c.is_primary);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Ansprechpartner</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Hinzufügen
        </Button>
      </Box>

      {contacts.length === 0 ? (
        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', my: 2 }}>
          Keine Ansprechpartner vorhanden. Bitte fügen Sie mindestens einen Ansprechpartner hinzu.
        </Typography>
      ) : (
        <List>
          {contacts.map((c, index) => (
            <ListItem 
              key={c.id || index} 
              component={Paper} 
              sx={{ 
                mb: 1, 
                p: 2,
                backgroundColor: c.is_primary ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                border: c.is_primary ? '1px solid rgba(25, 118, 210, 0.5)' : 'inherit'
              }}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1">
                      {c.first_name} {c.last_name}
                      {c.is_primary && (
                        <Typography 
                          component="span" 
                          variant="caption" 
                          sx={{ 
                            ml: 1, 
                            px: 1, 
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: 'primary.main',
                            color: 'white'
                          }}
                        >
                          Primärer Kontakt
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                }
                secondary={
                  <React.Fragment>
                    {c.position && <Typography variant="body2">{c.position}</Typography>}
                    {c.department && <Typography variant="body2">{c.department}</Typography>}
                    {c.email && <Typography variant="body2">E-Mail: {c.email}</Typography>}
                    {c.phone && <Typography variant="body2">Tel: {c.phone}</Typography>}
                    {c.mobile && <Typography variant="body2">Mobil: {c.mobile}</Typography>}
                  </React.Fragment>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(index)} sx={{ mr: 1 }}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editIndex >= 0 ? 'Ansprechpartner bearbeiten' : 'Ansprechpartner hinzufügen'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                autoFocus
                required
                name="first_name"
                label="Vorname"
                fullWidth
                value={contact.first_name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                name="last_name"
                label="Nachname"
                fullWidth
                value={contact.last_name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="position"
                label="Position"
                fullWidth
                value={contact.position}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="department"
                label="Abteilung"
                fullWidth
                value={contact.department}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="E-Mail"
                type="email"
                fullWidth
                value={contact.email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="phone"
                label="Telefon"
                fullWidth
                value={contact.phone}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="mobile"
                label="Mobiltelefon"
                fullWidth
                value={contact.mobile}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={contact.is_primary}
                    onChange={handleInputChange}
                    name="is_primary"
                    color="primary"
                  />
                }
                label={
                  <Typography>
                    Als primären Ansprechpartner festlegen
                    {isPrimaryExists && !contacts[editIndex]?.is_primary && (
                      <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                        (Ersetzt den aktuellen primären Kontakt)
                      </Typography>
                    )}
                  </Typography>
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Abbrechen
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

ContactList.propTypes = {
  contacts: PropTypes.array,
  onChange: PropTypes.func.isRequired
};

export default ContactList; 