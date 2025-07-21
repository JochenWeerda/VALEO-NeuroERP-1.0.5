import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  TextField, 
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Wifi as WifiIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAgentApi } from '../../../hooks/useAgentApi';

interface L3Connection {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  ipAddress: string;
  port: number;
  lastSeen: string;
  deviceType: string;
}

interface L3ConnectProps {
  onBack: () => void;
}

export const L3Connect: React.FC<L3ConnectProps> = ({ onBack }) => {
  const [connections, setConnections] = useState<L3Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<L3Connection | null>(null);
  const { } = useAgentApi();

  const mockConnections: L3Connection[] = [
    {
      id: '1',
      name: 'L3-Terminal 001',
      status: 'connected',
      ipAddress: '192.168.1.100',
      port: 8080,
      lastSeen: '2024-01-15 14:30:00',
      deviceType: 'Mobile Scanner'
    },
    {
      id: '2',
      name: 'L3-Terminal 002',
      status: 'disconnected',
      ipAddress: '192.168.1.101',
      port: 8080,
      lastSeen: '2024-01-15 13:45:00',
      deviceType: 'Tablet'
    },
    {
      id: '3',
      name: 'L3-Terminal 003',
      status: 'error',
      ipAddress: '192.168.1.102',
      port: 8080,
      lastSeen: '2024-01-15 12:15:00',
      deviceType: 'Smartphone'
    }
  ];

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simuliere API-Aufruf
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConnections(mockConnections);
    } catch (err) {
      setError('Fehler beim Laden der Verbindungen');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadConnections();
  };

  const handleEdit = (connection: L3Connection) => {
    setSelectedConnection(connection);
    setEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (selectedConnection) {
      setConnections(prev => 
        prev.map(conn => 
          conn.id === selectedConnection.id ? selectedConnection : conn
        )
      );
    }
    setEditDialog(false);
    setSelectedConnection(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'disconnected': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircleIcon />;
      case 'disconnected': return <WifiIcon />;
      case 'error': return <ErrorIcon />;
      default: return <WifiIcon />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h4" className="text-gray-800 mb-2">
            L3-Verbindungen
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Verwaltung der L3-Terminal Verbindungen
          </Typography>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Aktualisieren
          </Button>
          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
            onClick={onBack}
          >
            Zurück
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Connections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((connection) => (
          <Card key={connection.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <Typography variant="h6" className="text-gray-800 mb-1">
                  {connection.name}
                </Typography>
                <Chip
                  icon={getStatusIcon(connection.status)}
                  label={connection.status === 'connected' ? 'Verbunden' : 
                         connection.status === 'disconnected' ? 'Getrennt' : 'Fehler'}
                  color={getStatusColor(connection.status) as any}
                  size="small"
                />
              </div>
              <IconButton
                size="small"
                onClick={() => handleEdit(connection)}
                className="text-gray-500 hover:text-gray-700"
              >
                <EditIcon />
              </IconButton>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">IP-Adresse:</span>
                <span className="font-mono">{connection.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Port:</span>
                <span>{connection.port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gerätetyp:</span>
                <span>{connection.deviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Letzte Aktivität:</span>
                <span className="text-xs">{connection.lastSeen}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex space-x-2">
                <Button
                  size="small"
                  variant="outlined"
                  fullWidth
                  disabled={connection.status === 'connected'}
                >
                  Verbinden
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  fullWidth
                  disabled={connection.status === 'disconnected'}
                >
                  Trennen
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Verbindung bearbeiten</DialogTitle>
        <DialogContent>
          {selectedConnection && (
            <div className="space-y-4 pt-2">
              <TextField
                label="Name"
                value={selectedConnection.name}
                onChange={(e) => setSelectedConnection({
                  ...selectedConnection,
                  name: e.target.value
                })}
                fullWidth
              />
              <TextField
                label="IP-Adresse"
                value={selectedConnection.ipAddress}
                onChange={(e) => setSelectedConnection({
                  ...selectedConnection,
                  ipAddress: e.target.value
                })}
                fullWidth
              />
              <TextField
                label="Port"
                type="number"
                value={selectedConnection.port}
                onChange={(e) => setSelectedConnection({
                  ...selectedConnection,
                  port: parseInt(e.target.value)
                })}
                fullWidth
              />
              <TextField
                label="Gerätetyp"
                value={selectedConnection.deviceType}
                onChange={(e) => setSelectedConnection({
                  ...selectedConnection,
                  deviceType: e.target.value
                })}
                fullWidth
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}; 