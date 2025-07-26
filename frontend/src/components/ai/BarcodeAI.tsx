import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

interface BarcodeSuggestion {
  id: string;
  product_name: string;
  suggested_barcode: string;
  confidence_score: number;
  reasoning: string;
  category: string;
  similar_products: string[];
  market_trends: {
    demand_trend: string;
    price_trend: string;
    seasonality: string;
  };
  created_at: string;
}

interface BarcodeAIProps {
  onBarcodeSelect?: (barcode: string) => void;
}

export const BarcodeAI: React.FC<BarcodeAIProps> = ({ onBarcodeSelect }) => {
  const [productName, setProductName] = useState('');
  const [suggestions, setSuggestions] = useState<BarcodeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiHealth, setAiHealth] = useState<boolean | null>(null);

  // Prüfe AI-Service Health beim Laden
  useEffect(() => {
    checkAIHealth();
  }, []);

  const checkAIHealth = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/ai/barcode/health');
      if (response.ok) {
        setAiHealth(true);
      } else {
        setAiHealth(false);
      }
    } catch (err) {
      setAiHealth(false);
    }
  };

  const getBarcodeSuggestions = async () => {
    if (!productName.trim()) {
      setError('Bitte geben Sie einen Produktnamen ein');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/ai/barcode/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_name: productName }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Barcode-Vorschläge');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeSelect = (barcode: string) => {
    onBarcodeSelect?.(barcode);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'steigend':
        return <TrendingUpIcon color="success" />;
      case 'fallend':
        return <TrendingUpIcon sx={{ transform: 'rotate(180deg)', color: 'error.main' }} />;
      default:
        return <TrendingUpIcon color="info" />;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <Box className="flex items-center gap-3 mb-6">
          <AutoAwesomeIcon color="primary" fontSize="large" />
          <Typography variant="h5" component="h2" className="font-semibold">
            AI-Barcode Generator
          </Typography>
          {aiHealth !== null && (
            <Chip
              label={aiHealth ? 'AI Service Online' : 'AI Service Offline'}
              color={aiHealth ? 'success' : 'error'}
              size="small"
            />
          )}
        </Box>

        {/* Eingabe-Bereich */}
        <Paper className="p-4 mb-6 bg-gray-50">
          <Typography variant="h6" className="mb-3">
            Produkt für Barcode-Vorschläge
          </Typography>
          <Box className="flex gap-3">
            <TextField
              fullWidth
              label="Produktname"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="z.B. iPhone 15 Pro, Harry Potter Box Set"
              variant="outlined"
              onKeyPress={(e) => e.key === 'Enter' && getBarcodeSuggestions()}
            />
            <Button
              variant="contained"
              onClick={getBarcodeSuggestions}
              disabled={loading || !productName.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <QrCodeIcon />}
              className="min-w-[140px]"
            >
              {loading ? 'Analysiere...' : 'Vorschläge'}
            </Button>
          </Box>
        </Paper>

        {/* Fehler-Anzeige */}
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Vorschläge */}
        {suggestions.length > 0 && (
          <Box>
            <Typography variant="h6" className="mb-4">
              AI-Barcode Vorschläge ({suggestions.length})
            </Typography>
            <Grid container spacing={3}>
              {suggestions.map((suggestion) => (
                <Grid item xs={12} md={6} key={suggestion.id}>
                  <Paper className="p-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                    <Box className="flex justify-between items-start mb-3">
                      <Typography variant="h6" className="font-medium">
                        {suggestion.product_name}
                      </Typography>
                      <Chip
                        label={`${(suggestion.confidence_score * 100).toFixed(0)}%`}
                        color={getConfidenceColor(suggestion.confidence_score) as any}
                        size="small"
                      />
                    </Box>

                    <Box className="mb-3">
                      <Typography variant="body2" className="text-gray-600 mb-2">
                        <strong>Vorgeschlagener Barcode:</strong>
                      </Typography>
                      <Typography
                        variant="h6"
                        className="font-mono bg-gray-100 p-2 rounded"
                        component="code"
                      >
                        {suggestion.suggested_barcode}
                      </Typography>
                    </Box>

                    <Box className="mb-3">
                      <Typography variant="body2" className="text-gray-600 mb-1">
                        <strong>Begründung:</strong>
                      </Typography>
                      <Typography variant="body2">
                        {suggestion.reasoning}
                      </Typography>
                    </Box>

                    <Box className="flex items-center gap-2 mb-3">
                      <CategoryIcon fontSize="small" color="action" />
                      <Chip
                        label={suggestion.category}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {/* Markt-Trends */}
                    <Box className="mb-3">
                      <Typography variant="body2" className="text-gray-600 mb-2">
                        <strong>Markt-Trends:</strong>
                      </Typography>
                      <Box className="flex gap-2 flex-wrap">
                        <Chip
                          label={`Nachfrage: ${suggestion.market_trends.demand_trend}`}
                          size="small"
                          icon={getTrendIcon(suggestion.market_trends.demand_trend)}
                        />
                        <Chip
                          label={`Preis: ${suggestion.market_trends.price_trend}`}
                          size="small"
                          icon={getTrendIcon(suggestion.market_trends.price_trend)}
                        />
                        <Chip
                          label={`Saisonalität: ${suggestion.market_trends.seasonality}`}
                          size="small"
                        />
                      </Box>
                    </Box>

                    {/* Ähnliche Produkte */}
                    {suggestion.similar_products.length > 0 && (
                      <Box className="mb-3">
                        <Typography variant="body2" className="text-gray-600 mb-1">
                          <strong>Ähnliche Produkte:</strong>
                        </Typography>
                        <Box className="flex gap-1 flex-wrap">
                          {suggestion.similar_products.map((product, index) => (
                            <Chip
                              key={index}
                              label={product}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Divider className="my-3" />

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleBarcodeSelect(suggestion.suggested_barcode)}
                      startIcon={<QrCodeIcon />}
                    >
                      Barcode verwenden
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Info-Bereich */}
        {suggestions.length === 0 && !loading && !error && (
          <Paper className="p-4 bg-blue-50">
            <Typography variant="body2" className="text-blue-800">
              <strong>💡 Tipp:</strong> Geben Sie einen Produktnamen ein, um intelligente 
              Barcode-Vorschläge basierend auf KI-Analyse zu erhalten. Das System berücksichtigt 
              Produktkategorien, Markttrends und ähnliche Produkte für optimale Empfehlungen.
            </Typography>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
}; 