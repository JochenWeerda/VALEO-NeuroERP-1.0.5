import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// TypeScript Interfaces für Benutzer-Management
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager' | 'accountant';
  department?: string;
  avatar?: string;
  lastLogin?: Date;
  isActive: boolean;
  permissions: string[];
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  avatar?: string;
  preferences: {
    theme: 'neural' | 'neural-light' | 'neural-dark';
    language: 'de' | 'en';
    notifications: boolean;
  };
}

interface UserStore {
  // State
  currentUser: User | null;
  userProfile: UserProfile | null;
  users: User[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  fetchUsers: () => Promise<void>;
  addUser: (userData: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useUserStore = create<UserStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      currentUser: null,
      userProfile: null,
      users: [],
      loading: false,
      error: null,
      
      // Actions
      setCurrentUser: (user) => {
        set({ currentUser: user });
      },
      
      setUserProfile: (profile) => {
        set({ userProfile: profile });
      },
      
      updateUserProfile: (updates) => {
        set((state) => ({
          userProfile: state.userProfile 
            ? { ...state.userProfile, ...updates }
            : null
        }));
      },
      
      fetchUsers: async () => {
        set({ loading: true, error: null });
        try {
          // TODO: Implementiere API-Aufruf
          const response = await fetch('/api/users');
          if (!response.ok) {
            throw new Error('Fehler beim Laden der Benutzer');
          }
          const users = await response.json();
          set({ users, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unbekannter Fehler', 
            loading: false 
          });
        }
      },
      
      addUser: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });
          if (!response.ok) {
            throw new Error('Fehler beim Erstellen des Benutzers');
          }
          const newUser = await response.json();
          set((state) => ({ 
            users: [...state.users, newUser], 
            loading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unbekannter Fehler', 
            loading: false 
          });
        }
      },
      
      updateUser: async (id, userData) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });
          if (!response.ok) {
            throw new Error('Fehler beim Aktualisieren des Benutzers');
          }
          const updatedUser = await response.json();
          set((state) => ({
            users: state.users.map(user => 
              user.id === id ? updatedUser : user
            ),
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unbekannter Fehler', 
            loading: false 
          });
        }
      },
      
      deleteUser: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/users/${id}`, { 
            method: 'DELETE' 
          });
          if (!response.ok) {
            throw new Error('Fehler beim Löschen des Benutzers');
          }
          set((state) => ({
            users: state.users.filter(user => user.id !== id),
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unbekannter Fehler', 
            loading: false 
          });
        }
      },
      
      setLoading: (loading) => {
        set({ loading });
      },
      
      setError: (error) => {
        set({ error });
      },
      
      clearError: () => {
        set({ error: null });
      }
    }),
    { name: 'user-store' }
  )
); 