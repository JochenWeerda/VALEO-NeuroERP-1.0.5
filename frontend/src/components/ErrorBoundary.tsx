import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Box, Typography, Paper } from '@mui/material';
import { Refresh as RefreshIcon, BugReport as BugReportIcon } from '@mui/icons-material';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { StandardButton } from './forms/FormStandardization';
import { StandardMessage } from './ui/UIStandardization';
import { UI_LABELS } from './ui/UIStandardization';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 3,
            bgcolor: 'background.default'
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center',
              borderRadius: 2
            }}
          >
            <BugReportIcon
              sx={{
                fontSize: 64,
                color: 'error.main',
                mb: 2
              }}
            />
            
            <Typography variant="h4" component="h1" gutterBottom color="error.main">
              {UI_LABELS.ERRORS.TITLE}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {UI_LABELS.ERRORS.DESCRIPTION}
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mb: 3, textAlign: 'left' }}>
                <StandardMessage
                  type="error"
                  title={UI_LABELS.ERRORS.DETAILS_TITLE}
                  message={this.state.error.toString()}
                />
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <StandardButton
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleReset}
                sx={{ minWidth: 140 }}
              >
                {UI_LABELS.ACTIONS.RETRY}
              </StandardButton>
              
              <StandardButton
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={this.handleReload}
                sx={{ minWidth: 140 }}
              >
                {UI_LABELS.ACTIONS.RELOAD_PAGE}
              </StandardButton>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
} 