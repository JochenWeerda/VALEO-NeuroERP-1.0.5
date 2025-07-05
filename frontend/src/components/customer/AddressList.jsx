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
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';

/**
 * Komponente zur Verwaltung von Adressen eines Kunden
 */
const AddressList = ({ addresses = [], onChange }) => {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [address, setAddress] = useState({
    address_type: 'Lieferadresse',
    name: '',
    street: '',
    country: 'DE',
    postal_code: '',
    city: '',
    is_default: false
  });

  const addressTypes = ['Lieferadresse', 'Standort', 'Betriebsstätte', 'Lager', 'Büro', 'Sonstige'];

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditIndex(-1);
    setAddress({
      address_type: 'Lieferadresse',
      name: '',
      street: '',
      country: 'DE',
      postal_code: '',
      city: '',
      is_default: false
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddress({
      ...address,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = () => {
    // Validierung
    if (!address.name || !address.street || !address.postal_code || !address.city) {
      alert('Name, Straße, PLZ und Ort sind erforderlich!');
      return;
    }

    const newAddresses = [...addresses];
    const newAddress = { ...address };

    // Wenn eine Standardadresse gesetzt wird, alle anderen zurücksetzen
    if (newAddress.is_default) {
      newAddresses.forEach(a => {
        a.is_default = false;
      });
    }

    if (editIndex >= 0) {
      // Bestehende Adresse aktualisieren
      newAddresses[editIndex] = { ...newAddress, id: newAddresses[editIndex].id };
    } else {
      // Neue Adresse hinzufügen
      newAddresses.push({
        ...newAddress,
        id: new Date().getTime() // Temporäre ID für neue Adressen
      });
    }

    onChange(newAddresses);
    handleClose();
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setAddress({ ...addresses[index] });
    setOpen(true);
  };

  const handleDelete = (index) => {
    const newAddresses = [...addresses];
    newAddresses.splice(index, 1);
    onChange(newAddresses);
  };

  const isDefaultExists = addresses.some(a => a.is_default);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Lieferadressen</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Hinzufügen
        </Button>
      </Box>

      {addresses.length === 0 ? (
        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', my: 2 }}>
          Keine Lieferadressen vorhanden. Die Rechnungsadresse wird als Standard-Lieferadresse verwendet.
        </Typography>
      ) : (
        <List>
          {addresses.map((a, index) => (
            <ListItem 
              key={a.id || index} 
              component={Paper} 
              sx={{ 
                mb: 1, 
                p: 2,
                backgroundColor: a.is_default ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                border: a.is_default ? '1px solid rgba(25, 118, 210, 0.5)' : 'inherit'
              }}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1">
                      {a.name} <Typography component="span" variant="caption">({a.address_type})</Typography>
                      {a.is_default && (
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
                          Standardadresse
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                }
                secondary={
                  <React.Fragment>
                    <Typography variant="body2">{a.street}</Typography>
                    <Typography variant="body2">{a.postal_code} {a.city}</Typography>
                    {a.country && a.country !== 'DE' && <Typography variant="body2">Land: {a.country}</Typography>}
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
          {editIndex >= 0 ? 'Lieferadresse bearbeiten' : 'Lieferadresse hinzufügen'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Adresstyp</InputLabel>
                <Select
                  name="address_type"
                  value={address.address_type}
                  onChange={handleInputChange}
                  label="Adresstyp"
                >
                  {addressTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                name="name"
                label="Name/Bezeichnung"
                fullWidth
                value={address.name}
                onChange={handleInputChange}
                placeholder="z.B. Hauptlager, Zweigstelle Nord"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                name="street"
                label="Straße und Hausnummer"
                fullWidth
                value={address.street}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                required
                name="postal_code"
                label="PLZ"
                fullWidth
                value={address.postal_code}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                required
                name="city"
                label="Ort"
                fullWidth
                value={address.city}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="country"
                label="Land"
                fullWidth
                value={address.country}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={address.is_default}
                    onChange={handleInputChange}
                    name="is_default"
                    color="primary"
                  />
                }
                label={
                  <Typography>
                    Als Standardadresse für Lieferungen festlegen
                    {isDefaultExists && !addresses[editIndex]?.is_default && (
                      <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                        (Ersetzt die aktuelle Standardadresse)
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

AddressList.propTypes = {
  addresses: PropTypes.array,
  onChange: PropTypes.func.isRequired
};

export default AddressList; 