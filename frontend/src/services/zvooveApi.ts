// Zvoove API Service
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export interface ZvooveOrder {
  id?: string;
  orderNumber?: string;
  customer: string;
  items: Array<{
    articleNumber: string;
    description: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface ZvooveContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const zvooveApi = {
  // Orders
  async createOrder(order: Omit<ZvooveOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<ZvooveOrder> {
    const response = await axios.post(`${API_BASE_URL}/zvoove/orders`, order);
    return response.data;
  },

  async getOrders(): Promise<ZvooveOrder[]> {
    const response = await axios.get(`${API_BASE_URL}/zvoove/orders`);
    return response.data;
  },

  async getOrder(id: string): Promise<ZvooveOrder> {
    const response = await axios.get(`${API_BASE_URL}/zvoove/orders/${id}`);
    return response.data;
  },

  async updateOrder(id: string, order: Partial<ZvooveOrder>): Promise<ZvooveOrder> {
    const response = await axios.put(`${API_BASE_URL}/zvoove/orders/${id}`, order);
    return response.data;
  },

  async deleteOrder(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/zvoove/orders/${id}`);
  },

  // Contacts
  async getContacts(): Promise<ZvooveContact[]> {
    const response = await axios.get(`${API_BASE_URL}/zvoove/contacts`);
    return response.data;
  },

  async createContact(contact: Omit<ZvooveContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<ZvooveContact> {
    const response = await axios.post(`${API_BASE_URL}/zvoove/contacts`, contact);
    return response.data;
  },

  async updateContact(id: string, contact: Partial<ZvooveContact>): Promise<ZvooveContact> {
    const response = await axios.put(`${API_BASE_URL}/zvoove/contacts/${id}`, contact);
    return response.data;
  },

  async deleteContact(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/zvoove/contacts/${id}`);
  }
};

export default zvooveApi;