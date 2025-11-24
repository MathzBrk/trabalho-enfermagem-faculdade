import type { User, PaginationParams, PaginatedResponse, UpdateUserData, RegisterData, UserRole } from '../types';
import { api } from './api';

export interface ListUsersParams extends PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  role?: UserRole;
  isActive?: boolean;
  excludeDeleted?: boolean;
}

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
   * List users with pagination and filters
   */
  list: async (params?: ListUsersParams): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  /**
   * Create a new user (MANAGER only)
   * Uses the /auth/register endpoint
   */
  create: async (data: RegisterData): Promise<User> => {
    const response = await api.post<{ success: boolean; data: { user: User; token: string; expiresIn: string } }>('/auth/register', data);
    // Return only the user data, not the token (since it's created by a manager)
    return response.data.data.user;
  },

  /**
   * Update user profile
   */
  update: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Delete user (soft delete, MANAGER only)
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  /**
   * Activate or deactivate a user (MANAGER only)
   */
  activate: async (id: string, isActive: boolean): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, { isActive });
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
