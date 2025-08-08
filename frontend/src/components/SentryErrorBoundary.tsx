import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Box, Typography } from '@mui/material';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { StandardButton } from './forms/FormStandardization';
import { StandardMessage } from './ui/UIStandardization';
import { UI_LABELS } from './ui/UIStandardization';

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
          <Box sx={{ mb: 4 }}>
            <StandardMessage
              type="error"
              title={UI_LABELS.ERRORS.TITLE}
              message={UI_LABELS.ERRORS.DESCRIPTION}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <StandardButton
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{ mr: 2 }}
            >
              {UI_LABELS.ACTIONS.RELOAD_PAGE}
            </StandardButton>
            <StandardButton
              variant="outlined"
              onClick={() => this.setState({ hasError: false })}
            >
              {UI_LABELS.ACTIONS.RETRY}
            </StandardButton>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default SentryErrorBoundary; 