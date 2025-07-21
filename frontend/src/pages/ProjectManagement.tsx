import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Rating,
  Badge,
  IconButton,
  Box
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Timer as TimerIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

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
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock-Daten für das Projektmanagement
const mockProjectStats = {
  totalProjects: 12,
  activeProjects: 8,
  completedProjects: 3,
  overdueProjects: 1,
  totalHoursPlanned: 2400,
  totalHoursActual: 1850,
  totalBudgetPlanned: 850000,
  totalBudgetActual: 620000
};

const mockProjects = [
  {
    id: '1',
    projectNumber: 'PRJ000001',
    projectName: 'ERP-System Modernisierung',
    category: 'Software-Entwicklung',
    status: 'aktiv',
    priority: 'hoch',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    projectManager: 'Max Mustermann',
    customer: 'VALEO GmbH',
    budgetPlanned: 500000,
    budgetActual: 320000,
    hoursPlanned: 2000,
    hoursActual: 1250,
    progressPercent: 62.5,
    deadlineStatus: 'pünktlich'
  },
  {
    id: '2',
    projectNumber: 'PRJ000002',
    projectName: 'Kundenportal Entwicklung',
    category: 'Software-Entwicklung',
    status: 'planung',
    priority: 'normal',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    projectManager: 'Anna Schmidt',
    customer: 'TechCorp AG',
    budgetPlanned: 150000,
    budgetActual: 0,
    hoursPlanned: 800,
    hoursActual: 0,
    progressPercent: 0,
    deadlineStatus: 'pünktlich'
  },
  {
    id: '3',
    projectNumber: 'PRJ000003',
    projectName: 'Prozessoptimierung Beratung',
    category: 'Beratung',
    status: 'abgeschlossen',
    priority: 'normal',
    startDate: '2023-10-01',
    endDate: '2024-01-31',
    projectManager: 'Peter Weber',
    customer: 'Industrie GmbH',
    budgetPlanned: 75000,
    budgetActual: 72000,
    hoursPlanned: 400,
    hoursActual: 380,
    progressPercent: 100,
    deadlineStatus: 'pünktlich'
  }
];

const mockTasks = [
  {
    id: '1',
    taskName: 'Anforderungsanalyse',
    projectNumber: 'PRJ000001',
    projectName: 'ERP-System Modernisierung',
    phase: 'Analyse',
    taskType: 'Analyse',
    status: 'abgeschlossen',
    priority: 'hoch',
    assignedTo: 'Max Mustermann',
    startDate: '2024-01-15',
    endDate: '2024-01-31',
    estimatedHours: 40,
    actualHours: 38,
    progressPercent: 100,
    deadlineStatus: 'pünktlich'
  },
  {
    id: '2',
    taskName: 'Datenbank-Design',
    projectNumber: 'PRJ000001',
    projectName: 'ERP-System Modernisierung',
    phase: 'Entwicklung',
    taskType: 'Entwicklung',
    status: 'in_arbeit',
    priority: 'hoch',
    assignedTo: 'Anna Schmidt',
    startDate: '2024-02-01',
    endDate: '2024-03-15',
    estimatedHours: 80,
    actualHours: 45,
    progressPercent: 56.25,
    deadlineStatus: 'pünktlich'
  },
  {
    id: '3',
    taskName: 'Frontend-Entwicklung',
    projectNumber: 'PRJ000001',
    projectName: 'ERP-System Modernisierung',
    phase: 'Entwicklung',
    taskType: 'Entwicklung',
    status: 'offen',
    priority: 'normal',
    assignedTo: 'Peter Weber',
    startDate: '2024-03-16',
    endDate: '2024-06-30',
    estimatedHours: 120,
    actualHours: 0,
    progressPercent: 0,
    deadlineStatus: 'pünktlich'
  }
];

const mockTimeTracking = [
  {
    id: '1',
    employee: 'Max Mustermann',
    projectNumber: 'PRJ000001',
    projectName: 'ERP-System Modernisierung',
    taskName: 'Datenbank-Design',
    date: '2024-02-15',
    startTime: '09:00',
    endTime: '17:00',
    workHours: 8,
    overtimeHours: 0,
    description: 'Datenbankschema-Entwicklung',
    status: 'genehmigt'
  },
  {
    id: '2',
    employee: 'Anna Schmidt',
    projectNumber: 'PRJ000001',
    projectName: 'ERP-System Modernisierung',
    taskName: 'Datenbank-Design',
    date: '2024-02-14',
    startTime: '09:00',
    endTime: '18:00',
    workHours: 9,
    overtimeHours: 1,
    description: 'Tabellen-Design und Beziehungen',
    status: 'offen'
  }
];

const mockResources = [
  {
    id: '1',
    resourceName: 'Entwickler-Team',
    resourceType: 'Personal',
    projectName: 'ERP-System Modernisierung',
    availabilityPercent: 100,
    costPerUnit: 85,
    assignedHours: 1250,
    totalHours: 2000
  },
  {
    id: '2',
    resourceName: 'Server-Infrastruktur',
    resourceType: 'Hardware',
    projectName: 'ERP-System Modernisierung',
    availabilityPercent: 95,
    costPerUnit: 120,
    assignedHours: 800,
    totalHours: 2000
  }
];

const mockMilestones = [
  {
    id: '1',
    milestoneName: 'Anforderungsanalyse abgeschlossen',
    projectName: 'ERP-System Modernisierung',
    phase: 'Analyse',
    date: '2024-01-31',
    status: 'erreicht'
  },
  {
    id: '2',
    milestoneName: 'Datenbank-Design abgeschlossen',
    projectName: 'ERP-System Modernisierung',
    phase: 'Entwicklung',
    date: '2024-03-15',
    status: 'offen'
  },
  {
    id: '3',
    milestoneName: 'Frontend-Prototyp fertig',
    projectName: 'ERP-System Modernisierung',
    phase: 'Entwicklung',
    date: '2024-05-15',
    status: 'offen'
  }
];

const mockDocuments = [
  {
    id: '1',
    fileName: 'Anforderungsdokument.pdf',
    originalFileName: 'Anforderungsdokument.pdf',
    fileType: 'PDF',
    sizeBytes: 2048576,
    uploadedBy: 'Max Mustermann',
    description: 'Detaillierte Anforderungsanalyse',
    uploadDate: '2024-01-20'
  },
  {
    id: '2',
    fileName: 'Datenbankschema.sql',
    originalFileName: 'Datenbankschema.sql',
    fileType: 'SQL',
    sizeBytes: 51200,
    uploadedBy: 'Anna Schmidt',
    description: 'SQL-Schema für das neue ERP-System',
    uploadDate: '2024-02-10'
  }
];

// Helper-Funktionen
const getStatusColor = (status: string) => {
  switch (status) {
    case 'aktiv': return 'primary';
    case 'abgeschlossen': return 'success';
    case 'planung': return 'info';
    case 'pausiert': return 'warning';
    case 'abgebrochen': return 'error';
    default: return 'default';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'kritisch': return 'error';
    case 'hoch': return 'warning';
    case 'normal': return 'primary';
    case 'niedrig': return 'default';
    default: return 'default';
  }
};

const getDeadlineStatusColor = (status: string) => {
  switch (status) {
    case 'überfällig': return 'error';
    case 'heute fällig': return 'warning';
    case 'pünktlich': return 'success';
    default: return 'default';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const formatHours = (hours: number) => {
  return `${hours.toFixed(1)}h`;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const ProjectManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'project' | 'task' | 'time' | 'resource'>('project');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type: 'project' | 'task' | 'time' | 'resource') => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Typography variant="h4" className="text-gray-800 mb-2">
          Projektmanagement
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Verwaltung von Projekten, Aufgaben, Ressourcen und Zeiterfassung
        </Typography>
      </div>

      {/* KPI Dashboard */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" className="font-bold">
                    {mockProjectStats.totalProjects}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Gesamtprojekte
                  </Typography>
                </div>
                <FolderIcon className="text-4xl opacity-80" />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" className="font-bold">
                    {mockProjectStats.activeProjects}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Aktive Projekte
                  </Typography>
                </div>
                <TrendingUpIcon className="text-4xl opacity-80" />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" className="font-bold">
                    {formatHours(mockProjectStats.totalHoursActual)}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Geleistete Stunden
                  </Typography>
                </div>
                <TimerIcon className="text-4xl opacity-80" />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" className="font-bold">
                    {formatCurrency(mockProjectStats.totalBudgetActual)}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Verbrauchtes Budget
                  </Typography>
                </div>
                <MoneyIcon className="text-4xl opacity-80" />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tab Navigation */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="project management tabs">
            <Tab label="Projekte" icon={<FolderIcon />} iconPosition="start" />
            <Tab label="Aufgaben" icon={<AssignmentIcon />} iconPosition="start" />
            <Tab label="Zeiterfassung" icon={<TimerIcon />} iconPosition="start" />
            <Tab label="Ressourcen" icon={<PeopleIcon />} iconPosition="start" />
            <Tab label="Meilensteine" icon={<CheckCircleIcon />} iconPosition="start" />
            <Tab label="Dokumente" icon={<DescriptionIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Projekte Tab */}
        <TabPanel value={tabValue} index={0}>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">Projektübersicht</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('project')}
            >
              Neues Projekt
            </Button>
          </div>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Projektnummer</TableCell>
                  <TableCell>Projektname</TableCell>
                  <TableCell>Kategorie</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Projektleiter</TableCell>
                  <TableCell>Kunde</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Stunden</TableCell>
                  <TableCell>Fortschritt</TableCell>
                  <TableCell>Termin</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.projectNumber}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" className="font-semibold">
                        {project.projectName}
                      </Typography>
                    </TableCell>
                    <TableCell>{project.category}</TableCell>
                    <TableCell>
                      <Chip
                        label={project.status}
                        color={getStatusColor(project.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{project.projectManager}</TableCell>
                    <TableCell>{project.customer}</TableCell>
                    <TableCell>
                      <div>
                        <Typography variant="body2">
                          {formatCurrency(project.budgetActual)} / {formatCurrency(project.budgetPlanned)}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(project.budgetActual / project.budgetPlanned) * 100}
                          className="mt-1"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Typography variant="body2">
                          {formatHours(project.hoursActual)} / {formatHours(project.hoursPlanned)}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(project.hoursActual / project.hoursPlanned) * 100}
                          className="mt-1"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Typography variant="body2" className="mr-2">
                          {project.progressPercent}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={project.progressPercent}
                          className="w-16"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={project.deadlineStatus}
                        color={getDeadlineStatusColor(project.deadlineStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <IconButton size="small" color="primary">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Aufgaben Tab */}
        <TabPanel value={tabValue} index={1}>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">Aufgabenübersicht</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('task')}
            >
              Neue Aufgabe
            </Button>
          </div>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Aufgabe</TableCell>
                  <TableCell>Projekt</TableCell>
                  <TableCell>Phase</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Zugewiesen an</TableCell>
                  <TableCell>Priorität</TableCell>
                  <TableCell>Stunden</TableCell>
                  <TableCell>Fortschritt</TableCell>
                  <TableCell>Termin</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Typography variant="subtitle2" className="font-semibold">
                        {task.taskName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Typography variant="body2" className="font-semibold">
                          {task.projectNumber}
                        </Typography>
                        <Typography variant="caption" className="text-gray-600">
                          {task.projectName}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>{task.phase}</TableCell>
                    <TableCell>
                      <Chip
                        label={task.status}
                        color={getStatusColor(task.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{task.assignedTo}</TableCell>
                    <TableCell>
                      <Chip
                        label={task.priority}
                        color={getPriorityColor(task.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <Typography variant="body2">
                          {formatHours(task.actualHours)} / {formatHours(task.estimatedHours)}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(task.actualHours / task.estimatedHours) * 100}
                          className="mt-1"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Typography variant="body2" className="mr-2">
                          {task.progressPercent}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={task.progressPercent}
                          className="w-16"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.deadlineStatus}
                        color={getDeadlineStatusColor(task.deadlineStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <IconButton size="small" color="primary">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Zeiterfassung Tab */}
        <TabPanel value={tabValue} index={2}>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">Zeiterfassung</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('time')}
            >
              Neue Zeiterfassung
            </Button>
          </div>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mitarbeiter</TableCell>
                  <TableCell>Projekt</TableCell>
                  <TableCell>Aufgabe</TableCell>
                  <TableCell>Datum</TableCell>
                  <TableCell>Zeit</TableCell>
                  <TableCell>Stunden</TableCell>
                  <TableCell>Überstunden</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockTimeTracking.map((time) => (
                  <TableRow key={time.id}>
                    <TableCell>{time.employee}</TableCell>
                    <TableCell>
                      <div>
                        <Typography variant="body2" className="font-semibold">
                          {time.projectNumber}
                        </Typography>
                        <Typography variant="caption" className="text-gray-600">
                          {time.projectName}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>{time.taskName}</TableCell>
                    <TableCell>{time.date}</TableCell>
                    <TableCell>
                      {time.startTime} - {time.endTime}
                    </TableCell>
                    <TableCell>{formatHours(time.workHours)}</TableCell>
                    <TableCell>{formatHours(time.overtimeHours)}</TableCell>
                    <TableCell>
                      <Chip
                        label={time.status}
                        color={time.status === 'genehmigt' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <IconButton size="small" color="primary">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Ressourcen Tab */}
        <TabPanel value={tabValue} index={3}>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">Ressourcenverwaltung</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('resource')}
            >
              Neue Ressource
            </Button>
          </div>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ressource</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Projekt</TableCell>
                  <TableCell>Verfügbarkeit</TableCell>
                  <TableCell>Kosten/Einheit</TableCell>
                  <TableCell>Zugewiesene Stunden</TableCell>
                  <TableCell>Auslastung</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <Typography variant="subtitle2" className="font-semibold">
                        {resource.resourceName}
                      </Typography>
                    </TableCell>
                    <TableCell>{resource.resourceType}</TableCell>
                    <TableCell>{resource.projectName}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Typography variant="body2" className="mr-2">
                          {resource.availabilityPercent}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={resource.availabilityPercent}
                          className="w-16"
                        />
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(resource.costPerUnit)}</TableCell>
                    <TableCell>
                      {formatHours(resource.assignedHours)} / {formatHours(resource.totalHours)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Typography variant="body2" className="mr-2">
                          {((resource.assignedHours / resource.totalHours) * 100).toFixed(1)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(resource.assignedHours / resource.totalHours) * 100}
                          className="w-16"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <IconButton size="small" color="primary">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Meilensteine Tab */}
        <TabPanel value={tabValue} index={4}>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">Meilensteine</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
            >
              Neuer Meilenstein
            </Button>
          </div>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Meilenstein</TableCell>
                  <TableCell>Projekt</TableCell>
                  <TableCell>Phase</TableCell>
                  <TableCell>Termin</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockMilestones.map((milestone) => (
                  <TableRow key={milestone.id}>
                    <TableCell>
                      <Typography variant="subtitle2" className="font-semibold">
                        {milestone.milestoneName}
                      </Typography>
                    </TableCell>
                    <TableCell>{milestone.projectName}</TableCell>
                    <TableCell>{milestone.phase}</TableCell>
                    <TableCell>{milestone.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={milestone.status}
                        color={milestone.status === 'erreicht' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <IconButton size="small" color="primary">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Dokumente Tab */}
        <TabPanel value={tabValue} index={5}>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">Projektdokumente</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
            >
              Dokument hochladen
            </Button>
          </div>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Dateiname</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Größe</TableCell>
                  <TableCell>Hochgeladen von</TableCell>
                  <TableCell>Datum</TableCell>
                  <TableCell>Beschreibung</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <Typography variant="subtitle2" className="font-semibold">
                        {document.originalFileName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={document.fileType} size="small" />
                    </TableCell>
                    <TableCell>{formatFileSize(document.sizeBytes)}</TableCell>
                    <TableCell>{document.uploadedBy}</TableCell>
                    <TableCell>{document.uploadDate}</TableCell>
                    <TableCell>{document.description}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <IconButton size="small" color="primary">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>

      {/* Dialog für neue Einträge */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'project' && 'Neues Projekt erstellen'}
          {dialogType === 'task' && 'Neue Aufgabe erstellen'}
          {dialogType === 'time' && 'Neue Zeiterfassung'}
          {dialogType === 'resource' && 'Neue Ressource'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} className="mt-2">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select label="Status">
                  <MenuItem value="planung">Planung</MenuItem>
                  <MenuItem value="aktiv">Aktiv</MenuItem>
                  <MenuItem value="pausiert">Pausiert</MenuItem>
                  <MenuItem value="abgeschlossen">Abgeschlossen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Beschreibung"
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectManagement; 