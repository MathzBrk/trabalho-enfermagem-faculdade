import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/user.service';
import type { User, UpdateUserData, ApiError } from '../types';
import { useAuthStore } from '../store/authStore';

interface UseProfileReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: UpdateUserData) => Promise<void>;
  uploadPhoto: (file: File) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for managing user profile
 * Handles fetching, updating, and photo upload
 */
export const useProfile = (userId?: string): UseProfileReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authUser = useAuthStore((state) => state.user);
  const setAuthUser = useAuthStore((state) => state.setUser);

  // Use provided userId or fallback to authenticated user's ID
  const targetUserId = userId || authUser?.id;

  /**
   * Fetch user profile
   */
  const fetchProfile = useCallback(async () => {
    if (!targetUserId) {
      setError('User ID not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userData = await userService.getById(targetUserId);
      setUser(userData);

      // Update auth store if viewing own profile
      if (!userId && authUser?.id === targetUserId) {
        setAuthUser(userData);
        localStorage.setItem('authUser', JSON.stringify(userData));
      }

      setIsLoading(false);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar perfil');
      setIsLoading(false);
    }
  }, [targetUserId, userId, authUser?.id, setAuthUser]);

  /**
   * Update user profile
   */
  const updateProfile = async (data: UpdateUserData): Promise<void> => {
    if (!targetUserId) {
      throw new Error('User ID not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = await userService.update(targetUserId, data);
      setUser(updatedUser);

      // Update auth store if updating own profile
      if (!userId && authUser?.id === targetUserId) {
        setAuthUser(updatedUser);
        localStorage.setItem('authUser', JSON.stringify(updatedUser));
      }

      setIsLoading(false);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao atualizar perfil');
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Upload profile photo
   */
  const uploadPhoto = async (file: File): Promise<void> => {
    if (!targetUserId) {
      throw new Error('User ID not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await userService.uploadPhoto(targetUserId, file);

      // Update user with new photo URL
      const updatedUser = { ...user!, profilePhotoUrl: response.url };
      setUser(updatedUser);

      // Update auth store if updating own profile
      if (!userId && authUser?.id === targetUserId) {
        setAuthUser(updatedUser);
        localStorage.setItem('authUser', JSON.stringify(updatedUser));
      }

      setIsLoading(false);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao fazer upload da foto');
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };

  // Fetch profile on mount
  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
    }
  }, [targetUserId, fetchProfile]);

  return {
    user,
    isLoading,
    error,
    updateProfile,
    uploadPhoto,
    refreshProfile: fetchProfile,
    clearError,
  };
};
