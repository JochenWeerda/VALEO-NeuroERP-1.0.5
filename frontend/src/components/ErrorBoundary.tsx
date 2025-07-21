import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Alert, Button } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
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
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <Alert severity="error" className="mb-4">
            <h2 className="text-lg font-semibold mb-2">
              Ein Fehler ist aufgetreten
            </h2>
            <p className="mb-4">
              Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.
            </p>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
            >
              Seite neu laden
            </Button>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
} 