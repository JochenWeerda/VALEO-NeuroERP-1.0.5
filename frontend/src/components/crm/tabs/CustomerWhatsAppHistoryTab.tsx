import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Divider,
  Grid
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  Send as SendIcon,
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { Customer, CRMSubTab, CustomerCommunication, CommunicationType, CommunicationStatus, CommunicationOutcome } from '../../../types/crm';

interface CustomerWhatsAppHistoryTabProps {
  customer: Customer;
  currentSubTab: CRMSubTab;
  onSubTabChange: (subTab: CRMSubTab) => void;
}

const CustomerWhatsAppHistoryTab: React.FC<CustomerWhatsAppHistoryTabProps> = ({
  customer,
  currentSubTab,
  onSubTabChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<CustomerCommunication | null>(null);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Mock-WhatsApp-Nachrichten für Entwicklung
  const mockWhatsAppMessages: CustomerCommunication[] = [
    {
      id: '1',
      customerId: customer?.id || '',
      type: CommunicationType.WHATSAPP,
      subject: 'Bestellbestätigung',
      content: 'Vielen Dank für Ihre Bestellung! Ihre Bestellnummer ist: ORD-123456. Wir werden Sie über den Status informieren.',
      date: '2024-01-20T10:30:00Z',
      status: CommunicationStatus.DELIVERED,
      outcome: CommunicationOutcome.POSITIVE,
      attachments: [],
      from: 'System',
      to: customer?.name || '',
      priority: 'medium',
      createdBy: 'System',
      updatedAt: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      customerId: customer?.id || '',
      type: CommunicationType.WHATSAPP,
      subject: 'Lieferung-Update',
      content: 'Gute Nachrichten! Ihre Bestellung wird heute zwischen 14:00 - 18:00 geliefert. Sind Sie zu Hause?',
      date: '2024-01-19T14:15:00Z',
      status: CommunicationStatus.SENT,
      outcome: CommunicationOutcome.NEUTRAL,
      attachments: [],
      from: 'System',
      to: customer?.name || '',
      priority: 'medium',
      createdBy: 'System',
      updatedAt: '2024-01-19T14:15:00Z'
    },
    {
      id: '3',
      customerId: customer?.id || '',
      type: CommunicationType.WHATSAPP,
      subject: 'Support-Anfrage',
      content: 'Hallo! Ich sehe, dass Sie Unterstützung benötigen. Ein Mitarbeiter wird sich in Kürze bei Ihnen melden.',
      date: '2024-01-18T09:45:00Z',
      status: CommunicationStatus.SENT,
      outcome: CommunicationOutcome.NEUTRAL,
      attachments: [],
      from: 'System',
      to: customer?.name || '',
      priority: 'medium',
      createdBy: 'System',
      updatedAt: '2024-01-18T09:45:00Z'
    }
  ];

  const filteredMessages = mockWhatsAppMessages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReply = async () => {
    if (selectedMessage && replyText.trim()) {
      try {
        const response = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            to: selectedMessage.from,
            content: replyText,
            customerId: customer.id,
            originalMessageId: selectedMessage.id,
            type: 'reply'
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('WhatsApp Reply sent successfully:', result);
        
        // Add reply to local state
        const newReply: CustomerCommunication = {
          id: `reply-${Date.now()}`,
          customerId: customer.id,
          type: 'email' as CommunicationType,
          date: new Date().toISOString(),
          from: 'user@example.com',
          to: customer.email,
          content: replyText,
          subject: `Antwort auf: ${selectedMessage.subject}`,
          status: 'sent' as CommunicationStatus,
          priority: 'medium',
          outcome: 'delivered' as CommunicationOutcome,
          createdBy: 'current-user',
          updatedAt: new Date().toISOString()
        };

        // Update mock messages (in real app, this would be handled by state management)
        mockWhatsAppMessages.unshift(newReply);
        
        setIsReplyDialogOpen(false);
        setReplyText('');
        setSelectedMessage(null);
      } catch (err) {
        console.error('Error sending WhatsApp reply:', err);
        alert('Fehler beim Senden der WhatsApp-Antwort');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'delivered': return 'primary';
      case 'read': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box className="space-y-4">
      {/* Header */}
      <Box className="flex justify-between items-center">
        <Typography variant="h6" className="text-gray-800">
          WhatsApp-Historie - {customer.name}
        </Typography>
        <Box className="flex space-x-2">
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            size="small"
          >
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<WhatsAppIcon />}
            size="small"
          >
            Neue Nachricht
          </Button>
        </Box>
      </Box>

      {/* Suchfeld */}
      <TextField
        fullWidth
        placeholder="WhatsApp-Nachrichten durchsuchen..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon className="text-gray-400 mr-2" />
        }}
        variant="outlined"
        size="small"
      />

      {/* WhatsApp-Nachrichten */}
      <Card>
        <CardContent className="p-0">
          <List className="divide-y divide-gray-200">
            {filteredMessages.map((message) => (
              <ListItem
                key={message.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedMessage(message)}
              >
                <ListItemAvatar>
                  <Avatar className="bg-green-500">
                    <WhatsAppIcon />
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box className="flex items-center justify-between">
                      <Typography variant="subtitle2" className="font-medium">
                        {message.subject}
                      </Typography>
                      <Box className="flex space-x-1">
                        <Chip
                          label={message.status}
                          size="small"
                          color={getStatusColor(message.status)}
                          variant="outlined"
                        />
                        <Chip
                          label={message.priority}
                          size="small"
                          color={getPriorityColor(message.priority)}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" className="text-gray-600 mb-1">
                        {message.content.length > 100 
                          ? `${message.content.substring(0, 100)}...` 
                          : message.content
                        }
                      </Typography>
                      <Box className="flex items-center justify-between">
                        <Typography variant="caption" className="text-gray-500">
                          {formatDate(message.date)}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          {message.from} → {message.to}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />

                <Box className="flex space-x-1">
                  <Tooltip title="Antworten">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMessage(message);
                        setIsReplyDialogOpen(true);
                      }}
                    >
                      <ReplyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Weiterleiten">
                    <IconButton size="small">
                      <ForwardIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Archivieren">
                    <IconButton size="small">
                      <ArchiveIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItem>
            ))}
          </List>

          {filteredMessages.length === 0 && (
            <Box className="text-center py-8">
              <WhatsAppIcon className="text-gray-400 text-4xl mb-2" />
              <Typography variant="body2" color="textSecondary">
                Keine WhatsApp-Nachrichten gefunden
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog
        open={isReplyDialogOpen}
        onClose={() => setIsReplyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          WhatsApp-Antwort an {selectedMessage?.from}
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4">
            {/* Original Message */}
            {selectedMessage && (
              <Card variant="outlined">
                <CardContent className="p-3">
                  <Typography variant="caption" className="text-gray-500">
                    Original Nachricht:
                  </Typography>
                  <Typography variant="body2" className="mt-1">
                    {selectedMessage.content}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Reply Text */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Ihre Antwort"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Schreiben Sie Ihre WhatsApp-Antwort..."
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsReplyDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleReply}
            variant="contained"
            startIcon={<SendIcon />}
            disabled={!replyText.trim()}
          >
            Senden
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerWhatsAppHistoryTab; 