import React, { useEffect, useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Divider, 
  Chip, 
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  AccountBalance as AccountBalanceIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { formatCurrency, formatDate } from '../../utils/formatters';

// Typendefinitionen
interface Account {
  id: number;
  kontonummer: string;
  bezeichnung: string;
  typ: 'Aktiv' | 'Passiv' | 'Ertrag' | 'Aufwand';
  saldo: number;
  waehrung: string;
  ist_aktiv: boolean;
  kategorie?: string;
  beschreibung?: string;
  erstellt_am?: string;
  aktualisiert_am?: string;
}

interface Transaction {
  id: number;
  datum: string;
  buchungstext: string;
  betrag: number;
  soll_konto: string;
  haben_konto: string;
}

interface AccountDetailProps {
  accountId: number;
  onBack: () => void;
  onEdit: (accountId: number) => void;
}

const getChipColorByType = (type: string) => {
  switch (type) {
    case 'Aktiv':
      return 'primary';
    case 'Passiv':
      return 'secondary';
    case 'Ertrag':
      return 'success';
    case 'Aufwand':
      return 'error';
    default:
      return 'default';
  }
};

const AccountDetail: React.FC<AccountDetailProps> = ({ accountId, onBack, onEdit }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Laden der Kontodaten vom Server
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        // Konto-Details laden
        const accountResponse = await fetch(`/api/v1/finanzen/konten/${accountId}`);
        if (!accountResponse.ok) {
          throw new Error(`HTTP-Fehler: ${accountResponse.status}`);
        }
        const accountData = await accountResponse.json();
        setAccount(accountData);

        // Letzte Buchungen für dieses Konto laden
        const transactionsResponse = await fetch(`/api/v1/finanzen/buchungen?konto=${accountData.kontonummer}&limit=5`);
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setRecentTransactions(transactionsData);
        }

        setLoading(false);
      } catch (err) {
        setError('Fehler beim Laden der Kontodaten: ' + (err instanceof Error ? err.message : String(err)));
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [accountId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!account) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" height="200px">
        <Typography variant="h6" color="textSecondary">
          Konto nicht gefunden
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ mt: 2 }}
        >
          Zurück zur Übersicht
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ mr: 2 }}
        >
          Zurück
        </Button>
        <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
          Konto: {account.kontonummer} - {account.bezeichnung}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<EditIcon />}
          onClick={() => onEdit(account.id)}
        >
          Bearbeiten
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: account.typ === 'Aktiv' ? 'primary.main' : 'secondary.main' }}>
                  <AccountBalanceIcon />
                </Avatar>
              }
              title="Kontodetails"
              subheader={`Kontonummer: ${account.kontonummer}`}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Bezeichnung</Typography>
                  <Typography variant="body1">{account.bezeichnung}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Kategorie</Typography>
                  <Typography variant="body1">{account.kategorie || 'Nicht zugewiesen'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Typ</Typography>
                  <Chip 
                    label={account.typ} 
                    color={getChipColorByType(account.typ) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Chip 
                    label={account.ist_aktiv ? 'Aktiv' : 'Inaktiv'} 
                    color={account.ist_aktiv ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                </Grid>
                {account.beschreibung && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Beschreibung</Typography>
                    <Typography variant="body2">{account.beschreibung}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Erstellt am</Typography>
                  <Typography variant="body2">{account.erstellt_am ? formatDate(account.erstellt_am) : 'Nicht verfügbar'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Letzte Aktualisierung</Typography>
                  <Typography variant="body2">{account.aktualisiert_am ? formatDate(account.aktualisiert_am) : 'Nicht verfügbar'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  €
                </Avatar>
              }
              title="Aktueller Saldo"
              subheader={formatDate(new Date())}
            />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                <Typography variant="h3" component="div" color={account.saldo >= 0 ? 'success.main' : 'error.main'}>
                  {formatCurrency(account.saldo, account.waehrung)}
                </Typography>
              </Box>
              <Divider sx={{ mt: 2, mb: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  <HistoryIcon fontSize="small" sx={{ mr: 1 }} />
                  Letzte Buchungen
                </Typography>
                <Button variant="text" size="small">
                  Alle anzeigen
                </Button>
              </Box>
              <List>
                {recentTransactions.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary="Keine Buchungen gefunden" 
                      secondary="Für dieses Konto wurden noch keine Buchungen erfasst" 
                    />
                  </ListItem>
                ) : (
                  recentTransactions.map((transaction) => (
                    <ListItem key={transaction.id} divider>
                      <ListItemText
                        primary={transaction.buchungstext}
                        secondary={formatDate(transaction.datum)}
                      />
                      <Typography 
                        variant="body2" 
                        color={transaction.soll_konto === account.kontonummer ? 'error.main' : 'success.main'}
                      >
                        {transaction.soll_konto === account.kontonummer ? '-' : '+'} 
                        {formatCurrency(transaction.betrag, account.waehrung)}
                      </Typography>
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountDetail; 