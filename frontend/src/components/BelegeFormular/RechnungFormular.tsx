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
const RECHNUNG_STATUS = {
  ENTWURF: 'entwurf',
  GESENDET: 'gesendet',
  TEILWEISE_BEZAHLT: 'teilweise_bezahlt',
  BEZAHLT: 'bezahlt',
  UEBERFAELLIG: 'überfällig',
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
      id={`rechnung-tabpanel-${index}`}
      aria-labelledby={`rechnung-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

// Lieferscheintyp für Referenz
interface Lieferschein {
  id: string;
  nummer: string;
  kunde: {
    id: string;
    name: string;
  };
  positionen: Position[];
  datum: string;
  status: string;
}

// Rechnungsdaten
interface Rechnung {
  id?: string;
  nummer?: string;
  lieferscheinId?: string;
  lieferscheinNummer?: string;
  kunde: {
    id: string;
    name: string;
    ansprechpartner?: string;
    adresse?: string;
  };
  rechnungsdatum: string;
  faelligkeitsDatum?: string;
  zahlungsbedingungen?: string;
  bankverbindung?: string;
  ust_id?: string;
  positionen: Position[];
  bemerkungen?: string;
  zahlungsart?: string;
  skonto?: {
    prozent: number;
    tage: number;
  };
  status: string;
  gesamtsumme?: number;
  zahlungen?: Array<{
    datum: string;
    betrag: number;
    zahlungsart: string;
    referenz?: string;
  }>;
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
  ust_id?: string;
}

const RechnungFormular: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rechnung, setRechnung] = useState<Rechnung>({
    kunde: { id: '', name: '' },
    rechnungsdatum: new Date().toISOString().split('T')[0],
    positionen: [],
    status: RECHNUNG_STATUS.ENTWURF
  });
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [selectedKunde, setSelectedKunde] = useState<Kunde | null>(null);
  const [lieferscheine, setLieferscheine] = useState<Lieferschein[]>([]);
  const [selectedLieferschein, setSelectedLieferschein] = useState<Lieferschein | null>(null);

  // Rechnung aus der API laden, wenn ID vorhanden
  useEffect(() => {
    if (id) {
      setLoading(true);
      // Hier API-Aufruf implementieren
      setTimeout(() => {
        // Beispieldaten für Demo-Zwecke
        setRechnung({
          id: '123',
          nummer: 'R-2023-0001',
          lieferscheinId: '456',
          lieferscheinNummer: 'L-2023-0001',
          kunde: { id: '789', name: 'Musterfirma GmbH', ansprechpartner: 'Max Mustermann', adresse: 'Musterstraße 123, 12345 Musterstadt' },
          rechnungsdatum: '2023-06-01',
          faelligkeitsDatum: '2023-07-01',
          zahlungsbedingungen: '30 Tage netto',
          bankverbindung: 'DE12 3456 7890 1234 5678 90, BIC: ABCDEFGH123',
          ust_id: 'DE123456789',
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
          bemerkungen: 'Zahlbar innerhalb von 30 Tagen ohne Abzug',
          zahlungsart: 'Überweisung',
          skonto: {
            prozent: 2,
            tage: 14
          },
          status: RECHNUNG_STATUS.GESENDET,
          gesamtsumme: 1190,
          zahlungen: [],
          historie: [
            {
              id: '1',
              datum: '2023-06-01T10:00:00',
              benutzer: 'admin',
              aktion: 'Rechnung erstellt',
              status: RECHNUNG_STATUS.ENTWURF,
              typ: 'info'
            },
            {
              id: '2',
              datum: '2023-06-01T14:30:00',
              benutzer: 'admin',
              aktion: 'Rechnung gesendet',
              status: RECHNUNG_STATUS.GESENDET,
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
          email: 'info@musterfirma.de',
          ust_id: 'DE123456789'
        });
        setLoading(false);
      }, 1000);
    }
  }, [id]);

  // Handler für Tab-Wechsel
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handler für Lieferschein-Auswahl
  const handleLieferscheinAuswahl = (lieferschein: Lieferschein | null) => {
    if (lieferschein) {
      setSelectedLieferschein(lieferschein);
      setRechnung({
        ...rechnung,
        lieferscheinId: lieferschein.id,
        lieferscheinNummer: lieferschein.nummer,
        kunde: lieferschein.kunde,
        positionen: [...lieferschein.positionen]
      });
      // Kunde aus Lieferschein setzen
      const kunde = kunden.find(k => k.id === lieferschein.kunde.id);
      if (kunde) {
        setSelectedKunde(kunde);
      }
    }
  };

  // Handler für Änderungen an den Positionen
  const handlePositionenChange = (positionen: Position[]) => {
    // Gesamtsumme berechnen
    const gesamtsumme = positionen.reduce((sum, pos) => sum + (pos.gesamtpreis || 0), 0);
    
    setRechnung({
      ...rechnung,
      positionen,
      gesamtsumme
    });
  };

  // Handler für Änderung von Textfeldern
  const handleTextChange = (field: keyof Rechnung) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setRechnung({
      ...rechnung,
      [field]: event.target.value
    });
  };

  // Handler für Datums-Änderungen
  const handleDateChange = (field: keyof Rechnung) => (date: Date | null) => {
    if (date) {
      setRechnung({
        ...rechnung,
        [field]: date.toISOString().split('T')[0]
      });
    }
  };

  // Rechnung speichern
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hier API-Aufruf implementieren
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Nach erfolgreichem Speichern zurück zur Rechnungsliste navigieren
      // navigate('/rechnungen');
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern der Rechnung');
      setLoading(false);
    }
  };

  // Rechnung senden
  const handleSend = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hier API-Aufruf implementieren
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRechnung({
        ...rechnung,
        status: RECHNUNG_STATUS.GESENDET
      });
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Senden der Rechnung');
      setLoading(false);
    }
  };

  // Rechnung als bezahlt markieren
  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hier API-Aufruf implementieren
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRechnung({
        ...rechnung,
        status: RECHNUNG_STATUS.BEZAHLT,
        zahlungen: [
          ...(rechnung.zahlungen || []),
          {
            datum: new Date().toISOString().split('T')[0],
            betrag: rechnung.gesamtsumme || 0,
            zahlungsart: 'Überweisung',
            referenz: 'Manuell erfasst'
          }
        ]
      });
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Erfassen der Zahlung');
      setLoading(false);
    }
  };

  // Rechnung stornieren
  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hier API-Aufruf implementieren
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRechnung({
        ...rechnung,
        status: RECHNUNG_STATUS.STORNIERT
      });
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Stornieren der Rechnung');
      setLoading(false);
    }
  };

  // Zurück zur Rechnungsliste
  const handleBack = () => {
    // navigate('/rechnungen');
  };

  // Aktionen für die Rechnung definieren
  const aktionen = getStandardAktionen(
    'rechnung',
    rechnung.status,
    {
      onSave: handleSave,
      onPrint: () => console.log('Rechnung drucken'),
      onEmail: () => console.log('Rechnung per E-Mail senden'),
      onSend: handleSend,
      onPay: handlePayment,
      onCancel: handleCancel
    },
    loading
  );

  return (
    <BelegFormBase
      title={rechnung.id ? `Rechnung ${rechnung.nummer}` : 'Neue Rechnung'}
      belegData={rechnung}
      onSave={handleSave}
      onBack={handleBack}
      loading={loading}
      error={error || undefined}
    >
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center">
              {rechnung.status && (
                <StatusBadge
                  status={rechnung.status}
                  belegTyp="rechnung"
                  showLabel
                  style={{ marginRight: '16px' }}
                />
              )}
              {rechnung.lieferscheinNummer && (
                <Typography variant="body2">
                  Basierend auf Lieferschein: <strong>{rechnung.lieferscheinNummer}</strong>
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" justifyContent="flex-end">
              <BelegAktionenLeiste
                aktionen={aktionen}
                belegTyp="rechnung"
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
          <Tab label="Zahlungen" />
          <Tab label="Historie" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>Kundendaten</Typography>
              
              {!rechnung.id && (
                <Box sx={{ mb: 2 }}>
                  <Autocomplete
                    options={lieferscheine}
                    getOptionLabel={(option) => `${option.nummer} - ${option.kunde.name}`}
                    onChange={(event, value) => handleLieferscheinAuswahl(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Lieferschein auswählen"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </Box>
              )}
              
              {selectedKunde && (
                <Box>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2">{selectedKunde.name}</Typography>
                    {selectedKunde.ansprechpartner && (
                      <Typography variant="body2">
                        <strong>Ansprechpartner:</strong> {selectedKunde.ansprechpartner}
                      </Typography>
                    )}
                    {selectedKunde.adresse && (
                      <Typography variant="body2">
                        <strong>Adresse:</strong> {selectedKunde.adresse}
                      </Typography>
                    )}
                    {selectedKunde.ust_id && (
                      <Typography variant="body2">
                        <strong>USt-ID:</strong> {selectedKunde.ust_id}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>Rechnungsdaten</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                    <DatePicker
                      label="Rechnungsdatum"
                      value={rechnung.rechnungsdatum ? new Date(rechnung.rechnungsdatum) : null}
                      onChange={handleDateChange('rechnungsdatum')}
                      slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                      disabled={loading}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                    <DatePicker
                      label="Fälligkeitsdatum"
                      value={rechnung.faelligkeitsDatum ? new Date(rechnung.faelligkeitsDatum) : null}
                      onChange={handleDateChange('faelligkeitsDatum')}
                      slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                      disabled={loading}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Zahlungsbedingungen"
                    value={rechnung.zahlungsbedingungen || ''}
                    onChange={handleTextChange('zahlungsbedingungen')}
                    fullWidth
                    variant="outlined"
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Zahlungsart"
                    value={rechnung.zahlungsart || ''}
                    onChange={handleTextChange('zahlungsart')}
                    fullWidth
                    variant="outlined"
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Bankverbindung"
                    value={rechnung.bankverbindung || ''}
                    onChange={handleTextChange('bankverbindung')}
                    fullWidth
                    variant="outlined"
                    disabled={loading}
                  />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              
              <TextField
                label="Bemerkungen"
                value={rechnung.bemerkungen || ''}
                onChange={handleTextChange('bemerkungen')}
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                disabled={loading}
                helperText="Diese Bemerkungen werden auf der Rechnung angezeigt"
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <PositionenTabelle
            positionen={rechnung.positionen}
            onPositionenChange={handlePositionenChange}
            readOnly={loading || rechnung.status === RECHNUNG_STATUS.STORNIERT || rechnung.status === RECHNUNG_STATUS.BEZAHLT}
            showMwst={true}
            showRabatt={true}
            showSummary={true}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {rechnung.zahlungen && rechnung.zahlungen.length > 0 ? (
            <Paper>
              <Box p={2}>
                <Typography variant="h6" gutterBottom>Zahlungsinformationen</Typography>
                {rechnung.zahlungen.map((zahlung, index) => (
                  <Box key={index} mb={2} p={2} border={1} borderColor="divider" borderRadius={1}>
                    <Typography variant="subtitle1">Zahlung vom {new Date(zahlung.datum).toLocaleDateString('de-DE')}</Typography>
                    <Typography>Betrag: {zahlung.betrag.toFixed(2)} €</Typography>
                    <Typography>Zahlungsart: {zahlung.zahlungsart}</Typography>
                    {zahlung.referenz && <Typography>Referenz: {zahlung.referenz}</Typography>}
                  </Box>
                ))}
              </Box>
            </Paper>
          ) : (
            <Alert severity="info">
              Keine Zahlungen erfasst.
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {rechnung.historie ? (
            <BelegHistorie
              eintraege={rechnung.historie}
              title="Rechnungshistorie"
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

export default RechnungFormular; 