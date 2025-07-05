import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText,
  Chip
} from '@mui/material';
import { Send as SendIcon, SmartToy as BotIcon, Person as UserIcon } from '@mui/icons-material';
import { useThemeSystem } from '../themes/ThemeProvider';
import { processLLMThemeRequest } from '../themes/llmInterface';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const AI: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: 'Hallo! Ich bin Ihr KI-Assistent. Ich kann Ihnen helfen, das Theme anzupassen. Versuchen Sie Befehle wie "Aktiviere Dark Mode" oder "Wechsle zum Odoo-Theme".',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { mode, variant, setMode, setVariant } = useThemeSystem();

  // Automatisches Scrollen zu neuen Nachrichten
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const processThemeCommand = (text: string): boolean => {
    // Prüfen, ob die Nachricht Theme-Befehle enthält
    const themeRelated = /theme|modus|mode|dunkel|hell|dark|light|kontrast|contrast|odoo|classic|modern|default/i.test(text);
    
    if (themeRelated) {
      // Theme-Befehl verarbeiten
      processLLMThemeRequest(text);
      return true;
    }
    
    return false;
  };

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    // Benutzernachricht hinzufügen
    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsProcessing(true);

    // Prüfen, ob es ein Theme-Befehl ist
    const isThemeCommand = processThemeCommand(input);

    // Verzögerung für die "Verarbeitung" der Anfrage
    setTimeout(() => {
      let botResponse: Message;
      
      if (isThemeCommand) {
        botResponse = {
          text: `Ich habe das Theme angepasst. Aktuell ist der Modus "${
            mode === 'light' ? 'Hell' : mode === 'dark' ? 'Dunkel' : 'Hoher Kontrast'
          }" und die Variante "${variant}" aktiv.`,
          sender: 'bot',
          timestamp: new Date()
        };
      } else {
        botResponse = {
          text: 'Ich verstehe Ihre Anfrage, aber ich bin momentan auf die Bearbeitung von Theme-Befehlen spezialisiert. Versuchen Sie, mir Anweisungen zum Ändern des Themes zu geben, wie "Wechsle zum dunklen Modus" oder "Aktiviere das Odoo-Theme".',
          sender: 'bot',
          timestamp: new Date()
        };
      }
      
      setMessages(prevMessages => [...prevMessages, botResponse]);
      setIsProcessing(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '70vh', 
        maxWidth: '800px', 
        mx: 'auto', 
        overflow: 'hidden',
        borderRadius: 2
      }}
    >
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        backgroundColor: 'primary.main',
        color: 'primary.contrastText'
      }}>
        <Typography variant="h6">KI-Assistent</Typography>
        <Typography variant="caption">
          Aktuelles Theme: {mode === 'light' ? 'Hell' : mode === 'dark' ? 'Dunkel' : 'Hoher Kontrast'} / {variant}
        </Typography>
      </Box>
      
      <List 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto', 
          p: 2,
          bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.02)'
        }}
      >
        {messages.map((message, index) => (
          <ListItem 
            key={index} 
            alignItems="flex-start"
            sx={{ 
              flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
              mb: 2
            }}
          >
            <ListItemAvatar>
              <Avatar 
                sx={{ 
                  bgcolor: message.sender === 'user' ? 'secondary.main' : 'primary.main',
                  width: 36,
                  height: 36
                }}
              >
                {message.sender === 'user' ? <UserIcon /> : <BotIcon />}
              </Avatar>
            </ListItemAvatar>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%'
              }}
            >
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  bgcolor: message.sender === 'user' 
                    ? 'secondary.light' 
                    : 'primary.light',
                  color: message.sender === 'user' 
                    ? 'secondary.contrastText' 
                    : 'primary.contrastText'
                }}
              >
                <Typography variant="body1">{message.text}</Typography>
              </Paper>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>
      
      <Box sx={{ 
        p: 2, 
        borderTop: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Geben Sie eine Nachricht ein..."
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={isProcessing}
          size="small"
          multiline
          maxRows={3}
        />
        <Button 
          variant="contained" 
          color="primary" 
          endIcon={<SendIcon />}
          onClick={handleSendMessage}
          disabled={isProcessing || input.trim() === ''}
        >
          Senden
        </Button>
      </Box>
      
      <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          Beispiel-Befehle:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
          <Chip label="Aktiviere Dark Mode" size="small" onClick={() => setInput('Aktiviere Dark Mode')} />
          <Chip label="Wechsle zu Hellmodus" size="small" onClick={() => setInput('Wechsle zu Hellmodus')} />
          <Chip label="Zeige Odoo-Theme" size="small" onClick={() => setInput('Zeige Odoo-Theme')} />
          <Chip label="Verwende Standard-Theme" size="small" onClick={() => setInput('Verwende Standard-Theme')} />
        </Box>
      </Box>
    </Paper>
  );
};

export default AI; 