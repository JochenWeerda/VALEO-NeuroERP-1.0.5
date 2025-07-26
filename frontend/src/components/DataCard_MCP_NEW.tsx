import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as RemoveIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { TrustIndicator } from './TrustIndicator';
import type { TrustLevel } from './TrustIndicator';

// MCP Integration Imports
import { useMCPData } from '../hooks/useMCPForm';

// TypeScript Interfaces basierend auf MCP Schema
interface DataCardProps {
  title: string;
  dataSource: string; // MCP-Tabellenname
  valueField: string; // Feldname für den Wert
  trendField?: string; // Feldname für Trend-Berechnung
  icon: string;
  trustLevel: TrustLevel;
  confidence: number;
  refreshInterval?: number; // Auto-Refresh in Sekunden
}

interface DataPoint {
  value: number;
  timestamp: string;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
}

/**
 * MCP-basierte DataCard-Komponente
 * Verwendet live Daten vom MCP-Server mit automatischer Trend-Berechnung
 */
export const DataCard_MCP_NEW: React.FC<DataCardProps> = ({
  title,
  dataSource,
  valueField,
  trendField,
  icon,
  trustLevel,
  confidence,
  refreshInterval = 300 // 5 Minuten Standard
}) => {
  const [currentData, setCurrentData] = useState<DataPoint | null>(null);
  const [previousData, setPreviousData] = useState<DataPoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // MCP Hook für Daten
  const dataHook = useMCPData(dataSource);

  // Daten laden
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await dataHook.fetchData();
      const data = result.data || [];

      if (data.length > 0) {
        // Neueste Daten
        const latest = data[data.length - 1];
        const currentValue = parseFloat(latest[valueField]) || 0;

        // Vorherige Daten für Trend-Berechnung
        const previous = data.length > 1 ? data[data.length - 2] : null;
        const previousValue = previous ? parseFloat(previous[valueField]) || 0 : currentValue;

        // Trend berechnen
        let trend: 'up' | 'down' | 'neutral' = 'neutral';
        let change = '0%';

        if (previousValue !== 0) {
          const changePercent = ((currentValue - previousValue) / previousValue) * 100;
          change = `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%`;
          trend = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral';
        }

        const newDataPoint: DataPoint = {
          value: currentValue,
          timestamp: latest.created_at || new Date().toISOString(),
          trend,
          change
        };

        setCurrentData(newDataPoint);
        setPreviousData(previous ? {
          value: previousValue,
          timestamp: previous.created_at || new Date().toISOString()
        } : null);

        console.log(`✅ ${title} Daten geladen:`, newDataPoint);
      } else {
        setError('Keine Daten verfügbar');
      }

    } catch (err) {
      console.error(`❌ Fehler beim Laden der ${title} Daten:`, err);
      setError('Daten konnten nicht geladen werden');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial laden
  useEffect(() => {
    loadData();
  }, [dataSource, valueField]);

  // Auto-Refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(loadData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  // Trend-Konfiguration
  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'success';
      case 'down': return 'error';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return <TrendingUpIcon fontSize="small" />;
      case 'down': return <TrendingDownIcon fontSize="small" />;
      default: return <RemoveIcon fontSize="small" />;
    }
  };

  // Trust-Level-Konfiguration
  const getTrustConfig = (level: TrustLevel) => {
    switch (level) {
      case 'high': return { color: 'success' as const, icon: <CheckCircleIcon />, label: 'Hoch' };
      case 'medium': return { color: 'warning' as const, icon: <WarningIcon />, label: 'Mittel' };
      case 'low': return { color: 'error' as const, icon: <WarningIcon />, label: 'Niedrig' };
      default: return { color: 'default' as const, icon: <InfoIcon />, label: 'Unbekannt' };
    }
  };

  // Loading-State
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex justify-center items-center h-32">
          <Box className="text-center">
            <CircularProgress size={24} className="mb-2" />
            <Typography variant="caption" color="textSecondary">
              Lade {title}...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Error-State
  if (error || !currentData) {
    return (
      <Card className="h-full">
        <CardContent>
          <Alert severity="error" className="mb-2">
            <Typography variant="caption">
              {error || 'Keine Daten verfügbar'}
            </Typography>
          </Alert>
          <Typography variant="body2" color="textSecondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const trustConfig = getTrustConfig(trustLevel);

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardContent>
        <Box className="flex items-center justify-between mb-3">
          <Box className="flex items-center space-x-2">
            <i className={`${icon} text-gray-400 text-lg`}></i>
            <Typography variant="subtitle2" color="textSecondary">
              {title}
            </Typography>
          </Box>
          
          {/* Trust Indicator */}
          <Tooltip title={`Vertrauenslevel: ${trustConfig.label} (${confidence}%)`}>
            <Box>
              <TrustIndicator level={trustLevel} />
            </Box>
          </Tooltip>
        </Box>

        {/* Hauptwert */}
        <Box className="flex items-baseline space-x-2 mb-2">
          <Typography variant="h4" className="font-bold text-gray-900">
            {currentData.value.toLocaleString('de-DE')}
          </Typography>
          
          {/* Trend */}
          {currentData.trend && currentData.change && (
            <Chip
              icon={getTrendIcon(currentData.trend)}
              label={currentData.change}
              color={getTrendColor(currentData.trend)}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {/* Zusätzliche Informationen */}
        <Box className="space-y-1">
          <Typography variant="caption" color="textSecondary">
            Letzte Aktualisierung: {new Date(currentData.timestamp).toLocaleString('de-DE')}
          </Typography>
          
          {previousData && (
            <Typography variant="caption" color="textSecondary">
              Vorheriger Wert: {previousData.value.toLocaleString('de-DE')} 
              ({new Date(previousData.timestamp).toLocaleDateString('de-DE')})
            </Typography>
          )}
        </Box>

        {/* MCP-Informationen */}
        <Box className="mt-3 pt-2 border-t border-gray-100">
          <Typography variant="caption" className="text-gray-500">
            <strong>Daten-Quelle:</strong> {dataSource}
            <br />
            <strong>Feld:</strong> {valueField}
            <br />
            <strong>Auto-Refresh:</strong> {refreshInterval > 0 ? `${refreshInterval}s` : 'Deaktiviert'}
            <br />
            <strong>MCP-Status:</strong> ✅ Live
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DataCard_MCP_NEW; 