import React, { useState, useEffect } from 'react';
import { 
  Typography, Container, Paper, Grid, Box, Tabs, Tab, 
  Card, CardContent, TextField, Button, Switch, FormControlLabel,
  List, ListItem, ListItemText, Divider, FormControl, InputLabel,
  Select, MenuItem, Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

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
      id={`article-tabpanel-${index}`}
      aria-labelledby={`article-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Beispieldaten für die Demo
const demoArticleData = {
  artikelnummer: "10001",
  kurztext: "Bio-Weizen",
  bezeichnung: "Bio-Weizen Premium Qualität",
  zweiteMatchcode: "BIOWEIZEN",
  artikelArt: "Getreide",
  artikelGruppe: "Bio-Produkte",
  artikelGesperrt: false,
  
  mengenEinheit: "kg",
  gewicht: 1.0,
  hilfsgewicht: 0.0,
  preisJe: "kg",
  verpackungseinheit: "Sack",
  verpackung: "Papiersack",
  
  eanCode: "4006224100016",
  eanCodeEinheit: "Sack",
  internerCode: "BW-1001",
  sichtbarkeitWebshop: true,
  etikettenDruck: true,
  mhdKennzeichnung: true,
  
  empfohlenerVK: 1.29,
  einkaufspreis: 0.89,
  kalkulatorischerEK: 0.92,
  
  rabattGruppe: "BIO-RAB",
  konditionen: "Standard",
  
  gefahrgutKlasse: "",
  gefahrgutNummer: "",
  gefahrgutBeschreibung: "",
  
  ruecknahmeErlaubt: true,
  mhdPflicht: true,
  toleranzMenge: 0.05,
  kasseSonderbehandlung: "",
  commission: false,
  etikettInfo: "Bio-Qualität aus regionalem Anbau"
};

const ArticleMasterData: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [articleData, setArticleData] = useState(demoArticleData);
  const [isEditing, setIsEditing] = useState(false);
  const [showKiDialog, setShowKiDialog] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value, checked } = e.target as HTMLInputElement;
    
    if (name?.includes('.')) {
      // Handle nested properties
      const [parent, child] = name.split('.');
      setArticleData({
        ...articleData,
        [parent]: {
          ...articleData[parent as keyof typeof articleData],
          [child]: e.target.type === 'checkbox' ? checked : value
        }
      });
    } else if (name) {
      // Handle direct properties
      setArticleData({
        ...articleData,
        [name]: e.target.type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSave = () => {
    // Hier würde die API-Anfrage zum Speichern erfolgen
    console.log("Speichere Artikeldaten:", articleData);
    setIsEditing(false);
  };

  const handleAiAssistance = () => {
    setShowKiDialog(true);
  };

  const handleDialogClose = () => {
    setShowKiDialog(false);
  };

  return (
    <Container maxWidth="xl">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Artikel-Stammdaten
          </Typography>
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              sx={{ mr: 2 }}
            >
              {isEditing ? 'Speichern' : 'Bearbeiten'}
            </Button>
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={handleAiAssistance}
            >
              KI-Assistent
            </Button>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Artikeldaten Tabs">
            <Tab label="Allgemein" />
            <Tab label="Einheiten" />
            <Tab label="Kennzeichnung" />
            <Tab label="Preise & Rabatte" />
            <Tab label="Dokumente" />
            <Tab label="Gefahrgut" />
            <Tab label="Einstellungen" />
            <Tab label="KI-Erweiterungen" />
          </Tabs>
        </Box>

        {/* Allgemeine Daten */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Artikelnummer"
                name="artikelnummer"
                value={articleData.artikelnummer}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Kurztext"
                name="kurztext"
                value={articleData.kurztext}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Zweite Matchcode"
                name="zweiteMatchcode"
                value={articleData.zweiteMatchcode}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bezeichnung"
                name="bezeichnung"
                value={articleData.bezeichnung}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Artikel-Art"
                name="artikelArt"
                value={articleData.artikelArt}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Artikel-Gruppe"
                name="artikelGruppe"
                value={articleData.artikelGruppe}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={articleData.artikelGesperrt}
                    onChange={handleInputChange}
                    name="artikelGesperrt"
                    disabled={!isEditing}
                  />
                }
                label="Artikel gesperrt"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Einheiten */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Mengeneinheit"
                name="mengenEinheit"
                value={articleData.mengenEinheit}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Gewicht"
                name="gewicht"
                type="number"
                value={articleData.gewicht}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Hilfsgewicht"
                name="hilfsgewicht"
                type="number"
                value={articleData.hilfsgewicht}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Preis je"
                name="preisJe"
                value={articleData.preisJe}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Verpackungseinheit"
                name="verpackungseinheit"
                value={articleData.verpackungseinheit}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Verpackung"
                name="verpackung"
                value={articleData.verpackung}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Kennzeichnung */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="EAN-Code"
                name="eanCode"
                value={articleData.eanCode}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="EAN-Code Einheit"
                name="eanCodeEinheit"
                value={articleData.eanCodeEinheit}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Interner Code"
                name="internerCode"
                value={articleData.internerCode}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={articleData.sichtbarkeitWebshop}
                    onChange={handleInputChange}
                    name="sichtbarkeitWebshop"
                    disabled={!isEditing}
                  />
                }
                label="Sichtbarkeit im Webshop"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={articleData.etikettenDruck}
                    onChange={handleInputChange}
                    name="etikettenDruck"
                    disabled={!isEditing}
                  />
                }
                label="Etikettendruck"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={articleData.mhdKennzeichnung}
                    onChange={handleInputChange}
                    name="mhdKennzeichnung"
                    disabled={!isEditing}
                  />
                }
                label="MHD-Kennzeichnung"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Preise & Rabatte */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Empfohlener VK"
                name="empfohlenerVK"
                type="number"
                value={articleData.empfohlenerVK}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <span>€&nbsp;</span>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Einkaufspreis"
                name="einkaufspreis"
                type="number"
                value={articleData.einkaufspreis}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <span>€&nbsp;</span>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Kalkulatorischer EK"
                name="kalkulatorischerEK"
                type="number"
                value={articleData.kalkulatorischerEK}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <span>€&nbsp;</span>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Rabattgruppe"
                name="rabattGruppe"
                value={articleData.rabattGruppe}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Konditionen"
                name="konditionen"
                value={articleData.konditionen}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            
            {/* Verkaufspreise Tabelle würde hier hinzugefügt werden */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Verkaufspreise</Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                disabled={!isEditing}
                sx={{ mb: 2 }}
              >
                Preis hinzufügen
              </Button>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Keine Verkaufspreise definiert
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Dokumente */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6">Dokumente</Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                disabled={!isEditing}
                sx={{ my: 2 }}
              >
                Dokument hinzufügen
              </Button>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Keine Dokumente vorhanden
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6">Unterlagen</Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                disabled={!isEditing}
                sx={{ my: 2 }}
              >
                Unterlage hinzufügen
              </Button>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Keine Unterlagen vorhanden
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Gefahrgut */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gefahrgut-Klasse"
                name="gefahrgutKlasse"
                value={articleData.gefahrgutKlasse}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gefahrgut-Nummer"
                name="gefahrgutNummer"
                value={articleData.gefahrgutNummer}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Gefahrgut-Beschreibung"
                name="gefahrgutBeschreibung"
                value={articleData.gefahrgutBeschreibung}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={4}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Einstellungen */}
        <TabPanel value={tabValue} index={6}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={articleData.ruecknahmeErlaubt}
                    onChange={handleInputChange}
                    name="ruecknahmeErlaubt"
                    disabled={!isEditing}
                  />
                }
                label="Rücknahme erlaubt"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={articleData.mhdPflicht}
                    onChange={handleInputChange}
                    name="mhdPflicht"
                    disabled={!isEditing}
                  />
                }
                label="MHD-Pflicht"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Toleranz-Menge"
                name="toleranzMenge"
                type="number"
                value={articleData.toleranzMenge}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kasse-Sonderbehandlung"
                name="kasseSonderbehandlung"
                value={articleData.kasseSonderbehandlung}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={articleData.commission}
                    onChange={handleInputChange}
                    name="commission"
                    disabled={!isEditing}
                  />
                }
                label="Commission"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Etikett-Info"
                name="etikettInfo"
                value={articleData.etikettInfo}
                onChange={handleInputChange}
                margin="normal"
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* KI-Erweiterungen */}
        <TabPanel value={tabValue} index={7}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ mb: 3, bgcolor: theme.palette.background.default }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    KI-Klassifikation
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        disabled={true}
                        checked={true}
                      />
                    }
                    label="Warengruppen-Erkennung aktiv"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Klassifikation: Bio-Produkte (Konfidenz: 97.8%)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', bgcolor: theme.palette.background.default }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    KI-Empfehlungen
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Empfohlener VK:</strong> €1.35 (+4.6%)
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Empfohlener EK:</strong> €0.87 (-2.2%)
                  </Typography>
                  <Typography variant="body2">
                    <strong>Nachbestellungsprognose:</strong> 750 kg (in 14 Tagen)
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Alternativen:
                    </Typography>
                    <Chip 
                      label="Bio-Dinkel" 
                      variant="outlined" 
                      size="small" 
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip 
                      label="Bio-Roggen" 
                      variant="outlined" 
                      size="small" 
                      sx={{ mr: 1, mb: 1 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', bgcolor: theme.palette.background.default }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    KI-Texte
                  </Typography>
                  <Typography variant="subtitle2">
                    Beschreibung (GPT):
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Unser Bio-Weizen in Premium-Qualität stammt aus regionalem, biologischem Anbau ohne Pestizide und chemische Düngemittel. Perfekt für Backwaren mit vollem Geschmack.
                  </Typography>
                  
                  <Typography variant="subtitle2">
                    SEO-Keywords:
                  </Typography>
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Chip 
                      label="Bio-Weizen" 
                      size="small" 
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip 
                      label="regional" 
                      size="small" 
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip 
                      label="Getreide" 
                      size="small" 
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip 
                      label="Backwaren" 
                      size="small" 
                      sx={{ mr: 1, mb: 1 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card sx={{ bgcolor: theme.palette.background.default }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Intelligente Automatisierung
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            disabled={!isEditing}
                            checked={false}
                          />
                        }
                        label="Auto-Preisupdate"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            disabled={!isEditing}
                            checked={true}
                          />
                        }
                        label="Auto-Lagerauffüllung"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            disabled={!isEditing}
                            checked={false}
                          />
                        }
                        label="Auto-Kundengruppenrabatt"
                      />
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Qualitäts-Check:
                  </Typography>
                  <Typography variant="body2" color="green">
                    Keine Anomalien erkannt (letzter Check: 12.06.2024)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* KI-Dialog */}
      <Dialog 
        open={showKiDialog} 
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>KI-Assistent für Artikel-Stammdaten</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Frage an den KI-Assistenten"
            placeholder="z.B. 'Optimiere die Produktbeschreibung für SEO' oder 'Berechne einen optimalen Verkaufspreis'"
            multiline
            rows={3}
            margin="normal"
          />
          
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Vorschläge:</Typography>
          <List>
            <ListItem button>
              <ListItemText primary="Optimiere alle Produkttexte für SEO" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Schlage ähnliche Produkte als Cross-Selling vor" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Berechne optimalen Verkaufspreis basierend auf Marktdaten" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Erstelle automatisch eine Produktbeschreibung" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Abbrechen</Button>
          <Button variant="contained" color="primary" onClick={handleDialogClose}>
            Anfrage senden
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ArticleMasterData; 