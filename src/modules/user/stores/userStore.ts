import type { User, Prisma} from "@infrastructure/database";
import { BaseStore } from "@shared/stores/baseStore";
import { IUserStore, UserFilterParams } from "@shared/interfaces/user";
import { injectable } from "tsyringe";
import { UserDelegate, UserUpdateInput, UserCreateInput } from "@shared/models/user";
import { PaginationParams, PaginatedResponse, calculatePaginationMetadata } from "@shared/interfaces/pagination";
import { allowedSortFields } from "../constants";

/**
 * UserStore - Prisma-based implementation of IUserStore
 *
 * This is the production implementation that uses Prisma ORM for database operations.
 * Registered as singleton in DI container to maintain connection pooling and caching.
 *
 * Inherits basic CRUD methods from BaseStore:
 * - findById(id)
 * - findAll()
 * - create(data)
 * - update(id, data)
 * - delete(id)
 * - softDelete(id)
 * - count(where?)
 * - exists(where)
 *
 * And adds User-specific methods
 */

@injectable()
export class UserStore extends BaseStore<User, UserDelegate, UserCreateInput, UserUpdateInput> implements IUserStore {
  // Defines the model to be used by the base class
  protected readonly model = this.prisma.user;

  /**
   * Finds user by email
   *
   * @param email - User's email
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({
      where: { email },
    });
  }

  /**
   * Finds user by CPF
   *
   * @param cpf - User's CPF (11 digits)
   * @returns User or null if not found
   */
  async findByCPF(cpf: string): Promise<User | null> {
    return this.model.findUnique({
      where: { cpf },
    });
  }

  /**
   * Finds user by COREN (nurse registration number)
   *
   * @param coren - COREN number
   * @returns User or null if not found
   */
  async findByCOREN(coren: string): Promise<User | null> {
    return this.model.findUnique({
      where: { coren },
    });
  }

  /**
   * Finds users by role (profile)
   *
   * @param role - EMPLOYEE | NURSE | MANAGER
   * @returns Array of users
   */
  async findByRole(role: "EMPLOYEE" | "NURSE" | "MANAGER"): Promise<User[]> {
    return this.model.findMany({
      where: { role },
    });
  }

  /**
   * Finds only active users (not deleted)
   *
   * @returns Array of active users
   */
  async findAllActive(): Promise<User[]> {
    return this.model.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
    });
  }

  /**
   * Finds active nurses
   *
   * Useful for listing available nurses to administer vaccines
   *
   * @returns Array of active nurses
   */
  async findActiveNurses(): Promise<User[]> {
    return this.model.findMany({
      where: {
        role: "NURSE",
        isActive: true,
        deletedAt: null,
      },
    });
  }

  /**
   * Finds active managers
   *
   * @returns Array of active managers
   */
  async findActiveManagers(): Promise<User[]> {
    return this.model.findMany({
      where: {
        role: "MANAGER",
        isActive: true,
        deletedAt: null,
      },
    });
  }

  /**
   * Finds user with all relationships included
   *
   * @param id - User's ID
   * @returns User with relationships or null
   */
  async findByIdWithRelations(id: string) {
    return this.model.findUnique({
      where: { id },
      include: {
        schedulingsReceived: true,
        applicationsReceived: true,
        applicationsPerformed: true,
        notifications: {
          where: { isRead: false },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Checks if email is already in use
   *
   * @param email - Email to check
   * @returns true if already exists
   */
  async emailExists(email: string): Promise<boolean> {
    return this.exists({ email });
  }

  /**
   * Checks if CPF is already in use
   *
   * @param cpf - CPF to check
   * @returns true if already exists
   */
  async cpfExists(cpf: string): Promise<boolean> {
    return this.exists({ cpf });
  }

  /**
   * Checks if COREN is already in use
   *
   * @param coren - COREN to check
   * @returns true if already exists
   */
  async corenExists(coren: string): Promise<boolean> {
    return this.exists({ coren });
  }

  /**
   * Updates a user's password
   *
   * @param id - User's ID
   * @param hashedPassword - Already hashed password
   * @returns Updated User
   */
  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    return this.model.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  /**
   * Activates or deactivates a user
   *
   * @param id - User's ID
   * @param isActive - true to activate, false to deactivate
   * @returns Updated User
   */
  async toggleActive(id: string, isActive: boolean): Promise<User> {
    return this.model.update({
      where: { id },
      data: { isActive },
    });
  }

  /**
   * Counts users by role
   *
   * @param role - EMPLOYEE | NURSE | MANAGER
   * @returns Number of users with this role
   */
  async countByRole(role: "EMPLOYEE" | "NURSE" | "MANAGER"): Promise<number> {
    return this.count({ role });
  }

  /**
   * Counts active users
   *
   * @returns Number of active users
   */
  async countActive(): Promise<number> {
    return this.count({
      isActive: true,
      deletedAt: null,
    });
  }

  /**
   * Finds users with pagination, sorting, and optional filtering
   *
   * Implementation Details:
   * - Uses Prisma's skip/take for database-level pagination (efficient)
   * - Executes two queries in parallel: count + data (via Promise.all)
   * - Builds dynamic WHERE clause based on provided filters
   * - Validates sortBy field against whitelist (prevents invalid queries)
   * - Defaults to createdAt DESC if sortBy is invalid or not provided
   *
   * Default Behavior (backward compatible):
   * - isActive: true (only active users)
   * - excludeDeleted: true (exclude soft-deleted users)
   * - role: undefined (all roles)
   *
   * Performance Considerations:
   * - Count query is optimized (only counts, no SELECT *)
   * - Indexed fields (id, email, cpf, role, createdAt) sort faster
   * - Parallel queries reduce total latency by ~50%
   * - Consider adding composite index: (role, isActive, deletedAt)
   *
   * @param params - Pagination and sorting parameters
   * @param filters - Optional filter criteria (role, isActive, excludeDeleted)
   * @returns Paginated list of users matching criteria
   *
   * @example
   * // List all active nurses
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
   */
  async findUsersPaginated(
    params: PaginationParams,
    filters: UserFilterParams = {}
  ): Promise<PaginatedResponse<User>> {
    const { page, perPage, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    // Default filters for backward compatibility
    const {
      role,
      isActive = true,        // Default: only active users
      excludeDeleted = true   // Default: exclude soft-deleted
    } = filters;

    // Build dynamic WHERE clause
    const where: Prisma.UserWhereInput = {};

    if (role !== undefined) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (excludeDeleted) {
      where.deletedAt = null;
    }

    // Validate and sanitize sortBy field
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    // Execute count and data queries in parallel
    const [total, users] = await Promise.all([
      this.model.count({ where }),
      this.model.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: {
          [safeSortBy]: sortOrder,
        },
      }),
    ]);

    // Calculate pagination metadata
    const pagination = calculatePaginationMetadata(page, perPage, total);

    return {
      data: users,
      pagination,
    };
  }
}
