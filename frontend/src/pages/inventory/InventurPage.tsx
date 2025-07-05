import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  InventoryOutlined,
  ListAltOutlined,
  AppRegistrationOutlined,
  FactCheckOutlined,
  AssessmentOutlined,
  CalculateOutlined,
  DeleteOutline,
  ImportExportOutlined,
  AddCircleOutline,
  MoreVert,
  FileDownloadOutlined,
  FileUploadOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import inventurService, { InventurKopf } from '../../services/inventurService';

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
      id={`inventur-tabpanel-${index}`}
      aria-labelledby={`inventur-tab-${index}`}
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

const InventurPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [inventuren, setInventuren] = useState<InventurKopf[]>([]);
  const [selectedInventur, setSelectedInventur] = useState<InventurKopf | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuInventurId, setMenuInventurId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  // Inventuren laden
  useEffect(() => {
    loadInventuren();
  }, []);

  const loadInventuren = async () => {
    setIsLoading(true);
    try {
      const data = await inventurService.getInventuren();
      setInventuren(data);
    } catch (error) {
      console.error('Fehler beim Laden der Inventuren:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, inventurId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuInventurId(inventurId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuInventurId(null);
  };

  const showConfirmDialog = (title: string, message: string, action: () => void) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDialogClose = (confirm: boolean) => {
    setConfirmDialogOpen(false);
    if (confirm) {
      confirmAction();
    }
  };

  const handleInventurSelect = (inventur: InventurKopf) => {
    setSelectedInventur(inventur);
    // Bei Bedarf zu einer bestimmten Ansicht navigieren
  };

  const handleCreateInventur = () => {
    navigate('/inventur/neu');
  };

  const navigateToModule = (inventurId: string, module: string) => {
    handleMenuClose();
    navigate(`/inventur/${inventurId}/${module}`);
  };

  const handleLoescheErfassungen = (inventurId: string) => {
    handleMenuClose();
    showConfirmDialog(
      'Inventur-Erfassungen löschen',
      'Möchten Sie wirklich alle Erfassungen dieser Inventur löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.',
      async () => {
        try {
          await inventurService.loescheErfassungen(inventurId);
          loadInventuren(); // Aktualisierte Daten laden
        } catch (error) {
          console.error('Fehler beim Löschen der Erfassungen:', error);
        }
      }
    );
  };

  const getStatusChip = (status: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    
    switch (status) {
      case 'vorbereitet':
        color = 'info';
        break;
      case 'in_bearbeitung':
        color = 'warning';
        break;
      case 'abgeschlossen':
        color = 'success';
        break;
      case 'freigegeben':
        color = 'primary';
        break;
    }
    
    return (
      <Chip 
        label={status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)} 
        color={color} 
        size="small" 
        variant="outlined"
      />
    );
  };

  const renderInventurCard = (inventur: InventurKopf) => {
    const fortschritt = inventur.anzahl_artikel > 0 
      ? Math.round((inventur.anzahl_erfasst / inventur.anzahl_artikel) * 100) 
      : 0;
    
    return (
      <Card 
        key={inventur.id} 
        variant="outlined"
        sx={{ 
          mb: 2, 
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: 3
          }
        }}
        onClick={() => handleInventurSelect(inventur)}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" component="div">{inventur.bezeichnung}</Typography>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, inventur.id);
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Stichtag: {new Date(inventur.stichtag).toLocaleDateString('de-DE')}
            </Typography>
            {getStatusChip(inventur.status)}
          </Box>
          
          <Box mb={1}>
            <Typography variant="body2">
              Fortschritt: {fortschritt}% ({inventur.anzahl_erfasst} von {inventur.anzahl_artikel} Artikeln erfasst)
            </Typography>
            <Box 
              sx={{ 
                width: '100%', 
                backgroundColor: '#e0e0e0', 
                borderRadius: 1,
                mt: 0.5
              }}
            >
              <Box 
                sx={{ 
                  width: `${fortschritt}%`, 
                  backgroundColor: fortschritt === 100 ? 'success.main' : 'primary.main',
                  height: 8,
                  borderRadius: 1
                }} 
              />
            </Box>
          </Box>
          
          {inventur.gesamtwert_ist !== undefined && inventur.gesamtwert_soll !== undefined && (
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">
                Ist-Wert: {inventur.gesamtwert_ist.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </Typography>
              <Typography variant="body2">
                Soll-Wert: {inventur.gesamtwert_soll.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </Typography>
            </Box>
          )}
          
          {inventur.differenz_wert !== undefined && (
            <Typography 
              variant="body2" 
              color={inventur.differenz_wert < 0 ? 'error.main' : 'success.main'}
              align="right"
            >
              Differenz: {inventur.differenz_wert.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </Typography>
          )}
        </CardContent>
        <CardActions>
          <Button 
            size="small" 
            startIcon={<ListAltOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigateToModule(inventur.id, 'zaehliste');
            }}
          >
            Zählliste
          </Button>
          <Button 
            size="small" 
            startIcon={<AppRegistrationOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigateToModule(inventur.id, 'erfassung');
            }}
          >
            Erfassung
          </Button>
          <Button 
            size="small" 
            startIcon={<FactCheckOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigateToModule(inventur.id, 'kontrolle');
            }}
          >
            Kontrolle
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
          Inventurverwaltung
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddCircleOutline />}
          onClick={handleCreateInventur}
        >
          Neue Inventur
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Aktive Inventuren" icon={<InventoryOutlined />} iconPosition="start" />
          <Tab label="Abgeschlossene Inventuren" icon={<FactCheckOutlined />} iconPosition="start" />
          <Tab label="Auswertungen" icon={<AssessmentOutlined />} iconPosition="start" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={9}>
              <Box>
                {inventuren
                  .filter(inv => ['vorbereitet', 'in_bearbeitung'].includes(inv.status))
                  .map(renderInventurCard)}
                
                {inventuren.filter(inv => ['vorbereitet', 'in_bearbeitung'].includes(inv.status)).length === 0 && (
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      Keine aktiven Inventuren vorhanden.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<AddCircleOutline />} 
                      sx={{ mt: 2 }}
                      onClick={handleCreateInventur}
                    >
                      Neue Inventur erstellen
                    </Button>
                  </Paper>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Schnellzugriff
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  <ListItem button component="a" href="#" onClick={() => navigate('/inventur/export-import')}>
                    <ListItemIcon>
                      <ImportExportOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Export / Import" />
                  </ListItem>
                  <ListItem button component="a" href="#" onClick={() => navigate('/inventur/bestands-vortraege')}>
                    <ListItemIcon>
                      <CalculateOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Bestands-Vorträge" />
                  </ListItem>
                  <ListItem button component="a" href="#" onClick={() => navigate('/inventur/auswertung')}>
                    <ListItemIcon>
                      <AssessmentOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Warenauswertung" />
                  </ListItem>
                </List>
              </Paper>
              
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Hilfe
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" paragraph>
                  Die Inventurverwaltung ermöglicht die vollständige Durchführung und Auswertung von Inventuren.
                </Typography>
                <Typography variant="body2" paragraph>
                  Für eine neue Inventur erstellen Sie zunächst eine Zählliste und erfassen dann die gezählten Bestände.
                </Typography>
                <Typography variant="body2">
                  In der Kontrolle können nicht erfasste Artikel automatisch übernommen werden.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={9}>
              <Box>
                {inventuren
                  .filter(inv => ['abgeschlossen', 'freigegeben'].includes(inv.status))
                  .map(renderInventurCard)}
                
                {inventuren.filter(inv => ['abgeschlossen', 'freigegeben'].includes(inv.status)).length === 0 && (
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      Keine abgeschlossenen Inventuren vorhanden.
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Abgeschlossene Inventuren
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" paragraph>
                  Hier werden alle abgeschlossenen und freigegebenen Inventuren angezeigt.
                </Typography>
                <Typography variant="body2">
                  Abgeschlossene Inventuren können nicht mehr bearbeitet werden, aber Sie können Auswertungen und Berichte erstellen.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <AssessmentOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Inventur-Warenauswertung
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Detaillierte Auswertung der Inventurergebnisse mit Soll/Ist-Vergleich und Differenzberechnung.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/inventur/warenauswertung')}
                  >
                    Öffnen
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <CalculateOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Vorläufige Bewertung
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bewertung der erfassten Inventurbestände mit aktuellen Preisen vor Abschluss.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/inventur/vorlaeufige-bewertung')}
                  >
                    Öffnen
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <CalculateOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Bestands-Vorträge
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Erstellung von Bestandsvorträgen aus Inventurergebnissen für die Finanzbuchhaltung.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/inventur/bestands-vortraege')}
                  >
                    Öffnen
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <ImportExportOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Export/Import
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Export und Import von Inventurdaten für die externe Bearbeitung.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/inventur/export-import')}
                  >
                    Öffnen
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <ListAltOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Zähllisten
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Erstellung und Verwaltung von Zähllisten für verschiedene Lagerbereiche.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/inventur/zaehlisten')}
                  >
                    Öffnen
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <DeleteOutline sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Erfassungen löschen
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Löschen von Inventurerfassungen für einen Neustart der Inventur.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => {
                      if (inventuren.length > 0) {
                        handleLoescheErfassungen(inventuren[0].id);
                      }
                    }}
                  >
                    Öffnen
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Kontextmenü für Inventuren */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => menuInventurId && navigateToModule(menuInventurId, 'zaehliste')}>
          <ListItemIcon>
            <ListAltOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Zählliste</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => menuInventurId && navigateToModule(menuInventurId, 'erfassung')}>
          <ListItemIcon>
            <AppRegistrationOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Erfassung</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => menuInventurId && navigateToModule(menuInventurId, 'kontrolle')}>
          <ListItemIcon>
            <FactCheckOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Kontrolle</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => menuInventurId && navigateToModule(menuInventurId, 'bewertung')}>
          <ListItemIcon>
            <CalculateOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Vorläufige Bewertung</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => menuInventurId && navigateToModule(menuInventurId, 'warenauswertung')}>
          <ListItemIcon>
            <AssessmentOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Warenauswertung</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => menuInventurId && navigateToModule(menuInventurId, 'export')}>
          <ListItemIcon>
            <FileDownloadOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportieren</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => menuInventurId && navigateToModule(menuInventurId, 'import')}>
          <ListItemIcon>
            <FileUploadOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Importieren</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => menuInventurId && handleLoescheErfassungen(menuInventurId)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteOutline fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Erfassungen löschen</ListItemText>
        </MenuItem>
      </Menu>

      {/* Bestätigungsdialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => handleConfirmDialogClose(false)}
      >
        <DialogTitle>{confirmTitle}</DialogTitle>
        <DialogContent>
          <Typography>{confirmMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmDialogClose(false)}>Abbrechen</Button>
          <Button onClick={() => handleConfirmDialogClose(true)} color="primary" autoFocus>
            Bestätigen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventurPage; 