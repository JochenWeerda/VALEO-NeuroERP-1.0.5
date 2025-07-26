import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Alert,
  Chip
} from '@mui/material';
import { Table, Input, Space, Tag } from 'antd';
import { SearchOutlined, FilterOutlined, ShoppingCartOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// TypeScript Interfaces
export interface OrderSuggestionData {
  // Kopfbereich
  articleGroup: string;
  branch: string;
  articleNumber: string;
  description1: string;
  description2: string;
  storageLocation: string;
  matchcode: string;
  matchcode2: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  sales: number;
  suggestion: number;
  
  // Tabellendaten
  warehouse: string;
  stock: number;
  purchase: number;
}

export interface OrderSuggestionFilters {
  articleGroup?: string;
  branch?: string;
  searchTerm?: string;
}

export interface OrderSuggestionProps {
  onSuggestionSelect: (suggestion: OrderSuggestionData) => void;
  onOrderCreate: (order: OrderData) => void;
  filters: OrderSuggestionFilters;
}

export interface OrderData {
  id: string;
  items: OrderSuggestionData[];
  totalAmount: number;
  createdAt: Date;
}

// Validierungsschema
const filterSchema = yup.object({
  articleGroup: yup.string(),
  branch: yup.string(),
  searchTerm: yup.string()
});

// Mock-Daten für Demonstration
const mockSuggestions: OrderSuggestionData[] = [
  {
    articleGroup: 'Elektronik',
    branch: 'Hauptniederlassung',
    articleNumber: 'ART-001',
    description1: 'Laptop Dell XPS 13',
    description2: '13 Zoll, Intel i7, 16GB RAM',
    storageLocation: 'A-01-01',
    matchcode: 'LAPTOP-DELL-XPS13',
    matchcode2: 'DELL-XPS-13',
    currentStock: 5,
    minStock: 10,
    maxStock: 50,
    sales: 15,
    suggestion: 20,
    warehouse: 'Hauptlager',
    stock: 5,
    purchase: 20
  },
  {
    articleGroup: 'Bürobedarf',
    branch: 'Hauptniederlassung',
    articleNumber: 'ART-002',
    description1: 'Drucker HP LaserJet',
    description2: 'Schwarz-Weiß, 30 Seiten/Min',
    storageLocation: 'B-02-03',
    matchcode: 'DRUCKER-HP-LASERJET',
    matchcode2: 'HP-LASERJET',
    currentStock: 2,
    minStock: 5,
    maxStock: 20,
    sales: 8,
    suggestion: 15,
    warehouse: 'Hauptlager',
    stock: 2,
    purchase: 15
  }
];

const articleGroups = ['Elektronik', 'Bürobedarf', 'Möbel', 'Software'];
const branches = ['Hauptniederlassung', 'Niederlassung Nord', 'Niederlassung Süd'];

export const OrderSuggestion: React.FC<OrderSuggestionProps> = ({
  onSuggestionSelect,
  onOrderCreate,
  filters
}) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState<OrderSuggestionData[]>([]);
  const [searchText, setSearchText] = useState('');

  const { control, handleSubmit, watch } = useForm<OrderSuggestionFilters>({
    resolver: yupResolver(filterSchema),
    defaultValues: filters
  });

  const watchedFilters = watch();

  // Gefilterte Vorschläge
  const filteredSuggestions = useMemo(() => {
    return mockSuggestions.filter(suggestion => {
      const matchesArticleGroup = !watchedFilters.articleGroup || 
        suggestion.articleGroup === watchedFilters.articleGroup;
      const matchesBranch = !watchedFilters.branch || 
        suggestion.branch === watchedFilters.branch;
      const matchesSearch = !searchText || 
        suggestion.description1.toLowerCase().includes(searchText.toLowerCase()) ||
        suggestion.articleNumber.toLowerCase().includes(searchText.toLowerCase());

      return matchesArticleGroup && matchesBranch && matchesSearch;
    });
  }, [watchedFilters, searchText]);

  // Ant Design Table Spalten
  const columns = [
    {
      title: 'Artikel-Nr.',
      dataIndex: 'articleNumber',
      key: 'articleNumber',
      sorter: (a: OrderSuggestionData, b: OrderSuggestionData) => 
        a.articleNumber.localeCompare(b.articleNumber),
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Beschreibung',
      dataIndex: 'description1',
      key: 'description1',
      render: (text: string, record: OrderSuggestionData) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '0.8em', color: '#666' }}>
            {record.description2}
          </div>
        </div>
      )
    },
    {
      title: 'Lagerort',
      dataIndex: 'storageLocation',
      key: 'storageLocation',
      render: (text: string) => <Chip label={text} size="small" />
    },
    {
      title: 'Aktueller Bestand',
      dataIndex: 'currentStock',
      key: 'currentStock',
      sorter: (a: OrderSuggestionData, b: OrderSuggestionData) => 
        a.currentStock - b.currentStock,
      render: (value: number, record: OrderSuggestionData) => (
        <div>
          <span style={{ 
            color: value < record.minStock ? '#f44336' : 
                   value > record.maxStock ? '#ff9800' : '#4caf50' 
          }}>
            {value}
          </span>
          <div style={{ fontSize: '0.8em', color: '#666' }}>
            Min: {record.minStock} | Max: {record.maxStock}
          </div>
        </div>
      )
    },
    {
      title: 'Verkauf',
      dataIndex: 'sales',
      key: 'sales',
      sorter: (a: OrderSuggestionData, b: OrderSuggestionData) => 
        a.sales - b.sales
    },
    {
      title: 'Vorschlag',
      dataIndex: 'suggestion',
      key: 'suggestion',
      sorter: (a: OrderSuggestionData, b: OrderSuggestionData) => 
        a.suggestion - b.suggestion,
      render: (value: number) => (
        <Tag color="blue">{value}</Tag>
      )
    },
    {
      title: 'Aktionen',
      key: 'actions',
      render: (record: OrderSuggestionData) => (
        <Space>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onSuggestionSelect(record)}
          >
            Übernehmen
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              if (!selectedSuggestions.find(s => s.articleNumber === record.articleNumber)) {
                setSelectedSuggestions([...selectedSuggestions, record]);
              }
            }}
          >
            Auswählen
          </Button>
        </Space>
      )
    }
  ];

  const handleOrderCreate = () => {
    if (selectedSuggestions.length > 0) {
      const order: OrderData = {
        id: `ORDER-${Date.now()}`,
        items: selectedSuggestions,
        totalAmount: selectedSuggestions.reduce((sum, item) => sum + item.suggestion, 0),
        createdAt: new Date()
      };
      onOrderCreate(order);
      setSelectedSuggestions([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Kopfbereich */}
      <Card className="p-6">
        <Typography variant="h5" className="mb-4">
          Bestellvorschlag
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Controller
              name="articleGroup"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Artikel-Gruppe</InputLabel>
                  <Select {...field} label="Artikel-Gruppe">
                    <MenuItem value="">Alle Gruppen</MenuItem>
                    {articleGroups.map(group => (
                      <MenuItem key={group} value={group}>{group}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Controller
              name="branch"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Niederlassung</InputLabel>
                  <Select {...field} label="Niederlassung">
                    <MenuItem value="">Alle Niederlassungen</MenuItem>
                    {branches.map(branch => (
                      <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Suche"
              placeholder="Artikel-Nr. oder Beschreibung..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: <SearchOutlined className="mr-2" />
              }}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Ausgewählte Vorschläge */}
      {selectedSuggestions.length > 0 && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">
              Ausgewählte Vorschläge ({selectedSuggestions.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<ShoppingCartOutlined />}
              onClick={handleOrderCreate}
            >
              Bestellung erstellen
            </Button>
          </div>
          
          <div className="space-y-2">
            {selectedSuggestions.map((suggestion, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <strong>{suggestion.articleNumber}</strong> - {suggestion.description1}
                </div>
                <div className="flex items-center space-x-4">
                  <span>Vorschlag: {suggestion.suggestion}</span>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setSelectedSuggestions(
                      selectedSuggestions.filter((_, i) => i !== index)
                    )}
                  >
                    Entfernen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Vorschlags-Tabelle */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">
            Bestellvorschläge ({filteredSuggestions.length})
          </Typography>
          <div className="flex items-center space-x-2">
            <FilterOutlined />
            <span className="text-sm text-gray-600">Gefiltert</span>
          </div>
        </div>

        {filteredSuggestions.length === 0 ? (
          <Alert severity="info">
            Keine Bestellvorschläge gefunden. Passen Sie die Filter an.
          </Alert>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredSuggestions}
            rowKey="articleNumber"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} von ${total} Einträgen`
            }}
            scroll={{ x: 1200 }}
          />
        )}
      </Card>
    </div>
  );
};

export default OrderSuggestion; 