import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Box, 
  Grid, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Chip, 
  TextField, 
  Paper, 
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  Divider,
  Rating,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  ShoppingCart as ShoppingCartIcon, 
  ArrowBack as ArrowBackIcon,
  Inventory2 as InventoryIcon,
  LocalOffer as PriceIcon,
  Category as CategoryIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  category_name: string;
  stock_quantity: number;
  average_rating: number;
  rating_count: number;
}

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const productResponse = await axios.get(`http://localhost:8002/api/v1/produkte/${id}`);
        setProduct(productResponse.data);
        
        // Reviews laden
        try {
          const reviewsResponse = await axios.get(`http://localhost:8002/api/v1/produkte/${id}/reviews`);
          setReviews(reviewsResponse.data);
        } catch (err) {
          console.error('Fehler beim Laden der Bewertungen:', err);
          // Wir setzen keinen Fehler, da Reviews optional sind
        }
        
        setLoading(false);
      } catch (err) {
        setError('Fehler beim Laden der Produktdetails');
        setLoading(false);
        console.error('Fehler beim Laden der Produktdetails:', err);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && product && value <= product.stock_quantity) {
      setQuantity(value);
    }
  };

  const addToCart = async () => {
    if (!product) return;
    
    try {
      await axios.post('http://localhost:8002/api/v1/warenkorb/add', {
        product_id: product.id,
        quantity: quantity
      });
      navigate('/cart');
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

  if (error || !product) {
    return <Alert severity="error" sx={{ mt: 3, mb: 3 }}>{error || 'Produkt nicht gefunden'}</Alert>;
  }

  return (
    <Box sx={{ backgroundColor: '#f9f9f9', minHeight: '100vh', pt: 3, pb: 6 }}>
      <Container maxWidth="lg">
        {/* Breadcrumb-Navigation */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 3 }}
        >
          <Link 
            color="inherit" 
            href="/" 
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Link
            color="inherit"
            href="/ecommerce"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <StoreIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            E-Commerce
          </Link>
          <Typography color="text.primary">
            {product.name}
          </Typography>
        </Breadcrumbs>

        {/* Produktkopf im Odoo-Stil */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            bgcolor: 'white',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '4px'
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" component="h1" gutterBottom color="primary.main">
                {product.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating 
                  value={product.average_rating} 
                  precision={0.5} 
                  readOnly 
                  size="small"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({product.average_rating.toFixed(1)}) {product.rating_count} {product.rating_count === 1 ? 'Bewertung' : 'Bewertungen'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip 
                  icon={<CategoryIcon fontSize="small" />} 
                  label={product.category_name} 
                  size="small" 
                  color="default" 
                />
                <Chip 
                  icon={<InventoryIcon fontSize="small" />} 
                  label={product.stock_quantity > 0 ? `${product.stock_quantity} auf Lager` : 'Nicht verfügbar'} 
                  size="small" 
                  color={product.stock_quantity > 0 ? 'success' : 'error'} 
                />
                <Chip 
                  icon={<PriceIcon fontSize="small" />} 
                  label={`${product.price.toFixed(2)} €`} 
                  size="small" 
                  color="primary" 
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Tooltip title="Zurück zu allen Produkten">
                <IconButton 
                  color="primary" 
                  onClick={() => navigate('/ecommerce')}
                  sx={{ mr: 1 }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {/* Produktbild */}
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 2, 
                mb: { xs: 3, md: 0 },
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {product.image_url ? (
                <Box 
                  component="img"
                  src={product.image_url}
                  alt={product.name}
                  sx={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    borderRadius: 1
                  }}
                />
              ) : (
                <Box 
                  sx={{ 
                    bgcolor: '#f5f5f5', 
                    p: 5, 
                    width: '100%', 
                    height: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Kein Bild verfügbar
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* Produktdetails */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Produktbeschreibung
              </Typography>
              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              {product.stock_quantity > 0 ? (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Menge
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 3 }}>
                    <TextField
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      inputProps={{ 
                        min: 1, 
                        max: product.stock_quantity,
                        sx: { textAlign: 'center' }
                      }}
                      sx={{ width: '100px', mr: 2 }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ShoppingCartIcon />}
                      onClick={addToCart}
                      fullWidth
                    >
                      In den Warenkorb
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Alert severity="warning">
                  Dieses Produkt ist derzeit nicht verfügbar.
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Kundenbewertungen */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Kundenbewertungen
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {reviews.length === 0 ? (
            <Alert severity="info">
              Dieses Produkt hat noch keine Bewertungen.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {reviews.map(review => (
                <Grid item xs={12} md={6} key={review.id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                            {review.user_name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="subtitle2">
                            {review.user_name}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Rating 
                        value={review.rating} 
                        readOnly 
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      
                      <Typography variant="body2">
                        {review.comment}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ProductDetail; 