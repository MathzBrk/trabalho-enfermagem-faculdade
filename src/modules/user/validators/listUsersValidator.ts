import { z } from 'zod';
import { PAGINATION_DEFAULTS } from '@shared/interfaces/pagination';
import { allowedSortFields } from '../constants';

/**
 * ListUsersQuerySchema - Validates query parameters for user listing endpoint
 *
 * Validates and transforms query string parameters from:
 * - GET /api/users?page=2&perPage=20&sortBy=name&sortOrder=asc&role=NURSE
 *
 * Features:
 * - Automatic type conversion (string → number, string → boolean)
 * - Default values for optional parameters
 * - Validation rules (min/max, allowed values)
 * - Clear error messages for invalid inputs
 * - Filter support (role, isActive, excludeDeleted)
 *
 * Usage with validateRequest middleware:
 * ```typescript
 * router.get('/users',
 *   authMiddleware,
 *   validateRequest({ query: ListUsersQuerySchema }),
 *   userController.listUsers
 * );
 * ```
 *
 * Valid sortBy fields:
 * - id, name, email, cpf, coren, role, phone, isActive, createdAt, updatedAt
 */
export const ListUsersQuerySchema = z.object({
  /**
   * Page number (1-indexed)
   * - Optional, defaults to 1
   * - Must be >= 1
   */
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : PAGINATION_DEFAULTS.PAGE))
    .refine(val => !isNaN(val) && val >= 1, {
      message: 'Page must be a number >= 1',
    }),

  /**
   * Items per page
   * - Optional, defaults to 10
   * - Must be between 1 and 100
   */
  perPage: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : PAGINATION_DEFAULTS.PER_PAGE))
    .refine(
      val =>
        !isNaN(val) &&
        val >= PAGINATION_DEFAULTS.MIN_PER_PAGE &&
        val <= PAGINATION_DEFAULTS.MAX_PER_PAGE,
      {
        message: `perPage must be between ${PAGINATION_DEFAULTS.MIN_PER_PAGE} and ${PAGINATION_DEFAULTS.MAX_PER_PAGE}`,
      }
    ),

  /**
   * Field to sort by
   * - Optional, defaults to 'createdAt'
   * - Must be a valid User field
   */
  sortBy: z
    .string()
    .optional()
    .default(PAGINATION_DEFAULTS.SORT_BY)
    .refine(
      val =>
        allowedSortFields.includes(val),
      {
        message:
          `Invalid sortBy field. Allowed: ${allowedSortFields.join(', ')}`,
      }
    ),

  /**
   * Sort order
   * - Optional, defaults to 'desc'
   * - Must be 'asc' or 'desc'
   */
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default(PAGINATION_DEFAULTS.SORT_ORDER),

  /**
   * Filter by user role
   * - Optional
   * - Must be EMPLOYEE, NURSE, or MANAGER
   */
  role: z
    .enum(['EMPLOYEE', 'NURSE', 'MANAGER'])
    .optional(),

  /**
   * Filter by active status
   * - Optional, defaults to true (controller handles default)
   * - Converts string 'true'/'false' to boolean
   */
  isActive: z
    .string()
    .optional()
    .transform(val => {
      if (val === undefined) return undefined;
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined; // Invalid value ignored
    }),

  /**
   * Exclude soft-deleted users
   * - Optional, defaults to true (controller handles default)
   * - Converts string 'true'/'false' to boolean
   */
  excludeDeleted: z
    .string()
    .optional()
    .transform(val => {
      if (val === undefined) return undefined;
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined; // Invalid value ignored
    }),
});

/**
 * TypeScript type inferred from Zod schema
 *
 * Use this type in controller methods for type safety:
 * ```typescript
 * const query: ListUsersQuery = req.query;
 * ```
 */
export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>;
