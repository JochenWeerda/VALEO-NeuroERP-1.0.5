import React, { useState } from 'react';
import { Button, Card, Typography, Alert, CircularProgress, Box } from '@mui/material';

export const Last9Test: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const testErrorTracking = async () => {
    setLoading(true);
    setStatus('Testing error tracking...');
    
    try {
      throw new Error('Test Error für Last9 - ' + new Date().toISOString());
    } catch (error) {
      if (typeof window !== 'undefined' && (window as any).last9Metrics) {
        await (window as any).last9Metrics.trackError(error as Error, {
          component: 'Last9Test',
          test_type: 'manual_error'
        });
        setStatus('✅ Error tracking test completed');
      } else {
        setStatus('❌ Last9 metrics not available');
      }
    } finally {
      setLoading(false);
    }
  };

  const testPerformanceTracking = async () => {
    setLoading(true);
    setStatus('Testing performance tracking...');
    
    const startTime = performance.now();
    
    // Simuliere eine ERP-Operation
    setTimeout(async () => {
      const duration = performance.now() - startTime;
      
      if (typeof window !== 'undefined' && (window as any).last9Metrics) {
        await (window as any).last9Metrics.trackERPOperation('test_operation', duration, true);
        setStatus(`✅ Performance tracking test completed (${duration.toFixed(2)}ms)`);
      } else {
        setStatus('❌ Last9 metrics not available');
      }
      setLoading(false);
    }, 1000);
  };

  const testUserInteraction = async () => {
    setLoading(true);
    setStatus('Testing user interaction...');
    
    if (typeof window !== 'undefined' && (window as any).last9Metrics) {
      await (window as any).last9Metrics.trackUserInteraction('test_button_click', 'Last9Test');
      setStatus('✅ User interaction test completed');
    } else {
      setStatus('❌ Last9 metrics not available');
    }
    setLoading(false);
  };

  const testCustomMetric = async () => {
    setLoading(true);
    setStatus('Testing custom metric...');
    
    if (typeof window !== 'undefined' && (window as any).last9Metrics) {
      await (window as any).last9Metrics.sendMetric({
        name: 'custom_erp_metric',
        value: Math.random() * 100,
        tags: {
          metric_type: 'test',
          component: 'Last9Test',
          timestamp: new Date().toISOString()
        }
      });
      setStatus('✅ Custom metric test completed');
    } else {
      setStatus('❌ Last9 metrics not available');
    }
    setLoading(false);
  };

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing Last9 connection...');
    
    if (typeof window !== 'undefined' && (window as any).last9Metrics) {
      const success = await (window as any).last9Metrics.testConnection();
      if (success) {
        setStatus('✅ Last9 connection successful');
      } else {
        setStatus('❌ Last9 connection failed');
      }
    } else {
      setStatus('❌ Last9 metrics not available');
    }
    setLoading(false);
  };

  return (
    <Card sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Last9 Observability Test
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Testen Sie die Last9-Integration mit Ihrem Cluster: gmail-jochen-weerda
      </Alert>

      {status && (
        <Alert severity={status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : 'info'} sx={{ mb: 3 }}>
          {status}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={testConnection}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Connection Test
        </Button>

        <Button 
          variant="contained" 
          color="secondary"
          onClick={testUserInteraction}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          User Interaction Testen
        </Button>

        <Button 
          variant="contained" 
          color="secondary"
          onClick={testPerformanceTracking}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Performance Tracking Testen
        </Button>

        <Button 
          variant="contained" 
          color="error"
          onClick={testErrorTracking}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Error Tracking Testen
        </Button>

        <Button 
          variant="outlined"
          onClick={testCustomMetric}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Custom Metric Testen
        </Button>
      </Box>

      <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
        Öffnen Sie das Last9 Dashboard unter https://app.last9.io, um die Test-Daten zu sehen.
        Cluster: gmail-jochen-weerda
      </Typography>
    </Card>
  );
}; 