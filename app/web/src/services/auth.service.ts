// import { api } from './api'; // Commented out for now - using mock data
import type { AuthResponse, LoginCredentials, RegisterData, User } from '../types';
import { authenticateUser, mockUsers } from '../utils/mockData';

/**
 * Authentication service
 * Currently using mock data - will integrate with real API later
 */
export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = authenticateUser(credentials.email, credentials.password);

        if (user) {
          const { password, ...userWithoutPassword } = user;
          const response: AuthResponse = {
            token: `mock-token-${user.id}-${Date.now()}`,
            user: userWithoutPassword,
          };
          resolve(response);
        } else {
          reject({
            message: 'Email ou senha inválidos',
            statusCode: 401,
          });
        }
      }, 800); // Simulate network delay
    });

    // Real API call (commented out for now)
    // const response = await api.post<AuthResponse>('/auth/login', credentials);
    // return response.data;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if email already exists
        const existingUser = mockUsers.find((u) => u.email === data.email);
        if (existingUser) {
          reject({
            message: 'Email já cadastrado',
            statusCode: 400,
          });
          return;
        }

        // Create new user
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          role: data.role,
          coren: data.coren,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const response: AuthResponse = {
          token: `mock-token-${newUser.id}-${Date.now()}`,
          user: newUser,
        };

        resolve(response);
      }, 800);
    });

    // Real API call (commented out for now)
    // const response = await api.post<AuthResponse>('/auth/register', data);
    // return response.data;
  },

  /**
   * Logout user
   */
  logout: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  },

  /**
   * Get current user from token
   */
  getCurrentUser: async (): Promise<User> => {
    // Mock implementation
    const userString = localStorage.getItem('authUser');
    if (userString) {
      return Promise.resolve(JSON.parse(userString));
    }
    return Promise.reject({
      message: 'User not authenticated',
      statusCode: 401,
    });

    // Real API call (commented out for now)
    // const response = await api.get<User>('/auth/me');
    // return response.data;
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
