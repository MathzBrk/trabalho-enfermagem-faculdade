import type { NextFunction, Request, Response } from "express";
import { UserService } from "@modules/user/services/userService";
import { UserRole, type CreateUserDTO } from "@shared/models/user";
import { injectable } from "tsyringe";
import { PAGINATION_DEFAULTS } from "@shared/interfaces/pagination";
import { UserFilterParams } from "@shared/interfaces/user";
import { GetUsersQueryParams } from "../types/userTypes";

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
  constructor(
    private readonly userService: UserService
  ) {}

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
      
      const validRoles = Object.values(UserRole);

      if (!validRoles.includes(role)) {
        res.status(400).json({
          error: "Invalid role",
          validRoles,
        });
        return;
      }

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
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, perPage, sortBy, sortOrder, role, isActive, excludeDeleted } = req.query as GetUsersQueryParams;

      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
        return;
      }

      const filters: UserFilterParams = {};
      if (role !== undefined) filters.role = role as UserRole;
      if (isActive !== undefined) filters.isActive = isActive as boolean;
      if (excludeDeleted !== undefined) filters.excludeDeleted = excludeDeleted as boolean;

      const result = await this.userService.listUsers(
        userId,
        { page: page || PAGINATION_DEFAULTS.PAGE, perPage: perPage || PAGINATION_DEFAULTS.PER_PAGE, sortBy, sortOrder },
        Object.keys(filters).length > 0 ? filters : undefined
      );

      // Return successful response
      res.status(200).json(result);
    } catch (error) {
      // Pass error to Express error handling middleware
      next(error);
    }
  }
}
