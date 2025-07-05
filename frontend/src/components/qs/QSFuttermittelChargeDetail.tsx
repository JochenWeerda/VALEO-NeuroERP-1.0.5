import React, { useState } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Grid,
  Chip,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import GetAppIcon from '@mui/icons-material/GetApp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import {
  QSFuttermittelCharge,
  QSStatus,
  Rohstoff,
  Monitoring,
  Ereignis,
  MonitoringStatus,
  EreignisTyp,
  EreignisPrioritaet,
  generatePDFProtokoll
} from '../../services/qsApi';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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

interface QSFuttermittelChargeDetailProps {
  charge: QSFuttermittelCharge;
  onAddRohstoff?: () => void;
  onAddMonitoring?: () => void;
  onAddEreignis?: () => void;
  onBack: () => void;
}

const getStatusColor = (status: QSStatus) => {
  switch (status) {
    case QSStatus.NEU:
      return 'default';
    case QSStatus.IN_PRUEFUNG:
      return 'info';
    case QSStatus.FREIGEGEBEN:
      return 'success';
    case QSStatus.GESPERRT:
      return 'error';
    case QSStatus.VERWENDUNG:
      return 'warning';
    case QSStatus.ARCHIVIERT:
      return 'secondary';
    default:
      return 'default';
  }
};

const getMonitoringStatusColor = (status: MonitoringStatus) => {
  switch (status) {
    case MonitoringStatus.GEPLANT:
      return 'default';
    case MonitoringStatus.ENTNOMMEN:
      return 'info';
    case MonitoringStatus.LABOR_EINGANG:
      return 'primary';
    case MonitoringStatus.IN_ANALYSE:
      return 'warning';
    case MonitoringStatus.ABGESCHLOSSEN:
      return 'success';
    case MonitoringStatus.ABGEBROCHEN:
      return 'error';
    default:
      return 'default';
  }
};

const getEreignisPrioritaetColor = (prioritaet: EreignisPrioritaet) => {
  switch (prioritaet) {
    case EreignisPrioritaet.NIEDRIG:
      return 'info';
    case EreignisPrioritaet.MITTEL:
      return 'warning';
    case EreignisPrioritaet.HOCH:
      return 'error';
    case EreignisPrioritaet.KRITISCH:
      return 'error';
    default:
      return 'default';
  }
};

const QSFuttermittelChargeDetail: React.FC<QSFuttermittelChargeDetailProps> = ({
  charge,
  onAddRohstoff,
  onAddMonitoring,
  onAddEreignis,
  onBack
}) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await generatePDFProtokoll(charge.id!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QS-Protokoll-${charge.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Fehler beim Herunterladen des PDF-Protokolls:', error);
      // In einer echten Anwendung würde hier eine Fehlermeldung angezeigt werden
    }
  };

  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          QS-Futtermittelcharge {charge.produktbezeichnung}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={onBack}
            sx={{ mr: 1 }}
          >
            Zurück
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownloadPDF}
          >
            PDF Protokoll
          </Button>
        </Box>
      </Box>

      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Grundinformationen</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">ID:</Typography>
                <Typography variant="body1">{charge.id}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Charge-ID:</Typography>
                <Typography variant="body1">{charge.charge_id}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Produktbezeichnung:</Typography>
                <Typography variant="body1">{charge.produktbezeichnung}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Status:</Typography>
                <Chip 
                  label={charge.qs_status.charAt(0).toUpperCase() + charge.qs_status.slice(1).replace('_', ' ')} 
                  color={getStatusColor(charge.qs_status) as any}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Herstellungsdatum:</Typography>
                <Typography variant="body1">
                  {charge.herstellungsdatum ? format(parseISO(charge.herstellungsdatum), 'dd.MM.yyyy') : ''}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Mindesthaltbarkeitsdatum:</Typography>
                <Typography variant="body1">
                  {charge.mindesthaltbarkeitsdatum ? format(parseISO(charge.mindesthaltbarkeitsdatum), 'dd.MM.yyyy') : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Verarbeitungsinformationen</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Mischzeit:</Typography>
                <Typography variant="body1">{charge.mischzeit || 'N/A'} min</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Mahlzeit:</Typography>
                <Typography variant="body1">{charge.mahlzeit || 'N/A'} min</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Mischtemperatur:</Typography>
                <Typography variant="body1">{charge.mischtemperatur || 'N/A'} °C</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Feuchtigkeit:</Typography>
                <Typography variant="body1">{charge.feuchtigkeit || 'N/A'} %</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Spülcharge:</Typography>
                <Typography variant="body1">{charge.ist_spuelcharge ? 'Ja' : 'Nein'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Nach kritischem Material:</Typography>
                <Typography variant="body1">{charge.nach_kritischem_material ? 'Ja' : 'Nein'}</Typography>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1">QS-Informationen</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="textSecondary">QS-Freigabe:</Typography>
                <Typography variant="body1">
                  {charge.qs_freigabe_datum ? format(parseISO(charge.qs_freigabe_datum), 'dd.MM.yyyy') : 'Nicht freigegeben'}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="textSecondary">Kennzeichnung vollständig:</Typography>
                <Typography variant="body1">{charge.qs_kennzeichnung_vollstaendig ? 'Ja' : 'Nein'}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="textSecondary">Dokumentation vollständig:</Typography>
                <Typography variant="body1">{charge.qs_dokumentation_vollstaendig ? 'Ja' : 'Nein'}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="textSecondary">Monitoringpflicht:</Typography>
                <Typography variant="body1">{charge.monitoringpflicht ? 'Ja' : 'Nein'}</Typography>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1">HACCP-CCP</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">Temperatur:</Typography>
                <Typography variant="body1">{charge.haccp_ccp_temperatur ? 'Ja' : 'Nein'}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">Magnetabscheider:</Typography>
                <Typography variant="body1">{charge.haccp_ccp_magnetabscheider ? 'Ja' : 'Nein'}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">Siebung:</Typography>
                <Typography variant="body1">{charge.haccp_ccp_siebung ? 'Ja' : 'Nein'}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      
      <Divider />
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="QS-Futtermittelcharge Tabs">
            <Tab label="Rohstoffe" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Monitoring" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Ereignisse" id="tab-2" aria-controls="tabpanel-2" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            {onAddRohstoff && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={onAddRohstoff}
              >
                Rohstoff hinzufügen
              </Button>
            )}
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Rohstoff-Charge</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Menge</TableCell>
                  <TableCell>Lieferant</TableCell>
                  <TableCell>Kontaminationsrisiko</TableCell>
                  <TableCell>QS-zertifiziert</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {charge.rohstoffe.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Keine Rohstoffe für diese Charge</TableCell>
                  </TableRow>
                ) : (
                  charge.rohstoffe.map((rohstoff) => (
                    <TableRow key={rohstoff.id}>
                      <TableCell>{rohstoff.id}</TableCell>
                      <TableCell>{rohstoff.rohstoff_charge_id}</TableCell>
                      <TableCell>{rohstoff.rohstoff_typ}</TableCell>
                      <TableCell>{rohstoff.menge}</TableCell>
                      <TableCell>{rohstoff.lieferant_id || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={rohstoff.kontaminationsrisiko} 
                          color={
                            rohstoff.kontaminationsrisiko === 'niedrig' ? 'success' :
                            rohstoff.kontaminationsrisiko === 'mittel' ? 'warning' : 'error'
                          } 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{rohstoff.qs_zertifiziert ? 'Ja' : 'Nein'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            {onAddMonitoring && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={onAddMonitoring}
              >
                Monitoring hinzufügen
              </Button>
            )}
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Proben-ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Probentyp</TableCell>
                  <TableCell>Entnahmedatum</TableCell>
                  <TableCell>Ergebnisdatum</TableCell>
                  <TableCell>Grenzwert eingehalten</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {charge.monitoring.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">Kein Monitoring für diese Charge</TableCell>
                  </TableRow>
                ) : (
                  charge.monitoring.map((monitoring) => (
                    <TableRow key={monitoring.id}>
                      <TableCell>{monitoring.id}</TableCell>
                      <TableCell>{monitoring.proben_id}</TableCell>
                      <TableCell>
                        <Chip 
                          label={monitoring.status} 
                          color={getMonitoringStatusColor(monitoring.status) as any} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{monitoring.probentyp}</TableCell>
                      <TableCell>
                        {monitoring.entnahme_datum ? format(parseISO(monitoring.entnahme_datum), 'dd.MM.yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {monitoring.ergebnis_datum ? format(parseISO(monitoring.ergebnis_datum), 'dd.MM.yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {monitoring.grenzwert_eingehalten === null ? 'N/A' : 
                         monitoring.grenzwert_eingehalten ? 'Ja' : 'Nein'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Details anzeigen">
                          <IconButton size="small">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Protokoll herunterladen">
                          <IconButton size="small">
                            <GetAppIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            {onAddEreignis && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={onAddEreignis}
              >
                Ereignis hinzufügen
              </Button>
            )}
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Titel</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Priorität</TableCell>
                  <TableCell>Datum</TableCell>
                  <TableCell>Fällig bis</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {charge.ereignisse.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">Keine Ereignisse für diese Charge</TableCell>
                  </TableRow>
                ) : (
                  charge.ereignisse.map((ereignis) => (
                    <TableRow key={ereignis.id}>
                      <TableCell>{ereignis.id}</TableCell>
                      <TableCell>{ereignis.titel}</TableCell>
                      <TableCell>{ereignis.ereignis_typ}</TableCell>
                      <TableCell>
                        <Chip 
                          label={ereignis.prioritaet} 
                          color={getEreignisPrioritaetColor(ereignis.prioritaet) as any} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {ereignis.ereignis_datum ? format(parseISO(ereignis.ereignis_datum), 'dd.MM.yyyy') : ''}
                      </TableCell>
                      <TableCell>
                        {ereignis.faellig_bis ? format(parseISO(ereignis.faellig_bis), 'dd.MM.yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={ereignis.ist_abgeschlossen ? 'Abgeschlossen' : 'Offen'} 
                          color={ereignis.ist_abgeschlossen ? 'success' : 'warning'} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Details anzeigen">
                          <IconButton size="small">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Protokoll herunterladen">
                          <IconButton size="small">
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Box>
    </Paper>
  );
};

export default QSFuttermittelChargeDetail; 