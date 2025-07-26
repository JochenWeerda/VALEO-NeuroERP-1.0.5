import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    role: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  disabled: boolean;
  created_at?: string;
}

class AuthService {
  private tokenKey = 'valeo_access_token';
  private refreshTokenKey = 'valeo_refresh_token';

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      const data = response.data;
      
      // Tokens speichern
      localStorage.setItem(this.tokenKey, data.access_token);
      localStorage.setItem(this.refreshTokenKey, data.refresh_token);
      
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refreshToken(): Promise<LoginResponse> {
    try {
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      if (!refreshToken) {
        throw new Error('Kein Refresh Token verfügbar');
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken
      });
      
      const data = response.data;
      localStorage.setItem(this.tokenKey, data.access_token);
      localStorage.setItem(this.refreshTokenKey, data.refresh_token);
      
      return data;
    } catch (error) {
      this.logout();
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      if (refreshToken) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {
          refresh_token: refreshToken
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const token = this.getAccessToken();
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  private handleError(error: any): Error {
    if (error.response?.data?.detail) {
      return new Error(error.response.data.detail);
    }
    return new Error('Ein Fehler ist aufgetreten');
  }
}

export const authService = new AuthService(); 