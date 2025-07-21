import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

export type Module = 'crm' | 'warenwirtschaft' | 'fibu' | 'lager' | 'bi' | 'dms' | 'settings' | 'help';

export interface ModuleItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  trustLevel: 'fact' | 'assumption' | 'uncertain';
  confidence: number;
  status: 'active' | 'inactive';
}

export interface SidebarProps {
  activeModule: Module;
  onModuleChange: (module: Module) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const defaultModules: ModuleItem[] = [
  {
    id: 'crm',
    title: 'CRM',
    description: 'Kundenverwaltung',
    icon: 'fas fa-users',
    color: 'bg-blue-500',
    trustLevel: 'fact',
    confidence: 90,
    status: 'active'
  },
  {
    id: 'warenwirtschaft',
    title: 'Warenwirtschaft',
    description: 'L3 Warenwirtschaft & ERP',
    icon: 'fas fa-warehouse',
    color: 'bg-purple-500',
    trustLevel: 'fact',
    confidence: 95,
    status: 'active'
  },
  {
    id: 'fibu',
    title: 'FiBu',
    description: 'Finanzbuchhaltung',
    icon: 'fas fa-calculator',
    color: 'bg-green-500',
    trustLevel: 'fact',
    confidence: 98,
    status: 'active'
  },
  {
    id: 'lager',
    title: 'Lager',
    description: 'Lagerverwaltung',
    icon: 'fas fa-boxes',
    color: 'bg-orange-500',
    trustLevel: 'fact',
    confidence: 92,
    status: 'active'
  },
  {
    id: 'bi',
    title: 'BI',
    description: 'Business Intelligence',
    icon: 'fas fa-chart-line',
    color: 'bg-teal-500',
    trustLevel: 'assumption',
    confidence: 85,
    status: 'active'
  },
  {
    id: 'dms',
    title: 'DMS',
    description: 'Dokumentenmanagement',
    icon: 'fas fa-file-alt',
    color: 'bg-indigo-500',
    trustLevel: 'fact',
    confidence: 88,
    status: 'active'
  },
  {
    id: 'settings',
    title: 'Einstellungen',
    description: 'Systemkonfiguration',
    icon: 'fas fa-cog',
    color: 'bg-gray-500',
    trustLevel: 'fact',
    confidence: 100,
    status: 'active'
  },
  {
    id: 'help',
    title: 'Hilfe',
    description: 'Support & Dokumentation',
    icon: 'fas fa-question-circle',
    color: 'bg-pink-500',
    trustLevel: 'fact',
    confidence: 92,
    status: 'active'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onModuleChange,
  collapsed = false,
  onToggleCollapse
}) => {
  return (
    <Box
      sx={{
        width: collapsed ? 64 : 240,
        minHeight: '100vh',
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        transition: 'width 0.2s ease-in-out'
      }}
    >
      {/* Toggle Button */}
      {onToggleCollapse && (
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={onToggleCollapse} size="small">
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
      )}

      {/* Module List */}
      <List>
        {defaultModules.map((module) => (
          <ListItem key={module.id} disablePadding>
            <ListItemButton
              selected={activeModule === module.id}
              onClick={() => onModuleChange(module.id as Module)}
              sx={{
                minHeight: 48,
                px: 2.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 'auto' : 3,
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: module.color.replace('bg-', ''),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px'
                  }}
                >
                  {module.icon.includes('fas fa-') ? 
                    module.icon.replace('fas fa-', '').charAt(0).toUpperCase() : 
                    'M'
                  }
                </Box>
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={module.title}
                  secondary={module.description}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: activeModule === module.id ? 600 : 400,
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 