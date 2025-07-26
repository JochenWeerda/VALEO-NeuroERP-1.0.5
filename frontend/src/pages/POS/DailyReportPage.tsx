import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Euro as EuroIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

interface DailyReport {
  datum: string;
  kasse_id: string;
  kassierer_id: string;
  anzahl_belege: number;
  gesamt_umsatz_netto: number;
  gesamt_umsatz_brutto: number;
  mwst_gesamt: number;
  zahlungsarten_aufschlüsselung: Record<string, number>;
  kassenbestand_anfang: number;
  kassenbestand_ende: number;
  differenz: number;
  tse_signaturen: string[];
  status: string;
}

interface Sale {
  beleg_nr: string;
  kunde_id: string;
  kunde_name: string;
  verkaufsdatum: string;
  gesamt_netto: number;
  gesamt_brutto: number;
  mwst_gesamt: number;
  zahlungsart: string;
  status: string;
  anzahl_artikel: number;
}

const DailyReportPage: React.FC = () => {
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createReportDialogOpen, setCreateReportDialogOpen] = useState(false);
  const [exportFibuDialogOpen, setExportFibuDialogOpen] = useState(false);
  const [kasseId, setKasseId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pos/sales');
      if (response.ok) {
        const data = await response.json();
        setSales(data.sales);
      } else {
        setError('Fehler beim Laden der Verkäufe');
      }
    } catch (err) {
      setError('Verbindungsfehler');
    } finally {
      setLoading(false);
    }
  };

  const createDailyReport = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pos/daily-report/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kasse_id: kasseId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDailyReport(data.daily_report);
        setCreateReportDialogOpen(false);
        setKasseId('');
      } else {
        setError('Fehler beim Erstellen des Tagesjournals');
      }
    } catch (err) {
      setError('Verbindungsfehler');
    } finally {
      setLoading(false);
    }
  };

  const exportToFibu = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pos/daily-report/export-fibu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          datum: selectedDate
        })
      });

      if (response.ok) {
        setExportFibuDialogOpen(false);
        alert('Tagesjournal erfolgreich in FIBU exportiert!');
      } else {
        setError('Fehler beim FIBU-Export');
      }
    } catch (err) {
      setError('Verbindungsfehler');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
      'bar': 'success',
      'ec_karte': 'primary',
      'kreditkarte': 'secondary',
      'paypal': 'warning',
      'klarna': 'error'
    };
    return colors[method] || 'default';
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'bar': 'Bar',
      'ec_karte': 'EC-Karte',
      'kreditkarte': 'Kreditkarte',
      'paypal': 'PayPal',
      'klarna': 'Klarna',
      'ueberweisung': 'Überweisung',
      'rechnung': 'Rechnung'
    };
    return labels[method] || method;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Tagesjournal - Kassensystem
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AssessmentIcon />}
            onClick={() => setCreateReportDialogOpen(true)}
          >
            Tagesjournal erstellen
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => setExportFibuDialogOpen(true)}
            disabled={!dailyReport}
          >
            FIBU Export
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Tagesjournal Übersicht */}
        {dailyReport && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tagesjournal vom {formatDate(dailyReport.datum)}
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                      <ReceiptIcon sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                      <Typography variant="h4" color="white">
                        {dailyReport.anzahl_belege}
                      </Typography>
                      <Typography variant="body2" color="white">
                        Belege
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                      <EuroIcon sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                      <Typography variant="h4" color="white">
                        {formatCurrency(dailyReport.gesamt_umsatz_brutto)}
                      </Typography>
                      <Typography variant="body2" color="white">
                        Umsatz (Brutto)
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                      <TrendingUpIcon sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                      <Typography variant="h4" color="white">
                        {formatCurrency(dailyReport.gesamt_umsatz_netto)}
                      </Typography>
                      <Typography variant="body2" color="white">
                        Umsatz (Netto)
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                      <PaymentIcon sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                      <Typography variant="h4" color="white">
                        {formatCurrency(dailyReport.mwst_gesamt)}
                      </Typography>
                      <Typography variant="body2" color="white">
                        Umsatzsteuer
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Zahlungsarten Aufschlüsselung */}
                <Typography variant="h6" gutterBottom>
                  Zahlungsarten
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(dailyReport.zahlungsarten_aufschlüsselung).map(([method, amount]) => (
                    <Grid item xs={6} md={3} key={method}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Chip 
                            label={getPaymentMethodLabel(method)}
                            color={getPaymentMethodColor(method)}
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="h6">
                            {formatCurrency(amount)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Kassenbestand */}
                <Typography variant="h6" gutterBottom>
                  Kassenbestand
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Kassenbestand Anfang
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(dailyReport.kassenbestand_anfang)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Kassenbestand Ende
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(dailyReport.kassenbestand_ende)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Differenz
                        </Typography>
                        <Typography 
                          variant="h6" 
                          color={dailyReport.differenz >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(dailyReport.differenz)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* TSE-Signaturen */}
                {dailyReport.tse_signaturen.length > 0 && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom>
                      TSE-Signaturen ({dailyReport.tse_signaturen.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {dailyReport.tse_signaturen.map((signature, index) => (
                        <Chip 
                          key={index}
                          label={`TSE-${index + 1}`}
                          variant="outlined"
                          icon={<CheckCircleIcon />}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Verkäufe Tabelle */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Verkäufe des Tages
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Beleg-Nr</TableCell>
                        <TableCell>Datum</TableCell>
                        <TableCell>Kunde</TableCell>
                        <TableCell>Artikel</TableCell>
                        <TableCell align="right">Netto</TableCell>
                        <TableCell align="right">MwSt.</TableCell>
                        <TableCell align="right">Brutto</TableCell>
                        <TableCell>Zahlungsart</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sales.map((sale) => (
                        <TableRow key={sale.beleg_nr}>
                          <TableCell>{sale.beleg_nr}</TableCell>
                          <TableCell>{formatDate(sale.verkaufsdatum)}</TableCell>
                          <TableCell>{sale.kunde_name}</TableCell>
                          <TableCell>{sale.anzahl_artikel}</TableCell>
                          <TableCell align="right">{formatCurrency(sale.gesamt_netto)}</TableCell>
                          <TableCell align="right">{formatCurrency(sale.mwst_gesamt)}</TableCell>
                          <TableCell align="right">{formatCurrency(sale.gesamt_brutto)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={getPaymentMethodLabel(sale.zahlungsart)}
                              color={getPaymentMethodColor(sale.zahlungsart)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={sale.status}
                              color={sale.status === 'abgeschlossen' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tagesjournal erstellen Dialog */}
      <Dialog open={createReportDialogOpen} onClose={() => setCreateReportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tagesjournal erstellen</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Kasse ID"
            value={kasseId}
            onChange={(e) => setKasseId(e.target.value)}
            sx={{ mt: 1 }}
            placeholder="z.B. KASSE001"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateReportDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={createDailyReport} variant="contained" disabled={!kasseId}>
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>

      {/* FIBU Export Dialog */}
      <Dialog open={exportFibuDialogOpen} onClose={() => setExportFibuDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>FIBU Export</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Datum"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            sx={{ mt: 1 }}
            InputLabelProps={{ shrink: true }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Das Tagesjournal wird in die Finanzbuchhaltung exportiert und die entsprechenden Buchungssätze erstellt.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportFibuDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={exportToFibu} variant="contained">
            Exportieren
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DailyReportPage; 