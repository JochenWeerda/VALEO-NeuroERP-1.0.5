import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  Send as SendIcon,
  QrCode as QrCodeIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface WhatsAppMessage {
  id: string;
  phoneNumber: string;
  message: string;
  timestamp: Date;
  status: 'sent' | 'pending' | 'failed';
  customerName?: string;
}

interface QuickMessageTemplate {
  id: string;
  name: string;
  message: string;
  category: 'greeting' | 'order' | 'support' | 'custom';
}

interface WhatsAppWebTabProps {
  customer?: {
    id: string;
    name: string;
    phone?: string;
    whatsapp?: string;
  };
}

const QUICK_MESSAGE_TEMPLATES: QuickMessageTemplate[] = [
  {
    id: '1',
    name: 'Begrüßung',
    message: 'Hallo! Vielen Dank für Ihr Interesse an unseren Produkten. Wie kann ich Ihnen helfen?',
    category: 'greeting'
  },
  {
    id: '2',
    name: 'Bestellbestätigung',
    message: 'Vielen Dank für Ihre Bestellung! Ihre Bestellnummer ist: {orderNumber}. Wir werden Sie über den Status informieren.',
    category: 'order'
  },
  {
    id: '3',
    name: 'Support-Anfrage',
    message: 'Hallo! Ich sehe, dass Sie Unterstützung benötigen. Ein Mitarbeiter wird sich in Kürze bei Ihnen melden.',
    category: 'support'
  },
  {
    id: '4',
    name: 'Lieferung-Update',
    message: 'Gute Nachrichten! Ihre Bestellung wird heute zwischen {timeRange} geliefert. Sind Sie zu Hause?',
    category: 'order'
  }
];

export const CustomerWhatsAppWebTab: React.FC<WhatsAppWebTabProps> = ({ customer }) => {
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(customer?.whatsapp || customer?.phone || '');
  const [isWhatsAppWebOpen, setIsWhatsAppWebOpen] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [messageHistory, setMessageHistory] = useState<WhatsAppMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<QuickMessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<QuickMessageTemplate | null>(null);

  // Simuliere WhatsApp Web Verbindung
  useEffect(() => {
    const checkConnection = () => {
      // In der echten Implementierung würde hier die Verbindung geprüft
      const connected = localStorage.getItem('whatsapp-web-connected') === 'true';
      setIsConnected(connected);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenWhatsAppWeb = () => {
    const url = 'https://web.whatsapp.com';
    window.open(url, '_blank', 'width=1200,height=800');
    setIsWhatsAppWebOpen(true);
  };

  const handleSendMessage = async () => {
    if (!phoneNumber || !message.trim()) {
      return;
    }

    const newMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      phoneNumber,
      message: message.trim(),
      timestamp: new Date(),
      status: 'pending',
      customerName: customer?.name
    };

    setMessageHistory(prev => [newMessage, ...prev]);

    try {
      // WhatsApp Web URL mit vorausgefüllter Nachricht
      const encodedMessage = encodeURIComponent(message.trim());
      const whatsappUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
      
      // Öffne WhatsApp Web in neuem Tab
      window.open(whatsappUrl, '_blank');
      
      // Simuliere erfolgreiches Senden
      setTimeout(() => {
        setMessageHistory(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'sent' as const }
              : msg
          )
        );
      }, 2000);

      setMessage('');
    } catch (error) {
      setMessageHistory(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'failed' as const }
            : msg
        )
      );
    }
  };

  const handleUseTemplate = (template: QuickMessageTemplate) => {
    let processedMessage = template.message;
    
    // Ersetze Platzhalter
    if (customer) {
      processedMessage = processedMessage
        .replace('{customerName}', customer.name)
        .replace('{orderNumber}', `ORD-${Date.now().toString().slice(-6)}`)
        .replace('{timeRange}', '14:00 - 18:00');
    }
    
    setMessage(processedMessage);
    setShowTemplateDialog(false);
  };

  const handleSaveTemplate = () => {
    if (!message.trim()) return;

    const newTemplate: QuickMessageTemplate = {
      id: Date.now().toString(),
      name: `Template ${customTemplates.length + 1}`,
      message: message.trim(),
      category: 'custom'
    };

    setCustomTemplates(prev => [...prev, newTemplate]);
    setShowTemplateDialog(false);
  };

  const handleConnectWhatsApp = () => {
    setShowQrDialog(true);
    // Simuliere QR-Code Scan
    setTimeout(() => {
      localStorage.setItem('whatsapp-web-connected', 'true');
      setIsConnected(true);
      setShowQrDialog(false);
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'Gesendet';
      case 'pending': return 'Wird gesendet...';
      case 'failed': return 'Fehlgeschlagen';
      default: return 'Unbekannt';
    }
  };

  return (
    <Box className="space-y-6 p-4">
      {/* Header */}
      <Box className="flex justify-between items-center">
        <Typography variant="h5" className="flex items-center space-x-2">
          <WhatsAppIcon color="success" />
          <span>WhatsApp Web Integration</span>
        </Typography>
        
        <Box className="flex space-x-2">
          <Chip
            label={isConnected ? 'Verbunden' : 'Nicht verbunden'}
            color={isConnected ? 'success' : 'error'}
            icon={isConnected ? <WhatsAppIcon /> : <QrCodeIcon />}
          />
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setShowQrDialog(true)}
          >
            Verbindung
          </Button>
        </Box>
      </Box>

      {/* Verbindungsstatus */}
      {!isConnected && (
        <Alert severity="warning" className="mb-4">
          <Typography variant="body2">
            WhatsApp Web ist nicht verbunden. Scannen Sie den QR-Code, um zu beginnen.
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={handleConnectWhatsApp}
            className="mt-2"
          >
            QR-Code scannen
          </Button>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Hauptbereich - Nachrichten senden */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                Nachricht senden
              </Typography>
              
              <Box className="space-y-4">
                {/* Telefonnummer */}
                <TextField
                  fullWidth
                  label="WhatsApp Nummer"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+49 123 456789"
                  helperText="Format: +49 123 456789 (ohne Leerzeichen)"
                />

                {/* Nachricht */}
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Nachricht"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ihre Nachricht hier..."
                />

                {/* Aktions-Buttons */}
                <Box className="flex space-x-2">
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={!phoneNumber || !message.trim() || !isConnected}
                  >
                    Über WhatsApp Web senden
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setShowTemplateDialog(true)}
                  >
                    Template verwenden
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<WhatsAppIcon />}
                    onClick={handleOpenWhatsAppWeb}
                  >
                    WhatsApp Web öffnen
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Nachrichtenverlauf */}
          <Card className="mt-4">
            <CardContent>
              <Typography variant="h6" className="mb-4 flex items-center">
                <HistoryIcon className="mr-2" />
                Nachrichtenverlauf
              </Typography>
              
              <List>
                {messageHistory.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary="Keine Nachrichten gesendet"
                      secondary="Hier werden Ihre gesendeten WhatsApp-Nachrichten angezeigt"
                    />
                  </ListItem>
                ) : (
                  messageHistory.map((msg) => (
                    <React.Fragment key={msg.id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box className="flex items-center space-x-2">
                              <span>{msg.customerName || msg.phoneNumber}</span>
                              <Chip
                                label={getStatusText(msg.status)}
                                color={getStatusColor(msg.status) as any}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" className="mt-1">
                                {msg.message}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {msg.timestamp.toLocaleString('de-DE')}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton size="small">
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Seitenbereich - Templates */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                Schnell-Nachrichten
              </Typography>
              
              <Box className="space-y-2">
                {[...QUICK_MESSAGE_TEMPLATES, ...customTemplates].map((template) => (
                  <Paper key={template.id} className="p-3 hover:bg-gray-50 cursor-pointer">
                    <Box className="flex justify-between items-start">
                      <Box className="flex-1">
                        <Typography variant="subtitle2" className="font-medium">
                          {template.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" className="mt-1">
                          {template.message.length > 60 
                            ? `${template.message.substring(0, 60)}...` 
                            : template.message
                          }
                        </Typography>
                        <Chip
                          label={template.category}
                          size="small"
                          className="mt-2"
                          color={template.category === 'custom' ? 'primary' : 'default'}
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <SendIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Box>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => setShowTemplateDialog(true)}
                className="mt-4"
              >
                Neues Template erstellen
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* QR-Code Dialog */}
      <Dialog open={showQrDialog} onClose={() => setShowQrDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>WhatsApp Web verbinden</DialogTitle>
        <DialogContent>
          <Box className="text-center space-y-4">
            <QrCodeIcon sx={{ fontSize: 200, color: 'success.main' }} />
            <Typography variant="body1">
              Scannen Sie den QR-Code mit Ihrer WhatsApp-App
            </Typography>
            <Typography variant="body2" color="textSecondary">
              1. Öffnen Sie WhatsApp auf Ihrem Smartphone<br/>
              2. Gehen Sie zu Einstellungen → Verknüpfte Geräte<br/>
              3. Tippen Sie auf "Gerät verknüpfen"<br/>
              4. Scannen Sie den QR-Code
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQrDialog(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={handleConnectWhatsApp}>
            Verbunden
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onClose={() => setShowTemplateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nachrichten-Template</DialogTitle>
        <DialogContent>
          <Box className="space-y-4">
            <TextField
              fullWidth
              label="Template-Name"
              placeholder="z.B. Bestellbestätigung"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Nachricht"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ihre Nachricht hier..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTemplateDialog(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={handleSaveTemplate}>
            Template speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 