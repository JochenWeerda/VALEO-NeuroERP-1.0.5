import React from 'react';
import { Card, Typography, Box, Chip } from '@mui/material';
import { 
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { StatusChip } from './ui/UIStandardization';
import { UI_LABELS } from './ui/UIStandardization';

export interface TrustIndicatorProps {
  title?: string;
  description?: string;
  level: 'high' | 'medium' | 'low' | 'critical' | 'fact' | 'assumption' | 'uncertain';
  value?: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  lastUpdated?: string;
  details?: string[];
  className?: string;
  confidence?: number;
}

export type TrustLevel = 'high' | 'medium' | 'low' | 'critical' | 'fact' | 'assumption' | 'uncertain';

const TrustIndicator: React.FC<TrustIndicatorProps> = ({
  title,
  description,
  level,
  value,
  unit,
  trend,
  lastUpdated,
  details,
  className,
  confidence
}) => {
  // ✅ REFAKTORIERT: Verwendung von StatusChip für Level-Anzeige
  const getLevelStatus = (level: string): keyof typeof UI_LABELS.STATUS => {
    switch (level) {
      case 'high':
      case 'fact':
        return 'ACTIVE';
      case 'medium':
      case 'assumption':
        return 'PENDING';
      case 'low':
      case 'uncertain':
        return 'SUSPENDED';
      case 'critical':
        return 'ERROR';
      default:
        return 'UNKNOWN';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'high':
      case 'fact':
        return <CheckCircleIcon />;
      case 'medium':
      case 'assumption':
        return <WarningIcon />;
      case 'low':
      case 'uncertain':
      case 'critical':
        return <ErrorIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <span style={{ color: '#4caf50' }}>↗</span>;
      case 'down':
        return <span style={{ color: '#f44336' }}>↘</span>;
      case 'stable':
        return <span style={{ color: '#ff9800' }}>→</span>;
      default:
        return null;
    }
  };

  const levelStatus = getLevelStatus(level);
  const levelIcon = getLevelIcon(level);

  return (
    <Card 
      className={`trust-indicator ${className || ''}`}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: 2,
        borderColor: `${levelStatus}.main`,
        backgroundColor: `${levelStatus}.50`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3
        }
      }}
    >
      <Box display="flex" alignItems="center" mb={1}>
        <Box sx={{ color: `${levelStatus}.main`, mr: 1 }}>
          {levelIcon}
        </Box>
        {title && (
          <Typography 
            variant="h6" 
            component="h3"
            sx={{ 
              color: `${levelStatus}.main`,
              fontWeight: 600,
              flex: 1
            }}
          >
            {title}
          </Typography>
        )}
        <StatusChip 
          status={levelStatus}
          size="small"
        />
      </Box>

      {description && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            mb: 2,
            flex: 1
          }}
        >
          {description}
        </Typography>
      )}

      {value !== undefined && (
        <Box display="flex" alignItems="center" mb={1}>
          <Typography 
            variant="h4" 
            component="span"
            sx={{ 
              color: `${levelStatus}.main`,
              fontWeight: 700,
              mr: 0.5
            }}
          >
            {value}
          </Typography>
          {unit && (
            <Typography 
              variant="body2" 
              sx={{ color: 'text.secondary' }}
            >
              {unit}
            </Typography>
          )}
          {trend && (
            <Box ml={1}>
              {getTrendIcon(trend)}
            </Box>
          )}
        </Box>
      )}

      {details && details.length > 0 && (
        <Box mt={1}>
          {details.map((detail, index) => (
            <Typography 
              key={index}
              variant="caption" 
              sx={{ 
                display: 'block',
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}
            >
              • {detail}
            </Typography>
          ))}
        </Box>
      )}

      {lastUpdated && (
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.disabled',
            fontSize: '0.7rem',
            mt: 1,
            display: 'block'
          }}
        >
          {UI_LABELS.MESSAGES.LAST_UPDATE}: {lastUpdated}
        </Typography>
      )}
    </Card>
  );
};

export default TrustIndicator;
export { TrustIndicator }; 