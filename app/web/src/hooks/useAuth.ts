import { useAuthStore } from '../store/authStore';

/**
 * Custom hook to access auth state and actions
 * Provides a clean interface to the auth store
 */
export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    setUser,
    clearError,
    initAuth,
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    setUser,
    clearError,
    initAuth,
    // Derived values
    isEmployee: user?.role === 'EMPLOYEE',
    isNurse: user?.role === 'NURSE',
    isManager: user?.role === 'MANAGER',
  };
};
