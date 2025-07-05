import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  AppBar,
  Toolbar,
  useTheme as useMuiTheme,
  IconButton,
  Tooltip,
  Avatar,
  Badge,
  Paper,
  Grid,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ContactsIcon from '@mui/icons-material/Contacts';
import HomeIcon from '@mui/icons-material/Home';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EuroIcon from '@mui/icons-material/Euro';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import IconSet from '../components/IconSet';

/**
 * Seite für die Detailansicht eines Kunden
 * Nutzt die volle Bildschirmbreite ohne Sidebar
 */
const CustomerDetail = () => {
  const muiTheme = useMuiTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Kundendaten laden
  useEffect(() => {
    // API-Aufruf implementieren
    fetch(`/api/v1/kundenstamm/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Kunde nicht gefunden');
        }
        return response.json();
      })
      .then(data => {
        setCustomer(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Fehler beim Laden der Kundendaten:', error);
        setError('Kunde konnte nicht geladen werden');
        setLoading(false);
        
        // Fallback für Entwicklung - Beispieldaten
        if (process.env.NODE_ENV === 'development') {
          // Beispieldaten für die Entwicklung
          const mockCustomer = {
            id: parseInt(id),
            customer_number: `1000${id}`,
            debitor_account: `1000${id}`,
            name: 'Landwirtschaft Müller GmbH',
            name2: 'Filiale Nord',
            industry: 'Landwirtschaft',
            street: 'Hauptstraße 123',
            city: 'Bad Bentheim',
            postal_code: '48455',
            country: 'DE',
            phone1: '05922 123456',
            phone2: '05922 123457',
            fax: '05922 123458',
            email: 'info@landwirtschaft-mueller.de',
            website: 'www.landwirtschaft-mueller.de',
            is_active: true,
            has_online_access: true,
            creation_date: '2023-01-15',
            payment_term1_days: 14,
            discount1_percent: 2,
            payment_term2_days: 30,
            discount2_percent: 0,
            net_days: 30,
            credit_limit: 10000,
            // Zusätzliche Bankverbindungsdaten
            bank_accounts: [
              {
                id: 1,
                bank_name: 'Sparkasse Emsland',
                iban: 'DE89 3704 0044 0532 0130 00',
                bic: 'COBADEFFXXX',
                account_owner: 'Landwirtschaft Müller GmbH',
                is_default: true
              },
              {
                id: 2,
                bank_name: 'Volksbank Nordhorn',
                iban: 'DE27 2806 9878 1234 5678 90',
                bic: 'GENODEF1NEH',
                account_owner: 'Landwirtschaft Müller GmbH',
                is_default: false
              }
            ],
            contacts: [
              { 
                id: 1, 
                first_name: 'Hans', 
                last_name: 'Müller', 
                position: 'Geschäftsführer',
                phone: '05922 123456-1',
                email: 'h.mueller@landwirtschaft-mueller.de'
              },
              { 
                id: 2, 
                first_name: 'Lisa', 
                last_name: 'Schmidt', 
                position: 'Einkaufsleitung',
                phone: '05922 123456-2',
                email: 'l.schmidt@landwirtschaft-mueller.de'
              }
            ],
            addresses: [
              {
                id: 1,
                type: 'Lieferadresse',
                street: 'Industriestraße 45',
                postal_code: '48455',
                city: 'Bad Bentheim',
                country: 'DE'
              },
              {
                id: 2,
                type: 'Lager',
                street: 'Gewerbestraße 22',
                postal_code: '48455',
                city: 'Bad Bentheim',
                country: 'DE'
              }
            ],
            // Lieferungsinformationen
            delivery_info: {
              invoice_type: 'Standard',
              invoice_form: 'Digital',
              collective_invoice: 'Nein',
              shipping_method: 'Spedition',
              special_instructions: 'Lieferung nur werktags von 8-16 Uhr'
            }
          };
          setCustomer(mockCustomer);
          setLoading(false);
          setError(null);
        }
      });
  }, [id]);

  // Tabs wechseln
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Formatierte Darstellung von Kundendaten
  const CustomerInfoSection = ({ title, children }) => (
    <>
      <Typography variant="subtitle1" gutterBottom fontWeight="500" sx={{ mt: 3 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {children}
      </Grid>
    </>
  );

  const InfoItem = ({ label, value, gridSize = { xs: 12, sm: 6, md: 4 } }) => (
    <Grid item {...gridSize}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value || '-'}</Typography>
    </Grid>
  );

  return (
    <Box sx={{ 
      flexGrow: 1,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E8F0FE 0%, #E0E7FF 100%)'
    }}>
      {/* Header-Bar im Dashboard-Stil */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 3 }}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <IconSet icon="person" color={muiTheme.palette.primary.main} size="large" sx={{ mr: 1 }} />
            Kundendetails
          </Typography>
          
          {/* Rechte Seite mit Benachrichtigungen und Benutzer */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Zurück zur Kundenliste">
              <IconButton color="inherit" component={RouterLink} to="/kunden">
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Benachrichtigungen">
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <IconSet icon="notifications" />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Benutzerkonto">
              <IconButton color="inherit">
                <Avatar 
                  sx={{ 
                    width: 38, 
                    height: 38, 
                    bgcolor: muiTheme.palette.primary.main,
                    fontSize: '1rem'
                  }}
                >
                  MF
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ px: 3, pb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/landhandel" underline="hover" color="inherit">
            Dashboard
          </Link>
          <Link component={RouterLink} to="/kunden" underline="hover" color="inherit">
            Kundenstammdaten
          </Link>
          <Typography color="text.primary">Kundendetails</Typography>
        </Breadcrumbs>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : customer ? (
          <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h4">{customer.name}</Typography>
                  {customer.name2 && (
                    <Typography variant="h6" color="text.secondary">{customer.name2}</Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip 
                      label={customer.is_active ? "Aktiv" : "Inaktiv"} 
                      color={customer.is_active ? "success" : "default"}
                      size="small"
                    />
                    {customer.industry && (
                      <Chip 
                        label={customer.industry} 
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/kunden/${id}/bearbeiten`)}
                  >
                    Bearbeiten
                  </Button>
                </Box>
              </Box>
              
              {/* Tabs für verschiedene Datenbereiche */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab icon={<ContactsIcon />} label="Stammdaten" />
                  <Tab icon={<HomeIcon />} label="Adressen" />
                  <Tab icon={<LocalShippingIcon />} label="Lieferung" />
                  <Tab icon={<EuroIcon />} label="Finanzen" />
                  <Tab icon={<AccountBalanceIcon />} label="Bankverbindungen" />
                </Tabs>
              </Box>
              
              {/* Tab-Inhalte */}
              <Box role="tabpanel" hidden={activeTab !== 0}>
                {activeTab === 0 && (
                  <>
                    <CustomerInfoSection title="Allgemeine Informationen">
                      <InfoItem label="Kundennummer" value={customer.customer_number} />
                      <InfoItem label="Debitor-Konto" value={customer.debitor_account} />
                      <InfoItem label="Angelegt am" value={
                        customer.creation_date ? new Date(customer.creation_date).toLocaleDateString('de-DE') : '-'
                      } />
                    </CustomerInfoSection>
                    
                    <CustomerInfoSection title="Kontaktdaten">
                      <InfoItem label="Anschrift" value={customer.street} />
                      <InfoItem label="PLZ / Ort" value={`${customer.postal_code} ${customer.city}`} />
                      <InfoItem label="Land" value={
                        customer.country === 'DE' ? 'Deutschland' : 
                        customer.country === 'AT' ? 'Österreich' :
                        customer.country === 'CH' ? 'Schweiz' :
                        customer.country
                      } />
                      <InfoItem label="Telefon (Haupt)" value={
                        customer.phone1 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {customer.phone1}
                            <IconButton size="small" href={`tel:${customer.phone1}`}>
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )
                      } />
                      <InfoItem label="Telefon (Alternativ)" value={
                        customer.phone2 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {customer.phone2}
                            <IconButton size="small" href={`tel:${customer.phone2}`}>
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )
                      } />
                      <InfoItem label="Fax" value={customer.fax} />
                      <InfoItem label="E-Mail" value={
                        customer.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {customer.email}
                            <IconButton size="small" href={`mailto:${customer.email}`}>
                              <EmailIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )
                      } />
                      <InfoItem label="Website" value={customer.website} />
                    </CustomerInfoSection>
                    
                    {customer.contacts && customer.contacts.length > 0 && (
                      <CustomerInfoSection title="Kontaktpersonen">
                        {customer.contacts.map((contact, index) => (
                          <Grid item xs={12} sm={6} key={contact.id || index}>
                            <Paper sx={{ p: 2 }} variant="outlined">
                              <Typography variant="subtitle2">
                                {contact.first_name} {contact.last_name}
                              </Typography>
                              {contact.position && (
                                <Typography variant="body2" color="text.secondary">
                                  {contact.position}
                                </Typography>
                              )}
                              {contact.phone && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                  <PhoneIcon fontSize="small" color="action" />
                                  <Typography variant="body2">{contact.phone}</Typography>
                                </Box>
                              )}
                              {contact.email && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <EmailIcon fontSize="small" color="action" />
                                  <Typography variant="body2">{contact.email}</Typography>
                                </Box>
                              )}
                            </Paper>
                          </Grid>
                        ))}
                      </CustomerInfoSection>
                    )}
                  </>
                )}
              </Box>
              
              <Box role="tabpanel" hidden={activeTab !== 1}>
                {activeTab === 1 && (
                  <>
                    <CustomerInfoSection title="Hauptadresse">
                      <InfoItem 
                        label="Straße / Hausnummer" 
                        value={customer.street} 
                        gridSize={{ xs: 12, sm: 12, md: 6 }}
                      />
                      <InfoItem 
                        label="PLZ / Ort" 
                        value={`${customer.postal_code} ${customer.city}`} 
                        gridSize={{ xs: 12, sm: 6, md: 3 }}
                      />
                      <InfoItem 
                        label="Land" 
                        value={
                          customer.country === 'DE' ? 'Deutschland' : 
                          customer.country === 'AT' ? 'Österreich' :
                          customer.country === 'CH' ? 'Schweiz' :
                          customer.country
                        } 
                        gridSize={{ xs: 12, sm: 6, md: 3 }}
                      />
                    </CustomerInfoSection>
                    
                    {customer.addresses && customer.addresses.length > 0 && (
                      <CustomerInfoSection title="Weitere Adressen">
                        {customer.addresses.map((address, index) => (
                          <Grid item xs={12} sm={6} key={address.id || index}>
                            <Paper sx={{ p: 2 }} variant="outlined">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <LocationOnIcon fontSize="small" color="primary" />
                                <Typography variant="subtitle2">{address.type}</Typography>
                              </Box>
                              <Typography variant="body2">{address.street}</Typography>
                              <Typography variant="body2">
                                {address.postal_code} {address.city}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {address.country === 'DE' ? 'Deutschland' : 
                                 address.country === 'AT' ? 'Österreich' :
                                 address.country === 'CH' ? 'Schweiz' :
                                 address.country}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </CustomerInfoSection>
                    )}
                  </>
                )}
              </Box>
              
              <Box role="tabpanel" hidden={activeTab !== 2}>
                {activeTab === 2 && (
                  <>
                    {customer.delivery_info ? (
                      <CustomerInfoSection title="Lieferinformationen">
                        <InfoItem label="Rechnungsart" value={customer.delivery_info.invoice_type} />
                        <InfoItem label="Rechnungsform" value={customer.delivery_info.invoice_form} />
                        <InfoItem label="Sammelrechnung" value={customer.delivery_info.collective_invoice} />
                        <InfoItem label="Versandart" value={customer.delivery_info.shipping_method} />
                        <InfoItem 
                          label="Besondere Anweisungen" 
                          value={customer.delivery_info.special_instructions}
                          gridSize={{ xs: 12, sm: 12, md: 12 }}
                        />
                      </CustomerInfoSection>
                    ) : (
                      <Alert severity="info" sx={{ mb: 3 }}>
                        Keine Lieferinformationen verfügbar
                      </Alert>
                    )}
                    
                    {customer.addresses && customer.addresses.length > 0 && (
                      <CustomerInfoSection title="Lieferadressen">
                        {customer.addresses
                          .filter(addr => addr.type.toLowerCase().includes('liefer'))
                          .map((address, index) => (
                            <Grid item xs={12} sm={6} key={address.id || index}>
                              <Paper sx={{ p: 2 }} variant="outlined">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <LocalShippingIcon fontSize="small" color="primary" />
                                  <Typography variant="subtitle2">{address.type}</Typography>
                                </Box>
                                <Typography variant="body2">{address.street}</Typography>
                                <Typography variant="body2">
                                  {address.postal_code} {address.city}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {address.country === 'DE' ? 'Deutschland' : 
                                   address.country === 'AT' ? 'Österreich' :
                                   address.country === 'CH' ? 'Schweiz' :
                                   address.country}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                      </CustomerInfoSection>
                    )}
                  </>
                )}
              </Box>
              
              <Box role="tabpanel" hidden={activeTab !== 3}>
                {activeTab === 3 && (
                  <>
                    <CustomerInfoSection title="Zahlungsbedingungen">
                      <InfoItem 
                        label="Skonto" 
                        value={
                          customer.discount1_percent > 0
                            ? `${customer.discount1_percent}% bei Zahlung innerhalb von ${customer.payment_term1_days} Tagen`
                            : 'Kein Skonto'
                        } 
                      />
                      <InfoItem 
                        label="2. Skonto" 
                        value={
                          customer.discount2_percent > 0
                            ? `${customer.discount2_percent}% bei Zahlung innerhalb von ${customer.payment_term2_days} Tagen`
                            : '-'
                        } 
                      />
                      <InfoItem label="Zahlungsziel" value={`${customer.net_days || 30} Tage`} />
                      <InfoItem 
                        label="Kreditlimit" 
                        value={
                          customer.credit_limit
                            ? `${customer.credit_limit.toLocaleString('de-DE')} €`
                            : '-'
                        } 
                      />
                    </CustomerInfoSection>
                  </>
                )}
              </Box>
              
              <Box role="tabpanel" hidden={activeTab !== 4}>
                {activeTab === 4 && (
                  <>
                    {customer.bank_accounts && customer.bank_accounts.length > 0 ? (
                      <CustomerInfoSection title="Bankverbindungen">
                        <Grid item xs={12}>
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Bank</TableCell>
                                  <TableCell>IBAN</TableCell>
                                  <TableCell>BIC</TableCell>
                                  <TableCell>Kontoinhaber</TableCell>
                                  <TableCell>Standard</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {customer.bank_accounts.map((account, index) => (
                                  <TableRow key={account.id || index}>
                                    <TableCell>{account.bank_name}</TableCell>
                                    <TableCell>{account.iban}</TableCell>
                                    <TableCell>{account.bic}</TableCell>
                                    <TableCell>{account.account_owner}</TableCell>
                                    <TableCell>
                                      {account.is_default ? (
                                        <Chip 
                                          label="Standard" 
                                          color="primary" 
                                          size="small"
                                        />
                                      ) : '-'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Grid>
                      </CustomerInfoSection>
                    ) : (
                      <Alert severity="info" sx={{ mb: 3 }}>
                        Keine Bankverbindungen hinterlegt
                      </Alert>
                    )}
                  </>
                )}
              </Box>
            </Paper>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default CustomerDetail; 