import type { NextFunction, Request, Response } from 'express';

// biome-ignore lint/style/useImportType: I need to import types this way to avoid circular dependencies
import { UserService } from '@modules/user/services/userService';
import type {
  UserRole,
  CreateUserDTO,
  UpdateUserDTO,
} from '@shared/models/user';
import { injectable } from 'tsyringe';
import { PAGINATION_DEFAULTS } from '@shared/interfaces/pagination';
import type { UserFilterParams } from '@shared/interfaces/user';
import type { ListUsersQuery } from '@modules/user/validators/listUsersValidator';

/**
 * UserController - HTTP request handler for user endpoints
 *
 * Responsibilities:
 * - HTTP request/response handling
 * - Request validation
 * - Calling appropriate service methods
 * - Formatting HTTP responses
 * - Error handling and appropriate status codes
 *
 * This controller stays thin by delegating business logic to UserService.
 * It focuses solely on HTTP concerns and request/response transformation.
 *
 * Dependencies:
 * - UserService: Injected via constructor for user business logic
 */
@injectable()
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Creates a new user
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Promise<void> - Delegates error handling to next()
   *
   * @example
   * POST /users
   * {
   *   "name": "João Silva",
   *   "email": "joao@example.com",
   *   "password": "senha123",
   *   "cpf": "12345678900",
   *   "role": "EMPLOYEE"
   * }
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, cpf, phone, role, coren } = req.body;

      const createUserDTO: CreateUserDTO = {
        name,
        email,
        password,
        cpf,
        phone,
        role,
        coren,
      };

      // Call service to create user
      const user = await this.userService.createUser(createUserDTO);

      // Return success response with 201 Created
      res.status(201).json(user);
    } catch (error) {
      // Pass error to Express error handling middleware
      next(error);
    }
  }

  /**
   * Lists users with pagination and filtering
   *
   * HTTP Endpoint: GET /users
   * Query Parameters:
   * - page: number (default: 1)
   * - perPage: number (default: 10, max: 100)
   * - sortBy: string (default: 'createdAt')
   * - sortOrder: 'asc' | 'desc' (default: 'desc')
   * - role: 'EMPLOYEE' | 'NURSE' | 'MANAGER' (optional)
   * - isActive: boolean (optional, default: true)
   * - excludeDeleted: boolean (optional, default: true)
   *
   * Examples:
   * - GET /api/users → List all active users (default)
   * - GET /api/users?role=NURSE → List active nurses
   * - GET /api/users?role=MANAGER&isActive=false → List inactive managers
   *
   * Response: 200 OK
   * {
   *   "data": [{ user objects without passwords }],
   *   "pagination": {
   *     "page": 1,
   *     "perPage": 10,
   *     "total": 45,
   *     "totalPages": 5,
   *     "hasNext": true,
   *     "hasPrev": false
   *   }
   * }
   *
   * Errors:
   * - 401 Unauthorized: No authentication token
   * - 403 Forbidden: User is not MANAGER
   * - 400 Bad Request: Invalid query parameters
   *
   * @param req - Express request (authenticated via middleware)
   * @param res - Express response
   * @param next - Express next function
   */
  async listUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // req.query is already validated and transformed by validateRequest middleware
      const {
        page,
        perPage,
        sortBy,
        sortOrder,
        role,
        isActive,
        excludeDeleted,
      } = req.query as unknown as ListUsersQuery;

      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const filters: UserFilterParams = {};
      if (role !== undefined) filters.role = role as UserRole;
      if (isActive !== undefined) filters.isActive = isActive;
      if (excludeDeleted !== undefined) filters.excludeDeleted = excludeDeleted;

      const result = await this.userService.listUsers(
        userId,
        {
          page: page || PAGINATION_DEFAULTS.PAGE,
          perPage: perPage || PAGINATION_DEFAULTS.PER_PAGE,
          sortBy,
          sortOrder,
        },
        Object.keys(filters).length > 0 ? filters : undefined,
      );

      // Return successful response
      res.status(200).json(result);
    } catch (error) {
      // Pass error to Express error handling middleware
      next(error);
    }
  }

  /**
   * Gets a user by ID
   *
   * HTTP Endpoint: GET /users/:id
   *
   * Authorization:
   * - MANAGER: Can view any user
   * - Other roles: Can only view their own profile
   *
   * Response: 200 OK
   * {
   *   "id": "uuid",
   *   "name": "João Silva",
   *   "email": "joao@example.com",
   *   ...
   * }
   *
   * Errors:
   * - 401 Unauthorized: No authentication token
   * - 403 Forbidden: User trying to view another user's profile
   * - 404 Not Found: User not found or deleted
   *
   * @param req - Express request with id param
   * @param res - Express response
   * @param next - Express next function
   */
  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const user = await this.userService.getUserById(id, userId);

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates a user
   *
   * HTTP Endpoint: PATCH /users/:id
   *
   * Authorization:
   * - MANAGER: Can update any user, all fields
   * - Other roles: Can only update their own profile (name, phone)
   *
   * Request Body (all fields optional):
   * {
   *   "name": "João Silva",
   *   "phone": "11999999999",
   *   "isActive": true,      // MANAGER only
   *   "role": "NURSE",       // MANAGER only
   *   "coren": "123456"      // Required if role is NURSE
   * }
   *
   * Response: 200 OK
   * {
   *   "id": "uuid",
   *   "name": "João Silva",
   *   ...
   * }
   *
   * Errors:
   * - 401 Unauthorized: No authentication token
   * - 403 Forbidden: User trying to update another user or restricted fields
   * - 404 Not Found: User not found or deleted
   * - 409 Conflict: COREN already exists
   *
   * @param req - Express request with id param and body
   * @param res - Express response
   * @param next - Express next function
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const updateData: UpdateUserDTO = req.body;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const updatedUser = await this.userService.updateUser(
        id,
        updateData,
        userId,
      );

      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes a user (soft delete)
   *
   * HTTP Endpoint: DELETE /users/:id
   *
   * Authorization:
   * - Only MANAGER can delete users
   * - Cannot delete yourself
   *
   * Response: 204 No Content
   *
   * Errors:
   * - 401 Unauthorized: No authentication token
   * - 403 Forbidden: User is not MANAGER or trying to delete themselves
   * - 404 Not Found: User not found or already deleted
   *
   * @param req - Express request with id param
   * @param res - Express response
   * @param next - Express next function
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      await this.userService.deleteUser(id, userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
