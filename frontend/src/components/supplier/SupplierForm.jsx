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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Backdrop,
  FormControlLabel,
  Switch,
  InputAdornment
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import ContactsIcon from '@mui/icons-material/Contacts';
import HomeIcon from '@mui/icons-material/Home';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EuroIcon from '@mui/icons-material/Euro';
import VerifiedIcon from '@mui/icons-material/Verified';
import ReceiptIcon from '@mui/icons-material/Receipt';
import StorageIcon from '@mui/icons-material/Storage';
import ContactList from '../customer/ContactList';
import AddressList from '../customer/AddressList';

/**
 * Lieferantenstammdaten Formular 
 * Basierend auf dem Lieferanten-JSON-Schema mit allen relevanten Feldern
 */
const SupplierForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [duplicateDialog, setDuplicateDialog] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  
  // Formulardaten
  const [formData, setFormData] = useState({
    // Allgemein
    supplier_number: '',
    creditor_account: '',
    search_term: '',
    creation_date: new Date().toISOString().split('T')[0],
    
    // Firmenadresse
    name: '',
    name2: '',
    industry: '',
    street: '',
    country: 'DE',
    postal_code: '',
    city: '',
    post_box: '',
    
    // Kommunikation
    phone: '',
    email: '',
    website: '',
    salutation: '',
    letter_salutation: 'Sehr geehrte Damen und Herren',
    
    // Zertifizierungen
    certification_required: false,
    certification_authority: '',
    registration_number: '',
    min_order_value: 0,
    
    // THG-Bescheinigungen
    thg_certificates: [],
    article_thg_values: [],
    
    // Zahlungsbedingungen
    payment_term: '',
    discount_days: 0,
    discount_percent: 0,
    net_days: 28,
    
    // Lieferantenprofil
    founding_date: '',
    annual_revenue: 0,
    professional_association: '',
    
    // Schnittstellen
    edi_invoic: '',
    edi_orders: '',
    edi_desadv: '',
    
    // Genossenschaft
    cooperative_member_number: '',
    cooperative_shares: 0,
    cooperative_entry_date: '',
    
    // Datenschutz
    data_protection_consents: [],
    
    // E-Mail-Verteiler
    email_distribution_lists: [],
    
    // Betriebsgemeinschaften
    business_communities: [],
    
    // Artikelbedarf
    article_demands: [],
    
    // Transportklassen
    transport_classes: [],
    
    // Preise und Rabatte
    prices: [],
    discounts: [],
    agreed_prices: [],
    
    // Bankverbindung
    iban: '',
    bic: '',
    currency: 'EUR',
    
    // Chef-Anweisung
    management_instruction: '',
    
    // Ansprechpartner und Adressen
    contacts: [],
    addresses: [],
    
    // Versandinformationen
    invoice_shipping_method: 'post',
    contact_shipping_method: 'email',
    
    // Folkerts ERP spezifisch
    is_active: true,
    is_grain_supplier: false,
    
    // Einlagerungsinformationen für Landwirte
    is_storage_account: false,
    storage_account_info: ''
  });
  
  // Optionen für Dropdown-Felder
  const industryOptions = [
    'Landwirtschaft',
    'Gartenbau',
    'Handwerk',
    'Dienstleistung',
    'Handel',
    'Industrie',
    'Transport & Logistik',
    'Lebensmittel',
    'Futtermittel',
    'Saatgut'
  ];
  
  const paymentTermOptions = ['Standard', 'Express', 'Nachnahme', 'Vorkasse'];
  const shippingMethodOptions = ['E-Mail', 'Post', 'Fax', 'EDI'];
  const currencyOptions = ['EUR', 'USD', 'GBP', 'CHF'];
  
  // Effekt zum Laden der Daten bei Bearbeitung
  useEffect(() => {
    // Wenn im Bearbeitungsmodus, Lieferantendaten laden
    if (mode === 'edit' && id) {
      setLoading(true);
      // API-Aufruf um Lieferantendaten zu laden
      fetch(`/api/v1/lieferantenstamm/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Lieferant nicht gefunden');
          }
          return response.json();
        })
        .then(data => {
          setFormData(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Fehler beim Laden der Lieferantendaten:', error);
          setNotification({
            open: true,
            message: 'Fehler beim Laden der Lieferantendaten',
            severity: 'error'
          });
          setLoading(false);
          // Nach kurzer Verzögerung zurück zur Lieferantenliste
          setTimeout(() => navigate('/lieferanten'), 2000);
        });
    }
  }, [id, mode, navigate]);
  
  // Handler für Änderungen in den Formularfeldern
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Prüfung auf Dubletten
  const checkDuplicates = () => {
    // API-Aufruf zur Dublettenprüfung
    fetch('/api/v1/lieferantenstamm/check-duplicates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        postal_code: formData.postal_code,
        city: formData.city
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.has_duplicates) {
          setDuplicates(data.duplicates);
          setDuplicateDialog(true);
        } else {
          saveSupplier();
        }
      })
      .catch(error => {
        console.error('Fehler bei der Dublettenprüfung:', error);
        // Bei Fehler trotzdem speichern
        saveSupplier();
      });
  };
  
  // Speichern des Lieferanten
  const saveSupplier = () => {
    setLoading(true);
    const url = mode === 'edit' ? `/api/v1/lieferantenstamm/${id}` : '/api/v1/lieferantenstamm';
    const method = mode === 'edit' ? 'PUT' : 'POST';
    
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.error || 'Fehler beim Speichern');
          });
        }
        return response.json();
      })
      .then(data => {
        setNotification({
          open: true,
          message: `Lieferant erfolgreich ${mode === 'edit' ? 'aktualisiert' : 'erstellt'}`,
          severity: 'success'
        });
        setLoading(false);
        setTimeout(() => navigate('/lieferanten'), 2000);
      })
      .catch(error => {
        console.error('Fehler beim Speichern:', error);
        setNotification({
          open: true,
          message: error.message || `Fehler beim ${mode === 'edit' ? 'Aktualisieren' : 'Erstellen'} des Lieferanten`,
          severity: 'error'
        });
        setLoading(false);
      });
  };
  
  // Löschen des Lieferanten
  const deleteSupplier = () => {
    setLoading(true);
    fetch(`/api/v1/lieferantenstamm/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.error || 'Fehler beim Löschen');
          });
        }
        return response.json();
      })
      .then(data => {
        setNotification({
          open: true,
          message: 'Lieferant erfolgreich gelöscht',
          severity: 'success'
        });
        setLoading(false);
        setTimeout(() => navigate('/lieferanten'), 2000);
      })
      .catch(error => {
        console.error('Fehler beim Löschen:', error);
        setNotification({
          open: true,
          message: error.message || 'Fehler beim Löschen des Lieferanten',
          severity: 'error'
        });
        setLoading(false);
      });
  };
  
  // Tabs wechseln
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handler für Kontaktlisten-Änderungen
  const handleContactsChange = (contacts) => {
    setFormData({
      ...formData,
      contacts
    });
  };
  
  // Handler für Adresslisten-Änderungen
  const handleAddressesChange = (addresses) => {
    setFormData({
      ...formData,
      addresses
    });
  };
  
  // Notification schließen
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Formular-Validierung
  const isFormValid = () => {
    return formData.supplier_number && formData.creditor_account && formData.name;
  };

  // Stammdaten-Tab
  const renderStammdatenTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Allgemeine Informationen</Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          required
          fullWidth
          label="Lieferantennummer"
          name="supplier_number"
          value={formData.supplier_number}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          required
          fullWidth
          label="Kreditorenkonto"
          name="creditor_account"
          value={formData.creditor_account}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="Suchbegriff"
          name="search_term"
          value={formData.search_term}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="Erstelldatum"
          name="creation_date"
          type="date"
          value={formData.creation_date}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={8}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.is_active}
              onChange={handleChange}
              name="is_active"
              color="primary"
            />
          }
          label="Lieferant aktiv"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={formData.is_grain_supplier}
              onChange={handleChange}
              name="is_grain_supplier"
              color="primary"
            />
          }
          label="Getreidelieferant"
        />
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Firmenadresse</Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Namenszusatz"
          name="name2"
          value={formData.name2}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel id="industry-label">Branche</InputLabel>
          <Select
            labelId="industry-label"
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            label="Branche"
          >
            <MenuItem value=""><em>Keine Auswahl</em></MenuItem>
            {industryOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Straße"
          name="street"
          value={formData.street}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="PLZ"
          name="postal_code"
          value={formData.postal_code}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="Ort"
          name="city"
          value={formData.city}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="Land"
          name="country"
          value={formData.country}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Postfach"
          name="post_box"
          value={formData.post_box}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Kommunikation</Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="Telefon"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="E-Mail"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="Website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Anrede"
          name="salutation"
          value={formData.salutation}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Briefanrede"
          name="letter_salutation"
          value={formData.letter_salutation}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
    </Grid>
  );
  
  // Adressen-Tab
  const renderAdressenTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Lieferadressen</Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12}>
        <AddressList 
          addresses={formData.addresses} 
          onChange={handleAddressesChange} 
          editable={true}
        />
      </Grid>
    </Grid>
  );
  
  // Zertifizierungen-Tab
  const renderZertifizierungenTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Zertifizierungsinformationen</Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.certification_required}
              onChange={handleChange}
              name="certification_required"
              color="primary"
            />
          }
          label="Zertifizierung erforderlich"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Zertifizierungsstelle"
          name="certification_authority"
          value={formData.certification_authority}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          disabled={!formData.certification_required}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Registriernummer"
          name="registration_number"
          value={formData.registration_number}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          disabled={!formData.certification_required}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Mindestbestellwert (EUR)"
          name="min_order_value"
          type="number"
          value={formData.min_order_value}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
          }}
        />
      </Grid>
    </Grid>
  );
  
  // Zahlungsbedingungen-Tab
  const renderZahlungsbedingungenTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Zahlungsbedingungen</Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel id="payment-term-label">Zahlungsbedingung</InputLabel>
          <Select
            labelId="payment-term-label"
            id="payment_term"
            name="payment_term"
            value={formData.payment_term}
            onChange={handleChange}
            label="Zahlungsbedingung"
          >
            <MenuItem value=""><em>Keine Auswahl</em></MenuItem>
            {paymentTermOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Zahlungsziel (Netto in Tagen)"
          name="net_days"
          type="number"
          value={formData.net_days}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Skonto</Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Skontotage"
          name="discount_days"
          type="number"
          value={formData.discount_days}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Skontoprozent"
          name="discount_percent"
          type="number"
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
          value={formData.discount_percent}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
    </Grid>
  );
  
  // THG-Bescheinigung-Tab
  const renderTHGBescheinigungTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>THG-Bescheinigungen</Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info" sx={{ mb: 2 }}>
          Hier können THG-Bescheinigungen (Treibhausgas) für den Lieferanten erfasst werden.
        </Alert>
      </Grid>
      
      <Grid item xs={12}>
        {formData.thg_certificates.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Keine THG-Bescheinigungen vorhanden
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            {formData.thg_certificates.map((cert, index) => (
              <Paper key={index} sx={{ p: 2, mb: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={10}>
                    <Typography variant="subtitle2">{cert.certificate_number}</Typography>
                    <Typography variant="body2">Gültig bis: {cert.valid_until}</Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      color="error" 
                      onClick={() => {
                        const updatedCerts = [...formData.thg_certificates];
                        updatedCerts.splice(index, 1);
                        setFormData({
                          ...formData,
                          thg_certificates: updatedCerts
                        });
                      }}
                    >
                      Entfernen
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
        
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => {
            setFormData({
              ...formData,
              thg_certificates: [
                ...formData.thg_certificates,
                { certificate_number: '', valid_until: '', notes: '' }
              ]
            });
          }}
        >
          THG-Bescheinigung hinzufügen
        </Button>
      </Grid>
      
      <Grid item xs={12} sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>THG-Werte für Artikel</Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info" sx={{ mb: 2 }}>
          Hier können artikelbezogene THG-Werte erfasst werden.
        </Alert>
      </Grid>
      
      <Grid item xs={12}>
        {/* Ähnliche Implementierung für article_thg_values */}
      </Grid>
    </Grid>
  );
  
  // Einlagerung-Tab
  const renderEinlagerungTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Einlagerungsinformationen für Landwirte</Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info" sx={{ mb: 3 }}>
          Diese Einstellungen sind relevant, wenn der Lieferant auch gleichzeitig Kunde ist 
          und Einlagerungen z.B. als Landwirt vornimmt (§ 15 Abs. 1 Nr. 1 UStG).
        </Alert>
      </Grid>
      
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.is_storage_account}
              onChange={handleChange}
              name="is_storage_account"
              color="primary"
            />
          }
          label="Einlagerungskonto (Lieferant ist auch Kunde)"
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Einlagerungsinformationen"
          name="storage_account_info"
          value={formData.storage_account_info}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          multiline
          rows={4}
          disabled={!formData.is_storage_account}
        />
      </Grid>
      
      {formData.is_storage_account && (
        <Grid item xs={12}>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Steuerliche Hinweise</Typography>
            <Typography variant="body2">
              Bei Einlagerungen von Landwirten sind besondere steuerliche Anforderungen gemäß § 15 Abs. 1 Nr. 1 UStG 
              zu beachten. Stellen Sie sicher, dass die entsprechenden Kundenkonten korrekt konfiguriert sind.
            </Typography>
          </Alert>
        </Grid>
      )}
    </Grid>
  );
  
  // Ansprechpartner-Tab
  const renderAnsprechpartnerTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Ansprechpartner</Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12}>
        <ContactList 
          contacts={formData.contacts} 
          onChange={handleContactsChange} 
          editable={true}
        />
      </Grid>
    </Grid>
  );
  
  // Bankverbindung-Tab
  const renderBankverbindungTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Bankverbindung</Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="IBAN"
          name="iban"
          value={formData.iban}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="BIC"
          name="bic"
          value={formData.bic}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel id="currency-label">Währung</InputLabel>
          <Select
            labelId="currency-label"
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            label="Währung"
          >
            {currencyOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
  
  // Chef-Anweisung-Tab
  const renderChefAnweisungTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Chef-Anweisung</Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info" sx={{ mb: 3 }}>
          Hier können interne Anweisungen zum Umgang mit diesem Lieferanten hinterlegt werden.
        </Alert>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Chef-Anweisung"
          name="management_instruction"
          value={formData.management_instruction}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          multiline
          rows={6}
        />
      </Grid>
    </Grid>
  );
  
  // Versandinformationen-Tab
  const renderVersandinformationenTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Versandinformationen</Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel id="invoice-shipping-method-label">Rechnungsversand</InputLabel>
          <Select
            labelId="invoice-shipping-method-label"
            id="invoice_shipping_method"
            name="invoice_shipping_method"
            value={formData.invoice_shipping_method}
            onChange={handleChange}
            label="Rechnungsversand"
          >
            {shippingMethodOptions.map((option) => (
              <MenuItem key={option.toLowerCase()} value={option.toLowerCase()}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel id="contact-shipping-method-label">Kontaktversand</InputLabel>
          <Select
            labelId="contact-shipping-method-label"
            id="contact_shipping_method"
            name="contact_shipping_method"
            value={formData.contact_shipping_method}
            onChange={handleChange}
            label="Kontaktversand"
          >
            {shippingMethodOptions.map((option) => (
              <MenuItem key={option.toLowerCase()} value={option.toLowerCase()}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
  
  // Datenschutz-Tab
  const renderDatenschutzTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Datenschutz-Einwilligungen</Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info" sx={{ mb: 3 }}>
          Hier können Einwilligungen zur Datenverarbeitung und zum Datenschutz erfasst werden.
        </Alert>
      </Grid>
      
      <Grid item xs={12}>
        {formData.data_protection_consents.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Keine Datenschutz-Einwilligungen vorhanden
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            {formData.data_protection_consents.map((consent, index) => (
              <Paper key={index} sx={{ p: 2, mb: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={10}>
                    <Typography variant="subtitle2">{consent.type}</Typography>
                    <Typography variant="body2">Erteilt am: {consent.date}</Typography>
                    <Typography variant="body2">Medium: {consent.medium}</Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      color="error" 
                      onClick={() => {
                        const updatedConsents = [...formData.data_protection_consents];
                        updatedConsents.splice(index, 1);
                        setFormData({
                          ...formData,
                          data_protection_consents: updatedConsents
                        });
                      }}
                    >
                      Entfernen
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
        
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => {
            setFormData({
              ...formData,
              data_protection_consents: [
                ...formData.data_protection_consents,
                { type: '', date: new Date().toISOString().split('T')[0], medium: 'Schriftlich' }
              ]
            });
          }}
        >
          Einwilligung hinzufügen
        </Button>
      </Grid>
    </Grid>
  );
  
  // Genossenschaft-Tab
  const renderGenossenschaftTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Genossenschaftsinformationen</Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Mitgliedsnummer"
          name="cooperative_member_number"
          value={formData.cooperative_member_number}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Anteile"
          name="cooperative_shares"
          type="number"
          value={formData.cooperative_shares}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Eintrittsdatum"
          name="cooperative_entry_date"
          type="date"
          value={formData.cooperative_entry_date}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    </Grid>
  );
  
  // Schnittstellen-Tab
  const renderSchnittstellenTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>EDI-Schnittstellen</Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="INVOIC-Typ"
          name="edi_invoic"
          value={formData.edi_invoic}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          helperText="Format für elektronische Rechnungen"
        />
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="ORDERS-Typ"
          name="edi_orders"
          value={formData.edi_orders}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          helperText="Format für elektronische Bestellungen"
        />
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="DESADV-Typ"
          name="edi_desadv"
          value={formData.edi_desadv}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          helperText="Format für elektronische Lieferavise"
        />
      </Grid>
    </Grid>
  );
  
  // Lieferantenprofil-Tab
  const renderLieferantenprofilTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Lieferantenprofil</Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Gründungsdatum"
          name="founding_date"
          type="date"
          value={formData.founding_date}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Jahresumsatz"
          name="annual_revenue"
          type="number"
          value={formData.annual_revenue}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Berufsgenossenschaft"
          name="professional_association"
          value={formData.professional_association}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
      </Grid>
    </Grid>
  );
  
  // Preise/Rabatte-Tab
  const renderPreiseRabatteTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Preise</Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info" sx={{ mb: 3 }}>
          Hier können allgemeine Preisregelungen für den Lieferanten erfasst werden.
        </Alert>
      </Grid>
      
      <Grid item xs={12}>
        {formData.prices.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Keine Preisregelungen vorhanden
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            {formData.prices.map((price, index) => (
              <Paper key={index} sx={{ p: 2, mb: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={10}>
                    <Typography variant="subtitle2">{price.description}</Typography>
                    <Typography variant="body2">Gültig ab: {price.valid_from}</Typography>
                    <Typography variant="body2">Wert: {price.value}{price.is_percentage ? '%' : ' €'}</Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      color="error" 
                      onClick={() => {
                        const updatedPrices = [...formData.prices];
                        updatedPrices.splice(index, 1);
                        setFormData({
                          ...formData,
                          prices: updatedPrices
                        });
                      }}
                    >
                      Entfernen
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
        
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => {
            setFormData({
              ...formData,
              prices: [
                ...formData.prices,
                { 
                  description: '', 
                  valid_from: new Date().toISOString().split('T')[0], 
                  value: 0,
                  is_percentage: false
                }
              ]
            });
          }}
        >
          Preisregelung hinzufügen
        </Button>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>Rabatte</Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info" sx={{ mb: 3 }}>
          Hier können Rabattregelungen für den Lieferanten erfasst werden.
        </Alert>
      </Grid>
      
      <Grid item xs={12}>
        {formData.discounts.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Keine Rabattregelungen vorhanden
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            {formData.discounts.map((discount, index) => (
              <Paper key={index} sx={{ p: 2, mb: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={10}>
                    <Typography variant="subtitle2">{discount.description}</Typography>
                    <Typography variant="body2">Gültig ab: {discount.valid_from}</Typography>
                    <Typography variant="body2">Wert: {discount.value}%</Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      color="error" 
                      onClick={() => {
                        const updatedDiscounts = [...formData.discounts];
                        updatedDiscounts.splice(index, 1);
                        setFormData({
                          ...formData,
                          discounts: updatedDiscounts
                        });
                      }}
                    >
                      Entfernen
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
        
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => {
            setFormData({
              ...formData,
              discounts: [
                ...formData.discounts,
                { 
                  description: '', 
                  valid_from: new Date().toISOString().split('T')[0], 
                  value: 0
                }
              ]
            });
          }}
        >
          Rabattregelung hinzufügen
        </Button>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>Vereinbarte Preise</Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info" sx={{ mb: 3 }}>
          Hier können artikelspezifische vereinbarte Preise erfasst werden.
        </Alert>
      </Grid>
      
      <Grid item xs={12}>
        {formData.agreed_prices.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Keine vereinbarten Preise vorhanden
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            {formData.agreed_prices.map((agreedPrice, index) => (
              <Paper key={index} sx={{ p: 2, mb: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={10}>
                    <Typography variant="subtitle2">Artikel: {agreedPrice.article_number} - {agreedPrice.article_name}</Typography>
                    <Typography variant="body2">Gültig ab: {agreedPrice.valid_from}</Typography>
                    <Typography variant="body2">Preis: {agreedPrice.price} € / {agreedPrice.unit}</Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      color="error" 
                      onClick={() => {
                        const updatedAgreedPrices = [...formData.agreed_prices];
                        updatedAgreedPrices.splice(index, 1);
                        setFormData({
                          ...formData,
                          agreed_prices: updatedAgreedPrices
                        });
                      }}
                    >
                      Entfernen
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
        
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => {
            setFormData({
              ...formData,
              agreed_prices: [
                ...formData.agreed_prices,
                { 
                  article_number: '', 
                  article_name: '',
                  valid_from: new Date().toISOString().split('T')[0], 
                  price: 0,
                  unit: 'Stk'
                }
              ]
            });
          }}
        >
          Vereinbarten Preis hinzufügen
        </Button>
      </Grid>
    </Grid>
  );
  
  // Artikelbedarf-Tab
  const renderArtikelbedarfTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Artikelbedarf</Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info" sx={{ mb: 3 }}>
          Hier können Informationen zum Artikelbedarf für diesen Lieferanten erfasst werden.
        </Alert>
      </Grid>
      
      <Grid item xs={12}>
        {formData.article_demands.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Kein Artikelbedarf vorhanden
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            {formData.article_demands.map((demand, index) => (
              <Paper key={index} sx={{ p: 2, mb: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={10}>
                    <Typography variant="subtitle2">Artikel: {demand.article_number} - {demand.article_name}</Typography>
                    <Typography variant="body2">Menge: {demand.quantity} {demand.unit}</Typography>
                    <Typography variant="body2">Intervall: {demand.interval}</Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      color="error" 
                      onClick={() => {
                        const updatedDemands = [...formData.article_demands];
                        updatedDemands.splice(index, 1);
                        setFormData({
                          ...formData,
                          article_demands: updatedDemands
                        });
                      }}
                    >
                      Entfernen
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
        
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => {
            setFormData({
              ...formData,
              article_demands: [
                ...formData.article_demands,
                { 
                  article_number: '', 
                  article_name: '',
                  quantity: 0,
                  unit: 'Stk',
                  interval: 'Monatlich'
                }
              ]
            });
          }}
        >
          Artikelbedarf hinzufügen
        </Button>
      </Grid>
    </Grid>
  );
  
  // Transportklassen-Tab
  const renderTransportklassenTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Transportklassen</Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info" sx={{ mb: 3 }}>
          Hier können Transportklassen für diesen Lieferanten definiert werden.
        </Alert>
      </Grid>
      
      <Grid item xs={12}>
        {formData.transport_classes.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Keine Transportklassen vorhanden
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            {formData.transport_classes.map((transportClass, index) => (
              <Paper key={index} sx={{ p: 2, mb: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={10}>
                    <Typography variant="subtitle2">{transportClass.name}</Typography>
                    <Typography variant="body2">Beschreibung: {transportClass.description}</Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      color="error" 
                      onClick={() => {
                        const updatedClasses = [...formData.transport_classes];
                        updatedClasses.splice(index, 1);
                        setFormData({
                          ...formData,
                          transport_classes: updatedClasses
                        });
                      }}
                    >
                      Entfernen
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
        
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => {
            setFormData({
              ...formData,
              transport_classes: [
                ...formData.transport_classes,
                { name: '', description: '' }
              ]
            });
          }}
        >
          Transportklasse hinzufügen
        </Button>
      </Grid>
    </Grid>
  );
  
  // E-Mail-Verteiler-Tab
  const renderEmailVerteilerTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>E-Mail-Verteiler</Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info" sx={{ mb: 3 }}>
          Hier können E-Mail-Verteilerlisten für diesen Lieferanten definiert werden.
        </Alert>
      </Grid>
      
      <Grid item xs={12}>
        {formData.email_distribution_lists.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Keine E-Mail-Verteiler vorhanden
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            {formData.email_distribution_lists.map((list, index) => (
              <Paper key={index} sx={{ p: 2, mb: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={10}>
                    <Typography variant="subtitle2">{list.name}</Typography>
                    <Typography variant="body2">E-Mails: {list.emails.join(', ')}</Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      color="error" 
                      onClick={() => {
                        const updatedLists = [...formData.email_distribution_lists];
                        updatedLists.splice(index, 1);
                        setFormData({
                          ...formData,
                          email_distribution_lists: updatedLists
                        });
                      }}
                    >
                      Entfernen
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
        
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => {
            setFormData({
              ...formData,
              email_distribution_lists: [
                ...formData.email_distribution_lists,
                { name: '', emails: [] }
              ]
            });
          }}
        >
          E-Mail-Verteiler hinzufügen
        </Button>
      </Grid>
    </Grid>
  );
  
  // Betriebsgemeinschaften-Tab
  const renderBetriebsgemeinschaftenTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Betriebsgemeinschaften</Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info" sx={{ mb: 3 }}>
          Hier können Betriebsgemeinschaften erfasst werden, denen dieser Lieferant angehört.
        </Alert>
      </Grid>
      
      <Grid item xs={12}>
        {formData.business_communities.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Keine Betriebsgemeinschaften vorhanden
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            {formData.business_communities.map((community, index) => (
              <Paper key={index} sx={{ p: 2, mb: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={10}>
                    <Typography variant="subtitle2">{community.name}</Typography>
                    <Typography variant="body2">Mitgliedsnummer: {community.member_number}</Typography>
                    <Typography variant="body2">Beitrittsdatum: {community.join_date}</Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      color="error" 
                      onClick={() => {
                        const updatedCommunities = [...formData.business_communities];
                        updatedCommunities.splice(index, 1);
                        setFormData({
                          ...formData,
                          business_communities: updatedCommunities
                        });
                      }}
                    >
                      Entfernen
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
        
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => {
            setFormData({
              ...formData,
              business_communities: [
                ...formData.business_communities,
                { 
                  name: '', 
                  member_number: '',
                  join_date: new Date().toISOString().split('T')[0]
                }
              ]
            });
          }}
        >
          Betriebsgemeinschaft hinzufügen
        </Button>
      </Grid>
    </Grid>
  );
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            {mode === 'edit' ? 'Lieferant bearbeiten' : 'Neuen Lieferanten anlegen'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/lieferanten')}
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
              onClick={checkDuplicates}
              disabled={!isFormValid()}
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
            <Tab icon={<ContactsIcon />} label="Stammdaten" />
            <Tab icon={<HomeIcon />} label="Adressen" />
            <Tab icon={<VerifiedIcon />} label="Zertifizierungen" />
            <Tab icon={<EuroIcon />} label="Zahlungsbed." />
            <Tab icon={<ReceiptIcon />} label="THG-Bescheinigung" />
            <Tab label="Preise/Rabatte" />
            <Tab label="Artikelbedarf" />
            <Tab label="Transportklassen" />
            <Tab label="Datenschutz" />
            <Tab label="Schnittstellen" />
            <Tab label="Ansprechpartner" />
            <Tab label="Genossenschaft" />
            <Tab label="E-Mail-Verteiler" />
            <Tab label="Betriebsgemeinschaften" />
            <Tab label="Lieferantenprofil" />
            <Tab label="Bankverbindung" />
            <Tab label="Versandinformationen" />
            <Tab label="Einlagerung" />
            <Tab label="Chef-Anweisung" />
          </Tabs>
        </Box>
        
        <Box sx={{ p: 1 }}>
          {activeTab === 0 && renderStammdatenTab()}
          {activeTab === 1 && renderAdressenTab()}
          {activeTab === 2 && renderZertifizierungenTab()}
          {activeTab === 3 && renderZahlungsbedingungenTab()}
          {activeTab === 4 && renderTHGBescheinigungTab()}
          {activeTab === 5 && renderPreiseRabatteTab()}
          {activeTab === 6 && renderArtikelbedarfTab()}
          {activeTab === 7 && renderTransportklassenTab()}
          {activeTab === 8 && renderDatenschutzTab()}
          {activeTab === 9 && renderSchnittstellenTab()}
          {activeTab === 10 && renderAnsprechpartnerTab()}
          {activeTab === 11 && renderGenossenschaftTab()}
          {activeTab === 12 && renderEmailVerteilerTab()}
          {activeTab === 13 && renderBetriebsgemeinschaftenTab()}
          {activeTab === 14 && renderLieferantenprofilTab()}
          {activeTab === 15 && renderBankverbindungTab()}
          {activeTab === 16 && renderVersandinformationenTab()}
          {activeTab === 17 && renderEinlagerungTab()}
          {activeTab === 18 && renderChefAnweisungTab()}
        </Box>
        
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
      
      {/* Dubletten-Dialog */}
      <Dialog open={duplicateDialog} onClose={() => setDuplicateDialog(false)}>
        <DialogTitle>Mögliche Dubletten gefunden</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Es wurden ähnliche Lieferantendaten gefunden. Handelt es sich um einen neuen Lieferanten?
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            {duplicates.map((duplicate, index) => (
              <Paper key={index} sx={{ p: 2, mb: 1 }}>
                <Typography variant="subtitle2">{duplicate.name}</Typography>
                <Typography variant="body2">
                  {duplicate.postal_code} {duplicate.city}, {duplicate.street}
                </Typography>
              </Paper>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialog(false)}>Abbrechen</Button>
          <Button onClick={saveSupplier} variant="contained" color="primary">
            Trotzdem speichern
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Lösch-Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Lieferanten löschen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sind Sie sicher, dass Sie diesen Lieferanten löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Abbrechen</Button>
          <Button onClick={deleteSupplier} variant="contained" color="error">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupplierForm; 