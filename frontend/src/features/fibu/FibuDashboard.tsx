import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Alert, 
  Chip,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

interface FinancialAccount {
  id: string;
  name: string;
  number: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  currency: string;
  status: 'active' | 'inactive';
}

interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  accountId: string;
  reference: string;
  status: 'posted' | 'pending' | 'cancelled';
}

const FibuDashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFibuData();
  }, []);

  const loadFibuData = async () => {
    setLoading(true);
    try {
      // Simuliere API-Aufruf für FiBu-Daten
      const mockAccounts: FinancialAccount[] = [
        {
          id: '1',
          name: 'Bankkonto',
          number: '1000',
          type: 'asset',
          balance: 125000,
          currency: 'EUR',
          status: 'active'
        },
        {
          id: '2',
          name: 'Verbindlichkeiten',
          number: '2000',
          type: 'liability',
          balance: -45000,
          currency: 'EUR',
          status: 'active'
        },
        {
          id: '3',
          name: 'Umsatzerlöse',
          number: '4000',
          type: 'revenue',
          balance: 250000,
          currency: 'EUR',
          status: 'active'
        },
        {
          id: '4',
          name: 'Betriebsausgaben',
          number: '5000',
          type: 'expense',
          balance: -180000,
          currency: 'EUR',
          status: 'active'
        }
      ];

      const mockTransactions: Transaction[] = [
        {
          id: '1',
          date: new Date(),
          description: 'Kundenzahlung',
          amount: 5000,
          type: 'credit',
          accountId: '1',
          reference: 'RE-2024-001',
          status: 'posted'
        },
        {
          id: '2',
          date: new Date(Date.now() - 86400000),
          description: 'Lieferantenrechnung',
          amount: 2500,
          type: 'debit',
          accountId: '2',
          reference: 'LI-2024-001',
          status: 'posted'
        }
      ];

      setAccounts(mockAccounts);
      setTransactions(mockTransactions);
    } catch (err) {
      setError('Fehler beim Laden der FiBu-Daten');
    } finally {
      setLoading(false);
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'success';
      case 'liability': return 'error';
      case 'equity': return 'primary';
      case 'revenue': return 'success';
      case 'expense': return 'warning';
      default: return 'default';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'credit': return 'success';
      case 'debit': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const calculateTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom className="flex items-center gap-2">
        <AccountBalanceIcon className="text-green-600" />
        Finanzbuchhaltung Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom className="text-gray-600">
        Finanzverwaltung und Buchhaltung
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Financial Overview */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Finanzübersicht
        </Typography>
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Box className="text-center p-4 bg-green-50 rounded-lg">
            <AccountBalanceIcon className="text-green-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-green-800">Gesamtbilanz</Typography>
            <Typography variant="h4" className="text-green-600">
              {calculateTotalBalance().toLocaleString('de-DE')}€
            </Typography>
          </Box>
          <Box className="text-center p-4 bg-blue-50 rounded-lg">
            <ReceiptIcon className="text-blue-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-blue-800">Aktiva</Typography>
            <Typography variant="h4" className="text-blue-600">
              {accounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0).toLocaleString('de-DE')}€
            </Typography>
          </Box>
          <Box className="text-center p-4 bg-red-50 rounded-lg">
            <PaymentIcon className="text-red-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-red-800">Passiva</Typography>
            <Typography variant="h4" className="text-red-600">
              {Math.abs(accounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0)).toLocaleString('de-DE')}€
            </Typography>
          </Box>
          <Box className="text-center p-4 bg-purple-50 rounded-lg">
            <TrendingUpIcon className="text-purple-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-purple-800">Gewinn</Typography>
            <Typography variant="h4" className="text-purple-600">
              {(accounts.filter(a => a.type === 'revenue').reduce((sum, a) => sum + a.balance, 0) + 
                accounts.filter(a => a.type === 'expense').reduce((sum, a) => sum + a.balance, 0)).toLocaleString('de-DE')}€
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Accounts Table */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h6">
            Konten
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            Neues Konto
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell className="font-semibold">Kontonummer</TableCell>
                <TableCell className="font-semibold">Kontoname</TableCell>
                <TableCell className="font-semibold">Typ</TableCell>
                <TableCell className="font-semibold">Saldo</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell className="font-semibold">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Typography variant="body1" className="font-medium">
                      {account.number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{account.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={account.type}
                      size="small"
                      color={getAccountTypeColor(account.type) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className={`font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {account.balance.toLocaleString('de-DE')} {account.currency}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={account.status}
                      size="small"
                      color={account.status === 'active' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box className="flex gap-1">
                      <Button
                        size="small"
                        variant="outlined"
                      >
                        Details
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                      >
                        Buchungen
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Recent Transactions */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Letzte Buchungen
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell className="font-semibold">Datum</TableCell>
                <TableCell className="font-semibold">Beschreibung</TableCell>
                <TableCell className="font-semibold">Betrag</TableCell>
                <TableCell className="font-semibold">Typ</TableCell>
                <TableCell className="font-semibold">Referenz</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Typography variant="body2">
                      {transaction.date.toLocaleDateString('de-DE')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{transaction.description}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className={`font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'credit' ? '+' : '-'}{transaction.amount.toLocaleString('de-DE')}€
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.type}
                      size="small"
                      color={getTransactionTypeColor(transaction.type) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className="text-gray-600">
                      {transaction.reference}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.status}
                      size="small"
                      color={getStatusColor(transaction.status) as any}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Actions */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={loadFibuData}
          disabled={loading}
        >
          Daten aktualisieren
        </Button>
        <Button variant="outlined" startIcon={<AddIcon />}>
          Neue Buchung
        </Button>
        <Button variant="outlined" startIcon={<DownloadIcon />}>
          Bilanz exportieren
        </Button>
      </Box>
    </Box>
  );
};

export default FibuDashboard; 