import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Paper,
  Typography,
  Autocomplete,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { de } from 'date-fns/locale';

import BelegFormBase from './BelegFormBase';
import PositionenTabelle, { Position } from './PositionenTabelle';
import StatusBadge from './StatusBadge';
import BelegHistorie, { HistorienEintrag } from './BelegHistorie';
import BelegAktionenLeiste, { getStandardAktionen } from './BelegAktionenLeiste';
import belegeApi, { Angebot } from '../../services/belegeApi';
import BelegAssistent from './BelegAssistent';

// Mock API für Kundensuche
const kundenSuche = async (suchbegriff: string) => {
  // In einer realen Implementierung würde dies eine API-Anfrage sein
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: '1', name: 'Mustermann GmbH', ansprechpartner: 'Max Mustermann', adresse: 'Musterstraße 1, 12345 Musterstadt' },
    { id: '2', name: 'Beispiel AG', ansprechpartner: 'Erika Beispiel', adresse: 'Beispielweg 2, 54321 Beispielstadt' },
    { id: '3', name: 'Test KG', ansprechpartner: 'Thomas Test', adresse: 'Testplatz 3, 67890 Teststadt' }
  ].filter(k => k.name.toLowerCase().includes(suchbegriff.toLowerCase()));
};

// Mock API für Artikelsuche
const artikelSuche = async (suchbegriff: string) => {
  // In einer realen Implementierung würde dies eine API-Anfrage sein
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: '1', bezeichnung: 'Produkt A', beschreibung: 'Beschreibung von Produkt A', standardpreis: 100, einheit: 'Stk' },
    { id: '2', bezeichnung: 'Produkt B', beschreibung: 'Beschreibung von Produkt B', standardpreis: 200, einheit: 'kg' },
    { id: '3', bezeichnung: 'Produkt C', beschreibung: 'Beschreibung von Produkt C', standardpreis: 300, einheit: 'l' }
  ].filter(a => a.bezeichnung.toLowerCase().includes(suchbegriff.toLowerCase()));
};

// Mock API für Einheitensuche
const einheitenSuche = async (suchbegriff: string) => {
  // In einer realen Implementierung würde dies eine API-Anfrage sein
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { code: 'Stk', bezeichnung: 'Stück' },
    { code: 'kg', bezeichnung: 'Kilogramm' },
    { code: 'l', bezeichnung: 'Liter' },
    { code: 'm', bezeichnung: 'Meter' }
  ];
};

interface AngebotFormularProps {
  id?: string;
  onSave?: (angebot: Angebot) => void;
  readOnly?: boolean;
}

const AngebotFormular: React.FC<AngebotFormularProps> = ({
  id,
  onSave,
  readOnly = false
}) => {
  const { id: urlId } = useParams<{ id: string }>();
  const angebotId = id || urlId;
  const isNew = !angebotId;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [kundenSucheLoading, setKundenSucheLoading] = useState(false);
  const [kundenOptions, setKundenOptions] = useState<any[]>([]);
  const [kundenSuchtext, setKundenSuchtext] = useState('');
  const [ausgewaehlterKunde, setAusgewaehlterKunde] = useState<any | null>(null);
  const [historieEintraege, setHistorieEintraege] = useState<HistorienEintrag[]>([]);

  const initialAngebot: Angebot = {
    kundenId: '',
    betreff: '',
    erstellDatum: new Date().toISOString(),
    gueltigBis: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 Tage gültig
    status: 'entwurf',
    positionen: [],
    waehrung: 'EUR'
  };

  const [angebot, setAngebot] = useState<Angebot>(initialAngebot);

  // Angebot laden, wenn ID vorhanden
  useEffect(() => {
    if (angebotId && !isNew) {
      setLoading(true);
      belegeApi.getAngebot(angebotId)
        .then(data => {
          setAngebot(data);
          // Kunde laden
          return kundenSuche('');
        })
        .then(kunden => {
          const kunde = kunden.find(k => k.id === angebot.kundenId);
          if (kunde) {
            setAusgewaehlterKunde(kunde);
          }
          // Historie laden (in einer realen Implementierung würde dies eine separate API-Anfrage sein)
          setHistorieEintraege([
            {
              id: '1',
              datum: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              benutzer: 'Max Mustermann',
              aktion: 'Angebot erstellt',
              status: 'entwurf',
              typ: 'info'
            },
            {
              id: '2',
              datum: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              benutzer: 'Erika Beispiel',
              aktion: 'Angebot bearbeitet',
              details: 'Positionen hinzugefügt und Betreff geändert',
              status: 'entwurf',
              typ: 'info'
            }
          ]);
        })
        .catch(err => {
          setError('Fehler beim Laden des Angebots: ' + err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [angebotId, isNew]);

  // Kundensuche, wenn sich der Suchtext ändert
  useEffect(() => {
    if (kundenSuchtext) {
      setKundenSucheLoading(true);
      const timeoutId = setTimeout(() => {
        kundenSuche(kundenSuchtext)
          .then(ergebnisse => {
            setKundenOptions(ergebnisse);
          })
          .catch(err => {
            console.error('Fehler bei der Kundensuche:', err);
          })
          .finally(() => {
            setKundenSucheLoading(false);
          });
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setKundenOptions([]);
    }
  }, [kundenSuchtext]);

  // Angebot speichern
  const handleSave = async () => {
    if (readOnly) return;
    
    setSaving(true);
    setError(null);
    try {
      let savedAngebot;
      if (isNew) {
        savedAngebot = await belegeApi.createAngebot(angebot);
        setSuccess('Angebot erfolgreich erstellt');
      } else {
        savedAngebot = await belegeApi.updateAngebot(angebotId, angebot);
        setSuccess('Angebot erfolgreich aktualisiert');
      }
      
      setAngebot(savedAngebot);
      
      if (onSave) {
        onSave(savedAngebot);
      }
      
      // Wenn es ein neues Angebot war, zur Bearbeitungsseite navigieren
      if (isNew) {
        navigate(`/angebote/${savedAngebot.id}`);
      }
      
      // Neuen Historieneintrag hinzufügen
      const neuerEintrag: HistorienEintrag = {
        id: new Date().getTime().toString(),
        datum: new Date().toISOString(),
        benutzer: 'Aktueller Benutzer', // In einer realen Implementierung würde dies der aktuelle Benutzer sein
        aktion: isNew ? 'Angebot erstellt' : 'Angebot aktualisiert',
        status: angebot.status,
        typ: 'success'
      };
      setHistorieEintraege([neuerEintrag, ...historieEintraege]);
      
    } catch (err: any) {
      setError('Fehler beim Speichern: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Angebot versenden
  const handleSend = async () => {
    if (readOnly) return;
    
    // Zuerst speichern
    await handleSave();
    
    // Status auf "gesendet" setzen
    const updatedAngebot = { ...angebot, status: 'gesendet' };
    
    try {
      const savedAngebot = await belegeApi.updateAngebot(angebotId || updatedAngebot.id!, updatedAngebot);
      setAngebot(savedAngebot);
      setSuccess('Angebot erfolgreich versendet');
      
      // Neuen Historieneintrag hinzufügen
      const neuerEintrag: HistorienEintrag = {
        id: new Date().getTime().toString(),
        datum: new Date().toISOString(),
        benutzer: 'Aktueller Benutzer',
        aktion: 'Angebot versendet',
        status: 'gesendet',
        typ: 'info'
      };
      setHistorieEintraege([neuerEintrag, ...historieEintraege]);
      
    } catch (err: any) {
      setError('Fehler beim Versenden: ' + err.message);
    }
  };

  // Angebot drucken
  const handlePrint = () => {
    window.print();
  };

  // Angebot per E-Mail senden
  const handleEmail = () => {
    // In einer realen Implementierung würde hier ein E-Mail-Dialog geöffnet werden
    alert('E-Mail-Funktion in dieser Demo nicht implementiert');
  };

  // Angebot löschen
  const handleDelete = async () => {
    if (window.confirm('Sind Sie sicher, dass Sie dieses Angebot löschen möchten?')) {
      try {
        await belegeApi.deleteAngebot(angebotId!);
        navigate('/angebote');
        setSuccess('Angebot erfolgreich gelöscht');
      } catch (err: any) {
        setError('Fehler beim Löschen: ' + err.message);
      }
    }
  };

  // Zurück zur Übersicht
  const handleBack = () => {
    navigate('/angebote');
  };

  // Handler zum Laden des Angebots
  const handleAngebotChange = (field: string, value: any) => {
    setAngebot(prev => ({ ...prev, [field]: value }));
  };
  
  // Handler zum Aktualisieren der Positionen
  const handlePositionenChange = (positionen: Position[]) => {
    setAngebot(prev => ({ ...prev, positionen }));
  };
  
  // Handler für Kundenwechsel
  const handleKundenChange = (kunde: any) => {
    if (kunde) {
      setAngebot(prev => ({ ...prev, kundenId: kunde.id }));
      setAusgewaehlterKunde(kunde);
    } else {
      setAngebot(prev => ({ ...prev, kundenId: '' }));
      setAusgewaehlterKunde(null);
    }
  };

  // Erstellen von Standard-Aktionen für die Aktionsleiste
  const aktionen = getStandardAktionen(
    'angebot',
    angebot.status,
    {
      onSave: handleSave,
      onSend: handleSend,
      onPrint: handlePrint,
      onEmail: handleEmail,
      onDelete: isNew ? undefined : handleDelete,
      onClose: handleBack
    },
    readOnly
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <BelegFormBase
      title={isNew ? 'Neues Angebot erstellen' : `Angebot ${angebotId}`}
      belegData={angebot}
      onSave={handleSave}
      onBack={handleBack}
      onPrint={handlePrint}
      onEmail={handleEmail}
      loading={loading}
      error={error}
      readOnly={readOnly}
    >
      {angebot.status && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <StatusBadge status={angebot.status} />
          <BelegAktionenLeiste
            belegTyp="angebot"
            status={angebot.status}
            aktionen={aktionen.concat([
              {
                label: 'Als Auftrag übernehmen',
                onClick: () => console.log('Als Auftrag übernehmen'),
                color: 'success',
                icon: 'convert',
                visible: angebot.status === 'gesendet' || angebot.status === 'akzeptiert'
              }
            ])}
          />
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Allgemein" />
          <Tab label="Positionen" />
          <Tab label="Historie" />
          <Tab label="Dokumente" />
        </Tabs>
      </Box>

      {/* KI-Assistent Komponente */}
      <BelegAssistent 
        belegTyp="angebot" 
        belegDaten={angebot}
        onApplyPreisvorschlag={(artikelId, neuerPreis, rabatt) => {
          // Implementiere Preisvorschlag-Übernahme
          const neuePositionen = angebot.positionen.map(pos => {
            if (pos.artikelId === artikelId) {
              return {
                ...pos,
                einzelpreis: neuerPreis,
                rabattProzent: rabatt || pos.rabattProzent
              };
            }
            return pos;
          });
          
          handlePositionenChange(neuePositionen);
          setSuccess('Preisvorschlag übernommen');
        }}
      />

      {activeTab === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Angebotsdetails
                </Typography>
                <Grid container spacing={2}>
                  {angebot.nummer && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Angebotsnummer"
                        fullWidth
                        value={angebot.nummer}
                        InputProps={{
                          readOnly: true
                        }}
                      />
                    </Grid>
                  )}
                  
                  <Grid item xs={12} sm={6}>
                    <StatusBadge
                      status={angebot.status}
                      belegTyp="angebot"
                      showLabel
                      style={{ marginTop: 16 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Betreff"
                      fullWidth
                      required
                      value={angebot.betreff}
                      onChange={e => handleAngebotChange('betreff', e.target.value)}
                      disabled={readOnly}
                      error={!angebot.betreff}
                      helperText={!angebot.betreff ? 'Betreff ist erforderlich' : ''}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                      <DatePicker
                        label="Erstelldatum"
                        value={new Date(angebot.erstellDatum)}
                        onChange={date => handleAngebotChange('erstellDatum', date ? date.toISOString() : null)}
                        disabled={readOnly}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                      <DatePicker
                        label="Gültig bis"
                        value={new Date(angebot.gueltigBis)}
                        onChange={date => handleAngebotChange('gueltigBis', date ? date.toISOString() : null)}
                        disabled={readOnly}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Währung"
                      fullWidth
                      value={angebot.waehrung || 'EUR'}
                      onChange={e => handleAngebotChange('waehrung', e.target.value)}
                      disabled={readOnly}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Rabatt (%)"
                      fullWidth
                      type="number"
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                      value={angebot.rabatt || 0}
                      onChange={e => handleAngebotChange('rabatt', parseFloat(e.target.value) || 0)}
                      disabled={readOnly}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Kundeninformationen
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={kundenOptions}
                      getOptionLabel={(option) => option.name}
                      loading={kundenSucheLoading}
                      value={ausgewaehlterKunde}
                      onChange={(_, value) => handleKundenChange(value)}
                      onInputChange={(_, value) => setKundenSuchtext(value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Kunde"
                          required
                          fullWidth
                          error={!angebot.kundenId}
                          helperText={!angebot.kundenId ? 'Kunde ist erforderlich' : ''}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {kundenSucheLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      disabled={readOnly}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Ansprechpartner"
                      fullWidth
                      value={angebot.kundenAnsprechpartner || ''}
                      onChange={e => handleAngebotChange('kundenAnsprechpartner', e.target.value)}
                      disabled={readOnly}
                    />
                  </Grid>
                  
                  {ausgewaehlterKunde && (
                    <Grid item xs={12}>
                      <TextField
                        label="Adresse"
                        fullWidth
                        multiline
                        rows={2}
                        value={ausgewaehlterKunde.adresse || ''}
                        InputProps={{
                          readOnly: true
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
            
            <Box mt={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Konditionen
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Zahlungsbedingungen"
                        fullWidth
                        multiline
                        rows={2}
                        value={angebot.zahlungsbedingungen || ''}
                        onChange={e => handleAngebotChange('zahlungsbedingungen', e.target.value)}
                        disabled={readOnly}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Lieferbedingungen"
                        fullWidth
                        multiline
                        rows={2}
                        value={angebot.lieferbedingungen || ''}
                        onChange={e => handleAngebotChange('lieferbedingungen', e.target.value)}
                        disabled={readOnly}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          
          {angebot.kundenAffinitaet !== undefined && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    KI-Analysen
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Kundenaffinität</Typography>
                      <Typography variant="body1">{angebot.kundenAffinitaet}/100</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Optimierte Preise</Typography>
                      <Typography variant="body1">{angebot.optimiertePreise ? 'Ja' : 'Nein'}</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Saisonale Anpassung</Typography>
                      <Typography variant="body1">{angebot.saisonaleAnpassung ? 'Ja' : 'Nein'}</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Marktpreisvergleich</Typography>
                      <Typography variant="body1">{angebot.marktpreisVergleich !== undefined ? `${angebot.marktpreisVergleich}%` : '-'}</Typography>
                    </Grid>
                    
                    {angebot.preisOptimierungsBasis && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Basis für Preisoptimierung</Typography>
                        <Typography variant="body1">{angebot.preisOptimierungsBasis}</Typography>
                      </Grid>
                    )}
                    
                    {angebot.vorgeschlageneAlternativen && angebot.vorgeschlageneAlternativen.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Vorgeschlagene Alternativen</Typography>
                        <ul>
                          {angebot.vorgeschlageneAlternativen.map((alternative, index) => (
                            <li key={index}>{alternative}</li>
                          ))}
                        </ul>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {activeTab === 1 && (
        <PositionenTabelle
          positionen={angebot.positionen}
          onPositionenChange={handlePositionenChange}
          onArtikelSearch={artikelSuche}
          onEinheitenSearch={einheitenSuche}
          readOnly={readOnly}
        />
      )}

      {activeTab === 2 && (
        <BelegHistorie
          eintraege={historieEintraege}
          showAll
        />
      )}
    </BelegFormBase>

    <Snackbar
      open={!!success}
      autoHideDuration={6000}
      onClose={() => setSuccess(null)}
    >
      <Alert onClose={() => setSuccess(null)} severity="success">
        {success}
      </Alert>
    </Snackbar>
  );
};

export default AngebotFormular; 