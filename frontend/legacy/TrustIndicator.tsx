import React from 'react';
import { Card, Typography, Box, Chip } from '@mui/material';
import { 
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';

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
  const getLevelConfig = (level: string) => {
    switch (level) {
      case 'high':
        return {
          color: 'success' as const,
          icon: <CheckCircleIcon />,
          bgColor: '#e8f5e8',
          textColor: '#2e7d32'
        };
      case 'medium':
        return {
          color: 'warning' as const,
          icon: <WarningIcon />,
          bgColor: '#fff8e1',
          textColor: '#f57c00'
        };
      case 'low':
        return {
          color: 'error' as const,
          icon: <ErrorIcon />,
          bgColor: '#ffebee',
          textColor: '#d32f2f'
        };
      case 'critical':
        return {
          color: 'error' as const,
          icon: <ErrorIcon />,
          bgColor: '#ffcdd2',
          textColor: '#c62828'
        };
      case 'fact':
        return {
          color: 'success' as const,
          icon: <CheckCircleIcon />,
          bgColor: '#e8f5e8',
          textColor: '#2e7d32'
        };
      case 'assumption':
        return {
          color: 'warning' as const,
          icon: <WarningIcon />,
          bgColor: '#fff8e1',
          textColor: '#f57c00'
        };
      case 'uncertain':
        return {
          color: 'error' as const,
          icon: <ErrorIcon />,
          bgColor: '#ffebee',
          textColor: '#d32f2f'
        };
      default:
        return {
          color: 'info' as const,
          icon: <InfoIcon />,
          bgColor: '#e3f2fd',
          textColor: '#1976d2'
        };
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

  const levelConfig = getLevelConfig(level);

  return (
    <Card 
      className={`trust-indicator ${className || ''}`}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: `2px solid ${levelConfig.bgColor}`,
        backgroundColor: levelConfig.bgColor,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ color: levelConfig.textColor, mr: 1 }}>
          {levelConfig.icon}
        </Box>
        {title && (
          <Typography 
            variant="h6" 
            component="h3"
            sx={{ 
              color: levelConfig.textColor,
              fontWeight: 600,
              flex: 1
            }}
          >
            {title}
          </Typography>
        )}
        <Chip 
          label={level.toUpperCase()} 
          color={levelConfig.color}
          size="small"
          variant="outlined"
        />
      </Box>

      {description && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#666',
            mb: 2,
            flex: 1
          }}
        >
          {description}
        </Typography>
      )}

      {value !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography 
            variant="h4" 
            component="span"
            sx={{ 
              color: levelConfig.textColor,
              fontWeight: 700,
              mr: 0.5
            }}
          >
            {value}
          </Typography>
          {unit && (
            <Typography 
              variant="body2" 
              sx={{ color: '#666' }}
            >
              {unit}
            </Typography>
          )}
          {trend && (
            <Box sx={{ ml: 1 }}>
              {getTrendIcon(trend)}
            </Box>
          )}
        </Box>
      )}

      {details && details.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {details.map((detail, index) => (
            <Typography 
              key={index}
              variant="caption" 
              sx={{ 
                display: 'block',
                color: '#666',
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
            color: '#999',
            fontSize: '0.7rem',
            mt: 1,
            display: 'block'
          }}
        >
          Letzte Aktualisierung: {lastUpdated}
        </Typography>
      )}
    </Card>
  );
};

export default TrustIndicator;
export { TrustIndicator }; 