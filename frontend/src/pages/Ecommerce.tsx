import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Tab, 
  Tabs, 
  Typography, 
  Paper, 
  AppBar, 
  Toolbar, 
  Breadcrumbs, 
  Link, 
  useTheme,
  Button,
  Divider,
  Grid
} from '@mui/material';
import { 
  Home as HomeIcon, 
  ShoppingCart as CartIcon, 
  Category as CategoryIcon, 
  Store as StoreIcon, 
  Payment as PaymentIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import ProductList from '../components/ecommerce/ProductList';
import ProductCategories from '../components/ecommerce/ProductCategories';
import Cart from '../components/ecommerce/Cart';
import Checkout from '../components/ecommerce/Checkout';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ecommerce-tabpanel-${index}`}
      aria-labelledby={`ecommerce-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `ecommerce-tab-${index}`,
    'aria-controls': `ecommerce-tabpanel-${index}`,
  };
}

const Ecommerce: React.FC = () => {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleAddToCart = (product: any) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (productId: number) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    
    setCartItems(cartItems.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  // Tabinhalte mit Icons
  const tabContent = [
    { 
      label: 'Produkte', 
      icon: <StoreIcon sx={{ mr: 1 }} fontSize="small" /> 
    },
    { 
      label: 'Kategorien', 
      icon: <CategoryIcon sx={{ mr: 1 }} fontSize="small" /> 
    },
    { 
      label: 'Warenkorb', 
      icon: <CartIcon sx={{ mr: 1 }} fontSize="small" /> 
    },
    { 
      label: 'Checkout', 
      icon: <PaymentIcon sx={{ mr: 1 }} fontSize="small" /> 
    }
  ];

  return (
    <Box sx={{ backgroundColor: '#f9f9f9', minHeight: '100vh', pt: 3, pb: 6 }}>
      {/* Breadcrumb-Navigation */}
      <Container maxWidth="lg">
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
          <Typography 
            color="text.primary"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <StoreIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            E-Commerce
          </Typography>
        </Breadcrumbs>

        {/* Seitenkopf im Odoo-Stil */}
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
                E-Commerce-Verwaltung
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Verwalten Sie Ihren Online-Shop direkt aus Ihrem ERP-System heraus. Erfassen Sie Produkte, 
                bearbeiten Sie Kategorien und verfolgen Sie Bestellungen an einem zentralen Ort.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button 
                variant="contained" 
                color="secondary" 
                startIcon={<CartIcon />}
                onClick={() => setValue(2)}
                sx={{ mr: 1 }}
              >
                Zum Warenkorb
              </Button>
              <Button 
                variant="outlined"
                onClick={() => setValue(0)}
              >
                Produkte ansehen
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs im Odoo-Stil */}
        <Paper elevation={0} sx={{ borderRadius: '4px', overflow: 'hidden', mb: 4, border: '1px solid', borderColor: 'divider' }}>
          <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'white' }}>
            <Toolbar variant="dense" disableGutters>
              <Tabs 
                value={value} 
                onChange={handleChange} 
                aria-label="e-commerce tabs"
                variant="scrollable"
                scrollButtons="auto"
                sx={{ 
                  '& .MuiTab-root': {
                    minHeight: '48px',
                    color: theme.palette.text.secondary,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  },
                  '& .Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                  }
                }}
              >
                {tabContent.map((tab, index) => (
                  <Tab 
                    key={index}
                    icon={tab.icon} 
                    label={tab.label} 
                    iconPosition="start"
                    {...a11yProps(index)} 
                  />
                ))}
              </Tabs>
            </Toolbar>
          </AppBar>
          
          <Divider />
          
          <TabPanel value={value} index={0}>
            <ProductList 
              categoryFilter={selectedCategory}
              onAddToCart={handleAddToCart}
            />
          </TabPanel>
          
          <TabPanel value={value} index={1}>
            <ProductCategories onCategorySelect={handleCategorySelect} />
          </TabPanel>
          
          <TabPanel value={value} index={2}>
            <Cart 
              items={cartItems} 
              onRemoveItem={handleRemoveFromCart}
              onUpdateQuantity={handleUpdateQuantity}
              onCheckout={() => setValue(3)}
            />
          </TabPanel>
          
          <TabPanel value={value} index={3}>
            <Checkout items={cartItems} />
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default Ecommerce; 