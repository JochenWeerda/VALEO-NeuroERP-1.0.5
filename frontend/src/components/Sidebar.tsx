import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Collapse,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  SmartToy as AIIcon,
  Store as StoreIcon,
  Apps as AppsIcon,
  ExpandLess,
  ExpandMore,
  Science as ScienceIcon,
  Widgets as WidgetsIcon,
  ReceiptLong as ReceiptLongIcon,
  Analytics as AnalyticsIcon,
  LocalShipping as LocalShippingIcon,
  Receipt as ReceiptIcon,
  PointOfSale as PointOfSaleIcon,
  BarChart as BarChartIcon,
  Money as MoneyIcon,
  AccountBalance as AccountBalanceIcon,
  SwapHoriz as SwapHorizIcon,
  EditNote as EditNoteIcon,
  ListAlt as ListAltIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  ShoppingBasket as ShoppingBasketIcon,
  Sync as SyncIcon,
  FeaturedPlayList as FeaturedPlayListIcon,
  ReceiptLong as ReceiptIcon2,
} from '@mui/icons-material';
import { useThemeSystem } from '../themes/ThemeProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

// Props-Interface für die Sidebar
interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

// Dummy Link-Komponente, bis react-router-dom korrekt eingebunden ist
const Link = ({ to, children, ...props }: { to: string; children: React.ReactNode; [key: string]: any }) => (
  <div {...props} style={{ cursor: 'pointer' }}>{children}</div>
);

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  // React Router Hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  // State für Untermenüs
  const [openInventory, setOpenInventory] = useState(
    location.pathname.includes('/inventory') || 
    location.pathname.includes('/chargen') ||
    location.pathname.includes('/artikelkonto') ||
    location.pathname.includes('/lager') ||
    location.pathname.includes('/inventur')
  );
  const [openFinance, setOpenFinance] = useState(false);
  const [openBelegfolge, setOpenBelegfolge] = useState(
    location.pathname.includes('/belegfolge')
  );
  
  const { currentThemeConfig } = useThemeSystem();
  
  // Theme-spezifische Anpassungen für die Sidebar
  const isHighContrast = currentThemeConfig.mode === 'high-contrast';
  const customBgColor = currentThemeConfig.mode === 'dark' ? '#2c2c2c' : '#f5f5f5';
  const visualDensity = currentThemeConfig.parameters?.visualDensity || 'medium';
  
  // Visuelle Dichte für Sidebar-Elemente anpassen
  const itemPadding = visualDensity === 'low' ? '12px 16px' : (visualDensity === 'high' ? '6px 16px' : '8px 16px');
  const subItemPadding = visualDensity === 'low' ? '12px 32px' : (visualDensity === 'high' ? '6px 32px' : '8px 32px');

  const handleItemClick = (path: string) => {
    navigate(path);
  };

  const handleInventoryClick = () => {
    setOpenInventory(!openInventory);
  };

  const handleFinanceClick = () => {
    setOpenFinance(!openFinance);
  };

  const handleBelegfolgeClick = () => {
    setOpenBelegfolge(!openBelegfolge);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const drawerWidth = 240;
  
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      active: isActive('/')
    },
    {
      text: 'Belegfolge',
      icon: <ReceiptLongIcon />,
      onClick: handleBelegfolgeClick,
      active: location.pathname.includes('/belegfolge'),
      submenu: true,
      open: openBelegfolge,
      items: [
        {
          text: 'Dashboard',
          icon: <DashboardIcon fontSize="small" />,
          path: '/belegfolge',
          active: isActive('/belegfolge')
        },
        {
          text: 'Angebote',
          icon: <FeaturedPlayListIcon fontSize="small" />,
          path: '/belegfolge/angebote',
          active: location.pathname.includes('/belegfolge/angebote'),
          badge: 3
        },
        {
          text: 'Aufträge',
          icon: <AssignmentIcon fontSize="small" />,
          path: '/belegfolge/auftraege',
          active: location.pathname.includes('/belegfolge/auftraege'),
          badge: 5
        },
        {
          text: 'Lieferscheine',
          icon: <LocalShippingIcon fontSize="small" />,
          path: '/belegfolge/lieferscheine',
          active: location.pathname.includes('/belegfolge/lieferscheine'),
          badge: 2
        },
        {
          text: 'Rechnungen',
          icon: <ReceiptIcon fontSize="small" />,
          path: '/belegfolge/rechnungen',
          active: location.pathname.includes('/belegfolge/rechnungen'),
          badge: 4
        },
        {
          text: 'Bestellungen',
          icon: <ShoppingBasketIcon fontSize="small" />,
          path: '/belegfolge/bestellungen',
          active: location.pathname.includes('/belegfolge/bestellungen'),
          badge: 1
        },
        {
          text: 'Eingangsl.',
          icon: <SyncIcon fontSize="small" />,
          path: '/belegfolge/eingangslieferscheine',
          active: location.pathname.includes('/belegfolge/eingangslieferscheine')
        }
      ]
    },
    {
      text: 'Lager',
      icon: <InventoryIcon />,
      onClick: handleInventoryClick,
      active: location.pathname.includes('/lager') || location.pathname.includes('/chargen') || location.pathname.includes('/artikelkonto') || location.pathname.includes('/inventur'),
      submenu: true,
      open: openInventory,
      items: [
        {
          text: 'Lagerbestand',
          icon: <InventoryIcon fontSize="small" />,
          path: '/lager/bestand',
          active: isActive('/lager/bestand')
        },
        {
          text: 'Lager-zu-Lager',
          icon: <SwapHorizIcon fontSize="small" />,
          path: '/lager/umlagerung',
          active: isActive('/lager/umlagerung')
        },
        {
          text: 'Lagerkorrekturen',
          icon: <EditNoteIcon fontSize="small" />,
          path: '/lager/korrektur',
          active: isActive('/lager/korrektur')
        },
        {
          text: 'Inventur',
          icon: <ListAltIcon fontSize="small" />,
          path: '/inventur',
          active: location.pathname.includes('/inventur')
        },
        {
          text: 'Chargen',
          icon: <InventoryIcon fontSize="small" />,
          path: '/chargen',
          active: isActive('/chargen')
        },
        {
          text: 'Artikelkonto',
          icon: <BarChartIcon fontSize="small" />,
          path: '/artikelkonto',
          active: isActive('/artikelkonto')
        }
      ]
    },
    {
      text: 'Finanzen',
      icon: <MoneyIcon />,
      onClick: handleFinanceClick,
      active: location.pathname.includes('/offeneposten') || location.pathname.includes('/rechnungen'),
      submenu: true,
      open: openFinance,
      items: [
        {
          text: 'Offene Posten',
          icon: <AccountBalanceIcon fontSize="small" />,
          path: '/offeneposten',
          active: isActive('/offeneposten')
        },
        {
          text: 'Rechnungen',
          icon: <ReceiptIcon fontSize="small" />,
          path: '/rechnungen',
          active: isActive('/rechnungen')
        },
        {
          text: 'Kassenübernahme',
          icon: <PointOfSaleIcon fontSize="small" />,
          path: '/kassenimport',
          active: isActive('/kassenimport')
        },
        {
          text: 'Externe Finanzbuchhaltung',
          icon: <AccountBalanceIcon fontSize="small" />,
          path: '/finanzbuchhaltung',
          active: isActive('/finanzbuchhaltung') && !location.pathname.includes('/intern')
        },
        {
          text: 'Interne Finanzbuchhaltung',
          icon: <AccountBalanceIcon fontSize="small" />,
          path: '/finanzbuchhaltung/intern',
          active: isActive('/finanzbuchhaltung/intern')
        }
      ]
    },
    {
      text: 'Warenausgang',
      icon: <LocalShippingIcon />,
      path: '/warenausgang',
      active: isActive('/warenausgang')
    },
    {
      text: 'Belege',
      icon: <ReceiptIcon />,
      path: '/belege',
      active: isActive('/belege')
    },
    {
      text: 'Verkauf',
      icon: <PointOfSaleIcon />,
      path: '/verkauf',
      active: isActive('/verkauf')
    },
    {
      text: 'Berichte',
      icon: <BarChartIcon />,
      path: '/berichte',
      active: isActive('/berichte')
    },
    {
      text: 'Kundenverwaltung',
      icon: <PeopleIcon />,
      path: '/kunden',
      active: isActive('/kunden')
    },
    {
      text: 'Einstellungen',
      icon: <SettingsIcon />,
      path: '/settings',
      active: isActive('/settings')
    }
  ];

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : 64,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 64,
          overflowX: 'hidden',
          backgroundColor: isHighContrast ? '#000' : customBgColor,
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography 
          variant="h6"
          sx={{ 
            textAlign: 'center',
            color: isHighContrast ? '#fff' : 'text.primary',
            fontSize: visualDensity === 'high' ? '1.1rem' : '1.25rem',
            opacity: open ? 1 : 0,
            whiteSpace: 'nowrap',
            transition: 'opacity 0.2s'
          }}
        >
          ERP System
        </Typography>
        {!open && (
          <Typography
            variant="h6"
            sx={{
              position: 'absolute',
              top: 16,
              left: 0,
              right: 0,
              textAlign: 'center',
              color: isHighContrast ? '#fff' : 'text.primary',
            }}
          >
            ERP
          </Typography>
        )}
      </Box>
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.text}>
            <ListItem
              button
              onClick={item.submenu ? item.onClick : () => handleItemClick(item.path)}
              sx={{
                padding: itemPadding,
                backgroundColor: item.active ? (isHighContrast ? '#333' : 'action.selected') : 'transparent',
                '&:hover': {
                  backgroundColor: isHighContrast ? '#444' : 'action.hover',
                },
              }}
            >
              <Tooltip title={open ? '' : item.text} placement="right">
                <ListItemIcon
                  sx={{
                    color: isHighContrast ? '#fff' : (item.active ? 'primary.main' : 'text.primary'),
                    minWidth: 36,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              </Tooltip>
              {open && (
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    color: isHighContrast ? '#fff' : (item.active ? 'primary.main' : 'text.primary'),
                    '& .MuiTypography-root': {
                      fontSize: visualDensity === 'high' ? '0.85rem' : '0.95rem',
                    }
                  }} 
                />
              )}
              {item.submenu && open && (item.open ? <ExpandLess /> : <ExpandMore />)}
            </ListItem>

            {item.submenu && (
              <Collapse in={item.open && open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.items.map((subItem) => (
                    <ListItem
                      button
                      key={subItem.text}
                      onClick={() => handleItemClick(subItem.path)}
                      sx={{
                        padding: subItemPadding,
                        backgroundColor: subItem.active ? (isHighContrast ? '#333' : 'action.selected') : 'transparent',
                        '&:hover': {
                          backgroundColor: isHighContrast ? '#444' : 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: isHighContrast ? '#fff' : (subItem.active ? 'primary.main' : 'text.secondary'),
                          minWidth: 36,
                        }}
                      >
                        {subItem.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          subItem.badge ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {subItem.text}
                              <Badge 
                                badgeContent={subItem.badge} 
                                color="primary"
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          ) : (
                            subItem.text
                          )
                        } 
                        sx={{ 
                          color: isHighContrast ? '#fff' : (subItem.active ? 'primary.main' : 'text.secondary'),
                          '& .MuiTypography-root': {
                            fontSize: visualDensity === 'high' ? '0.8rem' : '0.875rem',
                          }
                        }} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar; 