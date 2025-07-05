import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Box,
  Typography,
  Paper,
  Autocomplete,
  Divider,
  Tabs,
  Tab,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import de from 'date-fns/locale/de';

// Eigene Komponenten
import BelegFormBase from './BelegFormBase';
import PositionenTabelle, { Position } from './PositionenTabelle';
import StatusBadge from './StatusBadge';
import BelegHistorie from './BelegHistorie';
import BelegAktionenLeiste, { getStandardAktionen } from './BelegAktionenLeiste';

// Konstanten für Status und Tabs
const BESTELLUNG_STATUS = {
  ENTWURF: 'entwurf',
  ANGEFRAGT: 'angefragt',
  BESTAETIGT: 'bestaetigt',
  TEILWEISE_GELIEFERT: 'teilweise_geliefert',
  GELIEFERT: 'geliefert',
  STORNIERT: 'storniert'
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bestellung-tabpanel-${index}`}
      aria-labelledby={`bestellung-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

// Bestellungsdaten
interface Bestellung {
  id?: string;
  nummer?: string;
  lieferant: {
    id: string;
    name: string;
    ansprechpartner?: string;
    adresse?: string;
  };
  bestelldatum: string;
  liefertermin?: string;
  ansprechpartner?: string;
  lieferadresse?: string;
  zahlungsbedingungen?: string;
  positionen: Position[];
  bemerkungen?: string;
  interne_notizen?: string;
  status: string;
  gesamtsumme?: number;
  historie?: any[];
}

// Lieferantentyp für Autocomplete
interface Lieferant {
  id: string;
  name: string;
  ansprechpartner?: string;
  adresse?: string;
  telefon?: string;
  email?: string;
  lieferantenNr?: string;
}

const BestellungFormular: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bestellung, setBestellung] = useState<Bestellung>({
    lieferant: { id: '', name: '' },
    bestelldatum: new Date().toISOString().split('T')[0],
    positionen: [],
    status: BESTELLUNG_STATUS.ENTWURF
  });
  const [lieferanten, setLieferanten] = useState<Lieferant[]>([]);
  const [selectedLieferant, setSelectedLieferant] = useState<Lieferant | null>(null);

  // Bestellung aus der API laden, wenn ID vorhanden
  useEffect(() => {
    if (id) {
      setLoading(true);
      // Hier API-Aufruf implementieren
      setTimeout(() => {
        // Beispieldaten für Demo-Zwecke
        setBestellung({
          id: '123',
          nummer: 'B-2023-0001',
          lieferant: { id: '789', name: 'Zulieferer GmbH', ansprechpartner: 'Max Mustermann', adresse: 'Zulieferweg 123, 12345 Zulieferstadt' },
          ansprechpartner: 'Max Mustermann',
          bestelldatum: '2023-06-01',
          liefertermin: '2023-06-15',
          lieferadresse: 'Hauptstraße 1, 54321 Eigenstadt',
          zahlungsbedingungen: '30 Tage netto',
          positionen: [
            {
              id: '1',
              artikelId: 'A001',
              artikelBezeichnung: 'Rohstoff A',
              menge: 100,
              einheit: 'kg',
              einzelpreis: 12.5,
              mwstSatz: 19,
              gesamtpreis: 1250
            }
          ],
          bemerkungen: 'Lieferung bitte avisieren',
          interne_notizen: 'Dringend benötigt für Produktion',
          status: BESTELLUNG_STATUS.BESTAETIGT,
          gesamtsumme: 1487.5,
          historie: [
            {
              id: '1',
              datum: '2023-06-01T10:00:00',
              benutzer: 'admin',
              aktion: 'Bestellung erstellt',
              status: BESTELLUNG_STATUS.ENTWURF,
              typ: 'info'
            },
            {
              id: '2',
              datum: '2023-06-01T14:30:00',
              benutzer: 'admin',
              aktion: 'Bestellung bestätigt',
              status: BESTELLUNG_STATUS.BESTAETIGT,
              typ: 'success'
            }
          ]
        });
        setSelectedLieferant({
          id: '789',
          name: 'Zulieferer GmbH',
          ansprechpartner: 'Max Mustermann',
          adresse: 'Zulieferweg 123, 12345 Zulieferstadt',
          telefon: '0123 / 456789',
          email: 'info@zulieferer.de',
          lieferantenNr: 'L-001'
        });
        setLoading(false);
      }, 1000);
    }
  }, [id]);

  // Lieferantendaten für Autocomplete laden
  useEffect(() => {
    // Hier API-Aufruf implementieren
    setTimeout(() => {
      setLieferanten([
        { id: '789', name: 'Zulieferer GmbH', ansprechpartner: 'Max Mustermann', adresse: 'Zulieferweg 123, 12345 Zulieferstadt' },
        { id: '790', name: 'Rohstoff AG', ansprechpartner: 'Erika Musterfrau', adresse: 'Rohstoffweg 456, 54321 Rohstoffstadt' }
      ]);
    }, 500);
  }, []);

  // Handler für Tab-Wechsel
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handler für Lieferanten-Auswahl
  const handleLieferantAuswahl = (lieferant: Lieferant | null) => {
    setSelectedLieferant(lieferant);
    if (lieferant) {
      setBestellung({
        ...bestellung,
        lieferant: {
          id: lieferant.id,
          name: lieferant.name,
          ansprechpartner: lieferant.ansprechpartner,
          adresse: lieferant.adresse
        }
      });
    }
  };

  // Handler für Änderungen an den Positionen
  const handlePositionenChange = (positionen: Position[]) => {
    // Gesamtsumme berechnen
    const gesamtsumme = positionen.reduce((sum, pos) => sum + (pos.gesamtpreis || 0), 0);
    
    setBestellung({
      ...bestellung,
      positionen,
      gesamtsumme
    });
  };

  // Handler für Änderung von Textfeldern
  const handleTextChange = (field: keyof Bestellung) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setBestellung({
      ...bestellung,
      [field]: event.target.value
    });
  };

  // Handler für Datums-Änderungen
  const handleDateChange = (field: keyof Bestellung) => (date: Date | null) => {
    if (date) {
      setBestellung({
        ...bestellung,
        [field]: date.toISOString().split('T')[0]
      });
    }
  };

  // Bestellung speichern
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hier API-Aufruf implementieren
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Nach erfolgreichem Speichern zurück zur Bestellungsliste navigieren
      // navigate('/bestellungen');
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern der Bestellung');
      setLoading(false);
    }
  };

  // Bestellung an Lieferanten senden
  const handleAnfragen = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hier API-Aufruf implementieren
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBestellung({
        ...bestellung,
        status: BESTELLUNG_STATUS.ANGEFRAGT
      });
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Anfragen der Bestellung');
      setLoading(false);
    }
  };

  // Bestellung bestätigen
  const handleBestaetigen = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hier API-Aufruf implementieren
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBestellung({
        ...bestellung,
        status: BESTELLUNG_STATUS.BESTAETIGT
      });
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Bestätigen der Bestellung');
      setLoading(false);
    }
  };

  // Wareneingang erstellen
  const handleWareneingangErstellen = () => {
    // Hier zur Wareneingang-Erstellung navigieren
    // navigate('/wareneingaenge/neu?bestellungId=' + bestellung.id);
  };

  // Bestellung stornieren
  const handleStornieren = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hier API-Aufruf implementieren
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBestellung({
        ...bestellung,
        status: BESTELLUNG_STATUS.STORNIERT
      });
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Stornieren der Bestellung');
      setLoading(false);
    }
  };

  // Zurück zur Bestellungsliste
  const handleBack = () => {
    // navigate('/bestellungen');
  };

  // Aktionen für die Bestellung definieren
  const aktionen = getStandardAktionen(
    'bestellung',
    bestellung.status,
    {
      onSave: handleSave,
      onPrint: () => console.log('Bestellung drucken'),
      onEmail: () => console.log('Bestellung per E-Mail senden'),
      onSend: handleAnfragen,
      onDelivery: handleWareneingangErstellen,
      onAccept: handleBestaetigen,
      onCancel: handleStornieren
    },
    loading
  );

  return (
    <BelegFormBase
      title={bestellung.id ? `Bestellung ${bestellung.nummer}` : 'Neue Bestellung'}
      belegData={bestellung}
      onSave={handleSave}
      onBack={handleBack}
      loading={loading}
      error={error || undefined}
    >
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center">
              {bestellung.status && (
                <StatusBadge
                  status={bestellung.status}
                  belegTyp="bestellung"
                  showLabel
                  style={{ marginRight: '16px' }}
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" justifyContent="flex-end">
              <BelegAktionenLeiste
                aktionen={aktionen}
                belegTyp="bestellung"
                loading={loading}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Basisdaten" />
          <Tab label="Positionen" />
          <Tab label="Dokumente" />
          <Tab label="Historie" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>Lieferantendaten</Typography>
              
              <Autocomplete
                options={lieferanten}
                getOptionLabel={(option) => option.name}
                value={selectedLieferant}
                onChange={(event, value) => handleLieferantAuswahl(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Lieferant"
                    variant="outlined"
                    fullWidth
                    required
                  />
                )}
                disabled={loading || Boolean(bestellung.id)}
              />
              
              {selectedLieferant && (
                <Box sx={{ mt: 2 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2">
                      <strong>Ansprechpartner:</strong> {selectedLieferant.ansprechpartner}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Adresse:</strong> {selectedLieferant.adresse}
                    </Typography>
                    {selectedLieferant.telefon && (
                      <Typography variant="body2">
                        <strong>Telefon:</strong> {selectedLieferant.telefon}
                      </Typography>
                    )}
                    {selectedLieferant.email && (
                      <Typography variant="body2">
                        <strong>E-Mail:</strong> {selectedLieferant.email}
                      </Typography>
                    )}
                    {selectedLieferant.lieferantenNr && (
                      <Typography variant="body2">
                        <strong>Lieferanten-Nr.:</strong> {selectedLieferant.lieferantenNr}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>Bestelldaten</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                    <DatePicker
                      label="Bestelldatum"
                      value={bestellung.bestelldatum ? new Date(bestellung.bestelldatum) : null}
                      onChange={handleDateChange('bestelldatum')}
                      slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                      disabled={loading}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                    <DatePicker
                      label="Liefertermin"
                      value={bestellung.liefertermin ? new Date(bestellung.liefertermin) : null}
                      onChange={handleDateChange('liefertermin')}
                      slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                      disabled={loading}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Zahlungsbedingungen"
                    value={bestellung.zahlungsbedingungen || ''}
                    onChange={handleTextChange('zahlungsbedingungen')}
                    fullWidth
                    variant="outlined"
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ansprechpartner (intern)"
                    value={bestellung.ansprechpartner || ''}
                    onChange={handleTextChange('ansprechpartner')}
                    fullWidth
                    variant="outlined"
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Lieferadresse"
                    value={bestellung.lieferadresse || ''}
                    onChange={handleTextChange('lieferadresse')}
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={2}
                    disabled={loading}
                  />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Bemerkungen"
                    value={bestellung.bemerkungen || ''}
                    onChange={handleTextChange('bemerkungen')}
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    disabled={loading}
                    helperText="Diese Bemerkungen werden auf der Bestellung angezeigt"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Interne Notizen"
                    value={bestellung.interne_notizen || ''}
                    onChange={handleTextChange('interne_notizen')}
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    disabled={loading}
                    helperText="Diese Notizen sind nur intern sichtbar"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <PositionenTabelle
            positionen={bestellung.positionen}
            onPositionenChange={handlePositionenChange}
            onArtikelSearch={(suchbegriff) => {
              // Hier API-Aufruf implementieren
              return new Promise(resolve => {
                setTimeout(() => {
                  resolve([
                    { id: 'A001', bezeichnung: 'Rohstoff A', einheit: 'kg', preis: 12.5 },
                    { id: 'A002', bezeichnung: 'Rohstoff B', einheit: 't', preis: 250 }
                  ]);
                }, 300);
              });
            }}
            onEinheitenSearch={(suchbegriff) => {
              return Promise.resolve(['Stk', 'kg', 't', 'l', 'm']);
            }}
            readOnly={loading || bestellung.status === BESTELLUNG_STATUS.STORNIERT}
            showMwst={true}
            showRabatt={false}
            showSummary={true}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Alert severity="info">
            Dokumente-Funktion ist noch in Entwicklung.
          </Alert>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {bestellung.historie ? (
            <BelegHistorie
              eintraege={bestellung.historie}
              title="Bestellungshistorie"
              showAll={true}
            />
          ) : (
            <Alert severity="info">
              Keine Historieneinträge vorhanden.
            </Alert>
          )}
        </TabPanel>
      </Paper>
    </BelegFormBase>
  );
};

export default BestellungFormular; 