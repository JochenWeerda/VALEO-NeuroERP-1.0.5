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
}).required();

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

// Temporär auskommentiert - wird später implementiert
export const OrderSuggestion: React.FC<OrderSuggestionProps> = ({
  onSuggestionSelect,
  onOrderCreate,
  filters
}) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Order Suggestion</h1>
      <p className="text-gray-600">Diese Komponente wird später implementiert.</p>
    </div>
  );
};

export default OrderSuggestion; 