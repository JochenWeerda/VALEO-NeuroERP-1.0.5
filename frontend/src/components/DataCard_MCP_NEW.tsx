import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  CircularProgress,
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
// ✅ NEU: Import der standardisierten UI-Komponenten
import { StatusChip, StandardMessage } from './ui/UIStandardization';
import { UI_LABELS } from './ui/UIStandardization';
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
          timestamp: (latest as any).created_at || new Date().toISOString(),
          trend,
          change
        };

        setCurrentData(newDataPoint);
        setPreviousData(previous ? {
          value: previousValue,
          timestamp: (previous as any).created_at || new Date().toISOString()
        } : null);
      } else {
        setError('Keine Daten verfügbar');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Daten');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial laden und Auto-Refresh
  useEffect(() => {
    loadData();
    
    if (refreshInterval > 0) {
      const interval = setInterval(loadData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [dataSource, valueField, refreshInterval]);

  // ✅ REFAKTORIERT: Verwendung von StatusChip für Trend-Anzeige
  const getTrendStatus = (trend: 'up' | 'down' | 'neutral'): keyof typeof UI_LABELS.STATUS => {
    switch (trend) {
      case 'up':
        return 'ACTIVE';
      case 'down':
        return 'ERROR';
      default:
        return 'PENDING';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon fontSize="small" />;
      case 'down':
        return <TrendingDownIcon fontSize="small" />;
      default:
        return <RemoveIcon fontSize="small" />;
    }
  };

  // Trust-Level-Konfiguration
  const getTrustConfig = (level: TrustLevel) => {
    switch (level) {
      case 'high': return { color: 'success' as const, icon: <CheckCircleIcon />, label: UI_LABELS.STATUS.HIGH };
      case 'medium': return { color: 'warning' as const, icon: <WarningIcon />, label: UI_LABELS.STATUS.MEDIUM };
      case 'low': return { color: 'error' as const, icon: <WarningIcon />, label: UI_LABELS.STATUS.LOW };
      default: return { color: 'default' as const, icon: <InfoIcon />, label: UI_LABELS.STATUS.UNKNOWN };
    }
  };

  // Loading-State
  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 128 }}>
          <Box textAlign="center">
            <CircularProgress size={24} sx={{ mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {UI_LABELS.MESSAGES.LOADING} {title}...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Error-State
  if (error || !currentData) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <StandardMessage
            type="error"
            message={error || UI_LABELS.MESSAGES.NO_DATA}
          />
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const trustConfig = getTrustConfig(trustLevel);

  return (
    <Card sx={{ height: '100%', '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.2s' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <i className={`${icon} text-gray-400 text-lg`}></i>
            <Typography variant="subtitle2" color="text.secondary">
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
        <Box display="flex" alignItems="baseline" gap={1} mb={1}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            {currentData.value.toLocaleString('de-DE')}
          </Typography>
          
          {/* ✅ REFAKTORIERT: Trend mit StatusChip */}
          {currentData.trend && currentData.change && (
            <Box display="flex" alignItems="center" gap={0.5}>
              {getTrendIcon(currentData.trend)}
              <Typography variant="caption" color="text.secondary">
                {currentData.change}
              </Typography>
              <StatusChip
                status={getTrendStatus(currentData.trend)}
                size="small"
              />
            </Box>
          )}
        </Box>

        {/* Zusätzliche Informationen */}
        <Box display="flex" flexDirection="column" gap={0.5}>
          <Typography variant="caption" color="text.secondary">
            {UI_LABELS.MESSAGES.LAST_UPDATE}: {new Date(currentData.timestamp).toLocaleString('de-DE')}
          </Typography>
          
          {previousData && (
            <Typography variant="caption" color="text.secondary">
              {UI_LABELS.MESSAGES.PREVIOUS_VALUE}: {previousData.value.toLocaleString('de-DE')} 
              ({new Date(previousData.timestamp).toLocaleDateString('de-DE')})
            </Typography>
          )}
        </Box>

        {/* MCP-Informationen */}
        <Box mt={2} pt={1} borderTop={1} borderColor="divider">
          <Typography variant="caption" color="text.secondary">
            <strong>{UI_LABELS.MESSAGES.DATA_SOURCE}:</strong> {dataSource}
            <br />
            <strong>{UI_LABELS.MESSAGES.FIELD}:</strong> {valueField}
            <br />
            <strong>{UI_LABELS.MESSAGES.AUTO_REFRESH}:</strong> {refreshInterval > 0 ? `${refreshInterval}s` : UI_LABELS.STATUS.DISABLED}
            <br />
            <strong>{UI_LABELS.MESSAGES.MCP_STATUS}:</strong> ✅ {UI_LABELS.STATUS.LIVE}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DataCard_MCP_NEW; 