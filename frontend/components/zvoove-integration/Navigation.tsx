import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  Chip,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Payment as PaymentIcon,
  Inventory as InventoryIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Add as AddIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';

// TypeScript Interfaces
interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onSubItemClick?: (subItem: NavigationSubItem) => void;
}

type NavigationTab = 
  | 'ALLGEMEIN'
  | 'ERFASSUNG' 
  | 'ABRECHNUNG'
  | 'LAGER'
  | 'PRODUKTION'
  | 'AUSWERTUNG';

interface NavigationItem {
  id: NavigationTab;
  label: string;
  icon: React.ReactNode;
  subItems?: NavigationSubItem[];
  badge?: number;
}

interface NavigationSubItem {
  id: string;
  label: string;
  route: string;
  icon?: React.ReactNode;
  description?: string;
}

// Navigation-Konfiguration
const navigationItems: NavigationItem[] = [
  {
    id: 'ALLGEMEIN',
    label: 'Allgemein',
    icon: <DashboardIcon />,
    subItems: [
      { id: 'customers', label: 'Kundenstamm', route: '/customers', description: 'Kundendaten verwalten' },
      { id: 'suppliers', label: 'Lieferantenstamm', route: '/suppliers', description: 'Lieferantendaten verwalten' },
      { id: 'articles', label: 'Artikelstamm', route: '/articles', description: 'Artikeldaten verwalten' },
      { id: 'employees', label: 'Mitarbeiterstamm', route: '/employees', description: 'Mitarbeiterdaten verwalten' }
    ]
  },
  {
    id: 'ERFASSUNG',
    label: 'Erfassung',
    icon: <AssignmentIcon />,
    badge: 5,
    subItems: [
      { id: 'offers', label: 'Angebote', route: '/offers', description: 'Angebote erstellen und verwalten' },
      { id: 'orders', label: 'Aufträge', route: '/orders', description: 'Aufträge erfassen und bearbeiten' },
      { id: 'deliveries', label: 'Lieferungen', route: '/deliveries', description: 'Lieferscheine erstellen' },
      { id: 'invoices', label: 'Rechnungen', route: '/invoices', description: 'Rechnungen generieren' },
      { id: 'contacts', label: 'Kontakte', route: '/contacts', description: 'CRM-Kontakte verwalten' }
    ]
  },
  {
    id: 'ABRECHNUNG',
    label: 'Abrechnung',
    icon: <PaymentIcon />,
    subItems: [
      { id: 'accounts-receivable', label: 'Debitorenbuchhaltung', route: '/accounts-receivable', description: 'Forderungen verwalten' },
      { id: 'accounts-payable', label: 'Kreditorenbuchhaltung', route: '/accounts-payable', description: 'Verbindlichkeiten verwalten' },
      { id: 'payments', label: 'Zahlungen', route: '/payments', description: 'Zahlungseingänge erfassen' },
      { id: 'banking', label: 'Bankwesen', route: '/banking', description: 'Bankkonten und Buchungen' }
    ]
  },
  {
    id: 'LAGER',
    label: 'Lager',
    icon: <InventoryIcon />,
    badge: 3,
    subItems: [
      { id: 'stock', label: 'Bestand', route: '/stock', description: 'Lagerbestand anzeigen' },
      { id: 'goods-in', label: 'Wareneingang', route: '/goods-in', description: 'Wareneingänge erfassen' },
      { id: 'goods-out', label: 'Warenausgang', route: '/goods-out', description: 'Warenausgänge erfassen' },
      { id: 'inventory-count', label: 'Inventur', route: '/inventory-count', description: 'Inventur durchführen' },
      { id: 'locations', label: 'Lagerplätze', route: '/locations', description: 'Lagerplatzverwaltung' }
    ]
  },
  {
    id: 'PRODUKTION',
    label: 'Produktion',
    icon: <BuildIcon />,
    subItems: [
      { id: 'work-orders', label: 'Arbeitsaufträge', route: '/work-orders', description: 'Fertigungsaufträge verwalten' },
      { id: 'routing', label: 'Arbeitspläne', route: '/routing', description: 'Fertigungsrouten definieren' },
      { id: 'machines', label: 'Maschinen', route: '/machines', description: 'Maschinendaten verwalten' },
      { id: 'capacity', label: 'Kapazitätsplanung', route: '/capacity', description: 'Kapazitäten planen' }
    ]
  },
  {
    id: 'AUSWERTUNG',
    label: 'Auswertung',
    icon: <AssessmentIcon />,
    subItems: [
      { id: 'sales-reports', label: 'Verkaufsberichte', route: '/sales-reports', description: 'Verkaufsstatistiken' },
      { id: 'purchase-reports', label: 'Einkaufsberichte', route: '/purchase-reports', description: 'Einkaufsstatistiken' },
      { id: 'financial-reports', label: 'Finanzberichte', route: '/financial-reports', description: 'Finanzauswertungen' },
      { id: 'inventory-reports', label: 'Lagerberichte', route: '/inventory-reports', description: 'Lagerauswertungen' },
      { id: 'production-reports', label: 'Produktionsberichte', route: '/production-reports', description: 'Fertigungsauswertungen' }
    ]
  }
];

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onSubItemClick
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<NavigationTab | null>(null);

  // Sub-Menü öffnen
  const handleSubMenuOpen = (event: React.MouseEvent<HTMLElement>, tab: NavigationTab) => {
    setAnchorEl(event.currentTarget);
    setActiveSubMenu(tab);
  };

  // Sub-Menü schließen
  const handleSubMenuClose = () => {
    setAnchorEl(null);
    setActiveSubMenu(null);
  };

  // Sub-Item klicken
  const handleSubItemClick = (subItem: NavigationSubItem) => {
    handleSubMenuClose();
    if (onSubItemClick) {
      onSubItemClick(subItem);
    }
  };

  // Tab ändern
  const handleTabChange = (event: React.SyntheticEvent, newValue: NavigationTab) => {
    onTabChange(newValue);
  };

  // Aktuelles Sub-Menü
  const currentSubItems = activeSubMenu 
    ? navigationItems.find(item => item.id === activeSubMenu)?.subItems 
    : [];

  return (
    <AppBar position="static" color="default" elevation={1} className="bg-white">
      <Toolbar className="px-4">
        {/* Logo/Brand */}
        <Typography variant="h6" className="mr-8 text-gray-800 font-semibold">
          zvoove Handel
        </Typography>

        {/* Hauptnavigation */}
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          className="flex-1"
          indicatorColor="primary"
          textColor="primary"
        >
          {navigationItems.map((item) => (
            <Tab
              key={item.id}
              value={item.id}
              label={
                <Box className="flex items-center space-x-1">
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge 
                      badgeContent={item.badge} 
                      color="error" 
                      className="ml-1"
                    />
                  )}
                  {item.subItems && item.subItems.length > 0 && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleSubMenuOpen(e, item.id)}
                      className="ml-1"
                    >
                      <ArrowDownIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              }
              className="min-w-0 px-4"
            />
          ))}
        </Tabs>

        {/* Rechte Toolbar */}
        <Box className="flex items-center space-x-2">
          {/* Schnellaktionen */}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            size="small"
            className="mr-2"
          >
            Neu
          </Button>

          <Divider orientation="vertical" flexItem />

          {/* Export-Aktionen */}
          <IconButton size="small" title="Drucken">
            <PrintIcon />
          </IconButton>
          
          <IconButton size="small" title="Export">
            <DownloadIcon />
          </IconButton>
          
          <IconButton size="small" title="Weiterleiten">
            <ShareIcon />
          </IconButton>

          <Divider orientation="vertical" flexItem />

          {/* Benachrichtigungen */}
          <IconButton size="small" title="Benachrichtigungen">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Benutzer-Menü */}
          <IconButton size="small" title="Benutzereinstellungen">
            <AccountCircleIcon />
          </IconButton>

          {/* Einstellungen */}
          <IconButton size="small" title="Einstellungen">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Sub-Menü */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleSubMenuClose}
        className="mt-1"
        PaperProps={{
          className: "min-w-64"
        }}
      >
        {currentSubItems?.map((subItem) => (
          <MenuItem
            key={subItem.id}
            onClick={() => handleSubItemClick(subItem)}
            className="py-3 px-4 hover:bg-gray-50"
          >
            <Box className="flex items-start space-x-3 w-full">
              {subItem.icon && (
                <Box className="mt-1">
                  {subItem.icon}
                </Box>
              )}
              <Box className="flex-1">
                <Typography variant="body1" className="font-medium text-gray-900">
                  {subItem.label}
                </Typography>
                {subItem.description && (
                  <Typography variant="body2" className="text-gray-600 mt-1">
                    {subItem.description}
                  </Typography>
                )}
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Breadcrumb/Status-Bar */}
      <Box className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <Box className="flex items-center justify-between">
          <Box className="flex items-center space-x-2">
            <Typography variant="body2" className="text-gray-600">
              Aktueller Bereich:
            </Typography>
            <Chip
              label={navigationItems.find(item => item.id === activeTab)?.label}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
          
          <Box className="flex items-center space-x-4">
            <Typography variant="body2" className="text-gray-600">
              Benutzer: Jochen Weerda
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Version: 2.0.1
            </Typography>
          </Box>
        </Box>
      </Box>
    </AppBar>
  );
};

// Zusätzliche Komponente für mobile Navigation
export const ZvooveMobileNavigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onSubItemClick
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Box className="md:hidden">
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar className="px-4">
          <Typography variant="h6" className="flex-1 text-gray-800 font-semibold">
            zvoove Handel
          </Typography>
          
          <IconButton
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            <ArrowDownIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Dropdown-Menü */}
      {mobileMenuOpen && (
        <Box className="bg-white border-t border-gray-200">
          {navigationItems.map((item) => (
            <Box key={item.id} className="border-b border-gray-100">
              <Button
                fullWidth
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`justify-start px-4 py-3 ${
                  activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
                startIcon={item.icon}
              >
                <Box className="flex items-center justify-between w-full">
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge badgeContent={item.badge} color="error" />
                  )}
                </Box>
              </Button>
              
              {/* Mobile Sub-Items */}
              {item.subItems && (
                <Box className="bg-gray-50 pl-8">
                  {item.subItems.map((subItem) => (
                    <Button
                      key={subItem.id}
                      fullWidth
                      onClick={() => {
                        if (onSubItemClick) {
                          onSubItemClick(subItem);
                        }
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start px-4 py-2 text-gray-600 text-sm"
                    >
                      {subItem.label}
                    </Button>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}; 