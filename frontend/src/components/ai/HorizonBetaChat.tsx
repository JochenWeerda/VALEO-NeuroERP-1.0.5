/**
 * VALEO NeuroERP 2.0 - Horizon Beta Chat Component
 * React-Komponente für die Horizon Beta KI-Integration
 * Serena Quality: Complete AI chat interface with streaming
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  model?: string;
  confidence?: number;
  suggestions?: string[];
}

interface HorizonBetaChatProps {
  module?: string;
  context?: string;
  maxTokens?: number;
  onMessageSend?: (message: string) => void;
  onResponseReceived?: (response: any) => void;
}

const HorizonBetaChat: React.FC<HorizonBetaChatProps> = ({
  module = 'valeo_general',
  context = 'valeo_general',
  maxTokens = 2000,
  onMessageSend,
  onResponseReceived
}) => {
  const theme = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    setIsStreaming(false);
    setStreamingMessage('');

    // Call parent callback
    onMessageSend?.(inputValue);

    try {
      // Send to Horizon Beta API
      const response = await fetch('/api/v1/horizon/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: inputValue,
          context: context,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        model: data.model,
        confidence: 0.85,
        suggestions: data.suggestions || []
      };

      setMessages(prev => [...prev, assistantMessage]);
      onResponseReceived?.(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      console.error('Horizon Beta chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamingChat = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    setIsStreaming(true);
    setStreamingMessage('');

    try {
      const response = await fetch('/api/v1/horizon/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query: inputValue,
          context: context,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Stream reader not available');

      let fullResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullResponse += data.content;
                setStreamingMessage(fullResponse);
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }

      // Add final message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: fullResponse,
        role: 'assistant',
        timestamp: new Date(),
        model: 'horizon-beta',
        confidence: 0.85
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage('');

      // Call callback if provided
      if (onResponseReceived) {
        onResponseReceived(assistantMessage);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Streaming-Fehler');
      console.error('Horizon Beta streaming error:', err);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadChat = () => {
    const chatText = messages.map(msg => 
      `${msg.role === 'user' ? 'Sie' : 'Horizon Beta'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `valeo-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.primary.main,
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AIIcon />
            <Typography variant="h6">
              Horizon Beta Assistant
            </Typography>
            <Chip 
              label="VALEO NeuroERP" 
              size="small" 
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              size="small" 
              onClick={clearChat}
              sx={{ color: 'white' }}
            >
              <RefreshIcon />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={downloadChat}
              sx={{ color: 'white' }}
            >
              <DownloadIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
          Intelligente Assistenz für VALEO NeuroERP - Landhandel-optimiert
        </Typography>
      </Paper>

      {/* Messages */}
      <Box 
        sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 2,
          backgroundColor: theme.palette.grey[50]
        }}
      >
        {messages.length === 0 && (
          <Card sx={{ mb: 2, backgroundColor: theme.palette.primary.light, color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Willkommen bei Horizon Beta!
              </Typography>
              <Typography variant="body2">
                Ich bin Ihr KI-Assistent für VALEO NeuroERP. Fragen Sie mich zu:
              </Typography>
              <List dense sx={{ mt: 1 }}>
                <ListItem>
                  <ListItemText 
                    primary="• Lagerverwaltung und Bestände" 
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="• Personal und Urlaubsverwaltung" 
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="• CRM und Tagesprotokolle" 
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="• Finanzen und Reporting" 
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        )}

        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '70%',
                backgroundColor: message.role === 'user' 
                  ? theme.palette.primary.main 
                  : 'white',
                color: message.role === 'user' ? 'white' : 'inherit',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                {message.role === 'user' ? <PersonIcon /> : <AIIcon />}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                  
                  {message.suggestions && message.suggestions.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        Vorschläge:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {message.suggestions.map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={suggestion}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {message.timestamp.toLocaleTimeString()}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(message.content)}
                      sx={{ color: 'inherit' }}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        ))}

        {/* Streaming message */}
        {isStreaming && streamingMessage && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '70%',
                backgroundColor: 'white',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <AIIcon />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {streamingMessage}
                    <Box component="span" sx={{ animation: 'blink 1s infinite' }}>
                      |
                    </Box>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Loading indicator */}
        {isLoading && !isStreaming && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                backgroundColor: 'white',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">
                  Horizon Beta denkt nach...
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Input */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: 'white'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Fragen Sie Horizon Beta... (Enter zum Senden, Shift+Enter für neue Zeile)"
            disabled={isLoading}
            variant="outlined"
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            <SendIcon />
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Horizon Beta • OpenRouter • VALEO NeuroERP 2.0
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {messages.length} Nachrichten
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default HorizonBetaChat; 