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
import ContactList from './ContactList';
import AddressList from './AddressList';

/**
 * Kundenstammdaten Formular 
 * Basierend auf dem CPD_Kreditor XML-Schema mit allen relevanten Feldern
 */
const CustomerForm = ({ mode = 'create' }) => {
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
    customer_number: 'K12345',
    debitor_account: '10001',
    search_term: 'Mustermann',
    creation_date: new Date().toISOString().split('T')[0],
    
    // Rechnungsadresse
    name: 'Max Mustermann GmbH',
    name2: 'Landwirtschaftsbetrieb',
    industry: 'Landwirtschaft',
    street: 'Musterstraße 123',
    country: 'DE',
    postal_code: '12345',
    city: 'Musterstadt',
    post_box: 'Postfach 123',
    phone1: '01234 / 56789',
    phone2: '01234 / 56780',
    fax: '01234 / 56781',
    salutation: 'Firma',
    letter_salutation: 'Sehr geehrte Damen und Herren',
    email: 'info@mustermann-gmbh.de',
    website: 'www.mustermann-gmbh.de',
    
    // Organisation
    branch_office: 'Hauptsitz',
    cost_center: 'Vertrieb',
    invoice_type: 'Standard',
    collective_invoice: 'Nein',
    invoice_form: 'Digital',
    sales_rep: 'Berater 1',
    region: 'Nord',
    
    // Zahlungsbedingungen
    payment_term1_days: 14,
    discount1_percent: 2,
    payment_term2_days: 30,
    discount2_percent: 0,
    net_days: 30,
    
    // Folkerts ERP spezifisch
    is_active: true,
    has_online_access: true,
    credit_limit: 10000,
    
    // Rechnung/Kontoauszug
    invoice_account_usage: true,
    account_statement_desired: true,
    balance_print_invoice: true,
    print_ad_text_on_invoice: false,
    calculate_shipping_flat_rate: true,
    single_billing: true,
    collective_billing: false,
    collective_billing_without_single: false,
    bonus_eligibility: true,
    notable_receivable: false,
    self_biller: false,
    
    // Preise/Rabatte (global)
    direct_account: true,
    discount_calculation: true,
    self_collector_discount: false,
    price_determination_varieties: true,
    direct_deduction: false,
    weekly_price_ec_basis: true,
    
    // Kundenrabatte
    customer_discounts: [
      { 
        article_number: 'A10001', 
        article_description: 'Premiumfutter', 
        discount_percent: 5,
        discount_valid_until: '2025-12-31' 
      },
      { 
        article_number: 'A10002', 
        article_description: 'Düngemittel Basis', 
        discount_percent: 3,
        discount_valid_until: '2025-10-15' 
      }
    ],
    
    // Vereinbarte Kundenpreise
    agreed_prices: [
      { 
        article_number: 'A10001', 
        article_description: 'Premiumfutter', 
        net_price: 150.50,
        including_freight: true,
        price_unit: 'to',
        discount_allowed: true,
        special_freight: 0,
        payment_term: 'Standard',
        valid_until: '2025-12-31',
        operator: 'MuellerJ'
      }
    ],
    
    // Datenschutz
    data_protection_consent: 'full',
    consent_date: '2023-05-15',
    consent_processor: 'Müller, Jana',
    consent_remarks: 'Kunde hat vollständige Einwilligung gegeben.',
    
    // Versandinformationen
    invoice_shipping_method: 'email',
    reminder_shipping_method: 'email',
    shipping_medium: 'email',
    contact_compilation: 'Standard',
    dispatch_number: 'D12345',
    initialization_instruction: 'Keine besondere Anweisung',
    
    // Kundenprofil
    company_name: 'Max Mustermann GmbH',
    founding_date: '1985-03-12',
    annual_revenue: 2500000,
    professional_association: 'Landwirtschaftliche Berufsgenossenschaft',
    professional_association_number: 'BG12345678',
    industry_profile: 'Landwirtschaft, Tierhaltung, Pflanzenbau',
    competitors: 'Landwirt AG, Bauernhof KG',
    bottlenecks: 'Saisonale Engpässe bei Futtermitteln',
    organization_structure: 'Familienbetrieb mit 15 Mitarbeitern',
    employee_count: 15,
    competitive_differentiation: 'Spezialisierung auf Bio-Produkte und nachhaltigen Anbau',
    works_council: false,
    company_philosophy: 'Nachhaltige Landwirtschaft im Einklang mit der Natur',
    
    // Schnittstelle
    edi_invoic: true,
    edi_orders: true,
    edi_desadv: false,
    fuel_card: 'F12345',
    ean_code: '4012345678901',
    customer_card_identifier: 'CC001',
    invoice_collective_print: true,
    webshop_customer_number: 'WEB12345',
    webshop_description: 'Premium-Kunde',
    
    // Selektionen
    selection_key: 'SK001',
    selection_calculation: 'SC001',
    
    // Sonstiges
    post_calculation: true,
    do_not_show_open_items: false,
    forms: true,
    insurance: true,
    language_key: 'de-DE',
    statistics_identifier: 'STAT001',
    agricultural_office: 'LWA Musterregion',
    market_price_evaluation: true,
    webshop_identifier: true,
    
    // Wegbeschreibung
    loading_information: 'Anlieferung über Tor 2, Zufahrt über Feldweg beschildert.',
    general_information: 'Große Anlage mit mehreren Gebäuden. Hauptgebäude hat grünes Dach.',
    
    // Kontakte und Adressen
    contacts: [
      {
        id: 1,
        salutation: 'Herr',
        first_name: 'Max',
        last_name: 'Mustermann',
        position: 'Geschäftsführer',
        department: 'Geschäftsleitung',
        phone: '01234 / 56789-11',
        mobile: '0170 / 1234567',
        email: 'max.mustermann@mustermann-gmbh.de',
        notes: 'Bevorzugt telefonische Kontaktaufnahme am Vormittag'
      },
      {
        id: 2,
        salutation: 'Frau',
        first_name: 'Erika',
        last_name: 'Musterfrau',
        position: 'Einkaufsleitung',
        department: 'Einkauf',
        phone: '01234 / 56789-22',
        mobile: '0170 / 7654321',
        email: 'erika.musterfrau@mustermann-gmbh.de',
        notes: 'Zuständig für Großbestellungen'
      }
    ],
    addresses: [
      {
        id: 1,
        type: 'Lieferadresse',
        name: 'Max Mustermann GmbH - Lager',
        street: 'Industriestraße 45',
        postal_code: '12345',
        city: 'Musterstadt',
        country: 'DE',
        is_default: true
      },
      {
        id: 2,
        type: 'Produktionsstandort',
        name: 'Max Mustermann GmbH - Produktion',
        street: 'Fabrikweg 12',
        postal_code: '12346',
        city: 'Nachbarort',
        country: 'DE',
        is_default: false
      }
    ]
  });
  
  // Optionen für Dropdown-Felder
  const industryOptions = [
    'Landwirtschaft',
    'Gartenbau',
    'Handwerk',
    'Dienstleistung',
    'Handel',
    'Industrie',
    'Transport & Logistik'
  ];
  
  const invoiceTypeOptions = ['Standard', 'Elektronisch', 'Papier', 'EDI'];
  const collectiveInvoiceOptions = ['Ja', 'Nein'];
  const invoiceFormOptions = ['Digital', 'Papier', 'Beides'];
  
  // Vertriebsberater-Optionen
  const salesRepOptions = [
    { value: 'JW', label: 'JW - Jochen Weerda' },
    { value: 'CHM', label: 'CHM - Claudia Habbena-Meyer' },
    { value: 'TBK', label: 'TBK - Tjarde Berend Kleemann' }
  ];
  
  // Effekt zum Laden der Daten bei Bearbeitung
  useEffect(() => {
    // Wenn im Bearbeitungsmodus, Kundendaten laden
    if (mode === 'edit' && id) {
      setLoading(true);
      // API-Aufruf um Kundendaten zu laden
      fetch(`/api/v1/kundenstamm/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Kunde nicht gefunden');
          }
          return response.json();
        })
        .then(data => {
          setFormData(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Fehler beim Laden der Kundendaten:', error);
          setNotification({
            open: true,
            message: 'Fehler beim Laden der Kundendaten',
            severity: 'error'
          });
          setLoading(false);
          // Nach kurzer Verzögerung zurück zur Kundenliste
          setTimeout(() => navigate('/kunden'), 2000);
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
    fetch('/api/v1/kundenstamm/check-duplicates', {
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
          saveCustomer();
        }
      })
      .catch(error => {
        console.error('Fehler bei der Dublettenprüfung:', error);
        // Bei Fehler trotzdem speichern
        saveCustomer();
      });
  };
  
  // Speichern des Kunden
  const saveCustomer = () => {
    setLoading(true);
    const url = mode === 'edit' ? `/api/v1/kundenstamm/${id}` : '/api/v1/kundenstamm';
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
          message: `Kunde erfolgreich ${mode === 'edit' ? 'aktualisiert' : 'erstellt'}`,
          severity: 'success'
        });
        setLoading(false);
        setTimeout(() => navigate('/kunden'), 2000);
      })
      .catch(error => {
        console.error('Fehler beim Speichern:', error);
        setNotification({
          open: true,
          message: error.message || `Fehler beim ${mode === 'edit' ? 'Aktualisieren' : 'Erstellen'} des Kunden`,
          severity: 'error'
        });
        setLoading(false);
      });
  };
  
  // Löschen des Kunden
  const deleteCustomer = () => {
    setLoading(true);
    fetch(`/api/v1/kundenstamm/${id}`, {
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
          message: 'Kunde erfolgreich gelöscht',
          severity: 'success'
        });
        setLoading(false);
        setTimeout(() => navigate('/kunden'), 2000);
      })
      .catch(error => {
        console.error('Fehler beim Löschen:', error);
        setNotification({
          open: true,
          message: error.message || 'Fehler beim Löschen des Kunden',
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
    return formData.customer_number && formData.debitor_account && formData.name;
  };
  
  // Tab-Inhalte für Rechnung/Kontoauszug
  const renderInvoiceStatementTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom fontWeight="500">
          Rechnung/Kontoauszug Einstellungen
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl component="fieldset">
          <Typography variant="subtitle2" gutterBottom>
            Kontonutzung
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.invoice_account_usage}
                    onChange={handleChange}
                    name="invoice_account_usage"
                  />
                }
                label="Kontonutzung für Rechnung"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.account_statement_desired}
                    onChange={handleChange}
                    name="account_statement_desired"
                  />
                }
                label="Kontoauszug gewünscht"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.balance_print_invoice}
                    onChange={handleChange}
                    name="balance_print_invoice"
                  />
                }
                label="Saldo Druck Rechnung"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.print_ad_text_on_invoice}
                    onChange={handleChange}
                    name="print_ad_text_on_invoice"
                  />
                }
                label="Druck Werbetext auf Rechnung / Lieferschein"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.calculate_shipping_flat_rate}
                    onChange={handleChange}
                    name="calculate_shipping_flat_rate"
                  />
                }
                label="Versandpauschalen berechnen"
              />
            </Grid>
          </Grid>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl component="fieldset">
          <Typography variant="subtitle2" gutterBottom>
            Abrechnungsart
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.single_billing}
                    onChange={handleChange}
                    name="single_billing"
                  />
                }
                label="Einzel-Abrechnung"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.collective_billing}
                    onChange={handleChange}
                    name="collective_billing"
                  />
                }
                label="Sammel-Abrechnung"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.collective_billing_without_single}
                    onChange={handleChange}
                    name="collective_billing_without_single"
                  />
                }
                label="Sammel-Abrechnung ohne Einzel-Abrechnung"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.bonus_eligibility}
                    onChange={handleChange}
                    name="bonus_eligibility"
                  />
                }
                label="Bonus-Berechtigung"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notable_receivable}
                    onChange={handleChange}
                    name="notable_receivable"
                  />
                }
                label="Bemerkenswerte Forderung"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.self_biller}
                    onChange={handleChange}
                    name="self_biller"
                  />
                }
                label="Selbstabrechner (Verkauf/Zukauf)"
              />
            </Grid>
          </Grid>
        </FormControl>
      </Grid>
    </Grid>
  );
  
  // Tab-Inhalte für Kundenrabatte
  const renderCustomerDiscountsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom fontWeight="500">
          Kundenrabatte
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Artikel-Nr."
                name="article_number"
                placeholder="Artikelnummer eingeben"
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Bezeichnung"
                name="article_description"
                disabled
                placeholder="Artikelbezeichnung wird angezeigt"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Rabatt"
                name="discount_percent"
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Gültig bis"
                name="discount_valid_until"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined">Rabatt-Liste übernehmen</Button>
          <Button variant="contained" color="primary">Rabatt-Liste speichern</Button>
        </Box>
      </Grid>
    </Grid>
  );
  
  // Tab-Inhalte für Vereinbarte Kundenpreise
  const renderAgreedPricesTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom fontWeight="500">
          Vereinbarte Kundenpreise
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Artikel-Nr."
                name="article_number"
                placeholder="Artikelnummer"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Bezeichnung"
                name="article_description"
                disabled
                placeholder="Artikelbezeichnung"
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField
                fullWidth
                label="Preis netto"
                name="net_price"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <FormControlLabel
                control={<Switch />}
                label="Inkl. Fracht"
                labelPlacement="top"
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField
                fullWidth
                label="Einheit"
                name="price_unit"
                placeholder="Einheit"
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <FormControlLabel
                control={<Switch />}
                label="Rabatt erlaubt"
                labelPlacement="top"
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField
                fullWidth
                label="Sonderfracht"
                name="special_freight"
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Gültig bis"
                name="valid_until"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
  
  // Tab-Inhalte für Globale Preise/Rabatte
  const renderGlobalPricesDiscountsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom fontWeight="500">
          Preise/Rabatte (global)
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl component="fieldset">
          <Typography variant="subtitle2" gutterBottom>
            Preiseinstellungen
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="direct_account"
                  />
                }
                label="Direktes Konto"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="discount_calculation"
                  />
                }
                label="Rabatt-Verrechnung"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="self_collector_discount"
                  />
                }
                label="Selbstabholer-Rabatt"
              />
            </Grid>
          </Grid>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl component="fieldset">
          <Typography variant="subtitle2" gutterBottom>
            Preisermittlung
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="price_determination_varieties"
                  />
                }
                label="Preisermittlung/Sorten"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="direct_deduction"
                  />
                }
                label="Direktabzug"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="weekly_price_ec_basis"
                  />
                }
                label="Wochenpreis EC-Basis"
              />
            </Grid>
          </Grid>
        </FormControl>
      </Grid>
    </Grid>
  );
  
  // Tab-Inhalte für Datenschutz
  const renderDataProtectionTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom fontWeight="500">
          Datenschutz
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Einwilligung</InputLabel>
          <Select
            name="data_protection_consent"
            defaultValue=""
          >
            <MenuItem value="">
              <em>Keine Auswahl</em>
            </MenuItem>
            <MenuItem value="full">Vollständige Einwilligung</MenuItem>
            <MenuItem value="partial">Teilweise Einwilligung</MenuItem>
            <MenuItem value="none">Keine Einwilligung</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Anlagedatum"
          name="consent_date"
          type="date"
          InputLabelProps={{ shrink: true }}
          disabled
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Anlagebearbeiter"
          name="consent_processor"
          disabled
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Zusatzbemerkung"
          name="consent_remarks"
          multiline
          rows={3}
        />
      </Grid>
    </Grid>
  );
  
  // Tab-Inhalte für Wegbeschreibung
  const renderDirectionsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom fontWeight="500">
          Wegbeschreibung
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Lade-Information"
          name="loading_information"
          multiline
          rows={4}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Allgemeine Angaben"
          name="general_information"
          multiline
          rows={4}
        />
      </Grid>
    </Grid>
  );
  
  // Tab-Inhalte für Sonstiges
  const renderMiscTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom fontWeight="500">
          Sonstiges
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl component="fieldset">
          <Typography variant="subtitle2" gutterBottom>
            Zusätzliche Einstellungen
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="post_calculation"
                  />
                }
                label="Nachkalkulation"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="do_not_show_open_items"
                  />
                }
                label="Offene Posten nicht aufrufen"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="forms"
                  />
                }
                label="Formulare"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="insurance"
                  />
                }
                label="Versicherung"
              />
            </Grid>
          </Grid>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl component="fieldset">
          <Typography variant="subtitle2" gutterBottom>
            Kennzeichnungen
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Sprachschlüssel"
                name="language_key"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Statistik-Kennzeichen"
                name="statistics_identifier"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Landwirtschaftsamt"
                name="agricultural_office"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="market_price_evaluation"
                  />
                }
                label="Marktpreis-Auswertung"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="webshop_identifier"
                  />
                }
                label="Webshop-Kennzeichen"
              />
            </Grid>
          </Grid>
        </FormControl>
      </Grid>
    </Grid>
  );
  
  // Tab-Inhalte für Selektionen
  const renderSelectionsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom fontWeight="500">
          Selektionen
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Schlüssel"
          name="selection_key"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Berechnung"
          name="selection_calculation"
        />
      </Grid>
    </Grid>
  );
  
  // Tab-Inhalte für Schnittstelle
  const renderInterfaceTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom fontWeight="500">
          Schnittstelle
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl component="fieldset">
          <Typography variant="subtitle2" gutterBottom>
            EDI-Einstellungen
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="edi_invoic"
                  />
                }
                label="EDIFACT INVOIC"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="edi_orders"
                  />
                }
                label="EDIFACT ORDERS"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="edi_desadv"
                  />
                }
                label="EDIFACT DESADV"
              />
            </Grid>
          </Grid>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl component="fieldset">
          <Typography variant="subtitle2" gutterBottom>
            Zusätzliche Schnittstellen
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tankkarte"
                name="fuel_card"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="EAN-Code"
                name="ean_code"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Kundenkarten-Kennzeichen"
                name="customer_card_identifier"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="invoice_collective_print"
                  />
                }
                label="Rechnungs-Sammeldruck"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Webshop Kundennr."
                name="webshop_customer_number"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Webshop Bezeichnung"
                name="webshop_description"
              />
            </Grid>
          </Grid>
        </FormControl>
      </Grid>
    </Grid>
  );
  
  // Tab-Inhalte für Kundenprofil
  const renderCustomerProfileTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom fontWeight="500">
          Kundenprofil
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Firmenname"
          name="company_name"
        />
      </Grid>
      
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          label="Gründung"
          name="founding_date"
          type="date"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          label="Jahresumsatz"
          name="annual_revenue"
          type="number"
          InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Berufsgenossenschaft"
          name="professional_association"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Berufsgen.-Nr."
          name="professional_association_number"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Branche"
          name="industry_profile"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Mitbewerber"
          name="competitors"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Engpässe"
          name="bottlenecks"
          multiline
          rows={2}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Organisationsstruktur"
          name="organization_structure"
          multiline
          rows={2}
        />
      </Grid>
      
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          label="Mitarbeiteranzahl"
          name="employee_count"
          type="number"
        />
      </Grid>
      
      <Grid item xs={12} md={9}>
        <TextField
          fullWidth
          label="Wettbewerbsdifferenzierung"
          name="competitive_differentiation"
          multiline
          rows={2}
        />
      </Grid>
      
      <Grid item xs={12} md={3}>
        <FormControlLabel
          control={
            <Switch
              name="works_council"
            />
          }
          label="Betriebsrat"
        />
      </Grid>
      
      <Grid item xs={12} md={9}>
        <TextField
          fullWidth
          label="Unternehmensphilosophie"
          name="company_philosophy"
          multiline
          rows={3}
        />
      </Grid>
    </Grid>
  );
  
  // Tab-Inhalte für Versandinformationen
  const renderShippingInfoTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom fontWeight="500">
          Versandinformationen
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel>Versandart Rechnung</InputLabel>
          <Select
            name="invoice_shipping_method"
            defaultValue=""
          >
            <MenuItem value="">
              <em>Keine Auswahl</em>
            </MenuItem>
            <MenuItem value="email">E-Mail</MenuItem>
            <MenuItem value="post">Post</MenuItem>
            <MenuItem value="fax">Fax</MenuItem>
            <MenuItem value="edi">EDI</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel>Mahnung</InputLabel>
          <Select
            name="reminder_shipping_method"
            defaultValue=""
          >
            <MenuItem value="">
              <em>Keine Auswahl</em>
            </MenuItem>
            <MenuItem value="email">E-Mail</MenuItem>
            <MenuItem value="post">Post</MenuItem>
            <MenuItem value="fax">Fax</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel>Versandmedium</InputLabel>
          <Select
            name="shipping_medium"
            defaultValue=""
          >
            <MenuItem value="">
              <em>Keine Auswahl</em>
            </MenuItem>
            <MenuItem value="email">E-Mail</MenuItem>
            <MenuItem value="post">Post</MenuItem>
            <MenuItem value="fax">Fax</MenuItem>
            <MenuItem value="edi">EDI</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Kontaktzusammenstellung"
          name="contact_compilation"
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Dispo-Nummer"
          name="dispatch_number"
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Initialisierungsweisung"
          name="initialization_instruction"
        />
      </Grid>
    </Grid>
  );
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            {mode === 'edit' ? 'Kunde bearbeiten' : 'Neuen Kunden anlegen'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/kunden')}
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
            <Tab icon={<LocalShippingIcon />} label="Lieferung/Zahlung" />
            <Tab icon={<EuroIcon />} label="Bank/Zahlungsverkehr" />
            <Tab label="Rechnung/Kontoauszug" />
            <Tab label="Preise/Rabatte" />
            <Tab label="Kundenrabatte" />
            <Tab label="Vereinbarte Kundenpreise" />
            <Tab label="Datenschutz" />
            <Tab label="Versandinformationen" />
            <Tab label="Ansprechpartner" />
            <Tab label="Betriebsgemeinschaften" />
            <Tab label="E-Mail-Verteiler" />
            <Tab label="Genossenschaftsanteile" />
            <Tab label="Kundenprofil" />
            <Tab label="Schnittstelle" />
            <Tab label="Selektionen" />
            <Tab label="Sonstiges" />
            <Tab label="Wegbeschreibung" />
            <Tab label="Langtext" />
            <Tab label="Chef-Anweisung" />
          </Tabs>
        </Box>
        
        {/* Tab-Inhalte */}
        <Box role="tabpanel" hidden={activeTab !== 0}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Allgemeines */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom fontWeight="500">
                  Allgemeine Informationen
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  name="customer_number"
                  label="Kundennummer"
                  value={formData.customer_number}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!formData.customer_number.trim()}
                  helperText={!formData.customer_number.trim() ? "Kundennummer ist erforderlich" : ""}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  name="debitor_account"
                  label="Debitor-Konto"
                  value={formData.debitor_account}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  name="search_term"
                  label="Suchbegriff"
                  value={formData.search_term}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="sales-rep-label">Vertriebsberater (VB)</InputLabel>
                  <Select
                    labelId="sales-rep-label"
                    name="sales_rep"
                    value={formData.sales_rep}
                    onChange={handleChange}
                    label="Vertriebsberater (VB)"
                  >
                    <MenuItem value="">
                      <em>Keine Auswahl</em>
                    </MenuItem>
                    {salesRepOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Kontaktdaten */}
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="500">
                  Kontaktdaten
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="name"
                  label="Name / Firma"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!formData.name.trim()}
                  helperText={!formData.name.trim() ? "Name ist erforderlich" : ""}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="name2"
                  label="Namenszusatz"
                  value={formData.name2}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="industry-label">Branche</InputLabel>
                  <Select
                    labelId="industry-label"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    label="Branche"
                  >
                    <MenuItem value="">
                      <em>Keine Auswahl</em>
                    </MenuItem>
                    {industryOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  name="phone1"
                  label="Telefon"
                  value={formData.phone1}
                  onChange={handleChange}
                  fullWidth
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
                />
              </Grid>
              
              {/* Adresse */}
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="500">
                  Rechnungsadresse
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="street"
                  label="Straße / Hausnummer"
                  value={formData.street}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel id="country-label">Land</InputLabel>
                  <Select
                    labelId="country-label"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    label="Land"
                  >
                    <MenuItem value="DE">Deutschland</MenuItem>
                    <MenuItem value="AT">Österreich</MenuItem>
                    <MenuItem value="CH">Schweiz</MenuItem>
                    <MenuItem value="NL">Niederlande</MenuItem>
                    <MenuItem value="BE">Belgien</MenuItem>
                    <MenuItem value="FR">Frankreich</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <TextField
                  name="postal_code"
                  label="PLZ"
                  value={formData.postal_code}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <TextField
                  name="city"
                  label="Ort"
                  value={formData.city}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              
              {/* Zusätzliche Felder hier */}
            </Grid>
          )}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 1}>
          {activeTab === 1 && (
            <AddressList 
              addresses={formData.addresses} 
              onChange={handleAddressesChange}
              mainAddress={{
                street: formData.street,
                postal_code: formData.postal_code,
                city: formData.city,
                country: formData.country
              }}
            />
          )}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 2}>
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom fontWeight="500">
                  Lieferinformationen
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="invoice-type-label">Rechnungsart</InputLabel>
                  <Select
                    labelId="invoice-type-label"
                    name="invoice_type"
                    value={formData.invoice_type}
                    onChange={handleChange}
                    label="Rechnungsart"
                  >
                    {invoiceTypeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="invoice-form-label">Rechnungsform</InputLabel>
                  <Select
                    labelId="invoice-form-label"
                    name="invoice_form"
                    value={formData.invoice_form}
                    onChange={handleChange}
                    label="Rechnungsform"
                  >
                    {invoiceFormOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Weitere Lieferinformationen hier */}
            </Grid>
          )}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 3}>
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom fontWeight="500">
                  Zahlungsbedingungen
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  name="payment_term1_days"
                  label="Skontofrist 1 (Tage)"
                  type="number"
                  value={formData.payment_term1_days}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  name="discount1_percent"
                  label="Skonto 1 (%)"
                  type="number"
                  value={formData.discount1_percent}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  name="payment_term2_days"
                  label="Skontofrist 2 (Tage)"
                  type="number"
                  value={formData.payment_term2_days}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  name="discount2_percent"
                  label="Skonto 2 (%)"
                  type="number"
                  value={formData.discount2_percent}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  name="net_days"
                  label="Zahlungsziel (Tage)"
                  type="number"
                  value={formData.net_days}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  name="credit_limit"
                  label="Kreditlimit (€)"
                  type="number"
                  value={formData.credit_limit}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              
              {/* Weitere Finanzinformationen hier */}
            </Grid>
          )}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 4}>
          {activeTab === 4 && renderInvoiceStatementTab()}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 5}>
          {activeTab === 5 && renderGlobalPricesDiscountsTab()}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 6}>
          {activeTab === 6 && renderCustomerDiscountsTab()}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 7}>
          {activeTab === 7 && renderAgreedPricesTab()}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 8}>
          {activeTab === 8 && renderDataProtectionTab()}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 9}>
          {activeTab === 9 && renderShippingInfoTab()}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 10}>
          {activeTab === 10 && (
            <ContactList 
              contacts={formData.contacts} 
              onChange={handleContactsChange}
            />
          )}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 14}>
          {activeTab === 14 && renderCustomerProfileTab()}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 15}>
          {activeTab === 15 && renderInterfaceTab()}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 16}>
          {activeTab === 16 && renderSelectionsTab()}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 17}>
          {activeTab === 17 && renderMiscTab()}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 18}>
          {activeTab === 18 && renderDirectionsTab()}
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
            Es wurden ähnliche Kundendaten gefunden. Handelt es sich um einen neuen Kunden?
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
          <Button onClick={saveCustomer} variant="contained" color="primary">
            Trotzdem speichern
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Lösch-Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Kunden löschen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sind Sie sicher, dass Sie diesen Kunden löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Abbrechen</Button>
          <Button onClick={deleteCustomer} variant="contained" color="error">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerForm; 