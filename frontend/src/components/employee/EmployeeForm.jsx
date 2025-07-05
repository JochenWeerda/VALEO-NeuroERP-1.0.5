import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Divider,
  Box,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Backdrop,
  FormControlLabel,
  Switch,
  Chip,
  InputAdornment,
  IconButton,
  FormHelperText,
  Checkbox
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import deLocale from 'date-fns/locale/de';
import axios from 'axios';

/**
 * Mitarbeiter-Formular für die Erstellung und Bearbeitung von Mitarbeitern/Benutzern
 */
const EmployeeForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [showSalesRepFields, setShowSalesRepFields] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  
  // Initialer Formularstatus
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone: '',
    department: '',
    position: '',
    password: '',
    is_active: true,
    is_superuser: false,
    is_sales_rep: false,
    sales_rep_code: '',
    // Arbeitsschutz-relevante Felder
    sachkundenachweis_pflanzenschutz: false,
    sachkundenachweis_pflanzenschutz_gueltig_bis: null,
    gabelstapler_schein: false,
    gabelstapler_schein_gueltig_bis: null,
    adr_schein: false,
    adr_schein_gueltig_bis: null,
    berufskraftfahrer_weiterbildung: false,
    berufskraftfahrer_weiterbildung_gueltig_bis: null
  });
  
  // Validierungsstatus
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    sales_rep_code: ''
  });
  
  // Abteilungsoptionen für Dropdown
  const departmentOptions = [
    'Vertrieb',
    'Buchhaltung',
    'IT',
    'Einkauf',
    'Logistik',
    'Marketing',
    'Verwaltung',
    'Produktion',
    'Qualitätssicherung',
    'Kundenservice'
  ];
  
  // Effekt zum Laden der Daten bei Bearbeitung
  useEffect(() => {
    // Wenn im Bearbeitungsmodus, Mitarbeiterdaten laden
    if (mode === 'edit' && id) {
      setLoading(true);
      // API-Aufruf um Mitarbeiterdaten zu laden
      fetch(`/api/v1/users/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Mitarbeiter nicht gefunden');
          }
          return response.json();
        })
        .then(data => {
          setFormData({
            ...data,
            password: '' // Passwort nie aus der API laden
          });
          setLoading(false);
        })
        .catch(error => {
          console.error('Fehler beim Laden der Mitarbeiterdaten:', error);
          setNotification({
            open: true,
            message: 'Fehler beim Laden der Mitarbeiterdaten',
            severity: 'error'
          });
          setLoading(false);
          
          // Mock-Daten für Entwicklung
          if (process.env.NODE_ENV === 'development') {
            setFormData({
              username: 'jweerda',
              email: 'j.weerda@example.com',
              full_name: 'Jochen Weerda',
              phone: '0123-456789',
              department: 'Vertrieb',
              position: 'Vertriebsleiter',
              password: '',
              is_active: true,
              is_superuser: false,
              is_sales_rep: true,
              sales_rep_code: 'JW',
              // Arbeitsschutz-relevante Felder
              sachkundenachweis_pflanzenschutz: false,
              sachkundenachweis_pflanzenschutz_gueltig_bis: null,
              gabelstapler_schein: false,
              gabelstapler_schein_gueltig_bis: null,
              adr_schein: false,
              adr_schein_gueltig_bis: null,
              berufskraftfahrer_weiterbildung: false,
              berufskraftfahrer_weiterbildung_gueltig_bis: null
            });
            setLoading(false);
          } else {
            // Nach kurzer Verzögerung zurück zur Mitarbeiterliste
            setTimeout(() => navigate('/mitarbeiter'), 2000);
          }
        });
    }
  }, [id, mode, navigate]);
  
  useEffect(() => {
    // Rollen laden
    const fetchRoles = async () => {
      try {
        const response = await axios.get('/api/users/roles');
        setRoles(response.data);
        
        // Wenn Mitarbeiter existiert, dessen Rollen vorauswählen
        if (id && formData.roles) {
          setSelectedRoles(formData.roles.map(role => role.id));
        }
      } catch (error) {
        console.error('Fehler beim Laden der Rollen:', error);
      }
    };
    
    fetchRoles();
  }, [id, formData.roles]);
  
  // Handler für Änderungen in den Formularfeldern
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Wenn is_sales_rep auf false gesetzt wird, Kürzel zurücksetzen
      if (name === 'is_sales_rep' && !checked) {
        newData.sales_rep_code = '';
      }
      
      // Wenn ein Vertriebsberater hinzugefügt wird und noch kein Kürzel existiert,
      // automatisch generieren, aber nur wenn wir einen vollständigen Namen haben
      if (name === 'is_sales_rep' && checked && !prevData.sales_rep_code && prevData.full_name) {
        generateSalesRepCode();
      }
      
      // Wenn der vollständige Name geändert wird und die Person ein Vertriebsberater ist,
      // fragen, ob das Kürzel automatisch aktualisiert werden soll
      if (name === 'full_name' && prevData.is_sales_rep && prevData.sales_rep_code && mode === 'create') {
        generateSalesRepCode();
      }
      
      // Wenn is_sales_rep geändert wird, ein/ausblenden der entsprechenden Felder
      if (name === 'is_sales_rep') {
        setShowSalesRepFields(checked);
      }
      
      return newData;
    });
    
    // Validierungsfehler zurücksetzen, wenn das Feld geändert wird
    if (name in validationErrors) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Automatische Generierung des Vertriebsberater-Kürzels
  const generateSalesRepCode = () => {
    if (!formData.full_name) {
      setValidationErrors(prev => ({
        ...prev,
        full_name: 'Name wird benötigt, um ein Kürzel zu generieren'
      }));
      return;
    }
    
    const nameParts = formData.full_name.split(' ');
    if (nameParts.length < 2) {
      setValidationErrors(prev => ({
        ...prev,
        full_name: 'Vor- und Nachname werden benötigt, um ein Kürzel zu generieren'
      }));
      return;
    }
    
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    
    setGeneratingCode(true);
    
    // API-Aufruf zur Generierung des Kürzels
    fetch('/api/v1/users/generate-sales-rep-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Fehler bei der Generierung des Kürzels');
        }
        return response.json();
      })
      .then(data => {
        setFormData(prev => ({
          ...prev,
          sales_rep_code: data.sales_rep_code
        }));
        setGeneratingCode(false);
      })
      .catch(error => {
        console.error('Fehler bei der Generierung des Kürzels:', error);
        
        // Für Entwicklungszwecke ein einfaches Kürzel generieren
        if (process.env.NODE_ENV === 'development') {
          const code = (firstName[0] + lastName[0]).toUpperCase();
          setFormData(prev => ({
            ...prev,
            sales_rep_code: code
          }));
        }
        
        setGeneratingCode(false);
        setNotification({
          open: true,
          message: 'Fehler bei der Generierung des Vertriebsberater-Kürzels',
          severity: 'error'
        });
      });
  };
  
  // Formularvalidierung
  const validateForm = () => {
    const errors = {
      username: '',
      email: '',
      full_name: '',
      password: '',
      sales_rep_code: ''
    };
    
    // Benutzername-Validierung
    if (!formData.username.trim()) {
      errors.username = 'Benutzername ist erforderlich';
    } else if (formData.username.length < 3) {
      errors.username = 'Benutzername muss mindestens 3 Zeichen lang sein';
    }
    
    // E-Mail-Validierung
    if (!formData.email.trim()) {
      errors.email = 'E-Mail ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Gültige E-Mail-Adresse erforderlich';
    }
    
    // Name-Validierung
    if (!formData.full_name.trim()) {
      errors.full_name = 'Name ist erforderlich';
    } else if (formData.full_name.split(' ').length < 2) {
      errors.full_name = 'Vor- und Nachname erforderlich';
    }
    
    // Passwort-Validierung (nur bei Erstellung oder wenn ein Passwort eingegeben wurde)
    if (mode === 'create' && !formData.password) {
      errors.password = 'Passwort ist erforderlich';
    } else if (formData.password && formData.password.length < 8) {
      errors.password = 'Passwort muss mindestens 8 Zeichen lang sein';
    }
    
    // Kürzel-Validierung für Vertriebsberater
    if (formData.is_sales_rep && !formData.sales_rep_code) {
      errors.sales_rep_code = 'Kürzel ist erforderlich für Vertriebsberater';
    } else if (formData.is_sales_rep && !/^[A-Z]{2,3}$/.test(formData.sales_rep_code)) {
      errors.sales_rep_code = 'Kürzel muss aus 2-3 Großbuchstaben bestehen';
    }
    
    setValidationErrors(errors);
    
    // Prüfen, ob Fehler vorliegen
    return !Object.values(errors).some(error => error);
  };
  
  // Speichern des Mitarbeiters
  const saveEmployee = () => {
    if (!validateForm()) {
      setNotification({
        open: true,
        message: 'Bitte korrigieren Sie die Fehler im Formular',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    const url = mode === 'edit' ? `/api/v1/users/${id}` : '/api/v1/users';
    const method = mode === 'edit' ? 'PUT' : 'POST';
    
    // Bei der Bearbeitung nur die geänderten Felder senden
    const submitData = mode === 'edit' 
      ? { ...Object.entries(formData).reduce((acc, [key, value]) => {
          // Passwort nur senden, wenn es geändert wurde
          if (key === 'password' && !value) return acc;
          return { ...acc, [key]: value };
        }, {}) }
      : formData;
    
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitData)
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.detail || 'Fehler beim Speichern');
          });
        }
        return response.json();
      })
      .then(data => {
        setNotification({
          open: true,
          message: `Mitarbeiter erfolgreich ${mode === 'edit' ? 'aktualisiert' : 'erstellt'}`,
          severity: 'success'
        });
        setLoading(false);
        setTimeout(() => navigate('/mitarbeiter'), 2000);
      })
      .catch(error => {
        console.error('Fehler beim Speichern:', error);
        setNotification({
          open: true,
          message: error.message || `Fehler beim ${mode === 'edit' ? 'Aktualisieren' : 'Erstellen'} des Mitarbeiters`,
          severity: 'error'
        });
        setLoading(false);
      });
  };
  
  // Löschen des Mitarbeiters
  const deleteEmployee = () => {
    setLoading(true);
    fetch(`/api/v1/users/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.detail || 'Fehler beim Löschen');
          });
        }
        
        setNotification({
          open: true,
          message: 'Mitarbeiter erfolgreich gelöscht',
          severity: 'success'
        });
        setLoading(false);
        setTimeout(() => navigate('/mitarbeiter'), 2000);
      })
      .catch(error => {
        console.error('Fehler beim Löschen:', error);
        setNotification({
          open: true,
          message: error.message || 'Fehler beim Löschen des Mitarbeiters',
          severity: 'error'
        });
        setLoading(false);
      });
  };
  
  // Toggle Passwort-Sichtbarkeit
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Notification schließen
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };
  
  const handleRoleChange = (e) => {
    const { value } = e.target;
    setSelectedRoles(typeof value === 'string' ? value.split(',') : value);
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={deLocale}>
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ p: 3, mb: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {mode === 'edit' ? 'Mitarbeiter bearbeiten' : 'Neuen Mitarbeiter anlegen'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/mitarbeiter')}
              >
                Abbrechen
              </Button>
              {mode === 'edit' && (
                <Button 
                  variant="outlined" 
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialog(true)}
                >
                  Löschen
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={saveEmployee}
              >
                Speichern
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={3}>
            {/* Allgemeine Informationen */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom fontWeight="500">
                Allgemeine Informationen
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                name="username"
                label="Benutzername"
                value={formData.username}
                onChange={handleChange}
                fullWidth
                required
                error={!!validationErrors.username}
                helperText={validationErrors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                name="email"
                label="E-Mail"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                error={!!validationErrors.email}
                helperText={validationErrors.email}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                name="full_name"
                label="Vollständiger Name"
                value={formData.full_name}
                onChange={handleChange}
                fullWidth
                required
                error={!!validationErrors.full_name}
                helperText={validationErrors.full_name}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                name="phone"
                label="Telefon"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="department-label">Abteilung</InputLabel>
                <Select
                  labelId="department-label"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  label="Abteilung"
                >
                  <MenuItem value="">
                    <em>Keine Angabe</em>
                  </MenuItem>
                  {departmentOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                name="position"
                label="Position"
                value={formData.position}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="password"
                label={mode === 'edit' ? 'Passwort (leer lassen, um nicht zu ändern)' : 'Passwort'}
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required={mode === 'create'}
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, height: '100%', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={handleChange}
                      name="is_active"
                    />
                  }
                  label="Aktiv"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_superuser}
                      onChange={handleChange}
                      name="is_superuser"
                    />
                  }
                  label="Administrator"
                />
              </Box>
            </Grid>
            
            {/* Vertriebsberater-Bereich */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="500">
                Vertriebsberater-Einstellungen
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_sales_rep}
                    onChange={handleChange}
                    name="is_sales_rep"
                  />
                }
                label="Ist Vertriebsberater"
              />
            </Grid>
            
            {showSalesRepFields && (
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    name="sales_rep_code"
                    label="Vertriebsberater-Kürzel"
                    value={formData.sales_rep_code}
                    onChange={handleChange}
                    fullWidth
                    error={!!validationErrors.sales_rep_code}
                    helperText={validationErrors.sales_rep_code || "2-3 Großbuchstaben (z.B. JW für Jochen Weerda)"}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AutorenewIcon />}
                    onClick={generateSalesRepCode}
                    disabled={!formData.is_sales_rep || !formData.full_name || generatingCode}
                    sx={{ height: 56 }}
                  >
                    {generatingCode ? <CircularProgress size={24} /> : "Generieren"}
                  </Button>
                </Box>
              </Grid>
            )}
            
            {formData.is_sales_rep && formData.sales_rep_code && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Mit dem Kürzel <strong>{formData.sales_rep_code}</strong> werden diesem Vertriebsberater Kunden und Provisionen zugeordnet.
                </Alert>
              </Grid>
            )}
            
            {/* Arbeitsschutz Informationen */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Arbeitsschutz & Zertifikate</Typography>
            </Grid>
            
            {/* Sachkundenachweis Pflanzenschutz */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.sachkundenachweis_pflanzenschutz}
                    onChange={handleChange}
                    name="sachkundenachweis_pflanzenschutz"
                  />
                }
                label="Sachkundenachweis Pflanzenschutz"
              />
            </Grid>
            
            {formData.sachkundenachweis_pflanzenschutz && (
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Gültig bis"
                  value={formData.sachkundenachweis_pflanzenschutz_gueltig_bis}
                  onChange={(newValue) => handleDateChange('sachkundenachweis_pflanzenschutz_gueltig_bis', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            )}
            
            {/* Gabelstapler-Schein */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.gabelstapler_schein}
                    onChange={handleChange}
                    name="gabelstapler_schein"
                  />
                }
                label="Flurförderfahrzeug-Schein (Gabelstapler)"
              />
            </Grid>
            
            {formData.gabelstapler_schein && (
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Gültig bis"
                  value={formData.gabelstapler_schein_gueltig_bis}
                  onChange={(newValue) => handleDateChange('gabelstapler_schein_gueltig_bis', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            )}
            
            {/* ADR-Schein */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.adr_schein}
                    onChange={handleChange}
                    name="adr_schein"
                  />
                }
                label="ADR-Schein (Gefahrgut)"
              />
            </Grid>
            
            {formData.adr_schein && (
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Gültig bis"
                  value={formData.adr_schein_gueltig_bis}
                  onChange={(newValue) => handleDateChange('adr_schein_gueltig_bis', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            )}
            
            {/* Berufskraftfahrer-Weiterbildung */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.berufskraftfahrer_weiterbildung}
                    onChange={handleChange}
                    name="berufskraftfahrer_weiterbildung"
                  />
                }
                label="Berufskraftfahrer-Weiterbildung"
              />
            </Grid>
            
            {formData.berufskraftfahrer_weiterbildung && (
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Gültig bis"
                  value={formData.berufskraftfahrer_weiterbildung_gueltig_bis}
                  onChange={(newValue) => handleDateChange('berufskraftfahrer_weiterbildung_gueltig_bis', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            )}
          </Grid>
        </Paper>
        
        {/* Benachrichtigungen */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
          >
            {notification.message}
          </Alert>
        </Snackbar>
        
        {/* Ladeanzeige */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        
        {/* Lösch-Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Mitarbeiter löschen</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Sind Sie sicher, dass Sie diesen Mitarbeiter löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Abbrechen</Button>
            <Button onClick={deleteEmployee} variant="contained" color="error">
              Löschen
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default EmployeeForm; 