import axios from 'axios';

const API_URL = '/api/auth'; // Anpassen je nach Backend-Route

export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } else {
      throw new Error('Ungültige Antwort vom Server');
    }
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Login fehlgeschlagen');
  }
};

export const logout = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Optional: Logout-API-Call
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}; 