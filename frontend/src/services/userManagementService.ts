import { api, type ApiResponse } from './api';

// User Management Interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  department?: string;
  position?: string;
  phone?: string;
  avatar_url?: string;
  last_login?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  full_name: string;
  password: string;
  role?: string;
  department?: string;
  position?: string;
  phone?: string;
  notes?: string;
}

export interface UserUpdateRequest {
  full_name?: string;
  email?: string;
  role?: string;
  status?: string;
  department?: string;
  position?: string;
  phone?: string;
  notes?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserStatistics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  role_distribution: Record<string, number>;
  department_distribution: Record<string, number>;
}

class UserManagementService {
  // User CRUD Operations
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role_filter?: string;
    status_filter?: string;
    department_filter?: string;
  }): Promise<ApiResponse<UserListResponse>> {
    return api.get<UserListResponse>('/api/users', params);
  }

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return api.get<User>(`/api/users/${userId}`);
  }

  async createUser(userData: UserCreateRequest): Promise<ApiResponse<User>> {
    return api.post<User>('/api/users', userData);
  }

  async updateUser(userId: string, userData: UserUpdateRequest): Promise<ApiResponse<User>> {
    return api.put<User>(`/api/users/${userId}`, userData);
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/api/users/${userId}`);
  }

  // Profile Management
  async getMyProfile(): Promise<ApiResponse<User>> {
    return api.get<User>('/api/users/me/profile');
  }

  async updateMyProfile(userData: UserUpdateRequest): Promise<ApiResponse<User>> {
    return api.put<User>('/api/users/me/profile', userData);
  }

  // Statistics and Analytics
  async getUserStatistics(): Promise<ApiResponse<UserStatistics>> {
    return api.get<UserStatistics>('/api/users/statistics');
  }

  async getUsersByRole(role: string): Promise<ApiResponse<User[]>> {
    return api.get<User[]>(`/api/users/by-role/${role}`);
  }

  async getUsersByDepartment(department: string): Promise<ApiResponse<User[]>> {
    return api.get<User[]>(`/api/users/by-department/${department}`);
  }

  // Helper Methods
  getRoleDisplayName(role: string): string {
    const roleNames: Record<string, string> = {
      admin: 'Administrator',
      manager: 'Manager',
      user: 'Benutzer',
      viewer: 'Betrachter'
    };
    return roleNames[role] || role;
  }

  getStatusDisplayName(status: string): string {
    const statusNames: Record<string, string> = {
      active: 'Aktiv',
      inactive: 'Inaktiv',
      suspended: 'Gesperrt'
    };
    return statusNames[status] || status;
  }

  getRoleColor(role: string): string {
    const roleColors: Record<string, string> = {
      admin: '#d32f2f',
      manager: '#1976d2',
      user: '#388e3c',
      viewer: '#f57c00'
    };
    return roleColors[role] || '#757575';
  }

  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      active: '#388e3c',
      inactive: '#757575',
      suspended: '#d32f2f'
    };
    return statusColors[status] || '#757575';
  }

  // Validation
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Passwort muss mindestens 8 Zeichen lang sein');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Passwort muss mindestens einen Großbuchstaben enthalten');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Passwort muss mindestens einen Kleinbuchstaben enthalten');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Passwort muss mindestens eine Zahl enthalten');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateUsername(username: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (username.length < 3) {
      errors.push('Benutzername muss mindestens 3 Zeichen lang sein');
    }
    
    if (username.length > 20) {
      errors.push('Benutzername darf maximal 20 Zeichen lang sein');
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push('Benutzername darf nur Buchstaben, Zahlen, Unterstriche und Bindestriche enthalten');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const userManagementService = new UserManagementService(); 