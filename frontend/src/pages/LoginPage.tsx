import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Link,
  Divider,
  Paper,
  Grid,
  Container,
  Fade,
  Zoom,
  Grow
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Login as LoginIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  VpnKey as VpnKeyIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowRight as ArrowRightIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Check as CheckIcon,
  Warning as WarningIcon2,
  Error as ErrorIcon2,
  Info as InfoIcon2,

  Help as HelpIcon2,
  Settings as SettingsIcon2,
  Notifications as NotificationsIcon2,
  AccountCircle as AccountCircleIcon2,
  Business as BusinessIcon2,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Store as StoreIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  InsertChart as InsertChartIcon,
  Analytics as AnalyticsIcon,
  DataUsage as DataUsageIcon,
  Storage as StorageIcon,
  Cloud as CloudIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Sync as SyncIcon,
  Autorenew as AutorenewIcon,
  Loop as LoopIcon,
  RotateRight as RotateRightIcon,
  RotateLeft as RotateLeftIcon,
  Flip as FlipIcon,
  Transform as TransformIcon,
  Crop as CropIcon,
  CropFree as CropFreeIcon,
  CropSquare as CropSquareIcon,
  Crop169 as Crop169Icon,
  Crop32 as Crop32Icon,
  Crop54 as Crop54Icon,
  Crop75 as Crop75Icon,
  CropDin as CropDinIcon,
  CropOriginal as CropOriginalIcon,
  CropPortrait as CropPortraitIcon,
  CropLandscape as CropLandscapeIcon,
  CropRotate as CropRotateIcon,

} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  token?: string;
  error?: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Formular-Handler
  const handleInputChange = (field: keyof LoginFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Login-Funktion
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Last9 Performance Tracking starten
      const startTime = performance.now();

      // Simuliere API-Call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock-Login-Logik
      const mockResponse: LoginResponse = await mockLoginAPI(formData);

      if (mockResponse.success && mockResponse.user && mockResponse.token) {
        // Last9 Performance Tracking beenden
        const duration = performance.now() - startTime;
        if (typeof window !== 'undefined' && (window as any).last9Metrics) {
          await (window as any).last9Metrics.trackERPOperation('user_login', duration, true);
          await (window as any).last9Metrics.trackUserInteraction('login_success', 'LoginPage');
        }

        // Erfolg setzen
        setSuccess(`Willkommen zurück, ${mockResponse.user.name}!`);
        
                 // Auth Context verwenden
         login({ username: mockResponse.user!.email, password: '' });

        // Nach Dashboard weiterleiten
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        throw new Error(mockResponse.error || 'Login fehlgeschlagen');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(errorMessage);

      // Last9 Error Tracking
      if (typeof window !== 'undefined' && (window as any).last9Metrics) {
        await (window as any).last9Metrics.trackError(new Error(errorMessage), {
          component: 'LoginPage',
          action: 'login_attempt',
          email: formData.email
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock API-Funktion
  const mockLoginAPI = async (data: LoginFormData): Promise<LoginResponse> => {
    // Simuliere verschiedene Login-Szenarien
    if (data.email === 'admin@valeo.com' && data.password === 'admin123') {
      return {
        success: true,
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@valeo.com',
          role: 'admin',
          avatar: 'https://via.placeholder.com/40/1976d2/ffffff?text=A'
        },
        token: 'mock-jwt-token-admin-123'
      };
    } else if (data.email === 'user@valeo.com' && data.password === 'user123') {
      return {
        success: true,
        user: {
          id: '2',
          name: 'Standard User',
          email: 'user@valeo.com',
          role: 'user',
          avatar: 'https://via.placeholder.com/40/4caf50/ffffff?text=U'
        },
        token: 'mock-jwt-token-user-456'
      };
    } else if (data.email === 'manager@valeo.com' && data.password === 'manager123') {
      return {
        success: true,
        user: {
          id: '3',
          name: 'Manager User',
          email: 'manager@valeo.com',
          role: 'manager',
          avatar: 'https://via.placeholder.com/40/ff9800/ffffff?text=M'
        },
        token: 'mock-jwt-token-manager-789'
      };
    } else {
      // Simuliere Netzwerkfehler
      if (Math.random() < 0.1) {
        throw new Error('Netzwerkfehler - Bitte versuchen Sie es erneut');
      }
      
      return {
        success: false,
        error: 'Ungültige E-Mail oder Passwort'
      };
    }
  };

  // Passwort-Sichtbarkeit umschalten
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Demo-Credentials setzen
  const setDemoCredentials = (type: 'admin' | 'user' | 'manager') => {
    const credentials = {
      admin: { email: 'admin@valeo.com', password: 'admin123' },
      user: { email: 'user@valeo.com', password: 'user123' },
      manager: { email: 'manager@valeo.com', password: 'manager123' }
    };

    setFormData(prev => ({
      ...prev,
      ...credentials[type]
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Grid container spacing={4} justifyContent="center" alignItems="center">
        {/* Linke Seite - VALEO Branding */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Zoom in timeout={1200}>
                <Box sx={{ mb: 3 }}>
                  <BusinessIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    VALEO NeuroERP
                  </Typography>
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    Intelligentes ERP-System mit KI-Integration
                  </Typography>
                </Box>
              </Zoom>
              
              <Grow in timeout={1400}>
                <Box sx={{ mt: 4 }}>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Erleben Sie die Zukunft des Enterprise Resource Planning
                  </Typography>
                  
                  {/* Feature-Liste */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CheckCircleIcon color="success" />
                      <Typography>KI-gestützte Prozessoptimierung</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CheckCircleIcon color="success" />
                      <Typography>Echtzeit-Datenanalyse</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CheckCircleIcon color="success" />
                      <Typography>Intelligente Automatisierung</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CheckCircleIcon color="success" />
                      <Typography>Umfassende Berichterstattung</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grow>
            </Box>
          </Fade>
        </Grid>

        {/* Rechte Seite - Login Formular */}
        <Grid item xs={12} md={6}>
          <Zoom in timeout={800}>
            <Card sx={{ 
              maxWidth: 400, 
              mx: 'auto', 
              boxShadow: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h4" component="h2" gutterBottom>
                    Anmeldung
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Melden Sie sich in Ihrem VALEO NeuroERP-Konto an
                  </Typography>
                </Box>

                {/* Erfolgs-/Fehlermeldungen */}
                {success && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                  </Alert>
                )}
                
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {/* Login Formular */}
                <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="E-Mail-Adresse"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Passwort"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VpnKeyIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.rememberMe}
                        onChange={handleInputChange('rememberMe')}
                        color="primary"
                      />
                    }
                    label="Angemeldet bleiben"
                    sx={{ mb: 3 }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                    sx={{ 
                      mb: 3,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                      }
                    }}
                  >
                    {loading ? 'Anmeldung läuft...' : 'Anmelden'}
                  </Button>

                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      ODER
                    </Typography>
                  </Divider>

                  {/* Demo-Credentials */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Demo-Anmeldung:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setDemoCredentials('admin')}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Admin
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setDemoCredentials('user')}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        User
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setDemoCredentials('manager')}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Manager
                      </Button>
                    </Box>
                  </Box>

                  {/* Zusätzliche Links */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Link href="#" variant="body2" sx={{ display: 'block', mb: 1 }}>
                      Passwort vergessen?
                    </Link>
                    <Link href="#" variant="body2" sx={{ display: 'block', mb: 1 }}>
                      Hilfe benötigt?
                    </Link>
                    <Link href="#" variant="body2">
                      Kontakt Support
                    </Link>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage; 