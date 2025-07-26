import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Button, 
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
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
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Api as ApiIcon,
  Storage as StorageIcon,
  Cloud as CloudIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';
import {
  ObjectPageHeader,
  ActionBar,
  QuickViewCard,
  StatusIndicator,
  MessageStrip
} from '../components/ui/NeuroFlowComponents';

const ApiCommunicationDemo: React.FC = () => {
  const {
    user,
    isAuthenticated,
    login,
    logout,
    systemStatus,
    isLoading,
    error,
    refreshSystemStatus,
    transactions,
    inventory,
    documents,
    notifications,
    getTransactions,
    createTransaction,
    getInventory,
    createInventoryItem,
    getDocuments,
    getNotifications,
    middlewareHealthCheck
  } = useApi();

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createType, setCreateType] = useState<'transaction' | 'inventory'>('transaction');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [createData, setCreateData] = useState<any>({});
  const [middlewareStatus, setMiddlewareStatus] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      checkMiddleware();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    await Promise.all([
      getTransactions(),
      getInventory(),
      getDocuments(),
      getNotifications()
    ]);
  };

  const checkMiddleware = async () => {
    try {
      const response = await middlewareHealthCheck();
      setMiddlewareStatus(response);
    } catch (err) {
      console.error('Middleware check failed:', err);
    }
  };

  const handleLogin = async () => {
    const response = await login(loginData);
    if (response.success) {
      setShowLoginDialog(false);
      setLoginData({ username: '', password: '' });
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleCreate = async () => {
    if (createType === 'transaction') {
      await createTransaction({
        type: createData.type || 'income',
        amount: parseFloat(createData.amount) || 0,
        date: new Date().toISOString(),
        description: createData.description || '',
        user_id: user?.id || '',
        status: 'pending'
      });
    } else if (createType === 'inventory') {
      await createInventoryItem({
        name: createData.name || '',
        sku: createData.sku || '',
        quantity: parseInt(createData.quantity) || 0,
        unit_price: parseFloat(createData.unit_price) || 0,
        location: createData.location || '',
        category: createData.category || 'general',
        status: 'in_stock'
      });
    }
    setShowCreateDialog(false);
    setCreateData({});
    loadData();
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ p: 4, maxWidth: 400, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <ApiIcon sx={{ fontSize: 64, color: '#0A6ED1', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              VALEO NeuroERP
            </Typography>
            <Typography variant="body1" color="text.secondary">
              API-Kommunikation Demo
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => setShowLoginDialog(true)}
            startIcon={<SecurityIcon />}
          >
            Anmelden
          </Button>

          <Alert severity="info" sx={{ mt: 2 }}>
            Verwenden Sie die Demo-Anmeldedaten: admin/admin
          </Alert>
        </Card>

        {/* Login Dialog */}
        <Dialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Anmeldung</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Benutzername"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Passwort"
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowLoginDialog(false)}>Abbrechen</Button>
            <Button onClick={handleLogin} variant="contained">Anmelden</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F7' }}>
      {/* Header */}
      <ObjectPageHeader
        title="API-Kommunikation Demo"
        subtitle="Frontend ↔ Middleware ↔ Backend"
        status="Aktiv"
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={handleLogout}>
              Abmelden
            </Button>
            <Button variant="contained" onClick={() => setShowCreateDialog(true)} startIcon={<AddIcon />}>
              Neu erstellen
            </Button>
          </Box>
        }
      />

      {/* Error Display */}
      {error && (
        <Box sx={{ px: 3 }}>
          <MessageStrip type="error" title="Fehler">
            {error}
          </MessageStrip>
        </Box>
      )}

      {/* Action Bar */}
      <ActionBar
        title="System-Status & Kommunikation"
        actions={[
          {
            label: 'Status aktualisieren',
            icon: <RefreshIcon />,
            onClick: () => {
              refreshSystemStatus();
              checkMiddleware();
              loadData();
            },
            variant: 'outlined'
          },
          {
            label: 'Middleware prüfen',
            icon: <ApiIcon />,
            onClick: checkMiddleware,
            variant: 'outlined'
          }
        ]}
      />

      <Box sx={{ p: 3 }}>
        {/* System Status */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
          <QuickViewCard
            title="Backend Status"
            icon={<StorageIcon />}
          >
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <StatusIndicator
                status={systemStatus?.backend ? 'success' : 'error'}
                label={systemStatus?.backend ? 'Online' : 'Offline'}
                size="large"
              />
              <Typography variant="body2" sx={{ mt: 1, color: '#515559' }}>
                Port 8000
              </Typography>
            </Box>
          </QuickViewCard>

          <QuickViewCard
            title="Middleware Status"
            icon={<CloudIcon />}
          >
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <StatusIndicator
                status={middlewareStatus?.success ? 'success' : 'error'}
                label={middlewareStatus?.success ? 'Online' : 'Offline'}
                size="large"
              />
              <Typography variant="body2" sx={{ mt: 1, color: '#515559' }}>
                Port 8001
              </Typography>
            </Box>
          </QuickViewCard>
        </Box>

        {/* Data Overview */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <QuickViewCard title="Transaktionen" icon={<SpeedIcon />}>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" sx={{ color: '#0A6ED1', mb: 1 }}>
                {transactions.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#515559' }}>
                Gesamt
              </Typography>
            </Box>
          </QuickViewCard>

          <QuickViewCard title="Inventar" icon={<StorageIcon />}>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" sx={{ color: '#107C41', mb: 1 }}>
                {inventory.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#515559' }}>
                Artikel
              </Typography>
            </Box>
          </QuickViewCard>

          <QuickViewCard title="Dokumente" icon={<ApiIcon />}>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" sx={{ color: '#E9730C', mb: 1 }}>
                {documents.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#515559' }}>
                Gespeichert
              </Typography>
            </Box>
          </QuickViewCard>

          <QuickViewCard title="Benachrichtigungen" icon={<SecurityIcon />}>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" sx={{ color: '#BB0000', mb: 1 }}>
                {notifications.filter(n => !n.read).length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#515559' }}>
                Ungelesen
              </Typography>
            </Box>
          </QuickViewCard>
        </Box>

        {/* Recent Data */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Card>
            <Box sx={{ p: 2, borderBottom: '1px solid #E5E5E5' }}>
              <Typography variant="h6">Letzte Transaktionen</Typography>
            </Box>
            <List>
              {transactions.slice(0, 5).map((transaction) => (
                <ListItem key={transaction.id}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${transaction.type} - ${transaction.amount}€`}
                    secondary={transaction.description}
                  />
                  <Chip label={transaction.status} size="small" />
                </ListItem>
              ))}
            </List>
          </Card>

          <Card>
            <Box sx={{ p: 2, borderBottom: '1px solid #E5E5E5' }}>
              <Typography variant="h6">Inventar-Status</Typography>
            </Box>
            <List>
              {inventory.slice(0, 5).map((item) => (
                <ListItem key={item.id}>
                  <ListItemIcon>
                    <StorageIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.name}
                    secondary={`SKU: ${item.sku} - ${item.quantity} Stück`}
                  />
                  <Chip 
                    label={item.status} 
                    size="small" 
                    color={item.status === 'in_stock' ? 'success' : 'warning'}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Box>

        {/* Loading Indicator */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </Box>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neuen Eintrag erstellen</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Typ</InputLabel>
            <Select
              value={createType}
              onChange={(e) => setCreateType(e.target.value as 'transaction' | 'inventory')}
            >
              <MenuItem value="transaction">Transaktion</MenuItem>
              <MenuItem value="inventory">Inventar-Item</MenuItem>
            </Select>
          </FormControl>

          {createType === 'transaction' ? (
            <>
              <TextField
                fullWidth
                label="Typ"
                value={createData.type || ''}
                onChange={(e) => setCreateData({ ...createData, type: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Betrag"
                type="number"
                value={createData.amount || ''}
                onChange={(e) => setCreateData({ ...createData, amount: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Beschreibung"
                value={createData.description || ''}
                onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                margin="normal"
              />
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="Name"
                value={createData.name || ''}
                onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="SKU"
                value={createData.sku || ''}
                onChange={(e) => setCreateData({ ...createData, sku: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Menge"
                type="number"
                value={createData.quantity || ''}
                onChange={(e) => setCreateData({ ...createData, quantity: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Einzelpreis"
                type="number"
                value={createData.unit_price || ''}
                onChange={(e) => setCreateData({ ...createData, unit_price: e.target.value })}
                margin="normal"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Abbrechen</Button>
          <Button onClick={handleCreate} variant="contained">Erstellen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApiCommunicationDemo; 