import React from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TextField } from '@mui/material';

const mockTransactions = [
  { id: 'T-001', date: '2024-07-01', amount: 120.5, status: 'abgeschlossen' },
  { id: 'T-002', date: '2024-07-02', amount: 89.9, status: 'offen' },
  { id: 'T-003', date: '2024-07-03', amount: 45.0, status: 'abgelehnt' },
];

const TransactionsPage: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Transaktionen</Typography>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <TextField label="Suche nach ID oder Status" fullWidth size="small" sx={{ mb: 2 }} />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Datum</TableCell>
                <TableCell>Betrag</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockTransactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.id}</TableCell>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>{tx.amount} €</TableCell>
                  <TableCell>{tx.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default TransactionsPage; 