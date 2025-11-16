import { create } from 'zustand';
import type { User, LoginCredentials } from '../types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
  initAuth: () => void;
}

/**
 * Zustand store for authentication state management
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  /**
   * Login action
   */
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login(credentials);

      // Store token and user in localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('authUser', JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      let errorMessage = 'Falha ao fazer login';

      if (typeof error === 'object' && error !== null && 'message' in error) {
        const message = (error as { message: string }).message;

        // Translate common error messages to Portuguese
        if (message === 'Invalid email or password' || message === 'Invalid credentials') {
          errorMessage = 'Email ou senha inválidos';
        } else if (message.toLowerCase().includes('network')) {
          errorMessage = 'Erro de conexão. Verifique sua internet.';
        } else {
          errorMessage = message;
        }
      }

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  /**
   * Logout action
   */
  logout: () => {
    authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  /**
   * Set user directly (for registration or profile updates)
   */
  setUser: (user: User) => {
    set({ user });
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Initialize auth from localStorage
   */
  initAuth: () => {
    const token = localStorage.getItem('authToken');
    const userString = localStorage.getItem('authUser');

    if (token && userString) {
      try {
        const user = JSON.parse(userString) as User;
        set({
          user,
          token,
          isAuthenticated: true,
        });
      } catch {
        // Invalid data in localStorage, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
  },
}));
