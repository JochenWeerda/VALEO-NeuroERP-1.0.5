import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { StatusChip } from './ui/UIStandardization';
import { UI_LABELS } from './ui/UIStandardization';
import { TrustIndicator } from './TrustIndicator';
import type { TrustLevel } from './TrustIndicator';

export interface DataCardProps {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  change: string;
  icon: string;
  trustLevel: TrustLevel;
  confidence: number;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  trend,
  change,
  icon,
  trustLevel,
  confidence
}) => {
  // ✅ REFAKTORIERT: Verwendung von StatusChip für Trend-Anzeige
  const getTrendStatus = () => {
    switch (trend) {
      case 'up':
        return 'success' as const;
      case 'down':
        return 'error' as const;
      default:
        return 'warning' as const;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp fontSize="small" />;
      case 'down':
        return <TrendingDown fontSize="small" />;
      default:
        return <Remove fontSize="small" />;
    }
  };

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <i className={`${icon} text-gray-400`}></i>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
            </Box>
            <Box display="flex" alignItems="baseline" gap={1}>
              <Typography variant="h4" component="p" fontWeight="bold" color="text.primary">
                {value}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                {getTrendIcon()}
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                  {change}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box ml={2}>
            <TrustIndicator level={trustLevel} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}; 