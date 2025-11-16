import { useState } from 'react';
import { authService } from '../services/auth.service';
import type { RegisterData, ApiError } from '../types';
import { useAuthStore } from '../store/authStore';

interface UseRegisterReturn {
  register: (data: RegisterData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for user registration
 * Handles registration logic, loading states, and error handling
 */
export const useRegister = (): UseRegisterReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(data);

      // Store token and user in localStorage
      localStorage.setItem('authToken', response.token || '');
      localStorage.setItem('authUser', JSON.stringify(response.user));

      // Update auth store
      setUser(response.user!);

      setIsLoading(false);
    } catch (err) {
      const apiError = err as ApiError;
      let errorMessage = 'Erro ao registrar usuário';

      if (apiError.message) {
        const message = apiError.message;

        // Translate common error messages to Portuguese
        if (message.toLowerCase().includes('email already exists') ||
            message.toLowerCase().includes('email já existe') ||
            message.toLowerCase().includes('already registered')) {
          errorMessage = 'Este email já está cadastrado';
        } else if (message.toLowerCase().includes('cpf already exists') ||
                   message.toLowerCase().includes('cpf já existe')) {
          errorMessage = 'Este CPF já está cadastrado';
        } else if (message.toLowerCase().includes('network')) {
          errorMessage = 'Erro de conexão. Verifique sua internet.';
        } else if (message.toLowerCase().includes('validation')) {
          errorMessage = 'Dados inválidos. Verifique os campos.';
        } else {
          errorMessage = message;
        }
      }

      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    register,
    isLoading,
    error,
    clearError,
  };
};
