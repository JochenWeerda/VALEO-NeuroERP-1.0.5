import React from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TextField, Button } from '@mui/material';

const mockInventory = [
  { id: 'A-001', name: 'Artikel 1', stock: 120, price: 19.99 },
  { id: 'A-002', name: 'Artikel 2', stock: 80, price: 29.99 },
  { id: 'A-003', name: 'Artikel 3', stock: 0, price: 9.99 },
];

const InventoryPage: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Inventar</Typography>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <TextField label="Suche nach Artikel" fullWidth size="small" sx={{ mb: 2 }} />
        <Button variant="contained" color="primary">Suchen</Button>
        <TableContainer sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Bestand</TableCell>
                <TableCell>Preis</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockInventory.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>{item.price} €</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default InventoryPage; 