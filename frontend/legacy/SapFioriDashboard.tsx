import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button,
  Chip,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  Home as HomeIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Assignment as AssignmentIcon,
  ShoppingCart as ShoppingCartIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Inventory as InventoryIcon,
  Mail as MailIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  LocalShipping as LocalShippingIcon,
  Block as BlockIcon,
  Group as GroupIcon,
  Receipt as ReceiptIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useApi } from '../src/contexts/ApiContext';
import {
  ObjectPageHeader,
  QuickViewCard,
  StatusIndicator,
  MessageStrip
} from '../src/components/ui/NeuroFlowComponents';

interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  status: 'critical' | 'warning' | 'success' | 'info';
  icon: React.ReactNode;
  action?: {
    label: string;
    path: string;
  };
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const SapFioriDashboard: React.FC = () => {
  const { isLoading, error } = useApi();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    // Refresh logic would go here
    console.log('Refreshing dashboard...');
  };

  // Tab Items Definition
  const tabItems = [
    { label: 'Startseite', icon: <HomeIcon /> },
    { label: 'Mitarbeiterservice', icon: <PeopleIcon /> },
    { label: 'Einkaufsanalyse', icon: <AnalyticsIcon /> },
    { label: 'Bedarfsanforderung', icon: <AssignmentIcon /> },
    { label: 'Bestellabwicklung', icon: <ShoppingCartIcon /> },
    { label: 'Lieferantenbewertung', icon: <StarIcon /> },
    { label: 'Bestellungen überwachen', icon: <VisibilityIcon /> },
    { label: 'Beschaffungsübersicht', icon: <InventoryIcon /> }
  ];

  // Dashboard Cards Data
  const dashboardCards: DashboardCard[] = [
    {
      id: 'posteingang',
      title: 'Mein Posteingang',
      value: '4 Aufgaben offen',
      subtitle: 'Letzte Aktualisierung: vor 30 Minuten',
      status: 'warning',
      icon: <MailIcon />
    },
    {
      id: 'situationen',
      title: 'Situationen überwachen',
      value: '469 Instanzen aktiv',
      subtitle: 'Letztes Ereignis: vor 11 Stunden',
      status: 'success',
      icon: <VisibilityIcon />,
      trend: { value: 12, direction: 'up' }
    },
    {
      id: 'bestellwert',
      title: 'Bestellwert & Terminierung',
      value: '533 Mio. EUR',
      subtitle: 'Gültig seit: Jahresbeginn',
      status: 'info',
      icon: <TrendingUpIcon />,
      trend: { value: 8.5, direction: 'up' }
    },
    {
      id: 'budgetabweichung',
      title: 'Budgetabweichung',
      value: '33,4 % Abweichung',
      subtitle: 'Bereich: Einkauf',
      status: 'critical',
      icon: <TrendingDownIcon />,
      trend: { value: 15.2, direction: 'down' }
    },
    {
      id: 'ueberfaellige',
      title: 'Überfällige Bestellpositionen',
      value: '625 Positionen',
      subtitle: 'Nicht abgeschlossen seit: 14 Stunden',
      status: 'critical',
      icon: <ScheduleIcon />
    },
    {
      id: 'liefertermin',
      title: 'Liefertermin vorhersagen',
      value: 'Lieferung in 2 Tagen',
      subtitle: 'Artikelgruppe: Rahmenkomponenten',
      status: 'success',
      icon: <LocalShippingIcon />
    },
    {
      id: 'nicht-verwaltet',
      title: 'Nicht verwaltete Artikel',
      value: '0 % verwaltet',
      subtitle: 'Bereich: Externe Beschaffung',
      status: 'success',
      icon: <BlockIcon />
    },
    {
      id: 'einkaufsgruppen',
      title: 'Einkaufsgruppen-Aktivität',
      value: '18 Gruppen aktiv',
      subtitle: 'Top-Performer: Gruppe Nord',
      status: 'info',
      icon: <GroupIcon />
    },
    {
      id: 'rechnungsabweichung',
      title: 'Rechnungsabweichung Preis',
      value: '+249,54 EUR',
      subtitle: 'Abgleich mit PO-Wert',
      status: 'warning',
      icon: <ReceiptIcon />
    },
    {
      id: 'ausgaben-ohne-vertrag',
      title: 'Ausgaben ohne Vertrag',
      value: '100 % ohne Rahmenvertrag',
      subtitle: 'Bereich: Projektbeschaffung',
      status: 'critical',
      icon: <WarningIcon />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return '#BB0000';
      case 'warning': return '#E9730C';
      case 'success': return '#107C41';
      case 'info': return '#0A6ED1';
      default: return '#515559';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'critical': return '#FFEBEE';
      case 'warning': return '#FFF3E0';
      case 'success': return '#E8F5E8';
      case 'info': return '#E3F2FD';
      default: return '#F5F6F7';
    }
  };

  const DashboardCard: React.FC<{ card: DashboardCard }> = ({ card }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Card
        data-testid={`dashboard-card-${card.id}`}
        sx={{
          p: 3,
          height: '100%',
          minHeight: 200,
          cursor: card.action ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          border: `2px solid ${getStatusColor(card.status)}`,
          backgroundColor: getStatusBgColor(card.status),
          '&:hover': {
            transform: isHovered ? 'translateY(-4px)' : 'none',
            boxShadow: isHovered ? '0 8px 25px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
            borderColor: getStatusColor(card.status)
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => card.action && (window.location.href = card.action.path)}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ color: getStatusColor(card.status) }}>
            {card.icon}
          </Box>
          {card.trend && (
            <Chip
              label={`${card.trend.direction === 'up' ? '+' : '-'}${card.trend.value}%`}
              size="small"
              color={card.trend.direction === 'up' ? 'success' : 'error'}
              variant="outlined"
            />
          )}
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#354A5F' }}>
          {card.title}
        </Typography>

        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          mb: 1, 
          color: getStatusColor(card.status),
          fontSize: card.action ? '1.5rem' : '2rem'
        }}>
          {card.value}
        </Typography>

        <Typography variant="body2" sx={{ color: '#515559', mb: 2 }}>
          {card.subtitle}
        </Typography>

        {card.action && (
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: getStatusColor(card.status),
              '&:hover': { bgcolor: getStatusColor(card.status), opacity: 0.9 }
            }}
          >
            {card.action.label}
          </Button>
        )}

        {/* Status Indicator */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: 4, 
          bgcolor: getStatusColor(card.status) 
        }} />
      </Card>
    );
  };

  return (
    <Box 
      data-testid="dashboard-container"
      sx={{ minHeight: '100vh', bgcolor: '#F5F6F7' }}
    >
      {/* Header */}
      <ObjectPageHeader
        title="VALEO NeuroERP Dashboard"
        subtitle="SAP Fiori Style - Intelligente Beschaffungsübersicht"
        status="Live-Daten"
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Aktualisieren
            </Button>
            <Button variant="contained">
              Export
            </Button>
          </Box>
        }
      />

      {/* Error Display */}
      {error && (
        <Box sx={{ px: 3 }}>
          {/* The MessageStrip component was removed, so this will be empty or replaced with a simple Typography */}
          {/* For now, we'll just show the error message */}
          <Typography variant="body1" color="error">{error}</Typography>
        </Box>
      )}

      {/* Navigation Tabs */}
      <Box 
        data-testid="navigation"
        sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}
      >
        <Box sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem'
              },
              '& .Mui-selected': {
                color: '#0A6ED1',
                fontWeight: 600
              }
            }}
          >
            {tabItems.map((tab, index) => (
              <Tab
                key={index}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.icon}
                    {tab.label}
                  </Box>
                }
                sx={{ minWidth: 'auto', px: 3 }}
              />
            ))}
          </Tabs>
        </Box>
      </Box>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ p: 3 }}>
          {/* Summary Cards */}
          <Box 
            data-testid="grid-container"
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Card sx={{ p: 3, bgcolor: '#E3F2FD', border: '2px solid #0A6ED1' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#0A6ED1' }} />
                <Box>
                  <Typography variant="h4" sx={{ color: '#0A6ED1', fontWeight: 600 }}>
                    533 Mio.€
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#515559' }}>
                    Gesamtbestellwert
                  </Typography>
                </Box>
              </Box>
            </Card>

            <Card sx={{ p: 3, bgcolor: '#E8F5E8', border: '2px solid #107C41' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#107C41' }} />
                <Box>
                  <Typography variant="h4" sx={{ color: '#107C41', fontWeight: 600 }}>
                    18
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#515559' }}>
                    Aktive Gruppen
                  </Typography>
                </Box>
              </Box>
            </Card>

            <Card sx={{ p: 3, bgcolor: '#FFF3E0', border: '2px solid #E9730C' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <WarningIcon sx={{ fontSize: 40, color: '#E9730C' }} />
                <Box>
                  <Typography variant="h4" sx={{ color: '#E9730C', fontWeight: 600 }}>
                    625
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#515559' }}>
                    Überfällige Positionen
                  </Typography>
                </Box>
              </Box>
            </Card>

            <Card sx={{ p: 3, bgcolor: '#FFEBEE', border: '2px solid #BB0000' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ErrorIcon sx={{ fontSize: 40, color: '#BB0000' }} />
                <Box>
                  <Typography variant="h4" sx={{ color: '#BB0000', fontWeight: 600 }}>
                    33,4%
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#515559' }}>
                    Budgetabweichung
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>

          {/* Dashboard Cards Grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3 
          }}>
            {dashboardCards.map((card) => (
              <Box key={card.id}>
                <DashboardCard card={card} />
              </Box>
            ))}
          </Box>
        </Box>
      </TabPanel>

      {/* Other Tab Panels */}
      {tabItems.slice(1).map((tab, index) => (
        <TabPanel key={index + 1} value={tabValue} index={index + 1}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#515559', mb: 2 }}>
              {tab.label}
            </Typography>
            <Typography variant="body1" sx={{ color: '#6A6D70' }}>
              Diese Funktion wird in Kürze verfügbar sein.
            </Typography>
          </Box>
        </TabPanel>
      ))}

      {/* Loading Overlay */}
      {isLoading && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          bgcolor: 'rgba(0,0,0,0.3)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default SapFioriDashboard; 