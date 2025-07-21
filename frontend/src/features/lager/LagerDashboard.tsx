import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Alert, 
  Chip,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Warehouse as WarehouseIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  location: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: Date;
}

interface WarehouseLocation {
  id: string;
  name: string;
  type: 'storage' | 'picking' | 'shipping';
  capacity: number;
  used: number;
  status: 'active' | 'maintenance' | 'inactive';
}

const LagerDashboard: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLagerData();
  }, []);

  const loadLagerData = async () => {
    setLoading(true);
    try {
      // Simuliere API-Aufruf für Lager-Daten
      const mockInventory: InventoryItem[] = [
        {
          id: '1',
          name: 'Laptop Dell XPS 13',
          sku: 'LAP-DELL-XPS13',
          category: 'Elektronik',
          quantity: 25,
          minQuantity: 10,
          maxQuantity: 100,
          location: 'A-01-01',
          status: 'in_stock',
          lastUpdated: new Date()
        },
        {
          id: '2',
          name: 'USB-C Kabel',
          sku: 'CAB-USB-C-1M',
          category: 'Zubehör',
          quantity: 8,
          minQuantity: 15,
          maxQuantity: 200,
          location: 'B-02-03',
          status: 'low_stock',
          lastUpdated: new Date(Date.now() - 86400000)
        },
        {
          id: '3',
          name: 'Wireless Mouse',
          sku: 'MOU-WIRELESS-LOGI',
          category: 'Zubehör',
          quantity: 0,
          minQuantity: 5,
          maxQuantity: 50,
          location: 'B-02-04',
          status: 'out_of_stock',
          lastUpdated: new Date(Date.now() - 172800000)
        }
      ];

      const mockLocations: WarehouseLocation[] = [
        {
          id: '1',
          name: 'Lager A - Regal 1',
          type: 'storage',
          capacity: 1000,
          used: 750,
          status: 'active'
        },
        {
          id: '2',
          name: 'Kommissionierung Zone',
          type: 'picking',
          capacity: 500,
          used: 300,
          status: 'active'
        },
        {
          id: '3',
          name: 'Versand Zone',
          type: 'shipping',
          capacity: 200,
          used: 150,
          status: 'active'
        }
      ];

      setInventory(mockInventory);
      setLocations(mockLocations);
    } catch (err) {
      setError('Fehler beim Laden der Lager-Daten');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'success';
      case 'low_stock': return 'warning';
      case 'out_of_stock': return 'error';
      default: return 'default';
    }
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'storage': return 'primary';
      case 'picking': return 'secondary';
      case 'shipping': return 'success';
      default: return 'default';
    }
  };

  const getLocationStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const calculateUtilization = (used: number, capacity: number) => {
    return Math.round((used / capacity) * 100);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom className="flex items-center gap-2">
        <WarehouseIcon className="text-blue-600" />
        Lager Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom className="text-gray-600">
        Lagerverwaltung und Bestandsüberwachung
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Inventory Overview */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Bestandsübersicht
        </Typography>
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Box className="text-center p-4 bg-blue-50 rounded-lg">
            <InventoryIcon className="text-blue-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-blue-800">Artikel</Typography>
            <Typography variant="h4" className="text-blue-600">
              {inventory.length}
            </Typography>
          </Box>
          <Box className="text-center p-4 bg-green-50 rounded-lg">
            <TrendingUpIcon className="text-green-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-green-800">Verfügbar</Typography>
            <Typography variant="h4" className="text-green-600">
              {inventory.filter(item => item.status === 'in_stock').length}
            </Typography>
          </Box>
          <Box className="text-center p-4 bg-orange-50 rounded-lg">
            <LocalShippingIcon className="text-orange-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-orange-800">Niedrig</Typography>
            <Typography variant="h4" className="text-orange-600">
              {inventory.filter(item => item.status === 'low_stock').length}
            </Typography>
          </Box>
          <Box className="text-center p-4 bg-red-50 rounded-lg">
            <InventoryIcon className="text-red-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-red-800">Ausverkauft</Typography>
            <Typography variant="h4" className="text-red-600">
              {inventory.filter(item => item.status === 'out_of_stock').length}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Inventory Table */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h6">
            Bestand
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            Neuer Artikel
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell className="font-semibold">SKU</TableCell>
                <TableCell className="font-semibold">Name</TableCell>
                <TableCell className="font-semibold">Kategorie</TableCell>
                <TableCell className="font-semibold">Menge</TableCell>
                <TableCell className="font-semibold">Lagerplatz</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell className="font-semibold">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Typography variant="body1" className="font-medium">
                      {item.sku}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item.category}</Typography>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Typography variant="body2" className="font-medium">
                        {item.quantity}
                      </Typography>
                      <Typography variant="caption" className="text-gray-600">
                        Min: {item.minQuantity} | Max: {item.maxQuantity}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item.location}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.status === 'in_stock' ? 'Verfügbar' : 
                             item.status === 'low_stock' ? 'Niedrig' : 'Ausverkauft'}
                      size="small"
                      color={getStatusColor(item.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Box className="flex gap-1">
                      <Button
                        size="small"
                        variant="outlined"
                      >
                        Details
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                      >
                        Bewegung
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Warehouse Locations */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Lagerplätze
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell className="font-semibold">Name</TableCell>
                <TableCell className="font-semibold">Typ</TableCell>
                <TableCell className="font-semibold">Auslastung</TableCell>
                <TableCell className="font-semibold">Kapazität</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell className="font-semibold">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locations.map((location) => (
                <TableRow key={location.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Typography variant="body1" className="font-medium">
                      {location.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={location.type === 'storage' ? 'Lagerung' :
                             location.type === 'picking' ? 'Kommissionierung' : 'Versand'}
                      size="small"
                      color={getLocationTypeColor(location.type) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <Typography variant="body2" className="font-medium">
                        {location.used} / {location.capacity}
                      </Typography>
                      <Typography variant="caption" className="text-gray-600">
                        {calculateUtilization(location.used, location.capacity)}% ausgelastet
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {location.capacity} Einheiten
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={location.status === 'active' ? 'Aktiv' :
                             location.status === 'maintenance' ? 'Wartung' : 'Inaktiv'}
                      size="small"
                      color={getLocationStatusColor(location.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Box className="flex gap-1">
                      <Button
                        size="small"
                        variant="outlined"
                      >
                        Details
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                      >
                        Inventur
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Actions */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={loadLagerData}
          disabled={loading}
        >
          Daten aktualisieren
        </Button>
        <Button variant="outlined" startIcon={<SearchIcon />}>
          Artikel suchen
        </Button>
        <Button variant="outlined">
          Inventur starten
        </Button>
      </Box>
    </Box>
  );
};

export default LagerDashboard; 