import { api } from './api';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '../types';

/**
 * Authentication service
 * Integrates with backend API for authentication operations
 */
export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);

    // Backend returns { success: true, data: { user, token, expiresIn } }
    if (response.data.data) {
      return {
        user: response.data.data.user,
        token: response.data.data.token,
      };
    }

    // Fallback for different response structure
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);

    // Backend returns { success: true, data: { user, token, expiresIn } }
    if (response.data.data) {
      return {
        user: response.data.data.user,
        token: response.data.data.token,
      };
    }

    // Fallback for different response structure
    return response.data;
  },

  /**
   * Logout user
   */
  logout: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  },

  /**
   * Get current user from localStorage
   * Note: Backend doesn't have a /auth/me endpoint, so we use localStorage
   */
  getCurrentUser: async (): Promise<User> => {
    const userString = localStorage.getItem('authUser');
    if (userString) {
      return Promise.resolve(JSON.parse(userString));
    }
    return Promise.reject({
      message: 'User not authenticated',
      statusCode: 401,
    });
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('authUser');
    return !!(token && user);
  },
};
