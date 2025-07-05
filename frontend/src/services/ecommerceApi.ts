import api from './api';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  stock: number;
  category_id: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  total: number;
}

export interface Order {
  id: number;
  customer_id: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  payment_method: string;
  shipping_address: string;
  billing_address: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  total: number;
}

// Produkt-Endpunkte
export const getProducts = async (category_id?: number): Promise<Product[]> => {
  const params = category_id ? { category_id } : {};
  const response = await api.get('/produkte', { params });
  return response.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await api.get(`/produkte/${id}`);
  return response.data;
};

// Kategorie-Endpunkte
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/kategorien');
  return response.data;
};

export const getCategory = async (id: number): Promise<Category> => {
  const response = await api.get(`/kategorien/${id}`);
  return response.data;
};

// Warenkorb-Endpunkte
export const getCart = async (): Promise<CartItem[]> => {
  const response = await api.get('/warenkorb');
  return response.data;
};

export const addToCart = async (product_id: number, quantity: number): Promise<CartItem> => {
  const response = await api.post('/warenkorb', { product_id, quantity });
  return response.data;
};

export const updateCartItem = async (id: number, quantity: number): Promise<CartItem> => {
  const response = await api.put(`/warenkorb/${id}`, { quantity });
  return response.data;
};

export const removeFromCart = async (id: number): Promise<void> => {
  await api.delete(`/warenkorb/${id}`);
};

// Bestellungs-Endpunkte
export const getOrders = async (): Promise<Order[]> => {
  const response = await api.get('/ecommerce/bestellungen');
  return response.data;
};

export const getOrder = async (id: number): Promise<Order> => {
  const response = await api.get(`/ecommerce/bestellungen/${id}`);
  return response.data;
};

export const createOrder = async (orderData: {
  customer_id: number;
  payment_method: string;
  shipping_address: string;
  billing_address: string;
}): Promise<Order> => {
  const response = await api.post('/ecommerce/bestellungen', orderData);
  return response.data;
};

export const updateOrderStatus = async (id: number, status: Order['status']): Promise<Order> => {
  const response = await api.put(`/ecommerce/bestellungen/${id}/status`, { status });
  return response.data;
}; 