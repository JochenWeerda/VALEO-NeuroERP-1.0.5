import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button } from '@mui/material';

const mockDocuments = [
  { id: 'D-001', name: 'Rechnung_2024-07-01.pdf', date: '2024-07-01' },
  { id: 'D-002', name: 'Vertrag_Musterfirma.pdf', date: '2024-06-28' },
];

const DocumentsPage: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Dokumente</Typography>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Button variant="contained" color="primary">Dokument hochladen</Button>
        <List>
          {mockDocuments.map(doc => (
            <ListItem key={doc.id} divider>
              <ListItemText primary={doc.name} secondary={`Hochgeladen am: ${doc.date}`} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default DocumentsPage; 