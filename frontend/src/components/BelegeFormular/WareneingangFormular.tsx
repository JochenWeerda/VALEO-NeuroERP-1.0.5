import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  IconButton,
  Dialog,
  DialogContent,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Print as PrintIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

import BelegFormBase from './BelegFormBase';
import PositionenTabelle from './PositionenTabelle';
import StatusBadge from './StatusBadge';
import BelegHistorie from './BelegHistorie';
import BelegAktionenLeiste from './BelegAktionenLeiste';
import ChargenAuswahlDialog from './ChargenAuswahlDialog';
import WareneingangScanner from './WareneingangScanner';
import { ChargeDetails } from '../../services/chargenService';

// Dummy-Daten für Wareneingang
const defaultWareneingang = {
  id: '',
  nummer: '',
  datum: new Date().toISOString().split('T')[0],
  lieferant_id: '',
  lieferant_name: '',
  lieferschein_nummer: '',
  lieferschein_datum: '',
  bestell_referenz: '',
  status: 'entwurf',
  notiz: '',
  positionen: [] as any[],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Dummy-Daten für Lieferanten
const lieferanten = [
  { id: '1', name: 'Agrar GmbH' },
  { id: '2', name: 'Futtermittel Müller' },
  { id: '3', name: 'Saatgut Schmidt' }
];

// Dummy-Daten für Artikel
const artikel = [
  { id: '1', name: 'Weizenschrot Premium', einheit: 'kg', chargenpflichtig: true },
  { id: '2', name: 'Maismehl', einheit: 'kg', chargenpflichtig: true },
  { id: '3', name: 'Mineralfutter Rind', einheit: 'kg', chargenpflichtig: true },
  { id: '4', name: 'Schweinefutter Standard', einheit: 'kg', chargenpflichtig: false }
];

interface Position {
  id: string;
  artikel_id: string;
  artikel_name: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
  notiz: string;
  chargen?: ChargeDetails[];
  chargenpflichtig: boolean;
}

const WareneingangFormular: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [wareneingang, setWareneingang] = useState({ ...defaultWareneingang });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [chargenDialogOpen, setChargenDialogOpen] = useState<boolean>(false);
  const [currentPositionIndex, setCurrentPositionIndex] = useState<number>(-1);
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);
  
  // Beim Laden des Formulars
  useEffect(() => {
    if (id && id !== 'neu') {
      // Hier würden wir die Daten vom Server laden
      setLoading(true);
      
      // Simulierte API-Anfrage
      setTimeout(() => {
        // Dummy-Daten
        const dummyWareneingang = {
          ...defaultWareneingang,
          id: id,
          nummer: `WE-${id}`,
          lieferant_id: '1',
          lieferant_name: 'Agrar GmbH',
          positionen: [
            {
              id: '1',
              artikel_id: '1',
              artikel_name: 'Weizenschrot Premium',
              menge: 1000,
              einheit: 'kg',
              einzelpreis: 0.45,
              gesamtpreis: 450,
              notiz: '',
              chargenpflichtig: true,
              chargen: []
            }
          ]
        };
        
        setWareneingang(dummyWareneingang);
        setLoading(false);
      }, 1000);
    }
  }, [id]);
  
  // Tab wechseln
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Formulardaten ändern
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWareneingang(prev => ({ ...prev, [name]: value }));
  };
  
  // Lieferanten auswählen
  const handleLieferantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lieferantId = e.target.value;
    const lieferantName = lieferanten.find(l => l.id === lieferantId)?.name || '';
    
    setWareneingang(prev => ({
      ...prev,
      lieferant_id: lieferantId,
      lieferant_name: lieferantName
    }));
  };
  
  // Position hinzufügen
  const handleAddPosition = () => {
    const newPosition: Position = {
      id: Date.now().toString(),
      artikel_id: '',
      artikel_name: '',
      menge: 0,
      einheit: '',
      einzelpreis: 0,
      gesamtpreis: 0,
      notiz: '',
      chargenpflichtig: false
    };
    
    setWareneingang(prev => ({
      ...prev,
      positionen: [...prev.positionen, newPosition]
    }));
  };
  
  // Position aktualisieren
  const handleUpdatePosition = (index: number, position: Position) => {
    const newPositionen = [...wareneingang.positionen];
    newPositionen[index] = position;
    
    setWareneingang(prev => ({
      ...prev,
      positionen: newPositionen
    }));
  };
  
  // Position entfernen
  const handleRemovePosition = (index: number) => {
    const newPositionen = [...wareneingang.positionen];
    newPositionen.splice(index, 1);
    
    setWareneingang(prev => ({
      ...prev,
      positionen: newPositionen
    }));
  };
  
  // Wareneingang speichern
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Hier würden wir die Daten an den Server senden
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Wareneingang erfolgreich gespeichert');
      
      // Bei einem neuen Wareneingang zur Bearbeitungsseite navigieren
      if (id === 'neu') {
        navigate('/wareneingang/1');
      }
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
      setError('Der Wareneingang konnte nicht gespeichert werden');
    } finally {
      setLoading(false);
    }
  };
  
  // Status ändern
  const handleStatusChange = (newStatus: string) => {
    setWareneingang(prev => ({
      ...prev,
      status: newStatus
    }));
  };
  
  // Chargen-Dialog öffnen
  const handleOpenChargenDialog = (index: number) => {
    setCurrentPositionIndex(index);
    setChargenDialogOpen(true);
  };
  
  // Chargen übernehmen
  const handleChargenSelected = (chargen: ChargeDetails[]) => {
    if (currentPositionIndex >= 0) {
      const newPositionen = [...wareneingang.positionen];
      newPositionen[currentPositionIndex] = {
        ...newPositionen[currentPositionIndex],
        chargen
      };
      
      setWareneingang(prev => ({
        ...prev,
        positionen: newPositionen
      }));
    }
    
    setChargenDialogOpen(false);
    setScannerOpen(false);
  };
  
  // Scanner öffnen
  const handleOpenScanner = (index: number) => {
    setCurrentPositionIndex(index);
    setScannerOpen(true);
  };
  
  // Artikel-Informationen für aktuelle Position
  const getCurrentArtikel = () => {
    if (currentPositionIndex >= 0) {
      const position = wareneingang.positionen[currentPositionIndex];
      return {
        id: position.artikel_id,
        name: position.artikel_name,
        menge: position.menge
      };
    }
    return null;
  };
  
  // Rendern der Tabs
  const renderTabs = () => {
    return (
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="wareneingang-tabs">
          <Tab label="Grunddaten" />
          <Tab label="Positionen" />
          <Tab label="Notizen" />
          <Tab label="Historie" />
        </Tabs>
      </Box>
    );
  };
  
  // Rendern der Grunddaten
  const renderGrunddaten = () => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            name="nummer"
            label="Wareneingangsnummer"
            value={wareneingang.nummer}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={wareneingang.status !== 'entwurf'}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            name="datum"
            label="Datum"
            type="date"
            value={wareneingang.datum}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            disabled={wareneingang.status !== 'entwurf'}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            name="lieferant_id"
            label="Lieferant"
            value={wareneingang.lieferant_id}
            onChange={handleLieferantChange}
            fullWidth
            margin="normal"
            disabled={wareneingang.status !== 'entwurf'}
          >
            <MenuItem value="">
              <em>Bitte auswählen</em>
            </MenuItem>
            {lieferanten.map((lieferant) => (
              <MenuItem key={lieferant.id} value={lieferant.id}>
                {lieferant.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            name="lieferschein_nummer"
            label="Lieferscheinnummer"
            value={wareneingang.lieferschein_nummer}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={wareneingang.status !== 'entwurf'}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            name="lieferschein_datum"
            label="Lieferscheindatum"
            type="date"
            value={wareneingang.lieferschein_datum}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            disabled={wareneingang.status !== 'entwurf'}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="bestell_referenz"
            label="Bestellreferenz"
            value={wareneingang.bestell_referenz}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={wareneingang.status !== 'entwurf'}
          />
        </Grid>
      </Grid>
    );
  };
  
  // Rendern der Positionen
  const renderPositionen = () => {
    return (
      <Box>
        <PositionenTabelle
          positionen={wareneingang.positionen}
          onUpdatePosition={handleUpdatePosition}
          onRemovePosition={handleRemovePosition}
          isReadOnly={wareneingang.status !== 'entwurf'}
          artikelOptions={artikel}
          renderChargenButton={(index: number) => {
            const position = wareneingang.positionen[index];
            return position.chargenpflichtig ? (
              <Box display="flex" alignItems="center">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleOpenChargenDialog(index)}
                  startIcon={position.chargen && position.chargen.length > 0 ? null : <AddIcon />}
                  color={position.chargen && position.chargen.length > 0 ? "success" : "primary"}
                  sx={{ mr: 1 }}
                >
                  {position.chargen && position.chargen.length > 0 ? (
                    <Chip 
                      label={`${position.chargen.length} Charge(n)`} 
                      color="success" 
                      size="small"
                    />
                  ) : (
                    "Chargen"
                  )}
                </Button>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleOpenScanner(index)}
                  title="Chargen scannen"
                >
                  <QrCodeScannerIcon />
                </IconButton>
              </Box>
            ) : null;
          }}
        />
        
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddPosition}
          sx={{ mt: 2 }}
          disabled={wareneingang.status !== 'entwurf'}
        >
          Position hinzufügen
        </Button>
      </Box>
    );
  };
  
  // Rendern der Notizen
  const renderNotizen = () => {
    return (
      <TextField
        name="notiz"
        label="Notizen"
        value={wareneingang.notiz}
        onChange={handleChange}
        fullWidth
        margin="normal"
        multiline
        rows={6}
        disabled={wareneingang.status !== 'entwurf'}
      />
    );
  };
  
  // Rendern der Historie
  const renderHistorie = () => {
    return (
      <BelegHistorie
        ereignisse={[
          {
            id: '1',
            typ: 'erstellt',
            datum: wareneingang.created_at,
            benutzer: 'Max Mustermann',
            details: 'Wareneingang erstellt'
          },
          {
            id: '2',
            typ: 'geändert',
            datum: wareneingang.updated_at,
            benutzer: 'Max Mustermann',
            details: 'Positionen hinzugefügt'
          }
        ]}
      />
    );
  };
  
  // Aktive Tab-Inhalte rendern
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderGrunddaten();
      case 1:
        return renderPositionen();
      case 2:
        return renderNotizen();
      case 3:
        return renderHistorie();
      default:
        return null;
    }
  };
  
  // Aktionsleiste rendern
  const renderAktionsleiste = () => {
    return (
      <BelegAktionenLeiste
        belegTyp="wareneingang"
        status={wareneingang.status}
        onStatusChange={handleStatusChange}
        onSave={handleSave}
        onPrint={() => console.log('Drucken')}
        disableSave={loading}
      />
    );
  };
  
  const currentArtikel = getCurrentArtikel();
  
  return (
    <BelegFormBase
      title={`Wareneingang ${wareneingang.nummer || 'Neu'}`}
      status={<StatusBadge status={wareneingang.status} />}
      loading={loading}
      error={error}
      onErrorClose={() => setError(null)}
      success={success}
      onSuccessClose={() => setSuccess(null)}
      aktionsleiste={renderAktionsleiste()}
    >
      {renderTabs()}
      {renderActiveTabContent()}
      
      {/* Chargen-Dialog */}
      <ChargenAuswahlDialog
        open={chargenDialogOpen}
        onClose={() => setChargenDialogOpen(false)}
        onChargenSelected={handleChargenSelected}
        artikelId={currentPositionIndex >= 0 ? wareneingang.positionen[currentPositionIndex].artikel_id : ''}
        benoetigteMenge={currentPositionIndex >= 0 ? wareneingang.positionen[currentPositionIndex].menge : 0}
        selectedChargen={currentPositionIndex >= 0 && wareneingang.positionen[currentPositionIndex].chargen ? 
          wareneingang.positionen[currentPositionIndex].chargen : []}
      />
      
      {/* Scanner-Dialog */}
      <Dialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogContent>
          <WareneingangScanner
            onChargenSelected={handleChargenSelected}
            onCancel={() => setScannerOpen(false)}
            artikelId={currentArtikel?.id}
            artikelBezeichnung={currentArtikel?.name}
            benoetigteMenge={currentArtikel?.menge}
          />
        </DialogContent>
      </Dialog>
    </BelegFormBase>
  );
};

export default WareneingangFormular; 