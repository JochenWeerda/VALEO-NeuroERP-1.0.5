import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Alert, 
  Chip,
  CircularProgress,
  Button
} from '@mui/material';
import { 
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import TrustIndicator from '../components/TrustIndicator';

interface TrustMetric {
  id: string;
  name: string;
  level: 'high' | 'medium' | 'low' | 'critical';
  confidence: number;
  source: string;
  lastUpdated: Date;
  status: 'good' | 'warning' | 'error';
}

interface SystemTrust {
  overall: number;
  dataIntegrity: number;
  aiAccuracy: number;
  userTrust: number;
  compliance: number;
}

const TrustAwareDashboard: React.FC = () => {
  const [trustMetrics, setTrustMetrics] = useState<TrustMetric[]>([]);
  const [systemTrust] = useState<SystemTrust>({
    overall: 85,
    dataIntegrity: 92,
    aiAccuracy: 78,
    userTrust: 88,
    compliance: 95
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrustMetrics();
  }, []);

  const loadTrustMetrics = async () => {
    setLoading(true);
    try {
      // Simuliere API-Aufruf für Trust-Metriken
      const mockMetrics: TrustMetric[] = [
        {
          id: '1',
          name: 'Datenintegrität',
          level: 'high',
          confidence: 92,
          source: 'System',
          lastUpdated: new Date(),
          status: 'good'
        },
        {
          id: '2',
          name: 'KI-Genauigkeit',
          level: 'medium',
          confidence: 78,
          source: 'AI-Modell',
          lastUpdated: new Date(),
          status: 'warning'
        },
        {
          id: '3',
          name: 'Benutzervertrauen',
          level: 'high',
          confidence: 88,
          source: 'Feedback',
          lastUpdated: new Date(),
          status: 'good'
        },
        {
          id: '4',
          name: 'Compliance',
          level: 'high',
          confidence: 95,
          source: 'Audit',
          lastUpdated: new Date(),
          status: 'good'
        }
      ];
      
      setTrustMetrics(mockMetrics);
    } catch (err) {
      setError('Fehler beim Laden der Trust-Metriken');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'warning': return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'error': return <ErrorIcon sx={{ color: 'error.main' }} />;
      default: return <InfoIcon sx={{ color: 'info.main' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SecurityIcon sx={{ color: 'primary.main' }} />
        Trust-Aware Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary' }}>
        Überwachung der Vertrauenswürdigkeit und Datenqualität im System
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* System Trust Overview */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          System Trust Overview
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2 
        }}>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              {systemTrust.overall}%
            </Typography>
            <Typography variant="body2" sx={{ color: 'primary.dark' }}>
              Gesamtvertrauen
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
            <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold' }}>
              {systemTrust.dataIntegrity}%
            </Typography>
            <Typography variant="body2" sx={{ color: 'success.dark' }}>
              Datenintegrität
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.50', borderRadius: 1 }}>
            <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
              {systemTrust.aiAccuracy}%
            </Typography>
            <Typography variant="body2" sx={{ color: 'secondary.dark' }}>
              KI-Genauigkeit
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
            <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
              {systemTrust.compliance}%
            </Typography>
            <Typography variant="body2" sx={{ color: 'warning.dark' }}>
              Compliance
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Trust Metrics */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Trust Metriken
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 2 
        }}>
          {trustMetrics.map((metric) => (
            <TrustIndicator
              key={metric.id}
              title={metric.name}
              description={`Vertrauenswürdigkeit: ${metric.confidence}%`}
              level={metric.level}
              value={metric.confidence}
              unit="%"
              lastUpdated={metric.lastUpdated.toLocaleString('de-DE')}
              details={[
                `Quelle: ${metric.source}`,
                `Status: ${metric.status}`,
                `Letzte Prüfung: ${metric.lastUpdated.toLocaleDateString('de-DE')}`
              ]}
            />
          ))}
        </Box>
      </Card>

      {/* Actions */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={loadTrustMetrics}
          disabled={loading}
        >
          Metriken aktualisieren
        </Button>
        <Button variant="outlined">
          Trust-Report exportieren
        </Button>
      </Box>
    </Box>
  );
};

export default TrustAwareDashboard; 