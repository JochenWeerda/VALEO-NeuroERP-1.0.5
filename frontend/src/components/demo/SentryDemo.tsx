import React, { useState } from 'react';
import { Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Alert,
  Chip, Grid, Paper } from '@mui/material';
import { Api as ApiIcon, BugReport as BugIcon, Person, Speed as SpeedIcon , Bug , Speed , Person , Api  } from '@mui/icons-material';
import { useSentry } from '../../hooks/useSentry';

/**
 * Demo-Komponente für Sentry Error Tracking
 * Zeigt verschiedene Sentry-Features in Aktion
 */
export const SentryDemo: React.FC = () => {
  const { captureError, addBreadcrumb, setUser, setTag, setContext  } = useSentry();
  const [lastAction, setLastAction] = useState<string>('');

  // Demo-Funktionen
  const triggerJavaScriptError = (...args[]) => {
    addBreadcrumb('Benutzer hat JavaScript-Fehler ausgelöst', 'user-action');
    setLastAction('JavaScript-Fehler ausgelöst');
    
    try {
      // Bewusst einen Fehler auslösen
      (null as unknown).someProperty.that.does.not.exist();
    } catch (_error) {
      captureError(error as Error, {
        tags: { 
          component: 'SentryDemo',
          errorType: 'javascript-error',
          demo: 'true'
        },
        extra: {
          userAction: 'triggered-javascript-error',
          timestamp: new Date().toISOString()
        },
        level: 'error'
      });
    }
  };

  const triggerAsyncError = async () => {
    addBreadcrumb('Benutzer hat Async-Fehler ausgelöst', 'user-action');
    setLastAction('Async-Fehler ausgelöst');
    
    try {
      // Simuliere einen API-Fehler
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Simulierter API-Fehler: Server nicht erreichbar'));
        }, 1000);
      });
    } catch (_error) {
      captureError(error as Error, {
        tags: { 
          component: 'SentryDemo',
          errorType: 'async-error',
          demo: 'true'
        },
        extra: {
          userAction: 'triggered-async-error',
          apiEndpoint: '/api/demo/error',
          timestamp: new Date().toISOString()
        },
        level: 'error'
      });
    }
  };

  const simulateSlowOperation = (...args[]) => {
    addBreadcrumb('Benutzer hat langsame Operation gestartet', 'user-action');
    setLastAction('Langsame Operation simuliert');
    
    // Simuliere eine langsame Operation
    setTimeout(() => {
      addBreadcrumb('Langsame Operation abgeschlossen', 'performance', 'warning');
      setTag('slowOperation', 'completed');
    }, 3000);

    setContext('performance', {
      operation: 'simulated-slow-operation',
      duration: 3000,
      startTime: Date.now()
    });
  };

  const setDemoUser = (...args[]) => {
    const demoUser = {
      id: 'demo-user-123',
      email: 'demo@valeo-neuroerp.de',
      username: 'Demo-Benutzer'
    };
    
    setUser(demoUser);
    setLastAction(`Benutzer gesetzt: ${demoUser.username}`);
    addBreadcrumb(`Benutzer-Kontext gesetzt für: ${demoUser.email}`, 'user-context');
  };

  const addCustomBreadcrumb = (...args[]) => {
    addBreadcrumb('Benutzer hat benutzerdefinierten Breadcrumb hinzugefügt', 'custom-action', 'info');
    setLastAction('Benutzerdefinierter Breadcrumb hinzugefügt');
  };

  const setCustomTags = (...args[]) => {
    setTag('feature', 'sentry-demo');
    setTag('environment', 'development');
    setTag('version', '1.0.0');
    setLastAction('Custom Tags gesetzt');
    addBreadcrumb('Custom Tags wurden gesetzt', 'configuration');
  };

  const clearLastAction = (...args[]) => {
    setLastAction('');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom color="primary">
        🚨 Sentry Error Tracking Demo
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Diese Demo zeigt die verschiedenen Sentry-Features in Aktion. 
        Alle Events werden an Sentry gesendet (wenn DSN konfiguriert ist).
      </Alert>

      <Grid container spacing={3}>
        {/* Error Tracking */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BugIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Error Tracking</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="error" 
                  onClick={() => triggerJavaScriptError()}
                  fullWidth
                >
                  JavaScript-Fehler auslösen
                </Button>
                
                <Button 
                  variant="contained" 
                  color="warning" 
                  onClick={triggerAsyncError}
                  fullWidth
                >
                  Async-Fehler simulieren
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Monitoring */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpeedIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Performance Monitoring</Typography>
              </Box>
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => simulateSlowOperation()}
                fullWidth
              >
                Langsame Operation simulieren
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* User Context */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">User Context</Typography>
              </Box>
              
              <Button 
                variant="contained" 
                color="success" 
                onClick={() => setDemoUser()}
                fullWidth
              >
                Demo-Benutzer setzen
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Breadcrumbs & Tags */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ApiIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Breadcrumbs & Tags</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => addCustomBreadcrumb()}
                  fullWidth
                >
                  Breadcrumb hinzufügen
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={() => setCustomTags()}
                  fullWidth
                >
                  Custom Tags setzen
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Letzte Aktion:
            </Typography>
            
            {lastAction ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={lastAction} 
                  color="primary" 
                  variant="outlined"
                />
                <Button 
                  size="small" 
                  onClick={() => clearLastAction()}
                  variant="text"
                >
                  Löschen
                </Button>
              </Box>
            ) : (
              <Typography color="text.secondary">
                Keine Aktionen ausgeführt
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Alert severity="success" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Hinweis:</strong> Überprüfe dein Sentry-Dashboard, um die Events zu sehen. 
          Stelle sicher, dass der DSN in der .env.local Datei konfiguriert ist.
        </Typography>
      </Alert>
    </Box>
  );
};

export default SentryDemo;
