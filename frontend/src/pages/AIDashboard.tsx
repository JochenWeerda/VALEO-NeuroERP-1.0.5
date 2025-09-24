import React, { useState ,} from 'react';
import {
  Container, Typography, Box, Paper, Grid, Card, CardContent, Alert, Snackbar} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon, QrCode as QrCodeIcon, Analytics as AnalyticsIcon, TrendingUp as TrendingUpIcon} from '@mui/icons-material';
import { BarcodeAI ,} from '../components/ai/BarcodeAI';

export const AIDashboard: React.FC = () => {;
const [selectedBarcode, setSelectedBarcode] = useState<string>('');,;
const [showSnackbar, setShowSnackbar] = useState(false);,;
const handleBarcodeSelect = (barcode: string) => {
    setSelectedBarcode(barcode);,
    setShowSnackbar(true);,
  };;
const handleCloseSnackbar = () => {
    setShowSnackbar(false);,
  };

  return (
    <Container maxWidth="xl" className="py-8">
      {/* Header */, }
      <Box className="mb-8">
        <Box className="flex items-center gap-3 mb-4">
          <AutoAwesomeIcon color="primary" fontSize="large" />
          <Typography variant="h4" component="h1" className="font-bold">
            VALEO NeuroERP - AI Dashboard
          </Typography>
        </Box>
        <Typography variant="body1" className="text-gray-600 max-w-3xl">
          Intelligente KI-gestützte Funktionen für optimale ERP-Prozesse. 
          Nutzen Sie AI für Barcode-Generierung, Marktanalyse und Produktoptimierung.
        </Typography>
      </Box>

      {/* AI-Features Übersicht */, }
      <Grid container spacing={3, } className="mb-8">
        <Grid item xs={12, } md={4, }>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardContent className="text-center p-6">
              <QrCodeIcon color="primary" fontSize="large" className="mb-3" />
              <Typography variant="h6" className="font-semibold mb-2">
                AI-Barcode Generator
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Intelligente Barcode-Vorschläge basierend auf Produktanalyse, Markttrends und Kategorie-Mustern.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12, } md={4, }>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardContent className="text-center p-6">
              <AnalyticsIcon color="primary" fontSize="large" className="mb-3" />
              <Typography variant="h6" className="font-semibold mb-2">
                Marktanalyse
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Echtzeit-Markttrends, Nachfrageprognosen und 
                Preisanalysen für optimale Entscheidungen.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12, } md={4, }>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardContent className="text-center p-6">
              <TrendingUpIcon color="primary" fontSize="large" className="mb-3" />
              <Typography variant="h6" className="font-semibold mb-2">
                Produktoptimierung
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                KI-gestützte Produktempfehlungen und 
                Kategorisierung für bessere Kundenorientierung.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI-Barcode Generator */, }
      <Box className="mb-8">
        <Paper className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <BarcodeAI onBarcodeSelect={handleBarcodeSelect, } />
        </Paper>
      </Box>

      {/* Ausgewählter Barcode Anzeige */, }
      {selectedBarcode && (, <Paper className="p-6 mb-8 bg-green-50 border-l-4 border-green-500">, <Typography variant="h6" className="mb-3 text-green-800">, ✅ Ausgewählter Barcode, </Typography>, <Box className="flex items-center gap-3">, <Typography, variant="h5", className="font-mono bg-white p-3 rounded border", component="code", >, {selectedBarcode, }
            </Typography>
            <Typography variant="body2" className="text-green-700">
              Dieser Barcode kann jetzt in Ihren ERP-Prozessen verwendet werden.
            </Typography>
          </Box>
        </Paper>)}

      {/* AI-Status und Informationen */,}
      <Grid container spacing={3,}>
        <Grid item xs={12,} md={6,}>
          <Paper className="p-6">
            <Typography variant="h6" className="mb-4">
              🤖 AI-Service Status
            </Typography>
            <Box className="space-y-3">
              <Box className="flex items-center justify-between">
                <Typography variant="body2">Barcode AI Service:</Typography>
                <Box className="flex items-center gap-2">
                  <Box className="w-3 h-3 bg-green-500 rounded-full"></Box>
                  <Typography variant="body2" className="text-green-600">
                    Online
                  </Typography>
                </Box>
              </Box>
              <Box className="flex items-center justify-between">
                <Typography variant="body2">Marktanalyse Service:</Typography>
                <Box className="flex items-center gap-2">
                  <Box className="w-3 h-3 bg-green-500 rounded-full"></Box>
                  <Typography variant="body2" className="text-green-600">
                    Online
                  </Typography>
                </Box>
              </Box>
              <Box className="flex items-center justify-between">
                <Typography variant="body2">Produktoptimierung:</Typography>
                <Box className="flex items-center gap-2">
                  <Box className="w-3 h-3 bg-yellow-500 rounded-full"></Box>
                  <Typography variant="body2" className="text-yellow-600">
                    In Entwicklung
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12,} md={6,}>
          <Paper className="p-6">
            <Typography variant="h6" className="mb-4">
              📊 AI-Features Übersicht
            </Typography>
            <Box className="space-y-3">
              <Box>
                <Typography variant="body2" className="font-medium">
                  ✅ Verfügbar
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  • Intelligente Barcode-Generierung<br/>
                  • Markttrend-Analyse<br/>
                  • Produktkategorisierung
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" className="font-medium">
                  🔄 In Entwicklung
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  • Erweiterte Produktoptimierung<br/>
                  • Predictive Analytics<br/>
                  • Automatische Bestellvorschläge
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar für Barcode-Auswahl */,}
      <Snackbar
        open={showSnackbar,}
        autoHideDuration={4000,}
        onClose={handleCloseSnackbar,}
        message={`Barcode "${selectedBarcode,}" wurde ausgewählt`}
      />
    </Container>
  );
}; 