import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  CircularProgress,
  Button,
  Alert,
  Grid,
  TextField,
  InputAdornment,
  Paper,
  Divider,
  Chip,
  IconButton,
  Tabs,
  Tab,
  CardActionArea,
  CardActions,
  CardMedia
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import api from '../../services/api';

const ArtikelKatalog = ({ kundenNr }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [artikel, setArtikel] = useState([]);
  const [empfehlungen, setEmpfehlungen] = useState([]);
  const [suchbegriff, setSuchbegriff] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const fetchArtikel = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/wws/artikel/');
      setArtikel(response.data);
      setError(null);
    } catch (err) {
      setError('Fehler beim Abrufen der Artikel. Bitte versuchen Sie es später erneut.');
      console.error('Artikel Fehler:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmpfehlungen = async () => {
    if (!kundenNr) return;
    
    try {
      const response = await api.get(`/api/v1/wws/artikel/empfehlungen/${kundenNr}`);
      setEmpfehlungen(response.data);
    } catch (err) {
      console.error('Empfehlungen Fehler:', err);
    }
  };

  useEffect(() => {
    fetchArtikel();
    if (kundenNr) {
      fetchEmpfehlungen();
    }
  }, [kundenNr]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearch = (event) => {
    setSuchbegriff(event.target.value);
  };

  const filteredArtikel = artikel.filter((item) => {
    if (!suchbegriff) return true;
    
    const searchLower = suchbegriff.toLowerCase();
    return (
      (item.artikelnr && item.artikelnr.toLowerCase().includes(searchLower)) ||
      (item.bezeichn1 && item.bezeichn1.toLowerCase().includes(searchLower)) ||
      (item.bezeichn2 && item.bezeichn2.toLowerCase().includes(searchLower)) ||
      (item.warengruppe && item.warengruppe.toLowerCase().includes(searchLower))
    );
  });

  const renderArtikelKarte = (artikel) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea>
        <CardMedia
          component="div"
          sx={{
            height: 140,
            bgcolor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Art.-Nr.: {artikel.artikelnr}
          </Typography>
        </CardMedia>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {artikel.bezeichn1}
          </Typography>
          {artikel.bezeichn2 && (
            <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
              {artikel.bezeichn2}
            </Typography>
          )}
          <Divider sx={{ my: 1 }} />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">
              <strong>Preis:</strong> {artikel.vk1?.toFixed(2)} €
            </Typography>
            <Chip 
              size="small" 
              label={artikel.warengruppe || 'Keine Gruppe'} 
              color="primary"
              icon={<LocalOfferIcon />}
            />
          </Box>
          <Box mt={1}>
            <Typography variant="body2">
              <strong>Bestand:</strong> {artikel.bestand || 0} {artikel.einheit || 'Stk.'}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button 
          size="small" 
          startIcon={<AddShoppingCartIcon />}
          fullWidth
        >
          Zum Warenkorb
        </Button>
      </CardActions>
    </Card>
  );

  if (loading && artikel.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="Artikel Tabs"
        >
          <Tab label="Alle Artikel" />
          {kundenNr && <Tab label="Empfehlungen" />}
        </Tabs>
      </Paper>

      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Artikel suchen..."
          value={suchbegriff}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton>
                  <FilterListIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {tabValue === 0 ? (
        <>
          <Typography variant="h6" gutterBottom>
            Artikel ({filteredArtikel.length})
          </Typography>
          <Grid container spacing={3}>
            {filteredArtikel.map((artikel) => (
              <Grid item key={artikel.id} xs={12} sm={6} md={4} lg={3}>
                {renderArtikelKarte(artikel)}
              </Grid>
            ))}
            {filteredArtikel.length === 0 && (
              <Grid item xs={12}>
                <Box textAlign="center" py={4}>
                  <Typography variant="body1">Keine Artikel gefunden</Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                  >
                    Neuen Artikel anlegen
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            Empfehlungen für Kunde {kundenNr}
          </Typography>
          <Grid container spacing={3}>
            {empfehlungen.map((artikel) => (
              <Grid item key={artikel.id} xs={12} sm={6} md={4} lg={3}>
                {renderArtikelKarte(artikel)}
              </Grid>
            ))}
            {empfehlungen.length === 0 && (
              <Grid item xs={12}>
                <Box textAlign="center" py={4}>
                  <Typography variant="body1">Keine Empfehlungen verfügbar</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default ArtikelKatalog; 