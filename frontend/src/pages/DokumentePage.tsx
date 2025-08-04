import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Alert
} from '@mui/material';
import {
  Print as PrintIcon,
  Preview as PreviewIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Duplicate as DuplicateIcon,
  Save as SaveIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dokumente-tabpanel-${index}`}
      aria-labelledby={`dokumente-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const DokumentePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [activeModule, setActiveModule] = useState<string>('lieferschein');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const modules = [
    { id: 'lieferschein', name: 'Lieferschein', icon: '📦' },
    { id: 'frachtausgang', name: 'Frachtausgang', icon: '🚚' },
    { id: 'bestellung', name: 'Bestellung', icon: '📋' },
    { id: 'kommissionsauftrag', name: 'Kommissionsauftrag drucken', icon: '🖨️' },
    { id: 'betriebsauftrag', name: 'Betriebsauftrag drucken', icon: '⚙️' },
    { id: 'versandavis', name: 'Versandavis', icon: '📢' },
    { id: 'paketetiketten', name: 'Paketetiketten drucken', icon: '🏷️' },
    { id: 'frachtpapier', name: 'Frachtpapier drucken', icon: '📄' },
    { id: 'produktionsdokumente', name: 'Produktionsdokumente drucken', icon: '🏭' }
  ];

  const renderLieferscheinModule = () => (
    <Grid container spacing={3}>
      {/* Header-Bereich */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Lieferschein - Header</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField fullWidth label="Lieferschein-Nr." variant="outlined" />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth label="Lieferschein-Datum" type="date" variant="outlined" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Niederlassung</InputLabel>
                  <Select label="Niederlassung">
                    <MenuItem value="hamburg">Hamburg</MenuItem>
                    <MenuItem value="berlin">Berlin</MenuItem>
                    <MenuItem value="muenchen">München</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Lieferant</InputLabel>
                  <Select label="Lieferant">
                    <MenuItem value="lieferant1">Lieferant 1</MenuItem>
                    <MenuItem value="lieferant2">Lieferant 2</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth label="Zahlungsbedingung" variant="outlined" />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth label="Liefer-Termin" type="date" variant="outlined" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth label="Lieferdatum" type="date" variant="outlined" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth label="Liefer-Nr." variant="outlined" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Positionsbereich */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Positionsbereich</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Pos-Nr.</TableCell>
                    <TableCell>Artikel-Nr.</TableCell>
                    <TableCell>Bezeichnung</TableCell>
                    <TableCell>Menge</TableCell>
                    <TableCell>Einheit</TableCell>
                    <TableCell>Einzelpreis</TableCell>
                    <TableCell>Nettobetrag</TableCell>
                    <TableCell>Lagerhalle</TableCell>
                    <TableCell>Lagerfach</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>ART001</TableCell>
                    <TableCell>Gartenerde Kompost</TableCell>
                    <TableCell>100</TableCell>
                    <TableCell>kg</TableCell>
                    <TableCell>2,50 €</TableCell>
                    <TableCell>250,00 €</TableCell>
                    <TableCell>HALLE1</TableCell>
                    <TableCell>A-01-01</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <DuplicateIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Buttons */}
      <Grid item xs={12}>
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button variant="outlined" startIcon={<RefreshIcon />}>Aktualisieren</Button>
          <Button variant="outlined" startIcon={<SaveIcon />}>Daten</Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />}>Lieferungen löschen</Button>
          <Button variant="contained" startIcon={<PrintIcon />}>Lieferungen drucken</Button>
          <Button variant="outlined" startIcon={<CloseIcon />}>Schließen</Button>
        </Box>
      </Grid>
    </Grid>
  );

  const renderFrachtausgangModule = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Frachtausgang</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={<Checkbox />}
                  label="Frachtauftrag erzeugt"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Niederlassung</InputLabel>
                  <Select label="Niederlassung">
                    <MenuItem value="hamburg">Hamburg</MenuItem>
                    <MenuItem value="berlin">Berlin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Liefertermin" type="date" variant="outlined" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Spediteur-Nr." variant="outlined" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="E-Mail" variant="outlined" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Telefon" variant="outlined" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Spediteur-Name" variant="outlined" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Belegnummer" variant="outlined" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderBestellungModule = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Bestellung</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Niederlassung</InputLabel>
                  <Select label="Niederlassung">
                    <MenuItem value="hamburg">Hamburg</MenuItem>
                    <MenuItem value="berlin">Berlin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Artikelgruppe</InputLabel>
                  <Select label="Artikelgruppe">
                    <MenuItem value="garten">Garten</MenuItem>
                    <MenuItem value="bau">Bau</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth label="Artikelnummer" variant="outlined" />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth label="Bezeichnung" variant="outlined" />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth label="Bestand" variant="outlined" type="number" />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth label="Mindestbestand" variant="outlined" type="number" />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth label="Vorschlag" variant="outlined" type="number" />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth label="Einheitspreis" variant="outlined" type="number" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderDruckModule = (moduleName: string) => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>{moduleName}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Lieferschein-Nr." variant="outlined" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Kundenname" variant="outlined" />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Formular</InputLabel>
                  <Select label="Formular">
                    <MenuItem value="standard">Standard</MenuItem>
                    <MenuItem value="erweitert">Erweitert</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Druckanzahl" variant="outlined" type="number" />
              </Grid>
            </Grid>
            <Box display="flex" gap={2} mt={3}>
              <Button variant="outlined" startIcon={<SettingsIcon />}>Drucker einrichten</Button>
              <Button variant="outlined" startIcon={<PreviewIcon />}>Vorschau</Button>
              <Button variant="contained" startIcon={<PrintIcon />}>Drucken</Button>
              <Button variant="outlined" startIcon={<CloseIcon />}>Schließen</Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'lieferschein':
        return renderLieferscheinModule();
      case 'frachtausgang':
        return renderFrachtausgangModule();
      case 'bestellung':
        return renderBestellungModule();
      case 'kommissionsauftrag':
        return renderDruckModule('Kommissionsauftrag drucken');
      case 'betriebsauftrag':
        return renderDruckModule('Betriebsauftrag drucken');
      case 'versandavis':
        return renderDruckModule('Versandavis');
      case 'paketetiketten':
        return renderDruckModule('Paketetiketten drucken');
      case 'frachtpapier':
        return renderDruckModule('Frachtpapier drucken');
      case 'produktionsdokumente':
        return renderDruckModule('Produktionsdokumente drucken');
      default:
        return <Alert severity="info">Modul auswählen</Alert>;
    }
  };

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <Typography variant="h4" gutterBottom>
        📄 Dokumente - VALERO Module
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="Dokumente Module">
          {modules.map((module, index) => (
            <Tab
              key={module.id}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <span>{module.icon}</span>
                  <span>{module.name}</span>
                </Box>
              }
              onClick={() => setActiveModule(module.id)}
            />
          ))}
        </Tabs>
      </Box>

      {renderModuleContent()}
    </Box>
  );
};

export default DokumentePage; 