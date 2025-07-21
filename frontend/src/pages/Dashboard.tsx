import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent,
  Typography, 
  Button,
  Chip,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Grid,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Person as PersonIcon,
  KeyboardArrowDown as ChevronDownIcon,
  Menu as MenuIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as ClockIcon,
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ChevronRight as ChevronRightIcon,
  People as PeopleIcon,
  AttachMoney as DollarIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as SalesIcon,
  Factory as FactoryIcon,
  BarChart as BarChartIcon,
  Description as FileTextIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// =====================================================
// COMPONENTS
// =====================================================

interface HeaderProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMobileMenuOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <Box className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Box className="flex items-center justify-between h-16">
          {/* Logo and Mobile Menu */}
          <Box className="flex items-center space-x-4">
            <IconButton
              onClick={onMenuToggle}
              className="md:hidden"
              size="small"
            >
              <MenuIcon />
            </IconButton>
            <Box className="flex items-center space-x-3">
              <Box className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Typography className="text-white font-bold text-sm">VN</Typography>
              </Box>
              <Box className="hidden sm:block">
                <Typography variant="h6" className="text-gray-900">VALEO</Typography>
                <Typography variant="caption" className="text-blue-600 -mt-1">NeuroERP</Typography>
              </Box>
            </Box>
          </Box>

          {/* Search Bar */}
          <Box className="flex-1 max-w-2xl mx-4 hidden md:block">
            <Box className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Suche in Modulen, Aufgaben, Dokumenten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </Box>
          </Box>

          {/* Right Actions */}
          <Box className="flex items-center space-x-3">
            <Tooltip title="Benachrichtigungen">
              <IconButton className="relative">
                <NotificationsIcon />
                <Box className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  5
                </Box>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Hilfe">
              <IconButton>
                <HelpIcon />
              </IconButton>
            </Tooltip>

            <Box className="relative">
              <Button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                endIcon={<ChevronDownIcon />}
              >
                <Avatar className="w-8 h-8 bg-blue-600">
                  <PersonIcon className="h-5 w-5 text-white" />
                </Avatar>
                <Box className="hidden sm:block text-left">
                  <Typography variant="body2" className="font-medium text-gray-900">Max Mustermann</Typography>
                  <Typography variant="caption" className="text-gray-500">Sachbearbeiter</Typography>
                </Box>
              </Button>

              {isUserMenuOpen && (
                <Box className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                  <Box className="py-1">
                    <Button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil</Button>
                    <Button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Einstellungen</Button>
                    <hr className="my-1" />
                    <Button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Abmelden</Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const QuickAccess: React.FC = () => {
  return (
    <Box className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4">
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Box className="flex items-center justify-between">
          <Typography variant="h6" className="font-semibold">
            Schnellzugriff
          </Typography>
          <Box className="flex space-x-4">
            <Button variant="outlined" className="text-white border-white hover:bg-white hover:text-blue-600">
              Neuer Auftrag
            </Button>
            <Button variant="outlined" className="text-white border-white hover:bg-white hover:text-blue-600">
              Dokument erstellen
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const KPIDashboard: React.FC = () => {
  const kpis = [
    {
      title: 'Offene Vorgänge',
      value: '23',
      change: '+5',
      trend: 'up',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: WarningIcon
    },
    {
      title: 'Bearbeitete Aufgaben',
      value: '156',
      change: '+12',
      trend: 'up',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: CheckCircleIcon
    },
    {
      title: 'Durchschn. Bearbeitungszeit',
      value: '2.3h',
      change: '-0.2h',
      trend: 'down',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: ClockIcon
    },
    {
      title: 'Zielerreichung',
      value: '94%',
      change: '+2%',
      trend: 'up',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: FlagIcon
    }
  ];

  return (
    <Card className="mb-8">
      <CardContent>
        <Box className="flex items-center space-x-2 mb-6">
          <Box className="p-2 bg-blue-100 rounded-lg">
            <TrendingUpIcon className="h-5 w-5 text-blue-600" />
          </Box>
          <Typography variant="h6" className="font-semibold text-gray-900">Meine Kennzahlen</Typography>
        </Box>

        {/* Kompakte Kennzahlen-Darstellung */}
        <Box className="flex justify-center">
          <Box className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl">
            {kpis.map((kpi, index) => {
              const IconComponent = kpi.icon;
              return (
                <Box key={index} className={`p-4 rounded-lg border ${kpi.bgColor} min-w-[200px] max-w-[250px]`}>
                  <Box className="flex items-center justify-between mb-2">
                    <IconComponent className={`h-5 w-5 ${kpi.color}`} />
                    <Box className={`flex items-center space-x-1 text-xs font-medium ${
                      kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.trend === 'up' ? (
                        <TrendingUpIcon className="h-3 w-3" />
                      ) : (
                        <TrendingDownIcon className="h-3 w-3" />
                      )}
                      <span>{kpi.change}</span>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="h4" className="font-bold text-gray-900">{kpi.value}</Typography>
                    <Typography variant="body2" className="text-gray-600 mt-1">{kpi.title}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Mini Chart Area */}
        <Box className="mt-6 p-4 bg-gray-50 rounded-lg max-w-2xl mx-auto">
          <Box className="flex items-center justify-between mb-3">
            <Typography variant="subtitle2" className="font-medium text-gray-700">Wöchentlicher Trend</Typography>
            <select className="text-xs border border-gray-300 rounded px-2 py-1">
              <option>Letzte 4 Wochen</option>
              <option>Letztes Quartal</option>
            </select>
          </Box>
          <Box className="h-20 flex items-end justify-between space-x-2">
            {[65, 78, 82, 94].map((height, index) => (
              <Box key={index} className="flex-1 bg-blue-500 rounded-t opacity-70" 
                   style={{ height: `${height}%` }}>
              </Box>
            ))}
          </Box>
          <Box className="flex justify-between text-xs text-gray-500 mt-2">
            <span>W1</span>
            <span>W2</span>
            <span>W3</span>
            <span>W4</span>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const ModulesWidget: React.FC = () => {
  const modules = [
    { name: 'Personal Management', icon: PeopleIcon, color: 'bg-blue-100 text-blue-600', count: '247 Mitarbeiter', path: '/personal' },
    { name: 'Finanzbuchhaltung', icon: DollarIcon, color: 'bg-green-100 text-green-600', count: '23 offene Posten', path: '/finance' },
    { name: 'Lagerverwaltung', icon: InventoryIcon, color: 'bg-purple-100 text-purple-600', count: '1,234 Artikel', path: '/warehouse' },
    { name: 'Einkauf', icon: ShoppingCartIcon, color: 'bg-orange-100 text-orange-600', count: '12 Bestellungen', path: '/purchasing' },
    { name: 'Verkauf', icon: SalesIcon, color: 'bg-red-100 text-red-600', count: '45 Angebote', path: '/sales' },
    { name: 'Produktion', icon: FactoryIcon, color: 'bg-indigo-100 text-indigo-600', count: '8 Aufträge', path: '/production' },
    { name: 'Reporting', icon: BarChartIcon, color: 'bg-cyan-100 text-cyan-600', count: '15 Berichte', path: '/reporting' },
    { name: 'Dokumentenverwaltung', icon: FileTextIcon, color: 'bg-pink-100 text-pink-600', count: '892 Dokumente', path: '/documents' },
  ];

  return (
    <Card>
      <CardContent>
        <Box className="flex items-center space-x-2 mb-6">
          <Box className="p-2 bg-blue-100 rounded-lg">
            <Box className="w-5 h-5 bg-gradient-to-br from-blue-600 to-blue-700 rounded flex items-center justify-center">
              <Typography className="text-white text-xs font-bold">🏢</Typography>
            </Box>
          </Box>
          <Typography variant="h6" className="font-semibold text-gray-900">Hauptmodule</Typography>
        </Box>

        <Box className="grid grid-cols-1 gap-3">
          {modules.map((module, index) => {
            const IconComponent = module.icon;
            return (
              <Button
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all duration-200 group w-full text-left"
                href={module.path}
              >
                <Box className="flex items-center space-x-3">
                  <Box className={`p-3 rounded-lg ${module.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </Box>
                  <Box className="text-left">
                    <Typography variant="body2" className="font-medium text-gray-900 group-hover:text-blue-600">
                      {module.name}
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">{module.count}</Typography>
                  </Box>
                </Box>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
              </Button>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

const TasksWidget: React.FC = () => {
  const tasks = [
    { id: 1, title: 'Monatsabschluss Februar prüfen', priority: 'high', status: 'pending', dueDate: 'Heute' },
    { id: 2, title: 'Lieferantenbewertung Q1 abschließen', priority: 'medium', status: 'in-progress', dueDate: 'Morgen' },
    { id: 3, title: 'Personalplanung 2024 finalisieren', priority: 'low', status: 'pending', dueDate: 'Übermorgen' },
    { id: 4, title: 'Qualitätsaudit vorbereiten', priority: 'high', status: 'completed', dueDate: 'Gestern' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box className="flex items-center justify-between mb-6">
          <Box className="flex items-center space-x-2">
            <Box className="p-2 bg-orange-100 rounded-lg">
              <Box className="w-5 h-5 bg-gradient-to-br from-orange-600 to-orange-700 rounded flex items-center justify-center">
                <Typography className="text-white text-xs font-bold">📋</Typography>
              </Box>
            </Box>
            <Typography variant="h6" className="font-semibold text-gray-900">Meine Aufgaben</Typography>
          </Box>
          <Button variant="outlined" size="small" startIcon={<AddIcon />}>
            Neue Aufgabe
          </Button>
        </Box>

        <Box className="space-y-3">
          {tasks.map((task) => (
            <Box key={task.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
              <Box className="flex items-start justify-between mb-2">
                <Typography variant="body2" className="font-medium text-gray-900 flex-1">
                  {task.title}
                </Typography>
                <Box className="flex space-x-1">
                  <Chip 
                    label={task.priority === 'high' ? 'Hoch' : task.priority === 'medium' ? 'Mittel' : 'Niedrig'} 
                    color={getPriorityColor(task.priority) as any} 
                    size="small" 
                  />
                  <Chip 
                    label={task.status === 'completed' ? 'Erledigt' : task.status === 'in-progress' ? 'In Bearbeitung' : 'Ausstehend'} 
                    color={getStatusColor(task.status) as any} 
                    size="small" 
                  />
                </Box>
              </Box>
              <Box className="flex items-center justify-between">
                <Typography variant="caption" className="text-gray-500">
                  Fällig: {task.dueDate}
                </Typography>
                <Box className="flex space-x-1">
                  <Tooltip title="Anzeigen">
                    <IconButton size="small">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Bearbeiten">
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const InfoWidget: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Box className="flex items-center space-x-2 mb-6">
          <Box className="p-2 bg-green-100 rounded-lg">
            <Box className="w-5 h-5 bg-gradient-to-br from-green-600 to-green-700 rounded flex items-center justify-center">
              <Typography className="text-white text-xs font-bold">ℹ️</Typography>
            </Box>
          </Box>
          <Typography variant="h6" className="font-semibold text-gray-900">System-Info</Typography>
        </Box>

        <Box className="space-y-4">
          <Box className="p-4 bg-blue-50 rounded-lg">
            <Typography variant="subtitle2" className="font-medium text-blue-900 mb-2">
              System-Status
              </Typography>
            <Box className="flex items-center space-x-2">
              <Box className="w-2 h-2 bg-green-500 rounded-full"></Box>
              <Typography variant="body2" className="text-blue-800">Alle Systeme online</Typography>
            </Box>
          </Box>

          <Box className="p-4 bg-yellow-50 rounded-lg">
            <Typography variant="subtitle2" className="font-medium text-yellow-900 mb-2">
              Wartungshinweis
            </Typography>
            <Typography variant="body2" className="text-yellow-800">
              Geplante Wartung am Samstag, 23. März, 02:00-04:00 Uhr
            </Typography>
          </Box>

          <Box className="p-4 bg-purple-50 rounded-lg">
            <Typography variant="subtitle2" className="font-medium text-purple-900 mb-2">
              Neue Features
              </Typography>
            <Typography variant="body2" className="text-purple-800">
              Dashboard-Erweiterungen und verbesserte Reporting-Funktionen verfügbar
              </Typography>
            </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// =====================================================
// MAIN DASHBOARD COMPONENT
// =====================================================

const Dashboard: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <Box className="min-h-screen bg-gray-100">
      <Header onMenuToggle={handleMenuToggle} isMobileMenuOpen={isMobileMenuOpen} />
      <QuickAccess />
      
      {/* Main Content */}
      <Box component="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <Box className="mb-8">
          <Typography variant="h4" className="font-bold text-gray-900 mb-2">
            Guten Morgen, Max! 👋
              </Typography>
          <Typography variant="body1" className="text-gray-600">
            Sie haben 12 offene Aufgaben und 5 neue Mitteilungen. Hier ist Ihr Arbeitsbereich für heute.
              </Typography>
            </Box>

        {/* KPI Dashboard */}
        <KPIDashboard />

        {/* Three Column Layout */}
        <Box className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Tasks Column */}
          <Box className="lg:col-span-4">
            <TasksWidget />
          </Box>

          {/* Modules Column */}
          <Box className="lg:col-span-4">
            <ModulesWidget />
          </Box>

          {/* Info Column */}
          <Box className="lg:col-span-4">
            <InfoWidget />
          </Box>
        </Box>

        {/* Additional Dashboard Sections */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Documents */}
          <Card>
            <CardContent>
              <Typography variant="h6" className="font-semibold text-gray-900 mb-4">
                Zuletzt bearbeitete Dokumente
              </Typography>
              <Box className="space-y-3">
                {[
                  { name: 'Monatsabschluss_Februar.xlsx', time: 'vor 2 Stunden', type: 'Excel' },
                  { name: 'Lieferantenbewertung_Q1.pdf', time: 'vor 1 Tag', type: 'PDF' },
                  { name: 'Personalplanung_2024.docx', time: 'vor 2 Tagen', type: 'Word' },
                ].map((doc, index) => (
                  <Box key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <Box className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Typography className="text-blue-600 text-xs font-semibold">{doc.type}</Typography>
                    </Box>
                    <Box className="flex-1">
                      <Typography variant="body2" className="font-medium text-gray-900">{doc.name}</Typography>
                      <Typography variant="caption" className="text-gray-500">{doc.time}</Typography>
                    </Box>
            </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Team Status */}
          <Card>
            <CardContent>
              <Typography variant="h6" className="font-semibold text-gray-900 mb-4">
                Team-Status
              </Typography>
              <Box className="space-y-3">
                {[
                  { name: 'Anna Weber', status: 'online', role: 'Buchhaltung', avatar: 'AW' },
                  { name: 'Thomas Schmidt', status: 'busy', role: 'Einkauf', avatar: 'TS' },
                  { name: 'Lisa Müller', status: 'away', role: 'Personal', avatar: 'LM' },
                  { name: 'Michael Koch', status: 'offline', role: 'Vertrieb', avatar: 'MK' },
                ].map((member, index) => (
                  <Box key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <Box className="relative">
                      <Avatar className="w-10 h-10 bg-gray-300">
                        <Typography className="text-gray-600 text-xs font-semibold">{member.avatar}</Typography>
                      </Avatar>
                      <Box className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        member.status === 'online' ? 'bg-green-500' :
                        member.status === 'busy' ? 'bg-red-500' :
                        member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></Box>
                    </Box>
                    <Box className="flex-1">
                      <Typography variant="body2" className="font-medium text-gray-900">{member.name}</Typography>
                      <Typography variant="caption" className="text-gray-500">{member.role}</Typography>
            </Box>
                  <Chip 
                      label={member.status === 'online' ? 'Online' : member.status === 'busy' ? 'Beschäftigt' : member.status === 'away' ? 'Abwesend' : 'Offline'} 
                      color={member.status === 'online' ? 'success' : member.status === 'busy' ? 'error' : member.status === 'away' ? 'warning' : 'default'} 
                    size="small" 
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard; 