import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Box, Typography } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class SentryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Track error with Last9 if available
    if (typeof window !== 'undefined' && (window as any).last9Metrics) {
      (window as any).last9Metrics.trackError(error, {
        component: 'ErrorBoundary',
        errorInfo: JSON.stringify(errorInfo)
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Ein Fehler ist aufgetreten
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{ mr: 2 }}
            >
              Seite neu laden
            </Button>
            <Button
              variant="outlined"
              onClick={() => this.setState({ hasError: false })}
            >
              Erneut versuchen
            </Button>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default SentryErrorBoundary; 