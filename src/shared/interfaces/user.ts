import type { Prisma } from '@infrastructure/database';
import type { UserRole, User } from '@shared/models/user';
import type { IBaseStore } from '@shared/stores/baseStore';
import type { PaginatedResponse, PaginationParams } from './pagination';

/**
 * UserFilterParams - Optional filter parameters for user queries
 *
 * All filters are optional and will be combined with AND logic.
 * Default behavior (no filters): Returns only active, non-deleted users
 *
 * @example
 * // Filter only nurses
 * { role: 'NURSE' }
 *
 * @example
 * // Include inactive users
 * { isActive: false }
 *
 * @example
 * // Admin view - all users including deleted
 * { isActive: undefined, excludeDeleted: false }
 */
export interface UserFilterParams {
  /** Filter by user role */
  role?: UserRole;

  /** Filter by active status. Default: true (only active users) */
  isActive?: boolean;

  /** Exclude soft-deleted users. Default: true (exclude deleted) */
  excludeDeleted?: boolean;
}

/**
 * IUserStore Interface
 *
 * Defines the contract for user data access operations.
 * Extends IBaseStore to inherit standard CRUD operations:
 * - findById(id)
 * - findAll()
 * - create(data)
 * - update(id, data)
 * - delete(id)
 * - softDelete(id)
 * - count(where?)
 * - exists(where)
 *
 * Adds user-specific query methods for business logic needs.
 * This interface enables dependency injection and allows for
 * multiple implementations (Prisma, in-memory, etc.).
 */
export interface IUserStore
  extends IBaseStore<User, Prisma.UserCreateInput, Prisma.UserUpdateInput> {
  findByEmail(email: string): Promise<User | null>;
  findByCPF(cpf: string): Promise<User | null>;
  findByCOREN(coren: string): Promise<User | null>;
  findByRole(role: 'EMPLOYEE' | 'NURSE' | 'MANAGER'): Promise<User[]>;
  findAllActive(): Promise<User[]>;
  findActiveNurses(): Promise<User[]>;
  findActiveManagers(): Promise<User[]>;
  findByIdWithRelations(id: string): Promise<User | null>;
  emailExists(email: string): Promise<boolean>;
  cpfExists(cpf: string): Promise<boolean>;
  corenExists(coren: string): Promise<boolean>;
  updatePassword(id: string, hashedPassword: string): Promise<User>;
  toggleActive(id: string, isActive: boolean): Promise<User>;
  countByRole(role: 'EMPLOYEE' | 'NURSE' | 'MANAGER'): Promise<number>;
  countActive(): Promise<number>;

  /**
   * Finds users with pagination, sorting, and optional filtering
   *
   * Flexible method that supports:
   * - Filtering by role (EMPLOYEE, NURSE, MANAGER)
   * - Filtering by active status
   * - Including/excluding soft-deleted users
   *
   * All filters are optional and combine with AND logic.
   * Default behavior (no filters): Returns only active, non-deleted users.
   * Uses database-level pagination for efficiency.
   *
   * @param params - Pagination and sorting parameters
   * @param filters - Optional filter criteria
   * @returns Paginated list of users matching criteria
   *
   * @example
   * // List all active nurses sorted by name
   * const result = await userStore.findUsersPaginated(
   *   { page: 1, perPage: 20, sortBy: 'name', sortOrder: 'asc' },
   *   { role: 'NURSE' }
   * );
   *
   * @example
   * // List inactive managers
   * const result = await userStore.findUsersPaginated(
   *   { page: 1, perPage: 20 },
   *   { role: 'MANAGER', isActive: false }
   * );
   *
   * @example
   * // Admin view - all users including deleted
   * const result = await userStore.findUsersPaginated(
   *   { page: 1, perPage: 20 },
   *   { isActive: undefined, excludeDeleted: false }
   * );
   */
  findUsersPaginated(
    params: PaginationParams,
    filters?: UserFilterParams,
  ): Promise<PaginatedResponse<User>>;
}
