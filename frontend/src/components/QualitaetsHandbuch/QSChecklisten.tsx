import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
  Divider,
  Tabs,
  Tab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  Send as SendIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  LocalShipping as LocalShippingIcon,
  Warehouse as WarehouseIcon,
  Agriculture as AgricultureIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import de from 'date-fns/locale/de';

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
      id={`checklist-tabpanel-${index}`}
      aria-labelledby={`checklist-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  kommentar?: string;
  required?: boolean;
  kritisch?: boolean;
}

interface Mitarbeiter {
  id: string;
  name: string;
  vorname: string;
  position: string;
  bereich: string;
  mobil: boolean;
}

// Mock-Daten für Mitarbeiter
const mitarbeiterListe: Mitarbeiter[] = [
  { id: '1', name: 'Müller', vorname: 'Hans', position: 'Lagerist', bereich: 'Lager', mobil: true },
  { id: '2', name: 'Schmidt', vorname: 'Petra', position: 'Fahrerin', bereich: 'Transport', mobil: true },
  { id: '3', name: 'Weber', vorname: 'Klaus', position: 'Anlagenführer', bereich: 'Produktion', mobil: true },
  { id: '4', name: 'Becker', vorname: 'Thomas', position: 'QM-Beauftragter', bereich: 'Qualität', mobil: false }
];

// Mock-Daten für Checklisten
const handelChecklistItems: ChecklistItem[] = [
  { id: '1-1', text: 'Wareneingangskontrolle gemäß QS-Anforderungen durchgeführt', checked: false, required: true },
  { id: '1-2', text: 'Lieferantenbewertung aktualisiert', checked: false },
  { id: '1-3', text: 'Produktkennzeichnung QS-konform', checked: false, required: true, kritisch: true },
  { id: '1-4', text: 'Rückverfolgbarkeit der Ware überprüft', checked: false, required: true },
  { id: '1-5', text: 'Probennahme und -lagerung gemäß Vorgaben', checked: false, required: true },
  { id: '1-6', text: 'Prüfung auf Schädlingsbefall durchgeführt', checked: false, required: true },
  { id: '1-7', text: 'Dokumentation der Wareneingangs- und Ausgangsdaten', checked: false, required: true }
];

const transportChecklistItems: ChecklistItem[] = [
  { id: '2-1', text: 'Fahrzeug gereinigt und in hygienisch einwandfreiem Zustand', checked: false, required: true, kritisch: true },
  { id: '2-2', text: 'Fahrzeug trocken und frei von Fremdgerüchen', checked: false, required: true },
  { id: '2-3', text: 'Reinigungsnachweis und Frachtenpapiere vollständig', checked: false, required: true },
  { id: '2-4', text: 'Vorfrachtenliste überprüft (keine verbotenen Vorfrachten)', checked: false, required: true, kritisch: true },
  { id: '2-5', text: 'Transportsicherheit gewährleistet', checked: false, required: true },
  { id: '2-6', text: 'Fahrer über Hygienevorgaben informiert', checked: false },
  { id: '2-7', text: 'Ladungssicherung entsprechend Vorschriften durchgeführt', checked: false, required: true },
  { id: '2-8', text: 'Fahrzeug-Checkliste vor Beladung ausgefüllt', checked: false, required: true }
];

const lagerChecklistItems: ChecklistItem[] = [
  { id: '3-1', text: 'Lagerstätte trocken und sauber', checked: false, required: true },
  { id: '3-2', text: 'Lager frei von Schädlingsbefall', checked: false, required: true, kritisch: true },
  { id: '3-3', text: 'Baulicher Zustand des Lagers in Ordnung', checked: false, required: true },
  { id: '3-4', text: 'Lager getrennt von Gefahrstoffen/Chemikalien', checked: false, required: true, kritisch: true },
  { id: '3-5', text: 'Temperaturkontrolle durchgeführt und dokumentiert', checked: false, required: true },
  { id: '3-6', text: 'Schädlingsmonitoring durchgeführt', checked: false, required: true },
  { id: '3-7', text: 'Reinigungsplan eingehalten', checked: false, required: true },
  { id: '3-8', text: 'Zugangs- und Kontaminationsschutz gewährleistet', checked: false, required: true },
  { id: '3-9', text: 'Chargen ordnungsgemäß gekennzeichnet', checked: false, required: true },
  { id: '3-10', text: 'Lagerbestand mit Buchbestand übereinstimmend', checked: false }
];

const mahlMischAnlagenChecklistItems: ChecklistItem[] = [
  { id: '4-1', text: 'Anlage gereinigt und in hygienisch einwandfreiem Zustand', checked: false, required: true, kritisch: true },
  { id: '4-2', text: 'Verschleißteile überprüft', checked: false, required: true },
  { id: '4-3', text: 'Kalibrierung der Dosier- und Wiegeeinrichtungen durchgeführt', checked: false, required: true },
  { id: '4-4', text: 'Rezepturen auf aktuellem Stand', checked: false, required: true },
  { id: '4-5', text: 'Dokumentation der Anlagenreinigung vorhanden', checked: false, required: true },
  { id: '4-6', text: 'Verunreinigungen und Fremdkörper ausgeschlossen', checked: false, required: true, kritisch: true },
  { id: '4-7', text: 'Verschleppungsgefahr minimiert (Trennung verschiedener Futtermittel)', checked: false, required: true, kritisch: true },
  { id: '4-8', text: 'Wartungsplan eingehalten', checked: false, required: true },
  { id: '4-9', text: 'Proben von Mischungen genommen', checked: false, required: true },
  { id: '4-10', text: 'Mitarbeiter für QS-Anforderungen geschult', checked: false, required: true }
];

const QSChecklisten: React.FC = () => {
  const [tabValue, setTabValue] = useState<number>(0);
  const [handelChecklist, setHandelChecklist] = useState<ChecklistItem[]>(handelChecklistItems);
  const [transportChecklist, setTransportChecklist] = useState<ChecklistItem[]>(transportChecklistItems);
  const [lagerChecklist, setLagerChecklist] = useState<ChecklistItem[]>(lagerChecklistItems);
  const [mahlMischAnlagenChecklist, setMahlMischAnlagenChecklist] = useState<ChecklistItem[]>(mahlMischAnlagenChecklistItems);
  const [selectedMitarbeiter, setSelectedMitarbeiter] = useState<string>('');
  const [pruefDatum, setPruefDatum] = useState<Date | null>(new Date());
  const [bemerkungen, setBemerkungen] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState<string>('');
  const [sendDialogOpen, setSendDialogOpen] = useState<boolean>(false);
  
  const printRef = useRef<HTMLDivElement>(null);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handler für Checkboxen
  const handleCheckboxChange = (listType: string, id: string, checked: boolean) => {
    switch (listType) {
      case 'handel':
        setHandelChecklist(prevList => 
          prevList.map(item => 
            item.id === id ? { ...item, checked } : item
          )
        );
        break;
      case 'transport':
        setTransportChecklist(prevList => 
          prevList.map(item => 
            item.id === id ? { ...item, checked } : item
          )
        );
        break;
      case 'lager':
        setLagerChecklist(prevList => 
          prevList.map(item => 
            item.id === id ? { ...item, checked } : item
          )
        );
        break;
      case 'mahlMischAnlagen':
        setMahlMischAnlagenChecklist(prevList => 
          prevList.map(item => 
            item.id === id ? { ...item, checked } : item
          )
        );
        break;
    }
  };
  
  // Handler für Kommentare
  const handleKommentarChange = (listType: string, id: string, kommentar: string) => {
    switch (listType) {
      case 'handel':
        setHandelChecklist(prevList => 
          prevList.map(item => 
            item.id === id ? { ...item, kommentar } : item
          )
        );
        break;
      case 'transport':
        setTransportChecklist(prevList => 
          prevList.map(item => 
            item.id === id ? { ...item, kommentar } : item
          )
        );
        break;
      case 'lager':
        setLagerChecklist(prevList => 
          prevList.map(item => 
            item.id === id ? { ...item, kommentar } : item
          )
        );
        break;
      case 'mahlMischAnlagen':
        setMahlMischAnlagenChecklist(prevList => 
          prevList.map(item => 
            item.id === id ? { ...item, kommentar } : item
          )
        );
        break;
    }
  };
  
  // Handler für das Drucken der Checkliste
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'QS_Checkliste',
    onAfterPrint: () => {
      setDialogContent('Checkliste wurde erfolgreich zum Drucken vorbereitet.');
      setDialogOpen(true);
    }
  });
  
  // Handler für das Speichern der Checkliste
  const handleSave = () => {
    // Hier würde die Speicherlogik implementiert werden
    setDialogContent('Checkliste wurde erfolgreich gespeichert.');
    setDialogOpen(true);
  };
  
  // Handler für das Senden der Checkliste an einen Mitarbeiter
  const handleSend = () => {
    setSendDialogOpen(true);
  };
  
  // Handler für das Bestätigen des Sendens
  const handleSendConfirm = () => {
    setSendDialogOpen(false);
    
    // Hier würde die Sendelogik implementiert werden
    setDialogContent(`Checkliste wurde erfolgreich an ${mitarbeiterListe.find(m => m.id === selectedMitarbeiter)?.vorname} ${mitarbeiterListe.find(m => m.id === selectedMitarbeiter)?.name} gesendet.`);
    setDialogOpen(true);
  };
  
  // Handler für das Schließen der Dialoge
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSendDialogOpen(false);
  };
  
  // Render-Funktion für Checklisten-Items
  const renderChecklistItems = (items: ChecklistItem[], listType: string) => {
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="5%">Nr.</TableCell>
              <TableCell width="60%">Prüfpunkt</TableCell>
              <TableCell width="10%" align="center">OK</TableCell>
              <TableCell width="10%" align="center">Nicht OK</TableCell>
              <TableCell width="15%" align="center">Nicht zutreffend</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id} sx={{ backgroundColor: item.kritisch ? '#fff8e1' : 'inherit' }}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {item.text}
                  {item.required && <span style={{ color: 'red' }}> *</span>}
                  {item.kritisch && <span style={{ color: 'orange' }}>(K)</span>}
                  <TextField
                    placeholder="Kommentar"
                    variant="outlined"
                    size="small"
                    fullWidth
                    margin="dense"
                    value={item.kommentar || ''}
                    onChange={(e) => handleKommentarChange(listType, item.id, e.target.value)}
                  />
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={item.checked === true}
                    onChange={() => handleCheckboxChange(listType, item.id, true)}
                  />
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={item.checked === false && item.kommentar !== undefined && item.kommentar !== ''}
                    onChange={() => {
                      handleCheckboxChange(listType, item.id, false);
                      if (!item.kommentar) {
                        handleKommentarChange(listType, item.id, 'Nicht OK - Begründung erforderlich');
                      }
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={item.checked === null}
                    onChange={() => handleCheckboxChange(listType, item.id, null as any)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2" gutterBottom>
            QS-Checklisten
          </Typography>
          
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<PrintIcon />} 
              onClick={handlePrint}
              sx={{ mr: 1 }}
            >
              Drucken
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{ mr: 1 }}
            >
              Speichern
            </Button>
            <Button 
              variant="contained" 
              startIcon={<SendIcon />}
              onClick={handleSend}
            >
              An Mitarbeiter senden
            </Button>
          </Box>
        </Box>
        
        <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
          Diese Checklisten entsprechen den QS-Anforderungen für Handel, Transport, Lagerung und mobile Mahl- und Mischanlagen. Pflichtfelder sind mit einem <span style={{ color: 'red' }}>*</span> gekennzeichnet. Kritische Prüfpunkte sind mit einem <span style={{ color: 'orange' }}>(K)</span> markiert.
        </Alert>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<AssignmentIcon />} label="Handel" />
            <Tab icon={<LocalShippingIcon />} label="Transport" />
            <Tab icon={<WarehouseIcon />} label="Lagerung" />
            <Tab icon={<AgricultureIcon />} label="Mobile Mahl- und Mischanlagen" />
          </Tabs>
        </Box>
      </Paper>
      
      <Box ref={printRef}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <DatePicker
                  label="Prüfdatum"
                  value={pruefDatum}
                  onChange={(newValue) => setPruefDatum(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="mitarbeiter-label">Zuständiger Mitarbeiter</InputLabel>
                <Select
                  labelId="mitarbeiter-label"
                  value={selectedMitarbeiter}
                  label="Zuständiger Mitarbeiter"
                  onChange={(e) => setSelectedMitarbeiter(e.target.value)}
                >
                  {mitarbeiterListe.map((mitarbeiter) => (
                    <MenuItem key={mitarbeiter.id} value={mitarbeiter.id}>
                      {mitarbeiter.vorname} {mitarbeiter.name} - {mitarbeiter.position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                Legende:
              </Typography>
              <Typography variant="body2">
                <span style={{ color: 'red' }}>*</span> = Pflichtfeld
              </Typography>
              <Typography variant="body2">
                <span style={{ color: 'orange' }}>(K)</span> = Kritischer Prüfpunkt
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            QS-Checkliste: Handel
          </Typography>
          {renderChecklistItems(handelChecklist, 'handel')}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            QS-Checkliste: Transport
          </Typography>
          {renderChecklistItems(transportChecklist, 'transport')}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            QS-Checkliste: Lagerung
          </Typography>
          {renderChecklistItems(lagerChecklist, 'lager')}
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            QS-Checkliste: Mobile Mahl- und Mischanlagen
          </Typography>
          {renderChecklistItems(mahlMischAnlagenChecklist, 'mahlMischAnlagen')}
        </TabPanel>
        
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Bemerkungen
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Hier können Sie zusätzliche Bemerkungen eintragen"
            value={bemerkungen}
            onChange={(e) => setBemerkungen(e.target.value)}
          />
          
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">
                Datum: {pruefDatum ? pruefDatum.toLocaleDateString('de-DE') : ''}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">
                Unterschrift: ______________________________
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      {/* Dialog für Bestätigungen */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
      >
        <DialogTitle>Information</DialogTitle>
        <DialogContent>
          <Typography>{dialogContent}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog für das Senden an Mitarbeiter */}
      <Dialog
        open={sendDialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Checkliste an Mitarbeiter senden</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Wählen Sie einen Mitarbeiter aus, an den die Checkliste gesendet werden soll:
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="send-mitarbeiter-label">Mitarbeiter</InputLabel>
            <Select
              labelId="send-mitarbeiter-label"
              value={selectedMitarbeiter}
              label="Mitarbeiter"
              onChange={(e) => setSelectedMitarbeiter(e.target.value)}
            >
              {mitarbeiterListe.map((mitarbeiter) => (
                <MenuItem key={mitarbeiter.id} value={mitarbeiter.id}>
                  {mitarbeiter.vorname} {mitarbeiter.name} - {mitarbeiter.position}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Der Mitarbeiter erhält eine Benachrichtigung mit der Checkliste und kann diese auf seinem Gerät ausfüllen.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>
            Abbrechen
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSendConfirm}
            disabled={!selectedMitarbeiter}
          >
            Senden
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QSChecklisten; 