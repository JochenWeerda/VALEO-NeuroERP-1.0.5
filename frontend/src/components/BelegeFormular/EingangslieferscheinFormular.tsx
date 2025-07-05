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
import ChargenAuswahlDialog, { SelectedCharge } from './ChargenAuswahlDialog';

// Konstanten für Status und Tabs
const EINGANGSLIEFERSCHEIN_STATUS = {
  ENTWURF: 'entwurf',
  ERFASST: 'erfasst',
  GEPRUEFT: 'geprüft',
  EINGELAGERT: 'eingelagert',
  ZURUECKGEWIESEN: 'zurückgewiesen'
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
      id={`eingangslieferschein-tabpanel-${index}`}
      aria-labelledby={`eingangslieferschein-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

// Bestellungstyp für Referenz
interface Bestellung {
  id: string;
  nummer: string;
  lieferant: {
    id: string;
    name: string;
  };
  positionen: Position[];
  liefertermin?: string;
  status: string;
}

// Eingangslieferscheindaten
interface Eingangslieferschein {
  id?: string;
  nummer?: string;
  bestellungId?: string;
  bestellungNummer?: string;
  lieferant: {
    id: string;
    name: string;
    ansprechpartner?: string;
    adresse?: string;
  };
  eingangsdatum: string;
  lieferscheinNummer?: string;
  frachtfuehrer?: string;
  lagerort?: string;
  positionen: Position[];
  bemerkungen?: string;
  qualitaetspruefung?: {
    erforderlich: boolean;
    durchgefuehrt?: boolean;
    ergebnis?: 'bestanden' | 'mit_maengeln' | 'nicht_bestanden';
    bemerkungen?: string;
  };
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
}

const EingangslieferscheinFormular: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eingangslieferschein, setEingangslieferschein] = useState<Eingangslieferschein>({
    lieferant: { id: '', name: '' },
    eingangsdatum: new Date().toISOString().split('T')[0],
    positionen: [],
    status: EINGANGSLIEFERSCHEIN_STATUS.ENTWURF
  });
  const [lieferanten, setLieferanten] = useState<Lieferant[]>([]);
  const [selectedLieferant, setSelectedLieferant] = useState<Lieferant | null>(null);
  const [bestellungen, setBestellungen] = useState<Bestellung[]>([]);
  const [selectedBestellung, setSelectedBestellung] = useState<Bestellung | null>(null);
  const [showChargenDialog, setShowChargenDialog] = useState(false);
  const [selectedPositionIndex, setSelectedPositionIndex] = useState<number | null>(null);

  // Eingangslieferschein aus der API laden, wenn ID vorhanden
  useEffect(() => {
    if (id) {
      setLoading(true);
      // Hier API-Aufruf implementieren
      setTimeout(() => {
        // Beispieldaten für Demo-Zwecke
        setEingangslieferschein({
          id: '123',
          nummer: 'EL-2023-0001',
          bestellungId: '456',
          bestellungNummer: 'B-2023-0001',
          lieferant: { id: '789', name: 'Zulieferer GmbH', ansprechpartner: 'Max Mustermann', adresse: 'Zulieferweg 123, 12345 Zulieferstadt' },
          eingangsdatum: '2023-06-01',
          lieferscheinNummer: 'LS-789',
          frachtfuehrer: 'Spedition Schnell',
          lagerort: 'Hauptlager',
          positionen: [
            {
              id: '1',
              artikelId: 'A001',
              artikelBezeichnung: 'Rohstoff A',
              menge: 100,
              einheit: 'kg',
              einzelpreis: 12.5,
              mwstSatz: 19,
              gesamtpreis: 1250,
              chargennummern: ['CH-2023-001']
            }
          ],
          bemerkungen: 'Lieferung vollständig',
          qualitaetspruefung: {
            erforderlich: true,
            durchgefuehrt: true,
            ergebnis: 'bestanden',
            bemerkungen: 'Keine Mängel festgestellt'
          },
          status: EINGANGSLIEFERSCHEIN_STATUS.EINGELAGERT,
          gesamtsumme: 1487.5,
          historie: [
            {
              id: '1',
              datum: '2023-06-01T10:00:00',
              benutzer: 'admin',
              aktion: 'Eingangslieferschein erstellt',
              status: EINGANGSLIEFERSCHEIN_STATUS.ENTWURF,
              typ: 'info'
            },
            {
              id: '2',
              datum: '2023-06-01T11:30:00',
              benutzer: 'admin',
              aktion: 'Qualitätsprüfung durchgeführt',
              status: EINGANGSLIEFERSCHEIN_STATUS.GEPRUEFT,
              typ: 'info'
            },
            {
              id: '3',
              datum: '2023-06-01T14:30:00',
              benutzer: 'admin',
              aktion: 'Waren eingelagert',
              status: EINGANGSLIEFERSCHEIN_STATUS.EINGELAGERT,
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
          email: 'info@zulieferer.de'
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

  // Bestellungen laden, wenn Lieferant ausgewählt wird
  useEffect(() => {
    if (selectedLieferant) {
      // Hier API-Aufruf implementieren
      setTimeout(() => {
        setBestellungen([
          {
            id: '456',
            nummer: 'B-2023-0001',
            lieferant: selectedLieferant,
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
            liefertermin: '2023-06-15',
            status: 'bestaetigt'
          }
        ]);
      }, 500);
    }
  }, [selectedLieferant]);

  // Handler für Tab-Wechsel
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handler für Bestellung-Auswahl
  const handleBestellungAuswahl = (bestellung: Bestellung | null) => {
    if (bestellung) {
      setSelectedBestellung(bestellung);
      setEingangslieferschein({
        ...eingangslieferschein,
        bestellungId: bestellung.id,
        bestellungNummer: bestellung.nummer,
        lieferant: bestellung.lieferant,
        positionen: [...bestellung.positionen]
      });
      // Lieferant aus Bestellung setzen
      const lieferant = lieferanten.find(l => l.id === bestellung.lieferant.id);
      if (lieferant) {
        setSelectedLieferant(lieferant);
      }
    }
  };

  // Handler für Lieferanten-Auswahl
  const handleLieferantAuswahl = (lieferant: Lieferant | null) => {
    setSelectedLieferant(lieferant);
    if (lieferant) {
      setEingangslieferschein({
        ...eingangslieferschein,
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
    
    setEingangslieferschein({
      ...eingangslieferschein,
      positionen,
      gesamtsumme
    });
  };

  // Handler für Änderung von Textfeldern
  const handleTextChange = (field: keyof Eingangslieferschein) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setEingangslieferschein({
      ...eingangslieferschein,
      [field]: event.target.value
    });
  };

  // Handler für Datums-Änderungen
  const handleDateChange = (field: keyof Eingangslieferschein) => (date: Date | null) => {
    if (date) {
      setEingangslieferschein({
        ...eingangslieferschein,
        [field]: date.toISOString().split('T')[0]
      });
    }
  };

  // Handler für Qualitätsprüfung
  const handleQualitaetsChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setEingangslieferschein({
      ...eingangslieferschein,
      qualitaetspruefung: {
        ...eingangslieferschein.qualitaetspruefung,
        [field]: field === 'erforderlich' || field === 'durchgefuehrt' 
          ? event.target.checked 
          : event.target.value
      }
    });
  };

  // Chargen-Dialog öffnen
  const handleChargenDialog = (index: number) => {
    setSelectedPositionIndex(index);
    setShowChargenDialog(true);
  };

  // Chargen-Auswahl anwenden
  const handleApplyChargen = (selectedChargen: SelectedCharge[]) => {
    if (selectedPositionIndex !== null) {
      const newPositionen = [...eingangslieferschein.positionen];
      newPositionen[selectedPositionIndex] = {
        ...newPositionen[selectedPositionIndex],
        chargennummern: selectedChargen.map(c => c.chargennummer)
      };
      
      setEingangslieferschein({
        ...eingangslieferschein,
        positionen: newPositionen
      });
      
      setShowChargenDialog(false);
    }
  };

  // Eingangslieferschein speichern
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hier API-Aufruf implementieren
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Nach erfolgreichem Speichern zurück zur Eingangslieferscheinliste navigieren
      // navigate('/eingangslieferscheine');
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern des Eingangslieferscheins');
      setLoading(false);
    }
  };

  // Eingangslieferschein prüfen
  const handlePruefen = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hier API-Aufruf implementieren
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEingangslieferschein({
        ...eingangslieferschein,
        status: EINGANGSLIEFERSCHEIN_STATUS.GEPRUEFT,
        qualitaetspruefung: {
          ...eingangslieferschein.qualitaetspruefung,
          durchgefuehrt: true
        }
      });
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Prüfen des Eingangslieferscheins');
      setLoading(false);
    }
  };

  // Waren einlagern
  const handleEinlagern = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hier API-Aufruf implementieren
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEingangslieferschein({
        ...eingangslieferschein,
        status: EINGANGSLIEFERSCHEIN_STATUS.EINGELAGERT
      });
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Einlagern der Waren');
      setLoading(false);
    }
  };

  // Eingangslieferschein zurückweisen
  const handleZurueckweisen = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hier API-Aufruf implementieren
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEingangslieferschein({
        ...eingangslieferschein,
        status: EINGANGSLIEFERSCHEIN_STATUS.ZURUECKGEWIESEN
      });
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Zurückweisen des Eingangslieferscheins');
      setLoading(false);
    }
  };

  // Zurück zur Eingangslieferscheinliste
  const handleBack = () => {
    // navigate('/eingangslieferscheine');
  };

  // Aktionen für den Eingangslieferschein definieren
  const aktionen = getStandardAktionen(
    'eingangslieferschein',
    eingangslieferschein.status,
    {
      onSave: handleSave,
      onPrint: () => console.log('Eingangslieferschein drucken'),
      onAccept: handlePruefen,
      onReject: handleZurueckweisen,
      onDelivery: handleEinlagern
    },
    loading
  );

  return (
    <BelegFormBase
      title={eingangslieferschein.id ? `Eingangslieferschein ${eingangslieferschein.nummer}` : 'Neuer Eingangslieferschein'}
      belegData={eingangslieferschein}
      onSave={handleSave}
      onBack={handleBack}
      loading={loading}
      error={error || undefined}
    >
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center">
              {eingangslieferschein.status && (
                <StatusBadge
                  status={eingangslieferschein.status}
                  belegTyp="eingangslieferschein"
                  showLabel
                  style={{ marginRight: '16px' }}
                />
              )}
              {eingangslieferschein.bestellungNummer && (
                <Typography variant="body2">
                  Basierend auf Bestellung: <strong>{eingangslieferschein.bestellungNummer}</strong>
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" justifyContent="flex-end">
              <BelegAktionenLeiste
                aktionen={aktionen}
                belegTyp="eingangslieferschein"
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
          <Tab label="Qualitätsprüfung" />
          <Tab label="Historie" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>Lieferantendaten</Typography>
              
              {!eingangslieferschein.id && (
                <Box sx={{ mb: 2 }}>
                  <Autocomplete
                    options={bestellungen}
                    getOptionLabel={(option) => `${option.nummer} - ${option.lieferant.name}`}
                    onChange={(event, value) => handleBestellungAuswahl(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Bestellung auswählen"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </Box>
              )}
              
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
                disabled={loading || Boolean(eingangslieferschein.id)}
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
                  </Paper>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>Eingangslieferscheindaten</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                    <DatePicker
                      label="Eingangsdatum"
                      value={eingangslieferschein.eingangsdatum ? new Date(eingangslieferschein.eingangsdatum) : null}
                      onChange={handleDateChange('eingangsdatum')}
                      slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                      disabled={loading}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Lieferscheinnummer"
                    value={eingangslieferschein.lieferscheinNummer || ''}
                    onChange={handleTextChange('lieferscheinNummer')}
                    fullWidth
                    variant="outlined"
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Frachtführer"
                    value={eingangslieferschein.frachtfuehrer || ''}
                    onChange={handleTextChange('frachtfuehrer')}
                    fullWidth
                    variant="outlined"
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Lagerort"
                    value={eingangslieferschein.lagerort || ''}
                    onChange={handleTextChange('lagerort')}
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
                value={eingangslieferschein.bemerkungen || ''}
                onChange={handleTextChange('bemerkungen')}
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                disabled={loading}
                helperText="Bemerkungen zum Wareneingang"
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <PositionenTabelle
            positionen={eingangslieferschein.positionen}
            onPositionenChange={handlePositionenChange}
            extraFields={[
              { name: 'chargennummern', label: 'Chargen', type: 'text' },
              { name: 'mhd', label: 'MHD', type: 'date' },
              { name: 'lagerplatz', label: 'Lagerplatz', type: 'text' }
            ]}
            readOnly={loading || eingangslieferschein.status === EINGANGSLIEFERSCHEIN_STATUS.EINGELAGERT || eingangslieferschein.status === EINGANGSLIEFERSCHEIN_STATUS.ZURUECKGEWIESEN}
            showMwst={true}
            showRabatt={false}
            showSummary={true}
          />

          {showChargenDialog && selectedPositionIndex !== null && (
            <ChargenAuswahlDialog
              open={showChargenDialog}
              onClose={() => setShowChargenDialog(false)}
              onApply={handleApplyChargen}
              position={eingangslieferschein.positionen[selectedPositionIndex]}
              chargen={[
                { chargennummer: 'CH-2023-001', menge: 100, mhd: '2024-06-01', lagerplatz: 'Hauptlager', einlagerungsdatum: '2023-06-01' }
              ]}
              title="Chargen für Wareneingang erfassen"
              buchungsregel="FIFO"
              istEinlagerung={true}
            />
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Qualitätsprüfung</Typography>
              
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Qualitätsprüfung erforderlich"
                      value={eingangslieferschein.qualitaetspruefung?.erforderlich ? 'Ja' : 'Nein'}
                      fullWidth
                      variant="outlined"
                      disabled={true}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Qualitätsprüfung durchgeführt"
                      value={eingangslieferschein.qualitaetspruefung?.durchgefuehrt ? 'Ja' : 'Nein'}
                      fullWidth
                      variant="outlined"
                      disabled={true}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Ergebnis"
                      value={eingangslieferschein.qualitaetspruefung?.ergebnis === 'bestanden' ? 'Bestanden' :
                             eingangslieferschein.qualitaetspruefung?.ergebnis === 'mit_maengeln' ? 'Mit Mängeln' :
                             eingangslieferschein.qualitaetspruefung?.ergebnis === 'nicht_bestanden' ? 'Nicht bestanden' : '-'}
                      fullWidth
                      variant="outlined"
                      disabled={true}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Bemerkungen zur Qualitätsprüfung"
                      value={eingangslieferschein.qualitaetspruefung?.bemerkungen || ''}
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={4}
                      disabled={loading || eingangslieferschein.status === EINGANGSLIEFERSCHEIN_STATUS.EINGELAGERT || eingangslieferschein.status === EINGANGSLIEFERSCHEIN_STATUS.ZURUECKGEWIESEN}
                      onChange={(e) => {
                        setEingangslieferschein({
                          ...eingangslieferschein,
                          qualitaetspruefung: {
                            ...eingangslieferschein.qualitaetspruefung,
                            bemerkungen: e.target.value
                          }
                        });
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {eingangslieferschein.historie ? (
            <BelegHistorie
              eintraege={eingangslieferschein.historie}
              title="Eingangslieferscheinhistorie"
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

export default EingangslieferscheinFormular; 