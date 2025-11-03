/**
 * Pagination Interfaces and Utilities
 *
 * This module provides reusable pagination types for the entire application.
 * Use these interfaces consistently across all modules (User, Vaccine, Scheduling, etc.)
 * to maintain a standardized API response format.
 */

/**
 * PaginationParams - Input parameters for paginated queries
 *
 * Use these params in controller query strings and service methods.
 *
 * @example
 * const params: PaginationParams = {
 *   page: 1,
 *   perPage: 20,
 *   sortBy: 'name',
 *   sortOrder: 'asc'
 * };
 */
export interface PaginationParams {
  /** Current page number (1-indexed) */
  page: number;

  /** Items per page (should be validated against MAX_PER_PAGE) */
  perPage: number;

  /** Field to sort by (e.g., 'createdAt', 'name', 'email') */
  sortBy?: string;

  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * PaginationMetadata - Response metadata for paginated results
 *
 * Provides clients with all information needed for UI pagination controls:
 * - Total pages calculation
 * - Navigation buttons (next/previous)
 * - Page indicators (1, 2, 3...)
 */
export interface PaginationMetadata {
  /** Current page number */
  page: number;

  /** Items per page */
  perPage: number;

  /** Total number of items across all pages */
  total: number;

  /** Total number of pages */
  totalPages: number;

  /** Whether there is a next page */
  hasNext: boolean;

  /** Whether there is a previous page */
  hasPrev: boolean;
}

/**
 * PaginatedResponse - Generic wrapper for paginated data
 *
 * Use this to return paginated results consistently across all endpoints.
 *
 * @template T - Type of items in the data array
 *
 * @example
 * // In service method
 * async listUsers(params: PaginationParams): Promise<PaginatedResponse<UserResponse>> {
 *   const result = await this.userStore.findActiveUsersPaginated(params);
 *   return {
 *     data: result.data.map(toUserResponse),
 *     pagination: result.pagination,
 *   };
 * }
 *
 * @example
 * // API Response
 * {
 *   "data": [
 *     { "id": "1", "name": "João Silva", "email": "joao@example.com" },
 *     { "id": "2", "name": "Maria Santos", "email": "maria@example.com" }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "perPage": 10,
 *     "total": 45,
 *     "totalPages": 5,
 *     "hasNext": true,
 *     "hasPrev": false
 *   }
 * }
 */
export interface PaginatedResponse<T> {
  /** Array of items for current page */
  data: T[];

  /** Pagination metadata */
  pagination: PaginationMetadata;
}

/**
 * Helper function to calculate pagination metadata
 *
 * Encapsulates pagination math to avoid duplication and errors.
 *
 * @param page - Current page number (1-indexed)
 * @param perPage - Items per page
 * @param total - Total number of items
 * @returns Calculated pagination metadata
 *
 * @example
 * const metadata = calculatePaginationMetadata(2, 10, 45);
 * // Returns:
 * // {
 * //   page: 2,
 * //   perPage: 10,
 * //   total: 45,
 * //   totalPages: 5,
 * //   hasNext: true,
 * //   hasPrev: true
 * // }
 */
export function calculatePaginationMetadata(
  page: number,
  perPage: number,
  total: number
): PaginationMetadata {
  const totalPages = Math.ceil(total / perPage);

  return {
    page,
    perPage,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Constants for pagination defaults and limits
 *
 * These values ensure:
 * - Consistent default behavior across endpoints
 * - Protection against excessive data retrieval
 * - Reasonable limits for API consumers
 */
export const PAGINATION_DEFAULTS = {
  /** Default page number if not specified */
  PAGE: 1,

  /** Default items per page if not specified */
  PER_PAGE: 10,

  /** Default sort field if not specified */
  SORT_BY: 'createdAt',

  /** Default sort direction if not specified */
  SORT_ORDER: 'desc' as const,

  /** Maximum items per page allowed (prevents API abuse) */
  MAX_PER_PAGE: 100,

  /** Minimum items per page allowed */
  MIN_PER_PAGE: 1,
} as const;
