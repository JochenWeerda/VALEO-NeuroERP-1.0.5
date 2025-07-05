import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// Benutzertyp
interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  fullName: string;
  department?: string;
  position?: string;
  roles: string[];
}

// Kontext-Werte
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
}

// Registrierungsdaten
interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  department?: string;
  position?: string;
}

// Erstellen des Kontexts mit Standardwerten
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  register: async () => {},
});

// Benutzerdefinierter Hook für den Zugriff auf den Kontext
export const useAuth = () => useContext(AuthContext);

// Kontext-Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Beim Laden der Anwendung prüfen, ob ein Token vorhanden ist
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Token als Header für alle Anfragen setzen
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Benutzerdaten abrufen
          const response = await axios.get(`${API_BASE_URL}/api/v1/auth/me`);
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Fehler beim Abrufen der Benutzerdaten:', err);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Anmelden
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Anmeldedaten senden
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
        username,
        password,
      });
      
      // Token speichern
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      
      // Token als Header für alle Anfragen setzen
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Benutzerdaten speichern
      setUser(user);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Anmeldefehler:', err);
      setError(err.response?.data?.message || 'Fehler bei der Anmeldung');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Abmelden
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  // Registrieren
  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Registrierungsdaten senden
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/register`, userData);
      
      // Token speichern
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      
      // Token als Header für alle Anfragen setzen
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Benutzerdaten speichern
      setUser(user);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Registrierungsfehler:', err);
      setError(err.response?.data?.message || 'Fehler bei der Registrierung');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Kontextwerte
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 