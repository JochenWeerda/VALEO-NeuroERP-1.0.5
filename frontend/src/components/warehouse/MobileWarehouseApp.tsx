import React, { useState } from 'react';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  QrCodeScanner as ScanIcon,
  Inbox as InboxIcon,
  ShoppingCart as CartIcon,
  Inventory as InventoryIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  Assessment as ReportsIcon,
} from '@mui/icons-material';
import { BarcodeScanner } from '../barcode/BarcodeScanner';
import { MobileGoodsReceipt } from '../warehouse/MobileGoodsReceipt';
import { MobilePickingList } from '../warehouse/MobilePickingList';
import { MobileInventory } from '../warehouse/MobileInventory';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mobile-tabpanel-${index}`}
      aria-labelledby={`mobile-tab-${index}`}
      {...other}
      style={{ height: 'calc(100vh - 112px)' }}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
}

export const MobileWarehouseApp: React.FC = () => {
  const [value, setValue] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event &&
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: <ReportsIcon />, text: 'Berichte', action: () => navigate('/reports') },
    { icon: <SettingsIcon />, text: 'Einstellungen', action: () => navigate('/settings') },
    { divider: true },
    { icon: <LogoutIcon />, text: 'Abmelden', action: handleLogout },
  ];

  return (
    <Box sx={{ pb: 7, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ top: 0 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            VALEO Lager
          </Typography>
          
          <IconButton color="inherit">
            <Badge badgeContent={notifications} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">{user?.name || 'Benutzer'}</Typography>
            <Typography variant="body2">{user?.email}</Typography>
          </Box>
          
          <List>
            {menuItems.map((item, index) => (
              item.divider ? (
                <Divider key={index} />
              ) : (
                <ListItem button key={index} onClick={item.action}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              )
            ))}
          </List>
        </Box>
      </SwipeableDrawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, mt: 8, overflow: 'hidden' }}>
        <TabPanel value={value} index={0}>
          <MobileBarcodeScanner />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <MobileGoodsReceipt />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <MobilePickingList />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <MobileInventory />
        </TabPanel>
      </Box>

      {/* Bottom Navigation */}
      <BottomNavigation
        value={value}
        onChange={handleChange}
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <BottomNavigationAction
          label="Scanner"
          icon={<ScanIcon />}
        />
        <BottomNavigationAction
          label="Wareneingang"
          icon={<InboxIcon />}
        />
        <BottomNavigationAction
          label="Kommissionierung"
          icon={
            <Badge badgeContent={2} color="error">
              <CartIcon />
            </Badge>
          }
        />
        <BottomNavigationAction
          label="Inventur"
          icon={<InventoryIcon />}
        />
      </BottomNavigation>
    </Box>
  );
};

// Mobile Scanner Komponente
const MobileBarcodeScanner: React.FC = () => {
  const [lastScanned, setLastScanned] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<Array<{ code: string; time: Date }>>([]);

  const handleScan = (code: string) => {
    setLastScanned(code);
    setScanHistory(prev => [{ code, time: new Date() }, ...prev].slice(0, 10));
    
    // Vibration Feedback (wenn verfügbar)
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
    
    // Artikel-Lookup
    lookupArticle(code);
  };

  const lookupArticle = async (code: string) => {
    try {
      const response = await fetch(`/api/v2/articles/barcode/${code}`);
      if (response.ok) {
        const article = await response.json();
        // Zeige Artikel-Details
        showArticleDetails(article);
      }
    } catch (error) {
      console.error('Artikel-Lookup fehlgeschlagen:', error);
    }
  };

  const showArticleDetails = (article: any) => {
    // Implementierung für Artikel-Detail-Anzeige
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom>
        Barcode Scanner
      </Typography>
      
      <Box sx={{ flexGrow: 1, mb: 2 }}>
        <BarcodeScanner
          onBarcodeDetected={handleScan}
          autoStart={true}
        />
      </Box>
      
      {lastScanned && (
        <Box sx={{ p: 2, bgcolor: 'success.main', color: 'white', borderRadius: 1, mb: 2 }}>
          <Typography variant="h6">Zuletzt gescannt:</Typography>
          <Typography variant="h4">{lastScanned}</Typography>
        </Box>
      )}
      
      {scanHistory.length > 0 && (
        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
          <Typography variant="subtitle2" gutterBottom>
            Scan-Verlauf:
          </Typography>
          <List dense>
            {scanHistory.map((item, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={item.code}
                  secondary={item.time.toLocaleTimeString()}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};