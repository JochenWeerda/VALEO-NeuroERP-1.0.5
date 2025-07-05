import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  BottomNavigation,
  BottomNavigationAction,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  QrCodeScanner as QrCodeScannerIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  MenuBook as MenuBookIcon,
  Assignment as AssignmentIcon,
  InventoryTwoTone as InventoryTwoToneIcon,
  CheckCircle as CheckCircleIcon,
  SwapHoriz as SwapHorizIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

// Pseudo-Authentifizierung für Demo-Zwecke
const getCurrentUser = () => {
  return {
    id: 1,
    name: 'Max Mustermann',
    position: 'Lagerist',
    avatar: 'https://i.pravatar.cc/150?img=3'
  };
};

// Daten für die Schnellzugriff-Karten
const quickAccessData = [
  {
    title: 'Wareneingang',
    icon: <LocalShippingIcon fontSize="large" sx={{ transform: 'scaleX(-1)' }} />,
    description: 'Artikel und Chargen scannen',
    route: '/mobile/scanner/wareneingang',
    color: '#4caf50'
  },
  {
    title: 'Warenausgang',
    icon: <LocalShippingIcon fontSize="large" />,
    description: 'Kommissionierung und Versand',
    route: '/mobile/scanner/warenausgang',
    color: '#2196f3'
  },
  {
    title: 'Inventur',
    icon: <AssignmentIcon fontSize="large" />,
    description: 'Bestandserfassung durchführen',
    route: '/mobile/scanner/inventur',
    color: '#ff9800'
  },
  {
    title: 'Umlagerung',
    icon: <SwapHorizIcon fontSize="large" />,
    description: 'Artikel zwischen Lagerplätzen verschieben',
    route: '/mobile/scanner/umlagerung',
    color: '#9c27b0'
  }
];

// Daten für die Liste der offenen Aufgaben
const aufgabenData = [
  {
    id: 1,
    title: 'Wareneingang Lieferung #L2025-0042',
    description: '15 Positionen offen, Lieferant: Agrar GmbH',
    icon: <LocalShippingIcon sx={{ transform: 'scaleX(-1)' }} />,
    route: '/mobile/aufgaben/wareneingang/1',
    status: 'offen',
    priorität: 'hoch'
  },
  {
    id: 2,
    title: 'Inventur Lager Ost',
    description: '42 Artikel zu zählen, Deadline: Heute 16:00 Uhr',
    icon: <AssignmentIcon />,
    route: '/mobile/aufgaben/inventur/2',
    status: 'offen',
    priorität: 'mittel'
  },
  {
    id: 3,
    title: 'Kommissionierung Auftrag #A2025-0123',
    description: '8 Positionen, Kunde: Landwirt Meyer',
    icon: <LocalShippingIcon />,
    route: '/mobile/aufgaben/kommissionierung/3',
    status: 'offen',
    priorität: 'niedrig'
  }
];

const MobileMainPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aufgaben, setAufgaben] = useState(aufgabenData);
  
  // In einer echten Anwendung würden hier Daten vom Server geladen
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        // API-Aufruf würde hier stattfinden
        // Simuliere API-Verzögerung
        await new Promise(resolve => setTimeout(resolve, 500));
        setUser(getCurrentUser());
      } catch (err) {
        console.error('Fehler beim Laden der Benutzerdaten:', err);
        setError('Benutzerdaten konnten nicht geladen werden');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);
  
  return (
    <Box sx={{ pb: 7 }}>
      {/* Header */}
      <AppBar position="sticky" color="primary">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mobiler Lagerzugriff
          </Typography>
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
          <IconButton color="inherit" sx={{ ml: 1 }}>
            <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        {/* Fehler-Anzeige */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Benutzer-Informationen */}
        {loading ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={user.avatar} 
              sx={{ width: 50, height: 50, mr: 2 }}
            />
            <Box>
              <Typography variant="h6">{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.position}
              </Typography>
            </Box>
          </Paper>
        )}
        
        {/* Schnellzugriff-Karten */}
        <Typography variant="h6" gutterBottom sx={{ px: 1 }}>
          Schnellzugriff
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {quickAccessData.map((item, index) => (
            <Grid item xs={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderTop: `4px solid ${item.color}`
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center',
                      mb: 1.5,
                      color: item.color
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" component="div" align="center">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {item.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    fullWidth 
                    variant="contained"
                    onClick={() => navigate(item.route)}
                    sx={{ bgcolor: item.color, '&:hover': { bgcolor: item.color, filter: 'brightness(0.9)' } }}
                  >
                    Öffnen
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Offene Aufgaben */}
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="subtitle1">Offene Aufgaben</Typography>
          </Box>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {aufgaben.length > 0 ? (
              aufgaben.map((aufgabe, index) => (
                <React.Fragment key={aufgabe.id}>
                  <ListItemButton onClick={() => navigate(aufgabe.route)}>
                    <ListItemIcon 
                      sx={{ 
                        color: aufgabe.priorität === 'hoch' ? 'error.main' : 
                               aufgabe.priorität === 'mittel' ? 'warning.main' : 
                               'success.main' 
                      }}
                    >
                      {aufgabe.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={aufgabe.title}
                      secondary={aufgabe.description}
                      primaryTypographyProps={{
                        fontWeight: aufgabe.priorität === 'hoch' ? 'bold' : 'normal'
                      }}
                    />
                  </ListItemButton>
                  {index < aufgaben.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText 
                  primary="Keine offenen Aufgaben" 
                  secondary="Alle Aufgaben wurden erledigt"
                  sx={{ textAlign: 'center', py: 2 }}
                />
              </ListItem>
            )}
          </List>
          <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button 
              fullWidth 
              variant="outlined"
              onClick={() => navigate('/mobile/aufgaben')}
            >
              Alle Aufgaben anzeigen
            </Button>
          </Box>
        </Paper>
        
        {/* Letzter Scan */}
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'secondary.main', color: 'white' }}>
            <Typography variant="subtitle1">Letzter Scan</Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2">Artikel: Weizenschrot Premium</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Gescannt vor 5 Minuten (10:45 Uhr)
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 1
              }}
            >
              <Box>
                <Typography variant="body2">
                  <strong>Charge:</strong> WS-2025-042
                </Typography>
                <Typography variant="body2">
                  <strong>Lagerplatz:</strong> Halle 2 / Regal B / Fach 04
                </Typography>
              </Box>
              <IconButton 
                color="primary"
                onClick={() => navigate('/mobile/scanner/wareneingang')}
              >
                <QrCodeScannerIcon fontSize="large" />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Container>
      
      {/* Bottom Navigation */}
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          switch(newValue) {
            case 0: // Home
              // Bereits auf der Home-Seite
              break;
            case 1: // Scan
              navigate('/mobile/scanner/wareneingang');
              break;
            case 2: // Inventar
              navigate('/mobile/inventar');
              break;
            case 3: // Profil
              navigate('/mobile/profil');
              break;
          }
        }}
        sx={{
          width: '100%',
          position: 'fixed',
          bottom: 0,
          zIndex: 1000,
          borderTop: '1px solid',
          borderColor: 'divider',
          boxShadow: 3
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Scan" icon={<QrCodeScannerIcon />} />
        <BottomNavigationAction label="Inventar" icon={<InventoryIcon />} />
        <BottomNavigationAction label="Profil" icon={<PersonIcon />} />
      </BottomNavigation>
    </Box>
  );
};

export default MobileMainPage; 