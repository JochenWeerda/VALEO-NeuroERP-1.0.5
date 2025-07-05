import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Backdrop,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import ContactsIcon from '@mui/icons-material/Contacts';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import VerifiedIcon from '@mui/icons-material/Verified';
import Layout from '../components/Layout';

/**
 * Lieferanten Detailansicht
 * Zeigt alle Details eines Lieferanten an ohne Bearbeitungsmöglichkeit
 */
const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Beispieldaten für einen Lieferanten
  const mockSupplier = {
    id: '1',
    supplier_number: '612300',
    creditor_account: '70012345',
    search_term: 'Hans Eilers',
    creation_date: '2023-01-15',
    name: 'Hans Eilers',
    name2: 'Tiernahrung-Blecky',
    industry: 'Futtermittel',
    street: 'Heueyrsweg',
    country: 'DE',
    postal_code: '27777',
    city: 'Ganderkesee',
    phone: '+49 4222 12345',
    email: 'info@eilers-futter.de',
    website: 'www.eilers-futter.de',
    letter_salutation: 'Sehr geehrte Damen und Herren',
    certification_required: true,
    certification_authority: 'TÜV Nord',
    registration_number: 'QS-1234-DE',
    payment_term: 'Standard',
    discount_days: 14,
    discount_percent: 2,
    net_days: 30,
    iban: 'DE89 3704 0044 0532 0130 00',
    bic: 'COBADEFFXXX',
    currency: 'EUR',
    is_active: true,
    is_grain_supplier: true,
    is_storage_account: true,
    contacts: [
      {
        id: '1',
        first_name: 'Hans',
        last_name: 'Eilers',
        position: 'Geschäftsführer',
        phone: '+49 4222 12345',
        mobile: '+49 172 9876543',
        email: 'h.eilers@eilers-futter.de'
      },
      {
        id: '2',
        first_name: 'Sabine',
        last_name: 'Müller',
        position: 'Buchhaltung',
        phone: '+49 4222 12346',
        mobile: '',
        email: 's.mueller@eilers-futter.de'
      }
    ],
    addresses: [
      {
        id: '1',
        type: 'Hauptsitz',
        street: 'Heueyrsweg',
        postal_code: '27777',
        city: 'Ganderkesee',
        country: 'Deutschland'
      }
    ]
  };

  // Simuliere API-Aufruf zum Laden des Lieferanten
  useEffect(() => {
    // In Produktionssystem würde hier ein API-Aufruf stattfinden
    // fetch(`/api/v1/lieferantenstamm/${id}`)
    //   .then(response => {
    //     if (!response.ok) {
    //       throw new Error('Lieferant nicht gefunden');
    //     }
    //     return response.json();
    //   })
    //   .then(data => {
    //     setSupplier(data);
    //     setLoading(false);
    //   })
    //   .catch(error => {
    //     console.error('Fehler beim Laden des Lieferanten:', error);
    //     setError(error.message);
    //     setLoading(false);
    //   });
    
    // Simuliere API-Aufruf mit Timeout
    setTimeout(() => {
      // Erweiterte Mock-Daten für verschiedene Lieferanten
      const mockSuppliers = {
        '1': mockSupplier,
        '2': {
          ...mockSupplier,
          id: '2',
          supplier_number: '453211',
          name: 'Müller GmbH & Co. KG',
          name2: 'Großhandel',
          postal_code: '28195',
          city: 'Bremen',
          street: 'Bremer Straße 45',
          phone: '+49 421 98765',
          email: 'info@mueller-grosshandel.de',
          is_grain_supplier: false
        },
        '3': {
          ...mockSupplier,
          id: '3',
          supplier_number: '781234',
          name: 'Futtermittel Schmidt',
          name2: '',
          postal_code: '49661',
          city: 'Cloppenburg',
          street: 'Industrieweg 12',
          phone: '+49 4471 12345',
          email: 'kontakt@futtermittel-schmidt.de',
          is_grain_supplier: false
        },
        '4': {
          ...mockSupplier,
          id: '4',
          supplier_number: '984522',
          name: 'Bio-Hof Petersen',
          name2: 'Direktvermarktung',
          postal_code: '24782',
          city: 'Büdelsdorf',
          street: 'Dorfstraße 8',
          phone: '+49 4331 87654',
          email: 'info@biohof-petersen.de',
          is_active: false,
          is_grain_supplier: true
        },
        '5': {
          ...mockSupplier,
          id: '5',
          supplier_number: '552398',
          name: 'Landmaschinen Krause',
          name2: '',
          postal_code: '26655',
          city: 'Westerstede',
          street: 'Oldenburger Straße 78',
          phone: '+49 4488 56789',
          email: 'service@landmaschinen-krause.de',
          is_grain_supplier: false
        }
      };

      if (mockSuppliers[id]) {
        setSupplier(mockSuppliers[id]);
      } else {
        setError('Lieferant nicht gefunden');
      }
      setLoading(false);
    }, 1000);
  }, [id]);

  // Zurück zur Lieferantenliste
  const handleBack = () => {
    navigate('/lieferanten');
  };

  // Lieferant bearbeiten
  const handleEdit = () => {
    navigate(`/lieferanten/${id}/bearbeiten`);
  };

  if (loading) {
    return (
      <Layout>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Zurück zur Lieferantenliste
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Lieferant: {supplier.name}</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
              >
                Zurück
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Bearbeiten
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ContactsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Allgemeine Informationen</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Lieferantennummer</Typography>
                    <Typography variant="body1">{supplier.supplier_number}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Kreditorenkonto</Typography>
                    <Typography variant="body1">{supplier.creditor_account}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Suchbegriff</Typography>
                    <Typography variant="body1">{supplier.search_term || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Erstelldatum</Typography>
                    <Typography variant="body1">{supplier.creation_date}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={supplier.is_active ? "Aktiv" : "Inaktiv"} 
                        color={supplier.is_active ? "success" : "default"} 
                        sx={{ mr: 1 }}
                      />
                      {supplier.is_grain_supplier && (
                        <Chip label="Getreidelieferant" color="primary" />
                      )}
                      {supplier.is_storage_account && (
                        <Chip label="Einlagerungskonto" color="secondary" sx={{ ml: 1 }} />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HomeIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Adresse</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body1">{supplier.name}</Typography>
                {supplier.name2 && <Typography variant="body1">{supplier.name2}</Typography>}
                <Typography variant="body1">{supplier.street}</Typography>
                <Typography variant="body1">{supplier.postal_code} {supplier.city}</Typography>
                <Typography variant="body1">{supplier.country === 'DE' ? 'Deutschland' : supplier.country}</Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Branche</Typography>
                  <Typography variant="body1">{supplier.industry || '-'}</Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ContactsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Kontakt</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body1">{supplier.phone || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body1">{supplier.email || '-'}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Website</Typography>
                  <Typography variant="body1">{supplier.website || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Briefanrede</Typography>
                  <Typography variant="body1">{supplier.letter_salutation}</Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VerifiedIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Zertifizierung</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Status: {supplier.certification_required ? 'Zertifizierung erforderlich' : 'Keine Zertifizierung erforderlich'}
                </Typography>
                
                {supplier.certification_required && (
                  <>
                    <Typography variant="subtitle2">Zertifizierungsstelle</Typography>
                    <Typography variant="body1">{supplier.certification_authority}</Typography>
                    
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>Registriernummer</Typography>
                    <Typography variant="body1">{supplier.registration_number}</Typography>
                  </>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalanceIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Zahlungsbedingungen</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="subtitle2">Zahlungsbedingung</Typography>
                <Typography variant="body1">{supplier.payment_term || '-'}</Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 1 }}>Skonto</Typography>
                <Typography variant="body1">
                  {supplier.discount_percent > 0 
                    ? `${supplier.discount_percent}% bei Zahlung innerhalb von ${supplier.discount_days} Tagen` 
                    : 'Kein Skonto'
                  }
                </Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 1 }}>Zahlungsziel</Typography>
                <Typography variant="body1">{supplier.net_days} Tage netto</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalanceIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Bankverbindung</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="subtitle2">IBAN</Typography>
                <Typography variant="body1">{supplier.iban || '-'}</Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 1 }}>BIC</Typography>
                <Typography variant="body1">{supplier.bic || '-'}</Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 1 }}>Währung</Typography>
                <Typography variant="body1">{supplier.currency}</Typography>
              </Paper>
            </Grid>

            {supplier.contacts.length > 0 && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ContactsIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Ansprechpartner</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    {supplier.contacts.map((contact) => (
                      <Grid item xs={12} md={6} key={contact.id}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="subtitle1">
                            {contact.first_name} {contact.last_name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {contact.position}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <PhoneIcon fontSize="small" sx={{ mr: 1, fontSize: '0.9rem' }} />
                              <Typography variant="body2">{contact.phone || '-'}</Typography>
                            </Box>
                            {contact.mobile && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <PhoneIcon fontSize="small" sx={{ mr: 1, fontSize: '0.9rem' }} />
                                <Typography variant="body2">{contact.mobile}</Typography>
                              </Box>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <EmailIcon fontSize="small" sx={{ mr: 1, fontSize: '0.9rem' }} />
                              <Typography variant="body2">{contact.email || '-'}</Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>
    </Layout>
  );
};

export default SupplierDetail; 