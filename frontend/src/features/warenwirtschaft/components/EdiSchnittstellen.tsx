import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Alert,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  Send as SendIcon
} from '@mui/icons-material';
import { useAgentApi } from '../../../hooks/useAgentApi';

const EdiSchnittstellen: React.FC = () => {
  const [ediMessages] = useState([
    {
      id: '1',
      typ: 'ORDERS',
      partner: 'Lieferant A',
      datum: new Date(),
      status: 'gesendet',
      inhalt: 'Bestellung für Artikel 123'
    },
    {
      id: '2',
      typ: 'DESADV',
      partner: 'Lieferant B',
      datum: new Date(),
      status: 'empfangen',
      inhalt: 'Lieferschein für Artikel 456'
    }
  ]);

  const { getAgentSuggestions } = useAgentApi();

  const handleSendEdi = async (messageId: string) => {
    const suggestions = await getAgentSuggestions(
      'EDI-Nachricht ' + messageId + ' wurde gesendet. Partner wurde benachrichtigt.'
    );
    console.log('Agent-Vorschläge für EDI-Send:', suggestions);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'gesendet': return 'success';
      case 'empfangen': return 'info';
      case 'fehler': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h4" className="text-gray-900 font-bold">
            EDI-Schnittstellen
          </Typography>
          <Typography variant="subtitle1" className="text-gray-600">
            Electronic Data Interchange für automatisierte Geschäftsprozesse
          </Typography>
        </div>
        {/* TrustIndicator removed as per edit hint */}
      </div>

      {/* EDI-Info */}
      <Alert severity="info">
        <Typography variant="body1" className="font-medium">
          EDI-Integration aktiv
        </Typography>
        <Typography variant="body2">
          Automatisierter Datenaustausch mit Lieferanten und Kunden. 
          ORDERS, DESADV, INVOIC und weitere Nachrichtentypen verfügbar.
        </Typography>
      </Alert>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <SendIcon className="text-blue-600 text-3xl mb-2 mx-auto" />
          <Typography variant="h6" className="text-blue-800">Gesendet</Typography>
          <Typography variant="h4" className="text-blue-600">
            {ediMessages.filter(m => m.status === 'gesendet').length}
          </Typography>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <SendIcon className="text-green-600 text-3xl mb-2 mx-auto" />
          <Typography variant="h6" className="text-green-800">Empfangen</Typography>
          <Typography variant="h4" className="text-green-600">
            {ediMessages.filter(m => m.status === 'empfangen').length}
          </Typography>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <SendIcon className="text-orange-600 text-3xl mb-2 mx-auto" />
          <Typography variant="h6" className="text-orange-800">Verarbeitet</Typography>
          <Typography variant="h4" className="text-orange-600">
            {ediMessages.filter(m => m.status === 'verarbeitet').length}
          </Typography>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <SendIcon className="text-red-600 text-3xl mb-2 mx-auto" />
          <Typography variant="h6" className="text-red-800">Fehler</Typography>
          <Typography variant="h4" className="text-red-600">
            {ediMessages.filter(m => m.status === 'fehler').length}
          </Typography>
        </div>
      </div>

      {/* EDI-Nachrichten */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6" className="text-gray-900">
              EDI-Nachrichten
            </Typography>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
            >
              Neue Nachricht
            </Button>
          </div>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Typ</TableCell>
                  <TableCell>Partner</TableCell>
                  <TableCell>Datum</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Inhalt</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ediMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <Chip
                        label={message.typ}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{message.partner}</TableCell>
                    <TableCell>
                      {message.datum.toLocaleDateString('de-DE')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={message.status}
                        color={getStatusColor(message.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{message.inhalt}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <IconButton
                          size="small"
                          onClick={() => handleSendEdi(message.id)}
                          color="primary"
                        >
                          <SendIcon />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Card>
    </div>
  );
};

export default EdiSchnittstellen; 