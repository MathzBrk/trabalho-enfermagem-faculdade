import type { User, PaginationParams, PaginatedResponse } from '../types';
import { mockUsers } from '../utils/mockData';

/**
 * User service
 * Currently using mock data - will integrate with real API later
 */
export const userService = {
  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<User> => {
    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find((u) => u.id === id);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          resolve(userWithoutPassword);
        } else {
          reject({
            message: 'User not found',
            statusCode: 404,
          });
        }
      }, 500);
    });

    // Real API call (commented out for now)
    // const response = await api.get<User>(`/users/${id}`);
    // return response.data;
  },

  /**
   * List users with pagination
   */
  list: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = mockUsers.map(({ password, ...user }) => user);
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedUsers = users.slice(start, end);

        resolve({
          data: paginatedUsers,
          total: users.length,
          page,
          limit,
          totalPages: Math.ceil(users.length / limit),
        });
      }, 500);
    });

    // Real API call (commented out for now)
    // const response = await api.get<PaginatedResponse<User>>('/users', { params });
    // return response.data;
  },
};
