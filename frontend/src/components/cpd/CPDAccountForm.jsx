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
  Tabs,
  Tab,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  CircularProgress,
  Backdrop,
  FormControlLabel,
  Switch
} from '@mui/material';

/**
 * CPD-Konto-Formular zum Erstellen und Bearbeiten
 * Basierend auf dem XML-Schema für CPD_Kreditor
 */
const CPDAccountForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Formular-Zustand
  const [formData, setFormData] = useState({
    // Allgemein
    accountNumber: 'CPD-12345',
    debitorAccount: '20001',
    searchTerm: 'CPD Muster',
    creationDate: new Date().toISOString().split('T')[0],
    
    // Rechnungsadresse
    name: 'CPD Mustergesellschaft mbH',
    name2: 'Büro Nord',
    industry: 'Dienstleistung',
    street: 'Hauptstraße 45',
    country: 'DE',
    postalCode: '23456',
    city: 'Beispielstadt',
    postBox: 'Postfach 456',
    phone1: '02345 / 67890',
    phone2: '02345 / 67891',
    fax: '02345 / 67892',
    salutation: 'Firma',
    letterSalutation: 'Sehr geehrte Damen und Herren',
    email: 'info@cpd-muster.de',
    website: 'www.cpd-muster.de',
    
    // Organisation
    branchOffice: 'Zentrale',
    costCenter: 'Verwaltung',
    invoiceType: 'Standard',
    collectiveInvoice: 'Monatlich',
    invoiceForm: 'Digital',
    salesRep: 'Schmidt',
    region: 'Ost',
    
    // Zahlungsbedingungen
    paymentTerm1Days: 14,
    discount1Percent: 2,
    paymentTerm2Days: 30,
    discount2Percent: 0,
    netDays: 30,
    
    // CPD Konto spezifisch
    customerNumber: 'C-54321',
    invoiceAddress: 'Hauptstraße 45, 23456 Beispielstadt',
    paymentTerms: '14 Tage 2% Skonto, 30 Tage netto',
    
    // Genossenschaftsanteile
    cooperativeShares: 10,
    sharesValue: 100.00,
    totalSharesValue: 1000.00,
    coopMemberNumber: 'GEN-5432',
    memberSince: '2010-05-01',
    memberStatus: 'active',
    cooperativeSharesNotes: 'Mitglied seit der Gründung der Genossenschaft. Hat zweimal Anteile aufgestockt.',
    
    // Menüstruktur (Navigation)
    menu_dashboard: true,
    menu_reports: true,
    menu_accounting: true,
    menu_orders: true,
    submenu_inventory: true,
    submenu_suppliers: false,
    submenu_customers: true,
    submenu_settings: true,
    
    // Status
    isActive: true
  });
  
  // Formular-Validierung
  const [errors, setErrors] = useState({});
  
  // Formulardaten laden bei Bearbeitung
  useEffect(() => {
    if (mode === 'edit' && id) {
      setLoading(true);
      
      // Simulieren einer API-Anfrage zur Datenabfrage
      setTimeout(() => {
        // Mock-Daten für die Entwicklung
        const mockData = {
          id: parseInt(id),
          accountNumber: `CPD-${10000 + parseInt(id)}`,
          debitorAccount: `${10000 + parseInt(id)}`,
          searchTerm: 'ABC',
          creationDate: '2023-01-15',
          name: `Testfirma ${id} GmbH`,
          name2: 'Zweigniederlassung',
          industry: 'Landwirtschaft',
          street: 'Hauptstraße 123',
          country: 'DE',
          postalCode: '48455',
          city: 'Bad Bentheim',
          postBox: '',
          phone1: '05922 12345',
          phone2: '',
          fax: '05922 12346',
          salutation: 'Firma',
          letterSalutation: 'Sehr geehrte Damen und Herren',
          email: 'info@testfirma.de',
          website: 'www.testfirma.de',
          branchOffice: 'Nord',
          costCenter: 'Vertrieb',
          invoiceType: 'Standard',
          collectiveInvoice: 'Monatlich',
          invoiceForm: 'Digital',
          salesRep: 'Müller',
          region: 'Niedersachsen',
          paymentTerm1Days: 14,
          discount1Percent: 2,
          paymentTerm2Days: 30,
          discount2Percent: 0,
          netDays: 30,
          isActive: true
        };
        
        setFormData(mockData);
        setLoading(false);
      }, 800);
      
      // Für die echte API später:
      /*
      fetch(`/api/v1/cpd-konten/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('CPD-Konto nicht gefunden');
          }
          return response.json();
        })
        .then(data => {
          setFormData(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Fehler beim Laden der CPD-Kontodaten:', error);
          setNotification({
            open: true,
            message: 'Fehler beim Laden der CPD-Kontodaten',
            severity: 'error'
          });
          setLoading(false);
        });
      */
    }
  }, [id, mode]);
  
  // Formular-Feld-Änderung
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Validierungsfehler löschen, wenn Feld geändert wird
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Tab-Wechsel
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Formular validieren
  const validateForm = () => {
    const newErrors = {};
    
    // Pflichtfelder prüfen
    if (!formData.accountNumber) {
      newErrors.accountNumber = 'Konto-Nr. ist erforderlich';
    }
    
    if (!formData.name) {
      newErrors.name = 'Name ist erforderlich';
    }
    
    // Zahlen validieren
    if (formData.paymentTerm1Days < 0) {
      newErrors.paymentTerm1Days = 'Muss größer oder gleich 0 sein';
    }
    
    if (formData.discount1Percent < 0 || formData.discount1Percent > 100) {
      newErrors.discount1Percent = 'Muss zwischen 0 und 100 liegen';
    }
    
    if (formData.paymentTerm2Days < 0) {
      newErrors.paymentTerm2Days = 'Muss größer oder gleich 0 sein';
    }
    
    if (formData.discount2Percent < 0 || formData.discount2Percent > 100) {
      newErrors.discount2Percent = 'Muss zwischen 0 und 100 liegen';
    }
    
    if (formData.netDays < 0) {
      newErrors.netDays = 'Muss größer oder gleich 0 sein';
    }
    
    // E-Mail validieren (einfache Prüfung)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Formular absenden
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Zur ersten Tab mit Fehler navigieren
      if (errors.accountNumber || errors.name) {
        setActiveTab(0);
      } else if (errors.email) {
        setActiveTab(1);
      } else if (errors.paymentTerm1Days || errors.discount1Percent || 
                 errors.paymentTerm2Days || errors.discount2Percent || 
                 errors.netDays) {
        setActiveTab(3);
      }
      
      setNotification({
        open: true,
        message: 'Bitte korrigieren Sie die markierten Felder',
        severity: 'error'
      });
      return;
    }
    
    setSubmitting(true);
    
    // Simuliere API-Aufruf mit Verzögerung
    setTimeout(() => {
      setSubmitting(false);
      setNotification({
        open: true,
        message: mode === 'edit' 
          ? 'CPD-Konto erfolgreich aktualisiert' 
          : 'CPD-Konto erfolgreich erstellt',
        severity: 'success'
      });
      
      // Zurück zur Liste nach erfolgreicher Erstellung/Aktualisierung
      setTimeout(() => {
        navigate('/cpd-konten');
      }, 1500);
    }, 1000);
    
    // Für die echte API später:
    /*
    const method = mode === 'edit' ? 'PUT' : 'POST';
    const url = mode === 'edit' 
      ? `/api/v1/cpd-konten/${id}` 
      : '/api/v1/cpd-konten';
    
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Fehler beim Speichern');
        }
        return response.json();
      })
      .then(data => {
        setSubmitting(false);
        setNotification({
          open: true,
          message: mode === 'edit' 
            ? 'CPD-Konto erfolgreich aktualisiert' 
            : 'CPD-Konto erfolgreich erstellt',
          severity: 'success'
        });
        
        // Zurück zur Liste nach erfolgreicher Erstellung/Aktualisierung
        setTimeout(() => {
          navigate('/cpd-konten');
        }, 1500);
      })
      .catch(error => {
        console.error('Fehler beim Speichern:', error);
        setSubmitting(false);
        setNotification({
          open: true,
          message: 'Fehler beim Speichern der CPD-Kontodaten',
          severity: 'error'
        });
      });
    */
  };
  
  // Abbrechen und zurück zur Liste
  const handleCancel = () => {
    navigate('/cpd-konten');
  };
  
  // Benachrichtigung schließen
  const handleNotificationClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };
  
  // Tab-Inhalte
  const renderGeneralTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="Konto-Nr."
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleChange}
          error={!!errors.accountNumber}
          helperText={errors.accountNumber}
          disabled={mode === 'edit'}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="Debitoren-Konto"
          name="debitorAccount"
          value={formData.debitorAccount}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Suchbegriff"
          name="searchTerm"
          value={formData.searchTerm}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Erstanlage"
          name="creationDate"
          type="date"
          value={formData.creationDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          disabled={mode === 'edit'}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            name="isActive"
            value={formData.isActive}
            onChange={handleChange}
            label="Status"
          >
            <MenuItem value={true}>Aktiv</MenuItem>
            <MenuItem value={false}>Inaktiv</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
  
  const renderAddressTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Name 2"
          name="name2"
          value={formData.name2}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Branche"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Straße"
          name="street"
          value={formData.street}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="Land"
          name="country"
          value={formData.country}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="PLZ"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="Ort"
          name="city"
          value={formData.city}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Postfach"
          name="postBox"
          value={formData.postBox}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Telefon 1"
          name="phone1"
          value={formData.phone1}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Telefon 2"
          name="phone2"
          value={formData.phone2}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Telefax"
          name="fax"
          value={formData.fax}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Anrede"
          name="salutation"
          value={formData.salutation}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Brief-Anrede"
          name="letterSalutation"
          value={formData.letterSalutation}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="E-Mail"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Internet-Homepage"
          name="website"
          value={formData.website}
          onChange={handleChange}
        />
      </Grid>
    </Grid>
  );
  
  const renderOrganizationTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Geschäftsstelle"
          name="branchOffice"
          value={formData.branchOffice}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Kostenstelle"
          name="costCenter"
          value={formData.costCenter}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Rechnungsart"
          name="invoiceType"
          value={formData.invoiceType}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Sammelrechnung"
          name="collectiveInvoice"
          value={formData.collectiveInvoice}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Rechnungsformular"
          name="invoiceForm"
          value={formData.invoiceForm}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="VB"
          name="salesRep"
          value={formData.salesRep}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Gebiet"
          name="region"
          value={formData.region}
          onChange={handleChange}
        />
      </Grid>
    </Grid>
  );
  
  const renderPaymentTermsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Zahlungsziel 1 (Tage)"
          name="paymentTerm1Days"
          type="number"
          value={formData.paymentTerm1Days}
          onChange={handleChange}
          error={!!errors.paymentTerm1Days}
          helperText={errors.paymentTerm1Days}
          InputProps={{
            endAdornment: <InputAdornment position="end">Tage</InputAdornment>,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Skonto 1"
          name="discount1Percent"
          type="number"
          value={formData.discount1Percent}
          onChange={handleChange}
          error={!!errors.discount1Percent}
          helperText={errors.discount1Percent}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Zahlungsziel 2 (Tage)"
          name="paymentTerm2Days"
          type="number"
          value={formData.paymentTerm2Days}
          onChange={handleChange}
          error={!!errors.paymentTerm2Days}
          helperText={errors.paymentTerm2Days}
          InputProps={{
            endAdornment: <InputAdornment position="end">Tage</InputAdornment>,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Skonto 2"
          name="discount2Percent"
          type="number"
          value={formData.discount2Percent}
          onChange={handleChange}
          error={!!errors.discount2Percent}
          helperText={errors.discount2Percent}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Netto-Zahlungsziel (Tage)"
          name="netDays"
          type="number"
          value={formData.netDays}
          onChange={handleChange}
          error={!!errors.netDays}
          helperText={errors.netDays}
          InputProps={{
            endAdornment: <InputAdornment position="end">Tage</InputAdornment>,
          }}
        />
      </Grid>
    </Grid>
  );
  
  // CPD Konto Tab
  const renderCPDAccountTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom fontWeight="500">
          CPD Konto Informationen
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Kundennummer"
          name="customerNumber"
          value={formData.customerNumber}
          onChange={handleChange}
          error={!!errors.customerNumber}
          helperText={errors.customerNumber}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Debitoren-Konto"
          name="debitorAccount"
          value={formData.debitorAccount}
          onChange={handleChange}
          error={!!errors.debitorAccount}
          helperText={errors.debitorAccount}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Suchbegriff"
          name="searchTerm"
          value={formData.searchTerm}
          onChange={handleChange}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Rechnungsadresse"
          name="invoiceAddress"
          value={formData.invoiceAddress}
          onChange={handleChange}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Geschäftsstelle"
          name="branchOffice"
          value={formData.branchOffice}
          onChange={handleChange}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Kostenstelle"
          name="costCenter"
          value={formData.costCenter}
          onChange={handleChange}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Rechnungsart"
          name="invoiceType"
          value={formData.invoiceType}
          onChange={handleChange}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Sammelrechnung</InputLabel>
          <Select
            name="collectiveInvoice"
            value={formData.collectiveInvoice}
            onChange={handleChange}
            label="Sammelrechnung"
          >
            <MenuItem value={true}>Ja</MenuItem>
            <MenuItem value={false}>Nein</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Rechnungsformular"
          name="invoiceForm"
          value={formData.invoiceForm}
          onChange={handleChange}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Vertriebsbeauftragter (VB)"
          name="salesRep"
          value={formData.salesRep}
          onChange={handleChange}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Gebiet"
          name="region"
          value={formData.region}
          onChange={handleChange}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Zahlungsbedingungen"
          name="paymentTerms"
          value={formData.paymentTerms}
          onChange={handleChange}
        />
      </Grid>
    </Grid>
  );
  
  // Menüstruktur (Navigation) Tab
  const renderMenuStructureTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom fontWeight="500">
          Menüstruktur (Navigation)
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Hier können Sie festlegen, welche Menüpunkte für dieses CPD-Konto in der Navigation sichtbar sein sollen.
        </Alert>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl component="fieldset">
          <Typography variant="subtitle2" gutterBottom>
            Hauptmenü
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="menu_dashboard"
                    checked={formData.menu_dashboard}
                    disabled
                  />
                }
                label="Dashboard"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="menu_reports"
                    checked={formData.menu_reports}
                  />
                }
                label="Berichte"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="menu_accounting"
                    checked={formData.menu_accounting}
                  />
                }
                label="Buchhaltung"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="menu_orders"
                    checked={formData.menu_orders}
                  />
                }
                label="Aufträge"
              />
            </Grid>
          </Grid>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl component="fieldset">
          <Typography variant="subtitle2" gutterBottom>
            Untermenüs
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="submenu_inventory"
                    checked={formData.submenu_inventory}
                  />
                }
                label="Bestandsverwaltung"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="submenu_suppliers"
                    checked={formData.submenu_suppliers}
                  />
                }
                label="Lieferanten"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="submenu_customers"
                    checked={formData.submenu_customers}
                  />
                }
                label="Kunden"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="submenu_settings"
                    checked={formData.submenu_settings}
                  />
                }
                label="Einstellungen"
              />
            </Grid>
          </Grid>
        </FormControl>
      </Grid>
    </Grid>
  );
  
  // Genossenschaftsanteile Tab
  const renderCooperativeSharesTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom fontWeight="500">
          Genossenschaftsanteile
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Anzahl Genossenschaftsanteile"
          name="cooperativeShares"
          type="number"
          value={formData.cooperativeShares}
          onChange={handleChange}
          InputProps={{
            inputProps: { min: 0 }
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Wert pro Anteil"
          name="sharesValue"
          type="number"
          value={formData.sharesValue}
          onChange={handleChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
            inputProps: { min: 0, step: 0.01 }
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Gesamtwert der Anteile"
          name="totalSharesValue"
          type="number"
          value={formData.cooperativeShares * formData.sharesValue}
          disabled
          InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Mitgliedsnummer"
          name="coopMemberNumber"
          value={formData.coopMemberNumber}
          onChange={handleChange}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Mitglied seit"
          name="memberSince"
          type="date"
          value={formData.memberSince}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel>Mitgliedsstatus</InputLabel>
          <Select
            name="memberStatus"
            value={formData.memberStatus}
            onChange={handleChange}
            label="Mitgliedsstatus"
          >
            <MenuItem value="active">Aktiv</MenuItem>
            <MenuItem value="passive">Passiv</MenuItem>
            <MenuItem value="terminated">Gekündigt</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Weitere Informationen
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Bemerkungen zu Genossenschaftsanteilen"
          name="cooperativeSharesNotes"
          multiline
          rows={3}
          value={formData.cooperativeSharesNotes}
          onChange={handleChange}
        />
      </Grid>
    </Grid>
  );
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            {mode === 'edit' ? 'CPD-Konto bearbeiten' : 'Neues CPD-Konto anlegen'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCancel}
            >
              Abbrechen
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              Speichern
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Allgemein" />
            <Tab label="Adresse" />
            <Tab label="Organisation" />
            <Tab label="Zahlungsbedingungen" />
            <Tab label="CPD Konto" />
            <Tab label="Genossenschaftsanteile" />
            <Tab label="Menüstruktur (Navigation)" />
          </Tabs>
        </Box>
        
        <form onSubmit={handleSubmit} noValidate>
          <Box role="tabpanel" hidden={activeTab !== 0}>
            {activeTab === 0 && renderGeneralTab()}
          </Box>
          
          <Box role="tabpanel" hidden={activeTab !== 1}>
            {activeTab === 1 && renderAddressTab()}
          </Box>
          
          <Box role="tabpanel" hidden={activeTab !== 2}>
            {activeTab === 2 && renderOrganizationTab()}
          </Box>
          
          <Box role="tabpanel" hidden={activeTab !== 3}>
            {activeTab === 3 && renderPaymentTermsTab()}
          </Box>
          
          <Box role="tabpanel" hidden={activeTab !== 4}>
            {activeTab === 4 && renderCPDAccountTab()}
          </Box>
          
          <Box role="tabpanel" hidden={activeTab !== 5}>
            {activeTab === 5 && renderCooperativeSharesTab()}
          </Box>
          
          <Box role="tabpanel" hidden={activeTab !== 6}>
            {activeTab === 6 && renderMenuStructureTab()}
          </Box>
        </form>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button 
            onClick={handleCancel} 
            sx={{ mr: 1 }}
          >
            Abbrechen
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </Box>
      </Paper>
      
      {/* Benachrichtigungen */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      {/* Ladeindikator */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading || submitting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default CPDAccountForm; 