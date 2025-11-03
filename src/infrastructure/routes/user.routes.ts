import { Router } from "express";
import { UserController } from "@modules/user/controllers/userController";
import { container } from "@infrastructure/di/container";
import { authMiddleware } from "@shared/middlewares/authMiddleware";
import { validateRequest } from "@shared/middlewares/validateRequest";
import { ListUsersQuerySchema } from "@modules/user/validators/listUsersValidator";

/**
 * User Routes
 *
 * Defines all HTTP endpoints for user-related operations.
 * Controller is resolved from DI container to ensure all dependencies
 * are properly injected.
 */
const userRoutes = Router();

// Resolve UserController from DI container
const userController = container.resolve(UserController);

/**
 * POST /users
 * Create a new user
 *
 * Body:
 * {
 *   "name": "João Silva",
 *   "email": "joao@example.com",
 *   "password": "senha123",
 *   "cpf": "12345678900",
 *   "role": "EMPLOYEE" | "NURSE" | "MANAGER",
 *   "phone": "11999999999" (optional),
 *   "coren": "COREN-123456" (required if role = NURSE)
 * }
 */
userRoutes.post("/", userController.create.bind(userController));

/**
 * GET /users
 * List users with pagination
 *
 * Authentication: Required (JWT token via authMiddleware)
 * Authorization: MANAGER role only (enforced in service layer)
 *
 * Query Parameters:
 * - page: number (default: 1) - Page number (1-indexed)
 * - perPage: number (default: 10, max: 100) - Items per page
 * - sortBy: string (default: 'createdAt') - Field to sort by
 * - sortOrder: 'asc' | 'desc' (default: 'desc') - Sort direction
 *
 * Valid sortBy fields:
 * - id, name, email, cpf, coren, role, phone, isActive, createdAt, updatedAt
 *
 * Example:
 * GET /api/users?page=2&perPage=20&sortBy=name&sortOrder=asc
 * Authorization: Bearer <JWT_TOKEN>
 *
 * Response: 200 OK
 * {
 *   "data": [
 *     {
 *       "id": "1",
 *       "name": "João Silva",
 *       "email": "joao@example.com",
 *       "cpf": "12345678900",
 *       "role": "MANAGER",
 *       ...
 *     }
 *   ],
 *   "pagination": {
 *     "page": 2,
 *     "perPage": 20,
 *     "total": 45,
 *     "totalPages": 3,
 *     "hasNext": true,
 *     "hasPrev": true
 *   }
 * }
 *
 * Middleware Chain:
 * 1. authMiddleware - Verifies JWT token, sets req.user
 * 2. validateRequest - Validates query params with Zod schema
 * 3. userController.listUsers - Handles business logic
 */
userRoutes.get(
  "/",
  authMiddleware,
  validateRequest({ query: ListUsersQuerySchema }),
  userController.listUsers.bind(userController)
);

export default userRoutes;
