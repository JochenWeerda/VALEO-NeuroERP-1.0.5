import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Box,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  LocalOffer as VoucherIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface Voucher {
  id: string;
  name: string;
  code: string;
  type: 'prozent' | 'betrag' | 'versandkosten';
  nominal: number;
  kuota: number;
  used_count: number;
  start_date: string;
  expired: string;
  minimal_buying: number;
  is_active: boolean;
  created_at: string;
}

interface VoucherUsage {
  id: string;
  voucher_id: string;
  transaction_id: string;
  customer_id?: string;
  used_amount: number;
  used_at: string;
}

interface VoucherManagementProps {
  className?: string;
}

export const VoucherManagement: React.FC<VoucherManagementProps> = ({
  className = ''
}) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [voucherUsage, setVoucherUsage] = useState<VoucherUsage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [usageDialogOpen, setUsageDialogOpen] = useState(false);
  
  // Form States
  const [voucherForm, setVoucherForm] = useState({
    name: '',
    code: '',
    type: 'betrag' as 'prozent' | 'betrag' | 'versandkosten',
    nominal: 0,
    kuota: 1,
    start_date: new Date().toISOString().split('T')[0],
    expired: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minimal_buying: 0,
    is_active: true
  });

  // Vouchers laden
  const loadVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vouchers');
      if (response.ok) {
        const data = await response.json();
        setVouchers(data.vouchers || []);
      } else {
        throw new Error('Fehler beim Laden der Gutscheine');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }, []);

  // Voucher erstellen
  const createVoucher = useCallback(async () => {
    try {
      const response = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuccess('Gutschein erfolgreich erstellt');
        setCreateDialogOpen(false);
        resetVoucherForm();
        loadVouchers();
      } else {
        throw new Error('Fehler beim Erstellen des Gutscheins');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }, [voucherForm, loadVouchers]);

  // Voucher bearbeiten
  const updateVoucher = useCallback(async () => {
    if (!selectedVoucher) return;
    
    try {
      const response = await fetch(`/api/vouchers/${selectedVoucher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherForm)
      });
      
      if (response.ok) {
        setSuccess('Gutschein erfolgreich aktualisiert');
        setEditDialogOpen(false);
        setSelectedVoucher(null);
        resetVoucherForm();
        loadVouchers();
      } else {
        throw new Error('Fehler beim Aktualisieren des Gutscheins');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }, [selectedVoucher, voucherForm, loadVouchers]);

  // Voucher löschen
  const deleteVoucher = useCallback(async (voucherId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Gutschein löschen möchten?')) return;
    
    try {
      const response = await fetch(`/api/vouchers/${voucherId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSuccess('Gutschein erfolgreich gelöscht');
        loadVouchers();
      } else {
        throw new Error('Fehler beim Löschen des Gutscheins');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }, [loadVouchers]);

  // Voucher-Nutzung laden
  const loadVoucherUsage = useCallback(async (voucherId: string) => {
    try {
      const response = await fetch(`/api/vouchers/${voucherId}/usage`);
      if (response.ok) {
        const data = await response.json();
        setVoucherUsage(data.usage || []);
      } else {
        throw new Error('Fehler beim Laden der Gutschein-Nutzung');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }, []);

  // Voucher bearbeiten öffnen
  const openEditDialog = useCallback((voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setVoucherForm({
      name: voucher.name,
      code: voucher.code,
      type: voucher.type,
      nominal: voucher.nominal,
      kuota: voucher.kuota,
      start_date: voucher.start_date,
      expired: voucher.expired,
      minimal_buying: voucher.minimal_buying,
      is_active: voucher.is_active
    });
    setEditDialogOpen(true);
  }, []);

  // Voucher-Nutzung anzeigen
  const showVoucherUsage = useCallback((voucher: Voucher) => {
    setSelectedVoucher(voucher);
    loadVoucherUsage(voucher.id);
    setUsageDialogOpen(true);
  }, [loadVoucherUsage]);

  // Code kopieren
  const copyVoucherCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setSuccess('Gutschein-Code kopiert');
  }, []);

  // Form zurücksetzen
  const resetVoucherForm = useCallback(() => {
    setVoucherForm({
      name: '',
      code: '',
      type: 'betrag',
      nominal: 0,
      kuota: 1,
      start_date: new Date().toISOString().split('T')[0],
      expired: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      minimal_buying: 0,
      is_active: true
    });
  }, []);

  // Automatischen Code generieren
  const generateCode = useCallback(() => {
    const code = 'VALE' + Math.random().toString(36).substr(2, 8).toUpperCase();
    setVoucherForm(prev => ({ ...prev, code }));
  }, []);

  // Status-Farbe
  const getStatusColor = (voucher: Voucher) => {
    if (!voucher.is_active) return 'error';
    if (voucher.used_count >= voucher.kuota) return 'warning';
    if (new Date(voucher.expired) < new Date()) return 'error';
    return 'success';
  };

  // Status-Text
  const getStatusText = (voucher: Voucher) => {
    if (!voucher.is_active) return 'Inaktiv';
    if (voucher.used_count >= voucher.kuota) return 'Aufgebraucht';
    if (new Date(voucher.expired) < new Date()) return 'Abgelaufen';
    return 'Aktiv';
  };

  // Typ-Text
  const getTypeText = (type: string) => {
    switch (type) {
      case 'prozent': return 'Prozent';
      case 'betrag': return 'Betrag';
      case 'versandkosten': return 'Versandkosten';
      default: return type;
    }
  };

  // Verwendungsrate berechnen
  const getUsageRate = (voucher: Voucher) => {
    return voucher.kuota > 0 ? (voucher.used_count / voucher.kuota) * 100 : 0;
  };

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Box className="flex items-center justify-between">
        <Typography variant="h4" className="flex items-center gap-2">
          <VoucherIcon />
          Gutschein-Verwaltung
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Neuer Gutschein
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Voucher-Liste */}
      <Card className="p-4">
        <Typography variant="h6" className="mb-4">
          Gutscheine
        </Typography>
        
        {loading ? (
          <Box className="flex justify-center p-8">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell align="right">Wert</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Verwendung</TableCell>
                  <TableCell>Gültig bis</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vouchers.map((voucher) => (
                  <TableRow key={voucher.id} hover>
                    <TableCell>{voucher.name}</TableCell>
                    <TableCell>
                      <Box className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {voucher.code}
                        </code>
                        <IconButton
                          size="small"
                          onClick={() => copyVoucherCode(voucher.code)}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTypeText(voucher.type)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {voucher.type === 'prozent' ? `${voucher.nominal}%` : `€${voucher.nominal.toFixed(2)}`}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(voucher)}
                        color={getStatusColor(voucher)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box className="flex items-center gap-2">
                        <Box className="w-16 bg-gray-200 rounded-full h-2">
                          <Box
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${getUsageRate(voucher)}%` }}
                          />
                        </Box>
                        <Typography variant="body2">
                          {voucher.used_count}/{voucher.kuota}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(voucher.expired).toLocaleDateString('de-DE')}
                    </TableCell>
                    <TableCell>
                      <Box className="flex gap-1">
                        <Tooltip title="Bearbeiten">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(voucher)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Nutzung anzeigen">
                          <IconButton
                            size="small"
                            onClick={() => showVoucherUsage(voucher)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Löschen">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteVoucher(voucher.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Neuer Gutschein Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Neuen Gutschein erstellen</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              label="Name"
              fullWidth
              value={voucherForm.name}
              onChange={(e) => setVoucherForm(prev => ({ ...prev, name: e.target.value }))}
            />
            
            <Box className="flex gap-2">
              <TextField
                label="Code"
                fullWidth
                value={voucherForm.code}
                onChange={(e) => setVoucherForm(prev => ({ ...prev, code: e.target.value }))}
              />
              <Button
                variant="outlined"
                onClick={generateCode}
                sx={{ minWidth: '120px' }}
              >
                Generieren
              </Button>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Typ</InputLabel>
              <Select
                value={voucherForm.type}
                label="Typ"
                onChange={(e) => setVoucherForm(prev => ({ ...prev, type: e.target.value as any }))}
              >
                <MenuItem value="betrag">Betrag (€)</MenuItem>
                <MenuItem value="prozent">Prozent (%)</MenuItem>
                <MenuItem value="versandkosten">Versandkosten</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={voucherForm.type === 'prozent' ? 'Prozentsatz' : 'Betrag'}
              type="number"
              fullWidth
              value={voucherForm.nominal}
              onChange={(e) => setVoucherForm(prev => ({ ...prev, nominal: Number(e.target.value) }))}
            />

            <TextField
              label="Verwendungslimit"
              type="number"
              fullWidth
              value={voucherForm.kuota}
              onChange={(e) => setVoucherForm(prev => ({ ...prev, kuota: Number(e.target.value) }))}
            />

            <TextField
              label="Mindestbestellwert"
              type="number"
              fullWidth
              value={voucherForm.minimal_buying}
              onChange={(e) => setVoucherForm(prev => ({ ...prev, minimal_buying: Number(e.target.value) }))}
            />

            <Box className="flex gap-4">
              <TextField
                label="Gültig ab"
                type="date"
                fullWidth
                value={voucherForm.start_date}
                onChange={(e) => setVoucherForm(prev => ({ ...prev, start_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Gültig bis"
                type="date"
                fullWidth
                value={voucherForm.expired}
                onChange={(e) => setVoucherForm(prev => ({ ...prev, expired: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={voucherForm.is_active}
                  onChange={(e) => setVoucherForm(prev => ({ ...prev, is_active: e.target.checked }))}
                />
              }
              label="Aktiv"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={createVoucher} variant="contained">
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Gutschein bearbeiten Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Gutschein bearbeiten</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              label="Name"
              fullWidth
              value={voucherForm.name}
              onChange={(e) => setVoucherForm(prev => ({ ...prev, name: e.target.value }))}
            />
            
            <TextField
              label="Code"
              fullWidth
              value={voucherForm.code}
              onChange={(e) => setVoucherForm(prev => ({ ...prev, code: e.target.value }))}
            />

            <FormControl fullWidth>
              <InputLabel>Typ</InputLabel>
              <Select
                value={voucherForm.type}
                label="Typ"
                onChange={(e) => setVoucherForm(prev => ({ ...prev, type: e.target.value as any }))}
              >
                <MenuItem value="betrag">Betrag (€)</MenuItem>
                <MenuItem value="prozent">Prozent (%)</MenuItem>
                <MenuItem value="versandkosten">Versandkosten</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={voucherForm.type === 'prozent' ? 'Prozentsatz' : 'Betrag'}
              type="number"
              fullWidth
              value={voucherForm.nominal}
              onChange={(e) => setVoucherForm(prev => ({ ...prev, nominal: Number(e.target.value) }))}
            />

            <TextField
              label="Verwendungslimit"
              type="number"
              fullWidth
              value={voucherForm.kuota}
              onChange={(e) => setVoucherForm(prev => ({ ...prev, kuota: Number(e.target.value) }))}
            />

            <TextField
              label="Mindestbestellwert"
              type="number"
              fullWidth
              value={voucherForm.minimal_buying}
              onChange={(e) => setVoucherForm(prev => ({ ...prev, minimal_buying: Number(e.target.value) }))}
            />

            <Box className="flex gap-4">
              <TextField
                label="Gültig ab"
                type="date"
                fullWidth
                value={voucherForm.start_date}
                onChange={(e) => setVoucherForm(prev => ({ ...prev, start_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Gültig bis"
                type="date"
                fullWidth
                value={voucherForm.expired}
                onChange={(e) => setVoucherForm(prev => ({ ...prev, expired: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={voucherForm.is_active}
                  onChange={(e) => setVoucherForm(prev => ({ ...prev, is_active: e.target.checked }))}
                />
              }
              label="Aktiv"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={updateVoucher} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Gutschein-Nutzung Dialog */}
      <Dialog open={usageDialogOpen} onClose={() => setUsageDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Gutschein-Nutzung: {selectedVoucher?.name}
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Datum</TableCell>
                  <TableCell>Transaktion</TableCell>
                  <TableCell>Kunde</TableCell>
                  <TableCell align="right">Verwendeter Betrag</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {voucherUsage.map((usage) => (
                  <TableRow key={usage.id}>
                    <TableCell>
                      {new Date(usage.used_at).toLocaleDateString('de-DE')}
                    </TableCell>
                    <TableCell>{usage.transaction_id}</TableCell>
                    <TableCell>{usage.customer_id || 'Anonym'}</TableCell>
                    <TableCell align="right">€{usage.used_amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUsageDialogOpen(false)}>
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}; 