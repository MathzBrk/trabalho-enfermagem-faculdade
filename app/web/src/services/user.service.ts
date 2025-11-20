import type { User, PaginationParams, PaginatedResponse, UpdateUserData } from '../types';
import { api } from './api';

/**
 * User service
 * Integrates with backend API for user operations
 */
export const userService = {
  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * List users with pagination
   */
  list: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  /**
   * Update user profile
   */
  update: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Upload profile photo
   */
  uploadPhoto: async (id: string, file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post<{ url: string }>(`/users/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * List all users (simplified for compatibility)
   */
  listUsers: async (): Promise<User[]> => {
    const response = await api.get<PaginatedResponse<User>>('/users', {
      params: { page: 1, limit: 1000 },
    });
    return response.data.data;
  },
};
