import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  Paper,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  LocalShipping as DeliveryIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon,
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Movie as VideoIcon,
  AudioFile as AudioIcon,
  Archive as ArchiveIcon,
  Folder as FolderIcon
} from '@mui/icons-material';

// Mock-Komponenten für fehlende Imports
interface ZvooveOrderFormProps {
  onSave?: (orderData: OrderData) => Promise<void>;
  onCancel?: () => void;
}

const ZvooveOrderForm: React.FC<ZvooveOrderFormProps> = ({ onSave, onCancel }) => (
  <div>ZvooveOrderForm Mock</div>
);

interface ZvooveContactOverviewProps {
  onFilterChange?: (newFilters: ContactFilters) => void;
}

const ZvooveContactOverview: React.FC<ZvooveContactOverviewProps> = ({ onFilterChange }) => (
  <div>ZvooveContactOverview Mock</div>
);

const useErpSelectors = () => ({ getOrders: () => [], getContacts: () => [] });

// Fehlende Typen definieren
interface ContactFilters {
  search?: string;
  type?: string;
  status?: string;
}

interface OrderData {
  id: string;
  title: string;
  status: string;
  amount: number;
}

// TabPanel-Komponente
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
      id={`integration-tabpanel-${index}`}
      aria-labelledby={`integration-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Temporär auskommentiert - wird später implementiert
export const IntegrationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Mock-Daten
  const orderStats = {
    byType: {
      offer: 5,
      order: 12
    }
  };

  const contactStats = {
    byType: {
      sales: 8,
      purchase: 3
    }
  };

  const fetchOrders = () => {
    // Mock-Implementation
  };

  const fetchContacts = () => {
    // Mock-Implementation
  };

  const handleOrderSave = async (orderData: OrderData) => {
    // Mock-Implementation
  };

  const handleContactFilterChange = (newFilters: ContactFilters) => {
    // Mock-Implementation
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Integration Dashboard
      </Typography>
      
      <Paper className="shadow-lg">
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab
            icon={<AssignmentIcon />}
            label="Aufträge"
          />
          <Tab
            icon={<PeopleIcon />}
            label="Kontakte"
          />
          <Tab
            icon={<DeliveryIcon />}
            label="Lieferungen"
          />
          <Tab
            icon={<AssessmentIcon />}
            label="Berichte"
          />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <ZvooveOrderForm
            onSave={handleOrderSave}
            onCancel={() => {}}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ZvooveContactOverview
            onFilterChange={handleContactFilterChange}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Lieferungen</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
            >
              Neue Lieferung
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Berichte</Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Aufträge</Typography>
                    <Typography variant="h4">{orderStats.byType.order}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      Details anzeigen
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Angebote</Typography>
                    <Typography variant="h4">{orderStats.byType.offer}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      Details anzeigen
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}; 