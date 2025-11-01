import type { NextFunction, Request, Response } from "express";
import { UserService } from "@modules/user/services/userService";
import { UserRole, type CreateUserDTO } from "@shared/models/user";

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
 */
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

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
}
