import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Container, 
  Box, 
  CircularProgress, 
  Alert,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import { ShoppingCart, LocalOffer, Inventory2 } from '@mui/icons-material';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  stock_quantity: number;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8002/api/v1/produkte');
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Fehler beim Laden der Produkte');
        setLoading(false);
        console.error('Fehler beim Laden der Produkte:', err);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = async (productId: number) => {
    try {
      await axios.post('http://localhost:8002/api/v1/warenkorb/add', { product_id: productId, quantity: 1 });
      // Benachrichtigung oder Feedback hier einfügen
    } catch (err) {
      console.error('Fehler beim Hinzufügen zum Warenkorb:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 3, mb: 3 }}>{error}</Alert>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          backgroundColor: '#f9f9f9', 
          borderLeft: '4px solid #7C7BAD' 
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Unsere Produkte
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Entdecken Sie unsere Auswahl an hochwertigen Produkten
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                }
              }}
            >
              {product.image_url && (
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image_url}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {product.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip 
                    icon={<LocalOffer fontSize="small" />} 
                    label={`${product.price.toFixed(2)} €`} 
                    color="primary" 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip 
                    icon={<Inventory2 fontSize="small" />} 
                    label={product.stock_quantity > 0 ? 'Auf Lager' : 'Nicht verfügbar'} 
                    color={product.stock_quantity > 0 ? 'success' : 'error'} 
                    variant="outlined"
                    size="small"
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  startIcon={<ShoppingCart />}
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock_quantity <= 0}
                >
                  {product.stock_quantity > 0 ? 'In den Warenkorb' : 'Nicht verfügbar'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ProductList; 