import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Avatar } from '@mui/material';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { StatusChip } from './ui/UIStandardization';
import { UI_LABELS } from './ui/UIStandardization';
import { TrustIndicator } from './TrustIndicator';
import type { ModuleCard as ModuleCardType, ModuleFeature } from '../lib/schemas';

export interface ModuleCardProps {
  module: ModuleCardType;
  onClick?: () => void;
}

export interface ModuleGridProps {
  modules: ModuleCardType[];
}

export interface ModuleFeatureComponentProps {
  feature: ModuleFeature;
}

export const ModuleFeatureComponent: React.FC<ModuleFeatureComponentProps> = ({ feature }) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" p={1} bgcolor="grey.50" borderRadius={1}>
      <Box flex={1}>
        <Typography variant="body2" fontWeight="medium" color="text.primary">
          {feature.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {feature.description}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        <StatusChip 
          status={feature.available ? 'ACTIVE' : 'ERROR'} 
          size="small"
        />
        <TrustIndicator level={feature.trustLevel} />
      </Box>
    </Box>
  );
};

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick }) => {
  return (
    <Card 
      sx={{ 
        p: 3, 
        cursor: 'pointer', 
        '&:hover': { boxShadow: 3 },
        transition: 'box-shadow 0.2s',
        height: '100%'
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar 
              sx={{ 
                width: 48, 
                height: 48, 
                bgcolor: module.color || 'primary.main' 
              }}
            >
              <i className={`${module.icon} text-white text-xl`}></i>
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="semibold" color="text.primary">
                {module.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {module.description}
              </Typography>
            </Box>
          </Box>
          <TrustIndicator level={module.trustLevel} />
        </Box>
        
        <Box display="flex" flexDirection="column" gap={1}>
          {module.features?.slice(0, 3).map((feature) => (
            <ModuleFeatureComponent key={feature.id} feature={feature} />
          ))}
        </Box>
        
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
          <StatusChip 
            status={module.status === 'active' ? 'ACTIVE' : 'PENDING'} 
            size="small"
          />
          <Typography variant="caption" color="text.secondary" textTransform="capitalize">
            {module.category}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export const ModuleGrid: React.FC<ModuleGridProps> = ({ modules }) => {
  return (
    <Box 
      display="grid" 
      gridTemplateColumns={{
        xs: '1fr',
        md: 'repeat(2, 1fr)',
        lg: 'repeat(3, 1fr)',
        xl: 'repeat(4, 1fr)'
      }}
      gap={3}
    >
      {modules.map((module) => (
        <ModuleCard key={module.id} module={module} />
      ))}
    </Box>
  );
}; 