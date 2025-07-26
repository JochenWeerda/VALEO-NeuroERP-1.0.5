import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Button, 
  TextField,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Palette as PaletteIcon,
  Code as CodeIcon,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';

const ComponentLibrary: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom className="flex items-center gap-2">
        <PaletteIcon className="text-purple-600" />
        VALEO Component Library
      </Typography>
      <Typography variant="subtitle1" gutterBottom className="text-gray-600">
        Übersicht aller verfügbaren UI-Komponenten und Design-System
      </Typography>

      {/* Buttons Section */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom className="flex items-center gap-2">
          <CodeIcon className="text-blue-600" />
          Buttons
        </Typography>
        <Box className="flex flex-wrap gap-4">
          <Button variant="contained" color="primary">
            Primary Button
          </Button>
          <Button variant="contained" color="secondary">
            Secondary Button
          </Button>
          <Button variant="outlined">
            Outlined Button
          </Button>
          <Button variant="text">
            Text Button
          </Button>
          <Button variant="contained" disabled>
            Disabled Button
          </Button>
        </Box>
      </Card>

      {/* Cards Section */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom className="flex items-center gap-2">
          <ViewModuleIcon className="text-green-600" />
          Cards
        </Typography>
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card sx={{ p: 2 }}>
            <Typography variant="h6">Standard Card</Typography>
            <Typography variant="body2" className="text-gray-600">
              Eine Standard-Karte mit Inhalt
            </Typography>
          </Card>
          
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6">Outlined Card</Typography>
            <Typography variant="body2" className="text-gray-600">
              Eine Karte mit Outline
            </Typography>
          </Card>
          
          <Card sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">Colored Card</Typography>
            <Typography variant="body2">
              Eine farbige Karte
            </Typography>
          </Card>
        </Box>
      </Card>

      {/* Form Elements */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Form Elements
        </Typography>
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            fullWidth
            label="Standard Input"
            placeholder="Geben Sie Text ein..."
          />
          <TextField
            fullWidth
            label="Required Input"
            required
            placeholder="Pflichtfeld"
          />
          <TextField
            fullWidth
            label="Error Input"
            error
            helperText="Dies ist ein Fehler"
            placeholder="Fehlerhafter Input"
          />
          <TextField
            fullWidth
            label="Disabled Input"
            disabled
            placeholder="Deaktiviert"
          />
        </Box>
      </Card>

      {/* Chips */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Chips
        </Typography>
        <Box className="flex flex-wrap gap-2">
          <Chip label="Default Chip" />
          <Chip label="Primary Chip" color="primary" />
          <Chip label="Secondary Chip" color="secondary" />
          <Chip label="Success Chip" color="success" />
          <Chip label="Warning Chip" color="warning" />
          <Chip label="Error Chip" color="error" />
          <Chip label="Deletable" onDelete={() => {}} />
        </Box>
      </Card>

      {/* Alerts */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Alerts
        </Typography>
        <Box className="space-y-2">
          <Alert severity="success">
            Dies ist eine Erfolgsmeldung
          </Alert>
          <Alert severity="info">
            Dies ist eine Informationsmeldung
          </Alert>
          <Alert severity="warning">
            Dies ist eine Warnmeldung
          </Alert>
          <Alert severity="error">
            Dies ist eine Fehlermeldung
          </Alert>
        </Box>
      </Card>

      {/* Loading States */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Loading States
        </Typography>
        <Box className="flex items-center gap-4">
          <Box className="flex items-center gap-2">
            <CircularProgress size={20} />
            <Typography>Kleiner Spinner</Typography>
          </Box>
          <Box className="flex items-center gap-2">
            <CircularProgress size={40} />
            <Typography>Mittlerer Spinner</Typography>
          </Box>
          <Box className="flex items-center gap-2">
            <CircularProgress size={60} />
            <Typography>Großer Spinner</Typography>
          </Box>
        </Box>
      </Card>

      {/* Custom VALEO Components */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          VALEO Custom Components
        </Typography>
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="valeo-card">
            <div className="valeo-card-header">
              <div className="valeo-card-title">VALEO Card</div>
              <div className="valeo-card-subtitle">Custom Styling</div>
            </div>
            <Typography variant="body2">
              Eine VALEO-spezifische Karte mit custom Styling
            </Typography>
          </Box>
          
          <Box className="agent-card">
            <Typography variant="h6" className="text-blue-800">
              Agent Card
            </Typography>
            <Typography variant="body2" className="text-blue-700">
              Eine Agent-spezifische Karte
            </Typography>
          </Box>
        </Box>
        
        <Box className="mt-4 space-y-2">
          <button className="btn-primary">
            VALEO Primary Button
          </button>
          <button className="btn-secondary">
            VALEO Secondary Button
          </button>
          <button className="btn-agent">
            Agent Button
          </button>
        </Box>
      </Card>
    </Box>
  );
};

export default ComponentLibrary; 