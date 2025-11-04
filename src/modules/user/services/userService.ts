import { TOKENS } from '@infrastructure/di/tokens';
import { hashPassword } from '@shared/helpers/passwordHelper';
import { normalizeEmail, toUserResponse } from '@shared/helpers/userHelper';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@shared/interfaces/pagination';
import type { IUserStore, UserFilterParams } from '@shared/interfaces/user';
import {
  type CreateUserDTO,
  type UserResponse,
  UserRole,
} from '@shared/models/user';
import dayjs from 'dayjs';
import { inject, injectable } from 'tsyringe';
import {
  CORENAlreadyExistsError,
  CPFAlreadyExistsError,
  EmailAlreadyExistsError,
  ForbiddenError,
  UserNotFoundError,
  ValidationError,
} from '../errors';

/**
 * UserService - Service layer for user business logic
 *
 * Responsible for:
 * - User creation with validation
 * - Business rules enforcement
 * - Data transformation and sanitization
 * - Orchestrating store operations
 *
 * This service handles all business logic related to users,
 * keeping the controller thin and focused on HTTP concerns.
 *
 * Dependencies:
 * - IUserStore: Injected via constructor for data access operations
 *   Allows switching between Prisma (production) and Mock (testing)
 */
@injectable()
export class UserService {
  constructor(
    @inject(TOKENS.IUserStore) private readonly userStore: IUserStore,
  ) {}

  /**
   * Creates a new user in the system
   *
   * Business rules enforced:
   * - Email must be unique
   * - CPF must be unique
   * - NURSE role requires a unique COREN
   * - Password is hashed before storage
   * - Response excludes sensitive data (password)
   *
   * @param data - User creation data
   * @returns User object without password
   * @throws Error if validation fails or duplicate data exists
   *
   * @example
   * const user = await userService.createUser({
   *   name: "João Silva",
   *   email: "joao@example.com",
   *   password: "securepass123",
   *   cpf: "12345678900",
   *   role: "EMPLOYEE"
   * });
   */
  async createUser(data: CreateUserDTO): Promise<UserResponse> {
    try {
      await this.validateUserUniqueness(data);

      const hashedPassword = await hashPassword(data.password);

      const user = await this.userStore.create({
        name: data.name,
        email: normalizeEmail(data.email),
        password: hashedPassword,
        cpf: data.cpf,
        phone: data.phone,
        role: data.role,
        coren: data.coren,
        updatedAt: dayjs().toDate(),
      });

      return toUserResponse(user);
    } catch (error) {
      console.log('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Lists users with pagination, sorting, and filtering
   *
   * Business Rules:
   * - Only MANAGER role can access user list
   * - Supports filtering by role (EMPLOYEE, NURSE, MANAGER)
   * - Supports filtering by active status
   * - Default: Returns only active, non-deleted users
   * - Sensitive data (password) excluded from response
   * - Pagination prevents excessive data transfer
   *
   * Authorization:
   * This method requires the requesting user to have MANAGER role.
   * Authentication check must be done at controller/middleware level.
   *
   * @param requestingUserId - ID of user making the request (for authorization)
   * @param params - Pagination and sorting parameters
   * @param filters - Optional filter criteria (role, isActive, excludeDeleted)
   * @returns Paginated list of users without sensitive data
   * @throws UserNotFoundError if requesting user not found
   * @throws ForbiddenError if requesting user is not MANAGER
   *
   * @example
   * // List all active nurses
   * const result = await userService.listUsers(
   *   'manager-user-id',
   *   { page: 1, perPage: 20, sortBy: 'name', sortOrder: 'asc' },
   *   { role: 'NURSE' }
   * );
   *
   * @example
   * // List inactive managers
   * const result = await userService.listUsers(
   *   'manager-user-id',
   *   { page: 1, perPage: 20 },
   *   { role: 'MANAGER', isActive: false }
   * );
   */
  async listUsers(
    requestingUserId: string,
    params: PaginationParams,
    filters?: UserFilterParams,
  ): Promise<PaginatedResponse<UserResponse>> {
    // Authorization: verify requesting user exists and has MANAGER role
    const requestingUser = await this.userStore.findById(requestingUserId);

    if (!requestingUser) {
      throw new UserNotFoundError('User not found');
    }

    if (requestingUser.role !== UserRole.MANAGER) {
      throw new ForbiddenError('Only MANAGER role can access user list');
    }

    // Fetch paginated users from store with filters
    const result = await this.userStore.findUsersPaginated(params, filters);

    // Transform users to response format (exclude passwords)
    return {
      data: result.data.map(toUserResponse),
      pagination: result.pagination,
    };
  }

  private async validateUserUniqueness(data: CreateUserDTO): Promise<void> {
    const normalizedEmail = normalizeEmail(data.email);
    const emailExists = await this.userStore.emailExists(normalizedEmail);
    if (emailExists) {
      throw new EmailAlreadyExistsError();
    }

    const cpfExists = await this.userStore.cpfExists(data.cpf);
    if (cpfExists) {
      throw new CPFAlreadyExistsError();
    }

    if (data.role === 'NURSE') {
      if (!data.coren) {
        throw new ValidationError('COREN is required for NURSE role');
      }

      const corenExists = await this.userStore.corenExists(data.coren);
      if (corenExists) {
        throw new CORENAlreadyExistsError();
      }
    }
  }
}
