import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress
} from '@mui/material';
import { Send as SendIcon, SmartToy as BotIcon, Person as PersonIcon } from '@mui/icons-material';
import { useThemeSystem } from '../themes/ThemeProvider';
import { LLMService } from '../services/llmService';
import { ThemeMode, ThemeVariant } from '../themes/themeTypes';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const AI: React.FC = () => {
  const { updateTheme, currentThemeConfig } = useThemeSystem();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      text: 'Hallo! Ich bin Ihr KI-Assistent. Sie können mich um Hilfe bitten oder nach Theme-Änderungen fragen, z.B. "Aktiviere den dunklen Modus" oder "Ändere das Theme zu modern".',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const processThemeCommand = (text: string) => {
    // Einfache Verarbeitung von Theme-Befehlen
    const lowercaseText = text.toLowerCase();
    
    // Theme-Modus-Befehle
    if (lowercaseText.includes('dunkel') || lowercaseText.includes('dark')) {
      updateTheme({ mode: 'dark' });
      return true;
    } else if (lowercaseText.includes('hell') || lowercaseText.includes('light')) {
      updateTheme({ mode: 'light' });
      return true;
    } else if (lowercaseText.includes('kontrast') || lowercaseText.includes('contrast')) {
      updateTheme({ mode: 'high-contrast' });
      return true;
    }
    
    // Theme-Varianten-Befehle
    const variants: ThemeVariant[] = ['odoo', 'default', 'modern', 'classic'];
    for (const variant of variants) {
      if (lowercaseText.includes(variant)) {
        updateTheme({ variant });
        return true;
      }
    }
    
    // Andere Theme-Parameter
    if (lowercaseText.includes('größere schrift') || lowercaseText.includes('große schrift')) {
      updateTheme({ parameters: { ...currentThemeConfig.parameters, fontSize: 'large' } });
      return true;
    } else if (lowercaseText.includes('kleinere schrift') || lowercaseText.includes('kleine schrift')) {
      updateTheme({ parameters: { ...currentThemeConfig.parameters, fontSize: 'small' } });
      return true;
    } else if (lowercaseText.includes('kompakt')) {
      updateTheme({ parameters: { ...currentThemeConfig.parameters, spacing: 'compact' } });
      return true;
    } else if (lowercaseText.includes('komfortabel')) {
      updateTheme({ parameters: { ...currentThemeConfig.parameters, spacing: 'comfortable' } });
      return true;
    } else if (lowercaseText.includes('keine ecken') || lowercaseText.includes('keine abrundung')) {
      updateTheme({ parameters: { ...currentThemeConfig.parameters, borderRadius: 'none' } });
      return true;
    } else if (lowercaseText.includes('starke abrundung') || lowercaseText.includes('stark abgerundet')) {
      updateTheme({ parameters: { ...currentThemeConfig.parameters, borderRadius: 'large' } });
      return true;
    }
    
    return false;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Benutzernachricht hinzufügen
    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Versuche zuerst als Theme-Befehl zu interpretieren
      const isThemeCommand = processThemeCommand(input);
      
      let response;
      if (isThemeCommand) {
        response = `Theme-Einstellungen wurden angepasst. Aktuelles Theme: ${currentThemeConfig.mode}, Variante: ${currentThemeConfig.variant}`;
      } else {
        // Falls kein Theme-Befehl, dann LLM-Antwort holen
        response = await LLMService.sendQuery(input);
      }

      // Bot-Antwort hinzufügen
      const botMessage: Message = {
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Fehler bei der Kommunikation mit dem LLM:', error);
      
      // Fehlermeldung hinzufügen
      const errorMessage: Message = {
        text: 'Entschuldigung, es gab ein Problem bei der Verarbeitung Ihrer Anfrage.',
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          KI-Assistent
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Stellen Sie Fragen oder bitten Sie um Anpassungen am Erscheinungsbild der Anwendung.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{
              height: '70vh',
              display: 'flex',
              flexDirection: 'column',
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
              <List>
                {messages.map((message, index) => (
                  <React.Fragment key={index}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                        mb: 1,
                      }}
                    >
                      {message.sender === 'bot' && (
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <BotIcon />
                          </Avatar>
                        </ListItemAvatar>
                      )}
                      <ListItemText
                        primary={message.text}
                        secondary={message.timestamp.toLocaleTimeString()}
                        sx={{
                          bgcolor: message.sender === 'user' ? 'primary.light' : 'background.paper',
                          p: 2,
                          borderRadius: 2,
                          maxWidth: '80%',
                        }}
                      />
                      {message.sender === 'user' && (
                        <ListItemAvatar sx={{ ml: 2 }}>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                      )}
                    </ListItem>
                    {index < messages.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Nachricht eingeben..."
                variant="outlined"
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
                multiline
                maxRows={4}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              >
                Senden
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Theme-Steuerung
              </Typography>
              <Typography variant="body2" paragraph>
                Sie können mit Nachrichten wie diesen das Erscheinungsbild anpassen:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Aktiviere den Dark Mode" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Wechsle zum Odoo-Theme" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Ich benötige hohen Kontrast" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Stelle größere Schrift ein" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Zeige kompaktere Ansicht" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
          
          <Card elevation={3} sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Aktuelles Theme
              </Typography>
              <Box component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
                {JSON.stringify(currentThemeConfig, null, 2)}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AI; 