import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Clear as ClearIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Euro as EuroIcon,
  LocalOffer as DiscountIcon
} from '@mui/icons-material';

interface Product {
  artikel_nr: string;
  bezeichnung: string;
  kurztext: string;
  verkaufspreis_netto: number;
  verkaufspreis_brutto: number;
  mwst_satz: number;
  einheit: string;
  lagerbestand: number;
  ean_code?: string;
  kategorie?: string;
  bild_url?: string;
  aktiv: boolean;
}

interface CartItem {
  artikel_nr: string;
  bezeichnung: string;
  menge: number;
  einzelpreis_netto: number;
  einzelpreis_brutto: number;
  gesamtpreis_netto: number;
  gesamtpreis_brutto: number;
  mwst_satz: number;
  mwst_betrag: number;
  einheit: string;
  ean_code?: string;
}

interface PaymentMethod {
  value: string;
  label: string;
  description: string;
}

const POSPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('bar');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Lade Produkte beim Start
  useEffect(() => {
    loadProducts();
    loadPaymentMethods();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pos/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError('Fehler beim Laden der Produkte');
      }
    } catch (err) {
      setError('Verbindungsfehler');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await fetch('/api/pos/payment-methods');
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.payment_methods);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Zahlungsarten:', err);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      const response = await fetch('/api/pos/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artikel_nr: product.artikel_nr,
          menge: quantity
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Warenkorb aktualisieren
        loadCart();
      } else {
        setError('Fehler beim Hinzufügen zum Warenkorb');
      }
    } catch (err) {
      setError('Verbindungsfehler');
    }
  };

  const removeFromCart = async (artikelNr: string, quantity?: number) => {
    try {
      const response = await fetch('/api/pos/cart/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artikel_nr: artikelNr,
          menge: quantity
        })
      });

      if (response.ok) {
        loadCart();
      } else {
        setError('Fehler beim Entfernen aus dem Warenkorb');
      }
    } catch (err) {
      setError('Verbindungsfehler');
    }
  };

  const loadCart = async () => {
    try {
      const response = await fetch('/api/pos/cart');
      if (response.ok) {
        const data = await response.json();
        setCart(data.items);
      }
    } catch (err) {
      console.error('Fehler beim Laden des Warenkorbs:', err);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('/api/pos/cart/clear', {
        method: 'POST'
      });

      if (response.ok) {
        setCart([]);
      } else {
        setError('Fehler beim Leeren des Warenkorbs');
      }
    } catch (err) {
      setError('Verbindungsfehler');
    }
  };

  const applyDiscount = async () => {
    try {
      const response = await fetch('/api/pos/cart/discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rabatt_prozent: discountPercent
        })
      });

      if (response.ok) {
        loadCart();
        setDiscountDialogOpen(false);
        setDiscountPercent(0);
      } else {
        setError('Fehler beim Anwenden des Rabatts');
      }
    } catch (err) {
      setError('Verbindungsfehler');
    }
  };

  const createSale = async () => {
    try {
      const response = await fetch('/api/pos/sale/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zahlungsart: selectedPaymentMethod
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentDialogOpen(false);
        setCart([]);
        // Erfolgsmeldung anzeigen
        alert('Verkauf erfolgreich abgeschlossen!');
      } else {
        setError('Fehler beim Erstellen der Verkaufstransaktion');
      }
    } catch (err) {
      setError('Verbindungsfehler');
    }
  };

  const getCartTotal = () => {
    const netto = cart.reduce((sum, item) => sum + item.gesamtpreis_netto, 0);
    const brutto = cart.reduce((sum, item) => sum + item.gesamtpreis_brutto, 0);
    const mwst = cart.reduce((sum, item) => sum + item.mwst_betrag, 0);
    
    return { netto, brutto, mwst, anzahl: cart.length };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.bezeichnung.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.artikel_nr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.kategorie === selectedCategory;
    return matchesSearch && matchesCategory && product.aktiv;
  });

  const categories = [...new Set(products.map(p => p.kategorie).filter(Boolean))];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>
        VALEO NeuroERP - Kassensystem
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
        {/* Linke Seite - Produkte */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Suchleiste und Filter */}
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      placeholder="Artikel suchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Kategorie</InputLabel>
                      <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        label="Kategorie"
                      >
                        <MenuItem value="">Alle Kategorien</MenuItem>
                        {categories.map(category => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              {/* Produktgrid */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {filteredProducts.map((product) => (
                      <Grid item xs={6} sm={4} md={3} key={product.artikel_nr}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { boxShadow: 3 },
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                          onClick={() => addToCart(product)}
                        >
                          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" noWrap>
                              {product.bezeichnung}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {product.kurztext}
                            </Typography>
                            <Typography variant="h6" color="primary" sx={{ mt: 'auto' }}>
                              {product.verkaufspreis_brutto.toFixed(2)}€
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {product.artikel_nr} • {product.einheit}
                            </Typography>
                            {product.lagerbestand <= 0 && (
                              <Chip 
                                label="Nicht verfügbar" 
                                color="error" 
                                size="small" 
                                sx={{ mt: 1 }}
                              />
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Rechte Seite - Warenkorb */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CartIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Warenkorb</Typography>
                <Box sx={{ ml: 'auto' }}>
                  <IconButton onClick={clearCart} size="small">
                    <ClearIcon />
                  </IconButton>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Warenkorb-Artikel */}
              <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                {cart.length === 0 ? (
                  <Typography color="text.secondary" align="center">
                    Warenkorb ist leer
                  </Typography>
                ) : (
                  cart.map((item) => (
                    <Card key={item.artikel_nr} sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" noWrap>
                              {item.bezeichnung}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.menge} {item.einheit} x {item.einzelpreis_brutto.toFixed(2)}€
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ mr: 1 }}>
                              {item.gesamtpreis_brutto.toFixed(2)}€
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => removeFromCart(item.artikel_nr)}
                            >
                              <RemoveIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Gesamtsumme */}
              <Box sx={{ mb: 2 }}>
                {(() => {
                  const total = getCartTotal();
                  return (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Zwischensumme:</Typography>
                        <Typography>{total.netto.toFixed(2)}€</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>MwSt.:</Typography>
                        <Typography>{total.mwst.toFixed(2)}€</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">Gesamt:</Typography>
                        <Typography variant="h6">{total.brutto.toFixed(2)}€</Typography>
                      </Box>
                    </>
                  );
                })()}
              </Box>

              {/* Aktions-Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<DiscountIcon />}
                  onClick={() => setDiscountDialogOpen(true)}
                  disabled={cart.length === 0}
                  fullWidth
                >
                  Rabatt
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PaymentIcon />}
                  onClick={() => setPaymentDialogOpen(true)}
                  disabled={cart.length === 0}
                  fullWidth
                  size="large"
                >
                  Bezahlen ({getCartTotal().brutto.toFixed(2)}€)
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Zahlungsdialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Zahlung abschließen</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Gesamtbetrag: {getCartTotal().brutto.toFixed(2)}€
            </Typography>
          </Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Zahlungsart</InputLabel>
            <Select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              label="Zahlungsart"
            >
              {paymentMethods.map(method => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={createSale} variant="contained">
            Verkauf abschließen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rabattdialog */}
      <Dialog open={discountDialogOpen} onClose={() => setDiscountDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rabatt anwenden</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Rabatt in Prozent"
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
            inputProps={{ min: 0, max: 100, step: 0.1 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscountDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={applyDiscount} variant="contained">
            Rabatt anwenden
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default POSPage; 