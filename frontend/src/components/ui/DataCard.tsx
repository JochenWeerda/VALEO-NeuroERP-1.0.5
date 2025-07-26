import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Skeleton } from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';
import { DataCardProps } from '../../types/global';

// Enhanced DataCard Component für VALEO NeuroERP
export const DataCard: React.FC<DataCardProps> = ({
  title,
  subtitle,
  value,
  change,
  icon: Icon,
  onClick,
  loading = false,
  className = '',
  style,
  children
}) => {
  const handleClick = () => {
    if (onClick && !loading) {
      onClick();
    }
  };

  const renderChangeIndicator = () => {
    if (!change) return null;

    const { value: changeValue, isPositive } = change;
    const IconComponent = isPositive ? TrendingUp : changeValue === 0 ? Remove : TrendingDown;
    const color = isPositive ? 'success' : changeValue === 0 ? 'default' : 'error';

    return (
      <Box className="flex items-center space-x-1">
        <IconComponent 
          className={`text-${color === 'success' ? 'green' : color === 'error' ? 'red' : 'gray'}-500`}
          fontSize="small"
        />
        <Typography
          variant="caption"
          className={`font-medium ${
            color === 'success' ? 'text-green-600' : 
            color === 'error' ? 'text-red-600' : 
            'text-gray-600'
          }`}
        >
          {changeValue > 0 ? '+' : ''}{changeValue}%
        </Typography>
      </Box>
    );
  };

  const renderValue = () => {
    if (loading) {
      return <Skeleton variant="text" width="60%" height={32} />;
    }

    if (typeof value === 'number') {
      return (
        <Typography variant="h4" className="font-semibold text-gray-900">
          {value.toLocaleString('de-DE')}
        </Typography>
      );
    }

    return (
      <Typography variant="h4" className="font-semibold text-gray-900">
        {value}
      </Typography>
    );
  };

  return (
    <Card
      className={`
        relative overflow-hidden transition-all duration-200 ease-in-out
        hover:shadow-lg hover:scale-[1.02] cursor-pointer
        ${onClick ? 'hover:bg-gray-50' : ''}
        ${className}
      `}
      style={style}
      onClick={handleClick}
      elevation={1}
    >
      {/* Background Pattern für Visual Appeal */}
      <Box className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 rounded-full transform translate-x-16 -translate-y-16" />
      </Box>

      <CardContent className="p-6 relative z-10">
        <Box className="flex items-start justify-between mb-4">
          <Box className="flex-1">
            <Typography 
              variant="h6" 
              className="font-medium text-gray-800 mb-1"
            >
              {loading ? <Skeleton variant="text" width="80%" /> : title}
            </Typography>
            
            {subtitle && (
              <Typography 
                variant="body2" 
                className="text-gray-600 mb-2"
              >
                {loading ? <Skeleton variant="text" width="60%" /> : subtitle}
              </Typography>
            )}
          </Box>

          {Icon && (
            <Box className="ml-4 p-2 bg-blue-50 rounded-lg">
              <Icon className="text-blue-600" fontSize="medium" />
            </Box>
          )}
        </Box>

        <Box className="flex items-end justify-between">
          <Box className="flex-1">
            {renderValue()}
            
            {change && (
              <Box className="mt-2">
                {renderChangeIndicator()}
              </Box>
            )}
          </Box>

          {children && (
            <Box className="ml-4">
              {children}
            </Box>
          )}
        </Box>
      </CardContent>

      {/* Hover Effect Border */}
      <Box className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-in-out group-hover:w-full" />
    </Card>
  );
};

// Specialized DataCard Variants
export const MetricCard: React.FC<DataCardProps & { unit?: string }> = ({
  unit,
  ...props
}) => {
  const formatValue = (value: string | number) => {
    if (typeof value === 'number') {
      return `${value.toLocaleString('de-DE')}${unit ? ` ${unit}` : ''}`;
    }
    return `${value}${unit ? ` ${unit}` : ''}`;
  };

  return (
    <DataCard
      {...props}
      value={formatValue(props.value)}
    />
  );
};

export const CurrencyCard: React.FC<DataCardProps> = (props) => {
  const formatCurrency = (value: string | number) => {
    if (typeof value === 'number') {
      return `${value.toLocaleString('de-DE', {
        style: 'currency',
        currency: 'EUR'
      })}`;
    }
    return value;
  };

  return (
    <DataCard
      {...props}
      value={formatCurrency(props.value)}
    />
  );
};

export const PercentageCard: React.FC<DataCardProps> = (props) => {
  const formatPercentage = (value: string | number) => {
    if (typeof value === 'number') {
      return `${value.toFixed(1)}%`;
    }
    return value;
  };

  return (
    <DataCard
      {...props}
      value={formatPercentage(props.value)}
    />
  );
};

// Loading State Component
export const DataCardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Card className={`p-6 ${className}`} elevation={1}>
      <Box className="flex items-start justify-between mb-4">
        <Box className="flex-1">
          <Skeleton variant="text" width="80%" height={24} />
          <Skeleton variant="text" width="60%" height={16} className="mt-1" />
        </Box>
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
      
      <Skeleton variant="text" width="60%" height={32} />
      <Skeleton variant="text" width="40%" height={16} className="mt-2" />
    </Card>
  );
};

export default DataCard; 