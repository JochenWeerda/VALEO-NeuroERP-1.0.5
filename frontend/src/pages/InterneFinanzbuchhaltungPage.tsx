import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Sync as SyncIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Receipt as ReceiptIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import InterneFinanzbuchhaltungDialog from '../components/finance/InterneFinanzbuchhaltungDialog';

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
      id={`fibu-tabpanel-${index}`}
      aria-labelledby={`fibu-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface TransferHistoryItem {
  id: string;
  timestamp: string;
  period: string;
  transactionTypes: string[];
  count: number;
  status: 'success' | 'error' | 'processing';
  message?: string;
}

interface JournalEntry {
  id: string;
  date: string;
  documentNumber: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
  createdBy: string;
  status: 'posted' | 'draft' | 'error';
}

const InterneFinanzbuchhaltungPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [transferHistory, setTransferHistory] = useState<TransferHistoryItem[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  
  // Beispieldaten
  useEffect(() => {
    // Beispiel-Übernahmehistorie
    setTransferHistory([
      {
        id: 'transfer-2024-123',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        period: 'Juni 2024',
        transactionTypes: ['Verkäufe', 'Einkäufe', 'Zahlungen'],
        count: 142,
        status: 'success'
      },
      {
        id: 'transfer-2024-122',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        period: 'Mai 2024',
        transactionTypes: ['Verkäufe'],
        count: 53,
        status: 'error',
        message: 'Fehlerhafte Belegnummern'
      },
      {
        id: 'transfer-2024-121',
        timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        period: 'April 2024',
        transactionTypes: ['Alle'],
        count: 215,
        status: 'success'
      }
    ]);
    
    // Beispiel-Buchungsjournal
    setJournalEntries([
      {
        id: 'je-2024-1001',
        date: '2024-06-15',
        documentNumber: 'RE-2024-1234',
        account: '8400 - Erlöse',
        description: 'Warenverkauf',
        debit: 0,
        credit: 1250.00,
        createdBy: 'System',
        status: 'posted'
      },
      {
        id: 'je-2024-1002',
        date: '2024-06-15',
        documentNumber: 'RE-2024-1234',
        account: '1600 - Forderungen',
        description: 'Warenverkauf',
        debit: 1250.00,
        credit: 0,
        createdBy: 'System',
        status: 'posted'
      },
      {
        id: 'je-2024-1003',
        date: '2024-06-16',
        documentNumber: 'ER-2024-567',
        account: '3400 - Warenaufwand',
        description: 'Wareneinkauf',
        debit: 750.00,
        credit: 0,
        createdBy: 'System',
        status: 'draft'
      },
      {
        id: 'je-2024-1004',
        date: '2024-06-16',
        documentNumber: 'ER-2024-567',
        account: '1800 - Verbindlichkeiten',
        description: 'Wareneinkauf',
        debit: 0,
        credit: 750.00,
        createdBy: 'System',
        status: 'draft'
      }
    ]);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'processing':
      case 'draft':
        return <ScheduleIcon color="warning" />;
      case 'posted':
        return <CheckCircleIcon color="success" />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Interne Finanzbuchhaltung
        </Typography>
        <Typography variant="body1" paragraph>
          Verwalten Sie Ihre interne Finanzbuchhaltung und führen Sie Datenübernahmen durch.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<SyncIcon />}
          onClick={handleOpenDialog}
          sx={{ mb: 2 }}
        >
          Daten in Finanzbuchhaltung übernehmen
        </Button>
      </Paper>
      
      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="fibu tabs">
            <Tab label="Übernahmehistorie" icon={<HistoryIcon />} iconPosition="start" />
            <Tab label="Buchungsjournal" icon={<DescriptionIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardHeader 
              title="Übernahmehistorie" 
              avatar={<HistoryIcon />}
            />
            <Divider />
            <CardContent>
              {transferHistory.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  Keine Übernahmehistorie verfügbar
                </Typography>
              ) : (
                <List>
                  {transferHistory.map((item, index) => (
                    <ListItem key={index} alignItems="flex-start" divider={index < transferHistory.length - 1}>
                      <ListItemIcon>
                        {getStatusIcon(item.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1">
                            Übernahme für Periode {item.period}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="textSecondary">
                              Datum: {new Date(item.timestamp).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Vorgangsarten: {item.transactionTypes.join(', ')}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Anzahl Buchungen: {item.count}
                            </Typography>
                            {item.status === 'error' && item.message && (
                              <Typography variant="body2" color="error">
                                Fehler: {item.message}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardHeader 
              title="Buchungsjournal" 
              avatar={<ReceiptIcon />}
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Datum</TableCell>
                      <TableCell>Beleg-Nr.</TableCell>
                      <TableCell>Konto</TableCell>
                      <TableCell>Beschreibung</TableCell>
                      <TableCell align="right">Soll</TableCell>
                      <TableCell align="right">Haben</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {journalEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell>{entry.documentNumber}</TableCell>
                        <TableCell>{entry.account}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell align="right">
                          {entry.debit > 0 ? entry.debit.toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €' : ''}
                        </TableCell>
                        <TableCell align="right">
                          {entry.credit > 0 ? entry.credit.toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €' : ''}
                        </TableCell>
                        <TableCell align="center">
                          {getStatusIcon(entry.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Offene Buchungen" 
              avatar={<InfoIcon />}
            />
            <Divider />
            <CardContent>
              <Alert severity="info" sx={{ mb: 2 }}>
                Es gibt 2 offene Buchungsentwürfe, die noch nicht gebucht wurden.
              </Alert>
              
              <Button
                variant="outlined"
                startIcon={<CheckCircleIcon />}
              >
                Alle offenen Buchungen freigeben
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Systeminformationen" 
              avatar={<AccountBalanceIcon />}
            />
            <Divider />
            <CardContent>
              <Typography variant="body2" paragraph>
                <strong>Aktueller Monat:</strong> Juni 2024
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Offene Buchungsperioden:</strong> Mai 2024, Juni 2024
              </Typography>
              <Typography variant="body2">
                <strong>Letzte Übernahme:</strong> 15.06.2024
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <InterneFinanzbuchhaltungDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
      />
    </Container>
  );
};

export default InterneFinanzbuchhaltungPage; 