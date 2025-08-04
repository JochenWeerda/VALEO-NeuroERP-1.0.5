import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { apiService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

// Validierungsschema
const loginSchema = Yup.object({
  email: Yup.string()
    .email('Ungültige E-Mail-Adresse')
    .required('E-Mail ist erforderlich'),
  password: Yup.string()
    .min(6, 'Passwort muss mindestens 6 Zeichen lang sein')
    .required('Passwort ist erforderlich'),
});

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiService.login(values.email, values.password);
        
        // User im Store speichern
        const user = await apiService.getCurrentUser();
        login(response.access_token, user);

        // Remember Me
        if (values.rememberMe) {
          localStorage.setItem('rememberEmail', values.email);
        } else {
          localStorage.removeItem('rememberEmail');
        }

        // Zur Startseite navigieren
        navigate('/');
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Login fehlgeschlagen');
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Remember Me - E-Mail vorausfüllen
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      formik.setFieldValue('email', rememberedEmail);
      formik.setFieldValue('rememberMe', true);
    }
  }, []);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Logo und Titel */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BusinessIcon sx={{ fontSize: 40, mr: 1, color: 'primary.main' }} />
            <Typography component="h1" variant="h4" fontWeight="bold">
              VALEO NeuroERP
            </Typography>
          </Box>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Willkommen zurück
          </Typography>

          {/* Fehleranzeige */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login-Formular */}
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="E-Mail-Adresse"
              type="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
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
              id="password"
              name="password"
              label="Passwort"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    id="rememberMe"
                    name="rememberMe"
                    color="primary"
                    checked={formik.values.rememberMe}
                    onChange={formik.handleChange}
                  />
                }
                label="Angemeldet bleiben"
              />

              <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                  Passwort vergessen?
                </Typography>
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading || !formik.isValid}
              sx={{ mb: 2, py: 1.5 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Anmelden'
              )}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                ODER
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Noch kein Konto?{' '}
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Typography component="span" variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                    Jetzt registrieren
                  </Typography>
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} VALEO GmbH. Alle Rechte vorbehalten.
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Link to="/privacy" style={{ textDecoration: 'none', marginRight: 16 }}>
              <Typography variant="body2" color="primary" component="span">
                Datenschutz
              </Typography>
            </Link>
            <Link to="/terms" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary" component="span">
                Nutzungsbedingungen
              </Typography>
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};