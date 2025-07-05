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
  CircularProgress,
  Button
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
import ChargenAuswahlDialog, { SelectedCharge } from './ChargenAuswahlDialog';

// Konstanten für Status und Tabs
const AUFTRAG_STATUS = {
  ENTWURF: 'entwurf',
  BESTAETIGT: 'bestaetigt',
  IN_BEARBEITUNG: 'in_bearbeitung',
  TEILWEISE_GELIEFERT: 'teilweise_geliefert',
  GELIEFERT: 'geliefert',
  ABGESCHLOSSEN: 'abgeschlossen',
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
      id={`auftrag-tabpanel-${index}`}
      aria-labelledby={`auftrag-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

// Beispiel für Angebotsdaten
interface Angebot {
  id: string;
  nummer: string;
  kunde: {
    id: string;
    name: string;
    ansprechpartner?: string;
    adresse?: string;
  };
  positionen: Position[];
  gesamtsumme: number;
  datum: string;
  status: string;
}

// Auftragsdaten
interface Auftrag {
  id?: string;
  nummer?: string;
  angebotId?: string;
  angebotNummer?: string;
  kunde: {
    id: string;
    name: string;
    ansprechpartner?: string;
    adresse?: string;
  };
  ansprechpartner?: string;
  auftragsart?: string;
  auftragsdatum: string;
  liefertermin?: string;
  lieferadresse?: string;
  zahlungsbedingungen?: string;
  positionen: Position[];
  bemerkungen?: string;
  interne_notizen?: string;
  status: string;
  gesamtsumme?: number;
  historie?: any[];
}

// Kundentyp für Autocomplete
interface Kunde {
  id: string;
  name: string;
  ansprechpartner?: string;
  adresse?: string;
  telefon?: string;
  email?: string;
}

const AuftragFormular: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auftrag, setAuftrag] = useState<Auftrag>({
    kunde: { id: '', name: '' },
    auftragsdatum: new Date().toISOString().split('T')[0],
    positionen: [],
    status: AUFTRAG_STATUS.ENTWURF
  });
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [selectedKunde, setSelectedKunde] = useState<Kunde | null>(null);
  const [angebote, setAngebote] = useState<Angebot[]>([]);
  const [selectedAngebot, setSelectedAngebot] = useState<Angebot | null>(null);

  // Auftrag aus der API laden, wenn ID vorhanden
  useEffect(() => {
    if (id) {
      setLoading(true);
      // Hier API-Aufruf implementieren
      setTimeout(() => {
        // Beispieldaten für Demo-Zwecke
        setAuftrag({
          id: '123',
          nummer: 'A-2023-0001',
          angebotId: '456',
          angebotNummer: 'ANG-2023-0001',
          kunde: { id: '789', name: 'Musterfirma GmbH', ansprechpartner: 'Max Mustermann', adresse: 'Musterstraße 123, 12345 Musterstadt' },
          ansprechpartner: 'Max Mustermann',
          auftragsart: 'Standard',
          auftragsdatum: '2023-06-01',
          liefertermin: '2023-06-15',
          lieferadresse: 'Musterstraße 123, 12345 Musterstadt',
          zahlungsbedingungen: '30 Tage netto',
          positionen: [
            {
              id: '1',
              artikelId: 'A001',
              artikelBezeichnung: 'Produkt A',
              menge: 10,
              einheit: 'Stk',
              einzelpreis: 100,
              mwstSatz: 19,
              gesamtpreis: 1000
            }
          ],
          bemerkungen: 'Lieferung bitte avisieren',
          interne_notizen: 'Kundenfreigabe liegt vor',
          status: AUFTRAG_STATUS.BESTAETIGT,
          gesamtsumme: 1190,
          historie: [
            {
              id: '1',
              datum: '2023-06-01T10:00:00',
              benutzer: 'admin',
              aktion: 'Auftrag erstellt',
              status: AUFTRAG_STATUS.ENTWURF,
              typ: 'info'
            },
            {
              id: '2',
              datum: '2023-06-01T14:30:00',
              benutzer: 'admin',
              aktion: 'Auftrag bestätigt',
              status: AUFTRAG_STATUS.BESTAETIGT,
              typ: 'success'
            }
          ]
        });
        setSelectedKunde({
          id: '789',
          name: 'Musterfirma GmbH',
          ansprechpartner: 'Max Mustermann',
          adresse: 'Musterstraße 123, 12345 Musterstadt',
          telefon: '0123 / 456789',
          email: 'info@musterfirma.de'
        });
        setLoading(false);
      }, 1000);
    }
  }, [id]);

  // Kundendaten für Autocomplete laden
  useEffect(() => {
    // Hier API-Aufruf implementieren
    setTimeout(() => {
      setKunden([
        { id: '789', name: 'Musterfirma GmbH', ansprechpartner: 'Max Mustermann', adresse: 'Musterstraße 123, 12345 Musterstadt' },
        { id: '790', name: 'Beispiel AG', ansprechpartner: 'Erika Musterfrau', adresse: 'Beispielweg 456, 54321 Beispielstadt' }
      ]);
    }, 500);
  }, []);

  // Angebote laden, wenn Kunde ausgewählt ist
  useEffect(() => {
    if (selectedKunde) {
      // Hier API-Aufruf implementieren
      setTimeout(() => {
        setAngebote([
          {
            id: '456',
            nummer: 'ANG-2023-0001',
            kunde: selectedKunde,
            positionen: [
              {
                id: '1',
                artikelId: 'A001',
                artikelBezeichnung: 'Produkt A',
                menge: 10,
                einheit: 'Stk',
                einzelpreis: 100,
                mwstSatz: 19,
                gesamtpreis: 1000
              }
            ],
            gesamtsumme: 1190,
            datum: '2023-05-15',
            status: 'akzeptiert'
          }
        ]);
      }, 500);
    }
  }, [selectedKunde]);

  // Handler für Tab-Wechsel
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handler für Angebot-Auswahl
  const handleAngebotAuswahl = (angebot: Angebot | null) => {
    if (angebot) {
      setSelectedAngebot(angebot);
      setAuftrag({
        ...auftrag,
        angebotId: angebot.id,
        angebotNummer: angebot.nummer,
        kunde: angebot.kunde,
        positionen: [...angebot.positionen]
      });
      setSelectedKunde(angebot.kunde);
    }
  };

  // Handler für Kunden-Auswahl
  const handleKundeAuswahl = (kunde: Kunde | null) => {
    setSelectedKunde(kunde);
    if (kunde) {
      setAuftrag({
        ...auftrag,
        kunde: {
          id: kunde.id,
          name: kunde.name,
          ansprechpartner: kunde.ansprechpartner,
          adresse: kunde.adresse
        }
      });
    }
  };

  // Handler für Änderungen an den Positionen
  const handlePositionenChange = (positionen: Position[]) => {
    // Gesamtsumme berechnen
    const gesamtsumme = positionen.reduce((sum, pos) => sum + (pos.gesamtpreis || 0), 0);
    
    setAuftrag({
      ...auftrag,
      positionen,
      gesamtsumme
    });
  };

  // Handler für Änderung von Textfeldern
  const handleTextChange = (field: keyof Auftrag) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setAuftrag({
      ...auftrag,
      [field]: event.target.value
    });
  };

  // Handler für Datums-Änderungen
  const handleDateChange = (field: keyof Auftrag) => (date: Date | null) => {
    if (date) {
      setAuftrag({
        ...auftrag,
        [field]: date.toISOString().split('T')[0]
      });
    }
  };

  // Auftrag speichern
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hier API-Aufruf implementieren
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Nach erfolgreichem Speichern zurück zur Auftragsliste navigieren
      // navigate('/auftraege');
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern des Auftrags');
      setLoading(false);
    }
  };

  // Auftrag bestätigen
  const handleBestaetigen = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hier API-Aufruf implementieren
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAuftrag({
        ...auftrag,
        status: AUFTRAG_STATUS.BESTAETIGT
      });
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Bestätigen des Auftrags');
      setLoading(false);
    }
  };

  // Lieferschein erstellen
  const handleLieferscheinErstellen = () => {
    // Hier zur Lieferschein-Erstellung navigieren
    // navigate('/lieferscheine/neu?auftragId=' + auftrag.id);
  };

  // Auftrag stornieren
  const handleStornieren = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hier API-Aufruf implementieren
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAuftrag({
        ...auftrag,
        status: AUFTRAG_STATUS.STORNIERT
      });
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Stornieren des Auftrags');
      setLoading(false);
    }
  };

  // Zurück zur Auftragsliste
  const handleBack = () => {
    // navigate('/auftraege');
  };

  // Aktionen für den Auftrag definieren
  const aktionen = getStandardAktionen(
    'auftrag',
    auftrag.status,
    {
      onSave: handleSave,
      onPrint: () => console.log('Auftrag drucken'),
      onEmail: () => console.log('Auftrag per E-Mail senden'),
      onSend: handleBestaetigen,
      onShip: handleLieferscheinErstellen,
      onCancel: handleStornieren
    },
    loading
  );

  return (
    <BelegFormBase
      title={auftrag.id ? `Auftrag ${auftrag.nummer}` : 'Neuer Auftrag'}
      belegData={auftrag}
      onSave={handleSave}
      onBack={handleBack}
      loading={loading}
      error={error || undefined}
    >
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center">
              {auftrag.status && (
                <StatusBadge
                  status={auftrag.status}
                  belegTyp="auftrag"
                  showLabel
                  style={{ marginRight: '16px' }}
                />
              )}
              {auftrag.angebotNummer && (
                <Typography variant="body2">
                  Basierend auf Angebot: <strong>{auftrag.angebotNummer}</strong>
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" justifyContent="flex-end">
              <BelegAktionenLeiste
                aktionen={aktionen}
                belegTyp="auftrag"
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
              <Typography variant="h6" sx={{ mb: 2 }}>Kundendaten</Typography>
              
              {!auftrag.id && (
                <Box sx={{ mb: 2 }}>
                  <Autocomplete
                    options={angebote}
                    getOptionLabel={(option) => `${option.nummer} - ${option.kunde.name}`}
                    onChange={(event, value) => handleAngebotAuswahl(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Angebot auswählen"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </Box>
              )}
              
              <Autocomplete
                options={kunden}
                getOptionLabel={(option) => option.name}
                value={selectedKunde}
                onChange={(event, value) => handleKundeAuswahl(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Kunde"
                    variant="outlined"
                    fullWidth
                    required
                  />
                )}
                disabled={loading || Boolean(auftrag.id)}
              />
              
              {selectedKunde && (
                <Box sx={{ mt: 2 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2">
                      <strong>Ansprechpartner:</strong> {selectedKunde.ansprechpartner}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Adresse:</strong> {selectedKunde.adresse}
                    </Typography>
                    {selectedKunde.telefon && (
                      <Typography variant="body2">
                        <strong>Telefon:</strong> {selectedKunde.telefon}
                      </Typography>
                    )}
                    {selectedKunde.email && (
                      <Typography variant="body2">
                        <strong>E-Mail:</strong> {selectedKunde.email}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>Auftragsdaten</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Auftragsart"
                    value={auftrag.auftragsart || ''}
                    onChange={handleTextChange('auftragsart')}
                    fullWidth
                    variant="outlined"
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                    <DatePicker
                      label="Auftragsdatum"
                      value={auftrag.auftragsdatum ? new Date(auftrag.auftragsdatum) : null}
                      onChange={handleDateChange('auftragsdatum')}
                      slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                      disabled={loading}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                    <DatePicker
                      label="Liefertermin"
                      value={auftrag.liefertermin ? new Date(auftrag.liefertermin) : null}
                      onChange={handleDateChange('liefertermin')}
                      slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                      disabled={loading}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Zahlungsbedingungen"
                    value={auftrag.zahlungsbedingungen || ''}
                    onChange={handleTextChange('zahlungsbedingungen')}
                    fullWidth
                    variant="outlined"
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Lieferadresse"
                    value={auftrag.lieferadresse || ''}
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
                    value={auftrag.bemerkungen || ''}
                    onChange={handleTextChange('bemerkungen')}
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    disabled={loading}
                    helperText="Diese Bemerkungen werden auf dem Auftrag angezeigt"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Interne Notizen"
                    value={auftrag.interne_notizen || ''}
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
            positionen={auftrag.positionen}
            onPositionenChange={handlePositionenChange}
            onArtikelSearch={(suchbegriff) => {
              // Hier API-Aufruf implementieren
              return new Promise(resolve => {
                setTimeout(() => {
                  resolve([
                    { id: 'A001', bezeichnung: 'Produkt A', einheit: 'Stk', preis: 100 },
                    { id: 'A002', bezeichnung: 'Produkt B', einheit: 'Kg', preis: 25 }
                  ]);
                }, 300);
              });
            }}
            onEinheitenSearch={(suchbegriff) => {
              return Promise.resolve(['Stk', 'Kg', 'l', 'm']);
            }}
            readOnly={loading || auftrag.status === AUFTRAG_STATUS.STORNIERT}
            showMwst={true}
            showRabatt={true}
            showSummary={true}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Alert severity="info">
            Dokumente-Funktion ist noch in Entwicklung.
          </Alert>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {auftrag.historie ? (
            <BelegHistorie
              eintraege={auftrag.historie}
              title="Auftragshistorie"
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

export default AuftragFormular; 