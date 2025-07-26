import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button,
  Grid,
  Container,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Avatar,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Alert,
  Breadcrumbs,
  Link,
  AppBar,
  Toolbar,
  Menu,
  MenuItem as MenuItemType,
  Switch,
  FormControlLabel,
  Drawer,
  ListItemButton,
  InputAdornment,
  Autocomplete
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Book as BookIcon,
  School as SchoolIcon,
  Help as HelpIcon,
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  VideoLibrary as VideoIcon,
  Article as ArticleIcon,
  Quiz as QuizIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  KeyboardArrowRight as ArrowRightIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  Work as WorkIcon,
  Code as CodeIcon,
  Build as BuildIcon,
  Storage as StorageIcon,
  Cloud as CloudIcon,
  Speed as SpeedIcon,
  Verified as VerifiedIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  AccountCircle as AccountCircleIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  Menu as MenuIcon,
  BugReport as BugReportIcon,
  Close as CloseIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Last9Test } from '../components/DataDogTest';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  completed: boolean;
  progress: number;
  rating: number;
  instructor: string;
  videoUrl?: string;
  materials: string[];
}

interface DocumentationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  lastUpdated: string;
  author: string;
  views: number;
  rating: number;
  content: string;
}

interface FavoriteItem {
  id: string;
  title: string;
  type: 'menu' | 'bi' | 'parameter';
  path: string;
  icon: React.ReactNode;
  category: string;
}

interface BIParameter {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  target: number;
  category: string;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openVideoDialog, setOpenVideoDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [darkMode, setDarkMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [biParameters, setBiParameters] = useState<BIParameter[]>([]);
  const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  // Mock-Daten für Lernmodule
  const learningModules: LearningModule[] = [
    {
      id: '1',
      title: 'VALEO NeuroERP Grundlagen',
      description: 'Lernen Sie die Grundfunktionen des ERP-Systems kennen',
      duration: '45 Min',
      difficulty: 'beginner',
      category: 'Grundlagen',
      completed: false,
      progress: 0,
      rating: 4.8,
      instructor: 'Dr. Anna Schmidt',
      videoUrl: 'https://example.com/video1',
      materials: ['PDF-Anleitung', 'Übungsdateien', 'Quiz']
    },
    {
      id: '2',
      title: 'Datenverwaltung & Analytics',
      description: 'Erweiterte Datenanalyse und Reporting-Funktionen',
      duration: '60 Min',
      difficulty: 'intermediate',
      category: 'Analytics',
      completed: false,
      progress: 25,
      rating: 4.6,
      instructor: 'Prof. Michael Weber',
      videoUrl: 'https://example.com/video2',
      materials: ['Datenbeispiele', 'Analytics-Tools', 'Fallstudien']
    },
    {
      id: '3',
      title: 'KI-gestützte Entscheidungsfindung',
      description: 'Nutzen Sie KI-Algorithmen für bessere Geschäftsentscheidungen',
      duration: '90 Min',
      difficulty: 'advanced',
      category: 'KI & ML',
      completed: false,
      progress: 0,
      rating: 4.9,
      instructor: 'Dr. Sarah Müller',
      videoUrl: 'https://example.com/video3',
      materials: ['KI-Modelle', 'Datenbanken', 'API-Dokumentation']
    },
    {
      id: '4',
      title: 'Prozessoptimierung',
      description: 'Optimieren Sie Ihre Geschäftsprozesse mit NeuroERP',
      duration: '75 Min',
      difficulty: 'intermediate',
      category: 'Prozesse',
      completed: true,
      progress: 100,
      rating: 4.7,
      instructor: 'Ing. Thomas Fischer',
      videoUrl: 'https://example.com/video4',
      materials: ['Prozessdiagramme', 'Optimierungstools', 'Best Practices']
    }
  ];

  // Mock-Daten für Dokumentation
  const documentationItems: DocumentationItem[] = [
    {
      id: '1',
      title: 'Installation & Setup Guide',
      description: 'Schritt-für-Schritt Anleitung zur Installation von VALEO NeuroERP',
      category: 'Installation',
      tags: ['Setup', 'Installation', 'Konfiguration'],
      lastUpdated: '2024-01-15',
      author: 'System Administration',
      views: 1247,
      rating: 4.8,
      content: 'Detaillierte Installationsanleitung...'
    },
    {
      id: '2',
      title: 'API-Dokumentation',
      description: 'Vollständige API-Referenz für Entwickler',
      category: 'Entwicklung',
      tags: ['API', 'REST', 'Integration'],
      lastUpdated: '2024-01-10',
      author: 'Development Team',
      views: 892,
      rating: 4.6,
      content: 'API-Endpunkte und Authentifizierung...'
    },
    {
      id: '3',
      title: 'Sicherheitsrichtlinien',
      description: 'Best Practices für Datensicherheit und Compliance',
      category: 'Sicherheit',
      tags: ['Sicherheit', 'Compliance', 'GDPR'],
      lastUpdated: '2024-01-12',
      author: 'Security Team',
      views: 567,
      rating: 4.9,
      content: 'Sicherheitsrichtlinien und Compliance...'
    }
  ];

  // Mock-Daten für Favoriten
  const availableFavorites: FavoriteItem[] = [
    { id: '1', title: 'Dashboard', type: 'menu', path: '/dashboard', icon: <DashboardIcon />, category: 'Navigation' },
    { id: '2', title: 'Umsatz-Analyse', type: 'bi', path: '/analytics/sales', icon: <BarChartIcon />, category: 'Business Intelligence' },
    { id: '3', title: 'Kundenzufriedenheit', type: 'parameter', path: '/kpi/satisfaction', icon: <TrendingUpIcon />, category: 'KPIs' },
    { id: '4', title: 'Lagerbestand', type: 'bi', path: '/analytics/inventory', icon: <InventoryIcon />, category: 'Business Intelligence' },
    { id: '5', title: 'Personal-Management', type: 'menu', path: '/personal', icon: <PersonIcon />, category: 'Navigation' },
    { id: '6', title: 'Produktivität', type: 'parameter', path: '/kpi/productivity', icon: <ShowChartIcon />, category: 'KPIs' }
  ];

  // Mock-Daten für BI-Parameter
  const mockBIParameters: BIParameter[] = [
    { id: '1', name: 'Umsatz', value: 1250000, unit: '€', trend: 'up', target: 1200000, category: 'Finanzen' },
    { id: '2', name: 'Kundenzufriedenheit', value: 4.8, unit: '/5', trend: 'up', target: 4.5, category: 'Service' },
    { id: '3', name: 'Produktivität', value: 87, unit: '%', trend: 'stable', target: 85, category: 'Operationen' },
    { id: '4', name: 'Lagerumschlag', value: 12.5, unit: 'x/Jahr', trend: 'up', target: 10, category: 'Logistik' },
    { id: '5', name: 'Mitarbeiterfluktuation', value: 8.2, unit: '%', trend: 'down', target: 10, category: 'Personal' }
  ];

  useEffect(() => {
    setBiParameters(mockBIParameters);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleVideoPlay = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
    setOpenVideoDialog(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Anfänger';
      case 'intermediate': return 'Fortgeschritten';
      case 'advanced': return 'Experte';
      default: return difficulty;
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    setUserMenuAnchorEl(null);
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleAddFavorite = (item: FavoriteItem) => {
    if (!favorites.find(fav => fav.id === item.id)) {
      setFavorites([...favorites, item]);
    }
  };

  const handleRemoveFavorite = (itemId: string) => {
    setFavorites(favorites.filter(fav => fav.id !== itemId));
  };

  const handleGlobalSearch = (term: string) => {
    setGlobalSearchTerm(term);
    // Hier würde die globale Suche implementiert werden
    console.log('Globale Suche nach:', term);
  };

  const filteredModules = learningModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: darkMode ? '#121212' : '#F5F6F7' }}>
      {/* Header mit Anmeldung, Suchleiste und Einstellungen */}
      <AppBar position="static" sx={{ bgcolor: darkMode ? '#1e1e1e' : '#0A6ED1' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 0, mr: 3, fontWeight: 700 }}>
            VALEO NeuroERP
          </Typography>

          {/* Globale Suchleiste */}
          <Box sx={{ flexGrow: 1, maxWidth: 600, mx: 2 }}>
            <Autocomplete
              freeSolo
              options={[
                'Dashboard',
                'Personal-Management',
                'Finanzen',
                'Lager',
                'Produktion',
                'Analytics',
                'Dokumentation',
                'Support'
              ]}
              value={globalSearchTerm}
              onChange={(event, newValue) => {
                if (typeof newValue === 'string') {
                  handleGlobalSearch(newValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Globale Suche..."
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: darkMode ? '#2d2d2d' : 'white',
                      '& fieldset': {
                        borderColor: darkMode ? '#555' : '#ccc',
                      },
                      '&:hover fieldset': {
                        borderColor: darkMode ? '#777' : '#999',
                      },
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>

          {/* Theme Toggle */}
          <IconButton
            color="inherit"
            onClick={handleThemeToggle}
            sx={{ mr: 1 }}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* Benachrichtigungen */}
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Einstellungen */}
          <IconButton
            color="inherit"
            onClick={() => setSettingsOpen(true)}
            sx={{ mr: 1 }}
          >
            <SettingsIcon />
          </IconButton>

          {/* Login Button */}
          {!isAuthenticated && (
            <Tooltip title="Anmelden">
              <IconButton
                color="inherit"
                onClick={handleLogin}
                sx={{ mr: 1 }}
              >
                <LoginIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Last9 Test Button */}
          <Tooltip title="Last9 Observability Test">
            <IconButton
              color="inherit"
              onClick={() => {
                // Scroll to Last9 Test component
                const last9Test = document.getElementById('last9-test');
                if (last9Test) {
                  last9Test.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              sx={{ mr: 1 }}
            >
              <BugReportIcon />
            </IconButton>
          </Tooltip>

          {/* Benutzer-Menü */}
          <IconButton
            color="inherit"
            onClick={(e) => setUserMenuAnchorEl(e.currentTarget)}
          >
            {isAuthenticated ? (
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.name.charAt(0)}
              </Avatar>
            ) : (
              <AccountCircleIcon />
            )}
          </IconButton>

          {/* Benutzer-Menü Dropdown */}
          <Menu
            anchorEl={userMenuAnchorEl}
            open={Boolean(userMenuAnchorEl)}
            onClose={() => setUserMenuAnchorEl(null)}
          >
            {isAuthenticated ? (
              <>
                <MenuItem onClick={() => setUserMenuAnchorEl(null)}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  {user?.name}
                </MenuItem>
                <MenuItem onClick={() => setUserMenuAnchorEl(null)}>
                  <ListItemIcon>
                    <EmailIcon fontSize="small" />
                  </ListItemIcon>
                  {user?.email}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Abmelden
                </MenuItem>
              </>
            ) : (
              <MenuItem onClick={handleLogin}>
                <ListItemIcon>
                  <LoginIcon fontSize="small" />
                </ListItemIcon>
                Anmelden
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Einstellungen-Drawer */}
      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 400,
            bgcolor: darkMode ? '#1e1e1e' : 'white',
            color: darkMode ? 'white' : 'inherit'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Einstellungen</Typography>
            <IconButton onClick={() => setSettingsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Theme-Einstellungen */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Erscheinungsbild
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={handleThemeToggle}
                  color="primary"
                />
              }
              label="Dark Mode"
            />
          </Card>

          {/* Favoriten */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Meine Favoriten
            </Typography>
            
            {/* Aktuelle Favoriten */}
            {favorites.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Aktuelle Favoriten:
                </Typography>
                <List dense>
                  {favorites.map((fav) => (
                    <ListItem key={fav.id} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {fav.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={fav.title}
                        secondary={fav.category}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFavorite(fav.id)}
                        color="error"
                      >
                        <FavoriteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Verfügbare Favoriten hinzufügen */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Favoriten hinzufügen:
            </Typography>
            <List dense>
              {availableFavorites
                .filter(item => !favorites.find(fav => fav.id === item.id))
                .map((item) => (
                  <ListItem key={item.id} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.title}
                      secondary={item.category}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleAddFavorite(item)}
                      color="primary"
                    >
                      <FavoriteBorderIcon />
                    </IconButton>
                  </ListItem>
                ))}
            </List>
          </Card>

          {/* BI-Parameter */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Business Intelligence Parameter
            </Typography>
            <List dense>
              {biParameters.map((param) => (
                <ListItem key={param.id} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {param.trend === 'up' ? (
                      <TrendingUpIcon color="success" />
                    ) : param.trend === 'down' ? (
                      <TrendingUpIcon color="error" sx={{ transform: 'rotate(180deg)' }} />
                    ) : (
                      <TimelineIcon color="action" />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={param.name}
                    secondary={`${param.value} ${param.unit} (Ziel: ${param.target} ${param.unit})`}
                  />
                  <Chip 
                    label={param.category} 
                    size="small" 
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Box>
      </Drawer>

      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #0A6ED1 0%, #1976d2 50%, #42a5f5 100%)',
        color: 'white',
        py: 8
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
                VALEO NeuroERP 2.0
              </Typography>
              <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                Intelligentes ERP-System mit KI-Integration
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
                Entdecken Sie die Zukunft der Unternehmensführung mit unserem fortschrittlichen 
                ERP-System. Kombinieren Sie traditionelle ERP-Funktionen mit modernster 
                künstlicher Intelligenz für optimale Geschäftsergebnisse.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/dashboard')}
                  sx={{ 
                    bgcolor: 'white', 
                    color: '#0A6ED1',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  Dashboard öffnen
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  sx={{ borderColor: 'white', color: 'white' }}
                >
                  Demo anfordern
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <AutoAwesomeIcon sx={{ fontSize: 120, opacity: 0.8 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" href="#">
            Startseite
          </Link>
          <Typography color="text.primary">VALEO NeuroERP</Typography>
        </Breadcrumbs>

        {/* Tabs */}
        <Card sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="ERP sections">
              <Tab 
                icon={<DashboardIcon />} 
                label="Übersicht" 
                iconPosition="start"
              />
              <Tab 
                icon={<SchoolIcon />} 
                label="Lernbereich" 
                iconPosition="start"
              />
              <Tab 
                icon={<BookIcon />} 
                label="Dokumentation" 
                iconPosition="start"
              />
              <Tab 
                icon={<HelpIcon />} 
                label="Wiki & Support" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <TabPanel value={tabValue} index={0}>
            {/* Übersicht */}
            <Grid container spacing={4}>
              {/* System-Status */}
              <Grid item xs={12} md={8}>
                <Card sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon color="primary" />
                    System-Status
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <VerifiedIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                        <Typography variant="h6" color="success.main">Online</Typography>
                        <Typography variant="body2" color="text.secondary">System-Status</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <SpeedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h6">99.9%</Typography>
                        <Typography variant="body2" color="text.secondary">Uptime</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <GroupIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                        <Typography variant="h6">1,247</Typography>
                        <Typography variant="body2" color="text.secondary">Aktive Benutzer</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <SecurityIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                        <Typography variant="h6">256-bit</Typography>
                        <Typography variant="body2" color="text.secondary">Verschlüsselung</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>

                {/* Schnellzugriff */}
                <Card sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkIcon color="primary" />
                    Schnellzugriff
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { title: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', color: '#0A6ED1' },
                      { title: 'Personal', icon: <PersonIcon />, path: '/personal', color: '#107C41' },
                      { title: 'Finanzen', icon: <BusinessIcon />, path: '/finance', color: '#E9730C' },
                      { title: 'Lager', icon: <InventoryIcon />, path: '/warehouse', color: '#BB0000' },
                      { title: 'Produktion', icon: <BuildIcon />, path: '/production', color: '#6F3CC4' },
                      { title: 'Analytics', icon: <AnalyticsIcon />, path: '/reporting', color: '#0F828F' }
                    ].map((item) => (
                      <Grid item xs={6} sm={4} md={2} key={item.title}>
                        <Card 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                            }
                          }}
                          onClick={() => navigate(item.path)}
                        >
                          <Box sx={{ color: item.color, mb: 1 }}>
                            {item.icon}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.title}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Card>
              </Grid>

              {/* Sidebar */}
              <Grid item xs={12} md={4}>
                {/* Aktuelle Aktivitäten */}
                <Card sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Aktuelle Aktivitäten
                  </Typography>
                  <List>
                    {[
                      { text: 'Neue Benutzer registriert', time: 'vor 5 Min', icon: <PersonIcon /> },
                      { text: 'System-Update abgeschlossen', time: 'vor 15 Min', icon: <CheckCircleIcon /> },
                      { text: 'Backup erfolgreich', time: 'vor 1 Std', icon: <StorageIcon /> },
                      { text: 'KI-Modell trainiert', time: 'vor 2 Std', icon: <PsychologyIcon /> }
                    ].map((activity, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {activity.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={activity.text}
                          secondary={activity.time}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Card>

                {/* Support */}
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Support & Kontakt
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText primary="support@valeo-neuroerp.de" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText primary="+49 89 1234 5678" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      <ListItemText primary="München, Deutschland" />
                    </ListItem>
                  </List>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<SupportIcon />}
                    sx={{ mt: 2 }}
                  >
                    Support anfordern
                  </Button>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* Lernbereich */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                Lernbereich & Schulungen
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Erweitern Sie Ihre Kenntnisse mit unseren umfassenden Schulungsmodulen und 
                interaktiven Lerninhalten.
              </Typography>

              {/* Filter */}
              <Card sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      placeholder="Module durchsuchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Kategorie</InputLabel>
                      <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        label="Kategorie"
                      >
                        <MenuItem value="all">Alle Kategorien</MenuItem>
                        <MenuItem value="Grundlagen">Grundlagen</MenuItem>
                        <MenuItem value="Analytics">Analytics</MenuItem>
                        <MenuItem value="KI & ML">KI & ML</MenuItem>
                        <MenuItem value="Prozesse">Prozesse</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                    >
                      Filter zurücksetzen
                    </Button>
                  </Grid>
                </Grid>
              </Card>

              {/* Lernmodule */}
              <Grid container spacing={3}>
                {filteredModules.map((module) => (
                  <Grid item xs={12} md={6} key={module.id}>
                    <Card sx={{ p: 3, height: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Chip 
                          label={module.category} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                        <Chip 
                          label={getDifficultyText(module.difficulty)}
                          size="small"
                          color={getDifficultyColor(module.difficulty) as any}
                        />
                      </Box>

                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {module.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {module.description}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating value={module.rating} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({module.rating})
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {module.duration}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                          • {module.instructor}
                        </Typography>
                      </Box>

                      {module.progress > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Fortschritt</Typography>
                            <Typography variant="body2">{module.progress}%</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={module.progress} 
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {module.materials.map((material, index) => (
                          <Chip 
                            key={index} 
                            label={material} 
                            size="small" 
                            variant="outlined"
                          />
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="contained" 
                          startIcon={<PlayIcon />}
                          onClick={() => handleVideoPlay(module.videoUrl || '')}
                          fullWidth
                        >
                          {module.completed ? 'Wiederholen' : 'Starten'}
                        </Button>
                        {module.completed && (
                          <CheckCircleIcon color="success" sx={{ alignSelf: 'center' }} />
                        )}
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* Dokumentation */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                Dokumentation & Handbücher
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Umfassende Dokumentation, API-Referenzen und technische Handbücher für 
                Entwickler und Administratoren.
              </Typography>

              {/* Dokumentationskategorien */}
              <Grid container spacing={3}>
                {[
                  { title: 'Benutzerhandbuch', icon: <BookIcon />, count: 15, color: '#0A6ED1' },
                  { title: 'API-Dokumentation', icon: <CodeIcon />, count: 8, color: '#107C41' },
                  { title: 'Administration', icon: <SettingsIcon />, count: 12, color: '#E9730C' },
                  { title: 'Entwicklung', icon: <BuildIcon />, count: 6, color: '#BB0000' },
                  { title: 'Sicherheit', icon: <SecurityIcon />, count: 4, color: '#6F3CC4' },
                  { title: 'Integration', icon: <CloudIcon />, count: 9, color: '#0F828F' }
                ].map((category) => (
                  <Grid item xs={12} sm={6} md={4} key={category.title}>
                    <Card sx={{ p: 3, cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ color: category.color, mr: 2 }}>
                          {category.icon}
                        </Box>
                        <Box>
                          <Typography variant="h6">{category.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {category.count} Dokumente
                          </Typography>
                        </Box>
                      </Box>
                      <Button variant="outlined" fullWidth>
                        Durchsuchen
                      </Button>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Neueste Dokumentation */}
              <Typography variant="h5" sx={{ mt: 4, mb: 3 }}>
                Neueste Dokumentation
              </Typography>
              <Grid container spacing={3}>
                {documentationItems.map((item) => (
                  <Grid item xs={12} md={6} key={item.id}>
                    <Card sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Chip label={item.category} size="small" color="primary" />
                        <Typography variant="body2" color="text.secondary">
                          {item.lastUpdated}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating value={item.rating} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({item.rating})
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                          {item.views} Aufrufe
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {item.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" size="small">
                          Lesen
                        </Button>
                        <Button variant="outlined" size="small" startIcon={<DownloadIcon />}>
                          PDF
                        </Button>
                        <Button variant="outlined" size="small" startIcon={<PrintIcon />}>
                          Drucken
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {/* Wiki & Support */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                Wiki & Support
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Finden Sie Antworten auf häufig gestellte Fragen, Lösungen für Probleme 
                und umfassende Support-Ressourcen.
              </Typography>

              <Grid container spacing={4}>
                {/* FAQ */}
                <Grid item xs={12} md={8}>
                  <Card sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ mb: 3 }}>
                      Häufig gestellte Fragen (FAQ)
                    </Typography>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Wie installiere ich VALEO NeuroERP?</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          Die Installation erfolgt über unseren Installer. Laden Sie die 
                          neueste Version herunter und folgen Sie der Schritt-für-Schritt-Anleitung.
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Wie konfiguriere ich die KI-Funktionen?</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          Die KI-Funktionen können über das Admin-Panel konfiguriert werden. 
                          Sie benötigen entsprechende Berechtigungen und API-Schlüssel.
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Wie sichere ich meine Daten?</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          Wir empfehlen regelmäßige Backups und die Verwendung unserer 
                          integrierten Sicherheitsfunktionen. Kontaktieren Sie unser Support-Team.
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  </Card>
                </Grid>

                {/* Support-Kanäle */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Support-Kanäle
                    </Typography>
                    <List>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <EmailIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="E-Mail Support"
                          secondary="support@valeo-neuroerp.de"
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <PhoneIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Telefon Support"
                          secondary="+49 89 1234 5678"
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <HelpIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Live Chat"
                          secondary="24/7 verfügbar"
                        />
                      </ListItem>
                    </List>
                  </Card>

                  <Card sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Community
                    </Typography>
                    <List>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <GroupIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Forum"
                          secondary="Diskussionen & Lösungen"
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <VideoIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Video-Tutorials"
                          secondary="Schritt-für-Schritt Anleitungen"
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <ArticleIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Blog"
                          secondary="News & Updates"
                        />
                      </ListItem>
                    </List>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </Card>
      </Container>

      {/* Video Dialog */}
      <Dialog 
        open={openVideoDialog} 
        onClose={() => setOpenVideoDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Schulungsvideo</DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%', height: 400, bgcolor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="white">
              Video-Player würde hier angezeigt werden
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVideoDialog(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>

      {/* Last9 Test */}
      <Box id="last9-test" sx={{ mt: 4 }}>
        <Last9Test />
      </Box>
    </Box>
  );
};

export default LandingPage; 