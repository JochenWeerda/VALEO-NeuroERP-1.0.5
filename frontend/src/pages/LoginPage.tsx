import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Paper
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Business as BusinessIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { Form, Input, Checkbox, message } from 'antd';
import { useApi } from '../contexts/ApiContext';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useApi();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (values: LoginFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await login({
        username: values.username,
        password: values.password
      });
      
      if (response.success) {
        message.success('Anmeldung erfolgreich!');
        navigate('/dashboard');
      } else {
        setError(response.error || 'Anmeldung fehlgeschlagen');
        message.error('Anmeldung fehlgeschlagen');
      }
    } catch (err) {
      setError('Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.');
      message.error('Anmeldung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterFormData) => {
    if (values.password !== values.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Hier würde die Registrierung über die API erfolgen
      // Da die API noch keine Registrierung unterstützt, simulieren wir sie
      message.success('Registrierung erfolgreich! Sie können sich jetzt anmelden.');
      setIsLoginMode(true);
      registerForm.resetFields();
    } catch (err) {
      setError('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      message.error('Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setError(null);
    loginForm.resetFields();
    registerForm.resetFields();
  };

  return (
    <Box className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Box className="w-full max-w-md">
        {/* Header */}
        <Box className="text-center mb-8">
          <Box className="flex items-center justify-center mb-4">
            <BusinessIcon sx={{ fontSize: 48, color: '#1976d2', mr: 2 }} />
            <Typography variant="h3" className="font-bold text-gray-800">
              VALEO
            </Typography>
          </Box>
          <Typography variant="h5" className="font-semibold text-gray-700 mb-2">
            NeuroERP System
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Intelligente ERP-Lösung mit KI-Integration
          </Typography>
        </Box>

        {/* Login/Register Card */}
        <Card className="shadow-2xl border-0">
          <CardContent className="p-8">
            {/* Mode Toggle */}
            <Box className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <Button
                fullWidth
                variant={isLoginMode ? 'contained' : 'text'}
                onClick={() => setIsLoginMode(true)}
                className={`rounded-md ${isLoginMode ? 'bg-white shadow-sm' : ''}`}
              >
                <LockIcon className="mr-2" />
                Anmelden
              </Button>
              <Button
                fullWidth
                variant={!isLoginMode ? 'contained' : 'text'}
                onClick={() => setIsLoginMode(false)}
                className={`rounded-md ${!isLoginMode ? 'bg-white shadow-sm' : ''}`}
              >
                <PersonIcon className="mr-2" />
                Registrieren
              </Button>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}

            {/* Login Form */}
            {isLoginMode ? (
              <Form
                form={loginForm}
                onFinish={handleLogin}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="username"
                  label="Benutzername"
                  rules={[
                    { required: true, message: 'Bitte geben Sie Ihren Benutzernamen ein' }
                  ]}
                >
                  <Input
                    prefix={<PersonIcon className="text-gray-400" />}
                    placeholder="ihr.benutzername"
                    className="h-12"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Passwort"
                  rules={[
                    { required: true, message: 'Bitte geben Sie Ihr Passwort ein' },
                    { min: 6, message: 'Passwort muss mindestens 6 Zeichen lang sein' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockIcon className="text-gray-400" />}
                    placeholder="Ihr Passwort"
                    className="h-12"
                    visibilityToggle={{
                      visible: showPassword,
                      onVisibleChange: setShowPassword
                    }}
                  />
                </Form.Item>

                <Form.Item name="rememberMe" valuePropName="checked">
                  <Checkbox>Angemeldet bleiben</Checkbox>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    className="h-12 bg-blue-600 hover:bg-blue-700"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SecurityIcon />}
                  >
                    {loading ? 'Anmeldung läuft...' : 'Anmelden'}
                  </Button>
                </Form.Item>
              </Form>
            ) : (
              /* Register Form */
              <Form
                form={registerForm}
                onFinish={handleRegister}
                layout="vertical"
                size="large"
              >
                <Box className="grid grid-cols-2 gap-4">
                  <Form.Item
                    name="firstName"
                    label="Vorname"
                    rules={[
                      { required: true, message: 'Bitte geben Sie Ihren Vornamen ein' }
                    ]}
                  >
                    <Input
                      prefix={<PersonIcon className="text-gray-400" />}
                      placeholder="Max"
                      className="h-12"
                    />
                  </Form.Item>

                  <Form.Item
                    name="lastName"
                    label="Nachname"
                    rules={[
                      { required: true, message: 'Bitte geben Sie Ihren Nachnamen ein' }
                    ]}
                  >
                    <Input
                      prefix={<PersonIcon className="text-gray-400" />}
                      placeholder="Mustermann"
                      className="h-12"
                    />
                  </Form.Item>
                </Box>

                <Form.Item
                  name="email"
                  label="E-Mail-Adresse"
                  rules={[
                    { required: true, message: 'Bitte geben Sie Ihre E-Mail-Adresse ein' },
                    { type: 'email', message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' }
                  ]}
                >
                  <Input
                    prefix={<EmailIcon className="text-gray-400" />}
                    placeholder="max.mustermann@valeo.com"
                    className="h-12"
                  />
                </Form.Item>

                <Form.Item
                  name="username"
                  label="Benutzername"
                  rules={[
                    { required: true, message: 'Bitte geben Sie einen Benutzernamen ein' },
                    { min: 3, message: 'Benutzername muss mindestens 3 Zeichen lang sein' }
                  ]}
                >
                  <Input
                    prefix={<PersonIcon className="text-gray-400" />}
                    placeholder="max.mustermann"
                    className="h-12"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Passwort"
                  rules={[
                    { required: true, message: 'Bitte geben Sie ein Passwort ein' },
                    { min: 8, message: 'Passwort muss mindestens 8 Zeichen lang sein' },
                    {
                      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Passwort muss Groß- und Kleinbuchstaben sowie Zahlen enthalten'
                    }
                  ]}
                >
                  <Input.Password
                    prefix={<LockIcon className="text-gray-400" />}
                    placeholder="Sicheres Passwort"
                    className="h-12"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Passwort bestätigen"
                  rules={[
                    { required: true, message: 'Bitte bestätigen Sie Ihr Passwort' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwörter stimmen nicht überein'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockIcon className="text-gray-400" />}
                    placeholder="Passwort wiederholen"
                    className="h-12"
                  />
                </Form.Item>

                <Form.Item
                  name="acceptTerms"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value ? Promise.resolve() : Promise.reject(new Error('Bitte akzeptieren Sie die Nutzungsbedingungen')),
                    },
                  ]}
                >
                  <Checkbox>
                    Ich akzeptiere die{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-800">
                      Nutzungsbedingungen
                    </a>{' '}
                    und{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-800">
                      Datenschutzerklärung
                    </a>
                  </Checkbox>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    className="h-12 bg-green-600 hover:bg-green-700"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonIcon />}
                  >
                    {loading ? 'Registrierung läuft...' : 'Registrieren'}
                  </Button>
                </Form.Item>
              </Form>
            )}

            {/* Divider */}
            <Divider className="my-6">
              <Typography variant="body2" className="text-gray-500">
                oder
              </Typography>
            </Divider>

            {/* Social Login */}
            <Box className="space-y-3">
              <Button
                fullWidth
                variant="outlined"
                size="large"
                className="h-12 border-gray-300 text-gray-700 hover:border-gray-400"
                startIcon={<BusinessIcon />}
              >
                Mit Unternehmens-Account anmelden
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                size="large"
                className="h-12 border-gray-300 text-gray-700 hover:border-gray-400"
                startIcon={<SecurityIcon />}
              >
                Single Sign-On (SSO)
              </Button>
            </Box>

            {/* Footer Links */}
            <Box className="mt-6 text-center space-y-2">
              <Typography variant="body2" className="text-gray-600">
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Passwort vergessen?
                </a>
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Hilfe & Support
                </a>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box className="text-center mt-8">
          <Typography variant="body2" className="text-gray-500">
            © 2024 VALEO NeuroERP. Alle Rechte vorbehalten.
          </Typography>
          <Typography variant="caption" className="text-gray-400 block mt-1">
            Version 2.0 - Powered by KI-Technologie
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage; 