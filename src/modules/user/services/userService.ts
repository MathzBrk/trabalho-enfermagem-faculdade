import { TOKENS } from '@infrastructure/di/tokens';
import { hashPassword } from '@shared/helpers/passwordHelper';
import {
  canAccessUser,
  normalizeEmail,
  toUserResponse,
} from '@shared/helpers/userHelper';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@shared/interfaces/pagination';
import type { IUserStore, UserFilterParams } from '@shared/interfaces/user';
import type {
  CreateUserDTO,
  UpdateUserDTO,
  User,
  UserResponse,
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

    if (requestingUser.role !== 'MANAGER') {
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

  /**
   * Gets a user by ID
   *
   * Business Rules:
   * - MANAGER: Can view any user
   * - Other roles: Can only view their own profile
   * - Deleted users are treated as not found
   *
   * @param id - ID of the user to retrieve
   * @param requestingUserId - ID of user making the request (for authorization)
   * @returns User object without password
   * @throws UserNotFoundError if user not found or deleted
   * @throws ForbiddenError if non-manager tries to view another user's profile
   *
   * @example
   * // Manager viewing any user
   * const user = await userService.getUserById('user-id', 'manager-id');
   *
   * @example
   * // User viewing their own profile
   * const user = await userService.getUserById('user-id', 'user-id');
   */
  async getUserById(
    id: string,
    requestingUserId: string,
  ): Promise<UserResponse> {
    // Fetch the user to view
    const user = await this.userStore.findById(id);

    if (!user || user.deletedAt) {
      throw new UserNotFoundError('User not found');
    }

    // Fetch the requesting user for authorization
    const requestingUser = await this.userStore.findById(requestingUserId);

    if (!requestingUser) {
      throw new UserNotFoundError('Requesting user not found');
    }

    const hasAccess = canAccessUser({
      requester: requestingUser,
      targetUser: user,
      reqType: 'view',
    });

    if (!hasAccess) {
      throw new ForbiddenError('You do not have permission to view this user');
    }

    return toUserResponse(user);
  }

  /**
   * Updates a user
   *
   * Business Rules:
   * - MANAGER: Can update any user, all fields (name, phone, isActive, role, coren)
   * - Other roles: Can only update their own profile (name, phone only)
   * - Role change to NURSE requires COREN
   * - COREN must be unique if changed
   * - Deleted users cannot be updated
   *
   * @param id - ID of the user to update
   * @param data - Fields to update (all optional)
   * @param requestingUserId - ID of user making the request (for authorization)
   * @returns Updated user object without password
   * @throws UserNotFoundError if user not found or deleted
   * @throws ForbiddenError if user lacks permission to update
   * @throws CORENAlreadyExistsError if COREN already exists
   *
   * @example
   * // Manager updating any user
   * const user = await userService.updateUser(
   *   'user-id',
   *   { isActive: false },
   *   'manager-id'
   * );
   *
   * @example
   * // User updating their own profile
   * const user = await userService.updateUser(
   *   'user-id',
   *   { name: 'New Name', phone: '11999999999' },
   *   'user-id'
   * );
   */
  async updateUser(
    id: string,
    data: UpdateUserDTO,
    requestingUserId: string,
  ): Promise<UserResponse> {
    // Fetch user to update
    const user = await this.userStore.findById(id);

    if (!user || user.deletedAt) {
      throw new UserNotFoundError('User not found');
    }

    // Fetch requesting user for authorization
    const requestingUser = await this.userStore.findById(requestingUserId);

    if (!requestingUser) {
      throw new UserNotFoundError('Requesting user not found');
    }

    // Authorization check using centralized function
    const hasAccess = canAccessUser({
      requester: requestingUser,
      targetUser: user,
      reqType: 'modify',
      dataUpdates: data,
    });

    if (!hasAccess) {
      throw new ForbiddenError(
        'You do not have permission to modify this user or these fields',
      );
    }

    const isChangingToNurse = data.role === 'NURSE' && user.role !== 'NURSE';
    const finalCoren = data.coren ?? user.coren;

    if (isChangingToNurse && !finalCoren) {
      throw new ValidationError(
        'COREN is required when changing role to NURSE',
      );
    }

    // Validate COREN uniqueness if changed
    if (data.coren && data.coren !== user.coren) {
      const corenExists = await this.userStore.corenExists(data.coren);
      if (corenExists) {
        throw new CORENAlreadyExistsError();
      }
    }

    // Update user
    const updatedUser = await this.userStore.update(id, {
      ...data,
      updatedAt: dayjs().toDate(),
    });

    return toUserResponse(updatedUser);
  }

  /**
   * Deletes a user (soft delete)
   *
   * Business Rules:
   * - Only MANAGER can delete users
   * - Cannot delete yourself (prevent accidental lockout)
   * - Uses soft delete (sets deletedAt and isActive=false)
   * - Deleted users are preserved for audit trail
   *
   * @param id - ID of the user to delete
   * @param requestingUserId - ID of user making the request (for authorization)
   * @throws UserNotFoundError if user not found or already deleted
   * @throws ForbiddenError if user is not MANAGER or trying to delete themselves
   *
   * @example
   * await userService.deleteUser('user-to-delete-id', 'manager-id');
   */
  async deleteUser(id: string, requestingUserId: string): Promise<void> {
    // Fetch user to delete
    const user = await this.userStore.findById(id);

    if (!user || user.deletedAt) {
      throw new UserNotFoundError('User not found');
    }

    // Fetch requesting user for authorization
    const requestingUser = await this.userStore.findById(requestingUserId);

    if (!requestingUser) {
      throw new UserNotFoundError('Requesting user not found');
    }

    // Authorization check using centralized function
    const hasAccess = canAccessUser({
      requester: requestingUser,
      targetUser: user,
      reqType: 'delete',
    });

    if (!hasAccess) {
      throw new ForbiddenError(
        'Only MANAGER can delete users and you cannot delete yourself',
      );
    }

    // Soft delete the user
    await this.userStore.softDelete(id);
  }

  /**
   * Validates if a user exists and returns it
   *
   * This utility method provides a centralized way to validate user existence
   * across the application, ensuring consistent error handling and business rules.
   *
   * Business Rules:
   * - Deleted users (deletedAt is set) are treated as not found
   * - Non-existent users throw UserNotFoundError
   *
   * @param userId - ID of the user to validate
   * @returns User object if exists and not deleted
   * @throws UserNotFoundError if user not found or deleted
   *
   * @example
   * const user = await userService.validateUserExists('user-id');
   */
  async validateUserExists(userId: string): Promise<User> {
    const user = await this.userStore.findById(userId);
    if (!user || user.deletedAt) {
      throw new UserNotFoundError('User not found');
    }
    return user;
  }

  /**
   * Validates if a user has MANAGER role
   *
   * This utility method provides authorization validation for operations
   * that require MANAGER role. It combines existence check with role validation
   * in a single operation.
   *
   * Business Rules:
   * - User must exist and not be deleted
   * - User must have MANAGER role
   *
   * @param userId - ID of the user to validate
   * @throws UserNotFoundError if user not found or deleted
   * @throws ForbiddenError if user is not a MANAGER
   *
   * @example
   * await userService.validateManagerRole('user-id');
   * // If no exception thrown, user is a MANAGER and can proceed
   */
  async validateManagerRole(userId: string): Promise<void> {
    const user = await this.validateUserExists(userId);
    if (user.role !== 'MANAGER') {
      throw new ForbiddenError('Only MANAGER can perform this action');
    }
  }

  /**
   * Gets user role for authorization checks
   *
   * This utility method retrieves a user's role for authorization logic
   * in other services. It ensures the user exists before returning the role.
   *
   * Business Rules:
   * - User must exist and not be deleted
   *
   * @param userId - ID of the user
   * @returns User role (EMPLOYEE, NURSE, or MANAGER)
   * @throws UserNotFoundError if user not found or deleted
   *
   * @example
   * const role = await userService.getUserRole('user-id');
   * if (role === 'MANAGER') {
   *   // Show admin features
   * }
   */
  async getUserRole(userId: string): Promise<UserRole> {
    const user = await this.validateUserExists(userId);
    return user.role;
  }

  async getUserWithoutValidation(userId: string): Promise<User | null> {
    return this.userStore.findById(userId);
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
