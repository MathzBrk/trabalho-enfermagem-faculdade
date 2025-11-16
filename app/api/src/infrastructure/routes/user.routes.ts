import { Router } from 'express';
import { UserController } from '@modules/user/controllers/userController';
import { container } from '@infrastructure/di/container';
import { authMiddleware } from '@shared/middlewares/authMiddleware';
import { validateRequest } from '@shared/middlewares/validateRequest';
import { ListUsersQuerySchema } from '@modules/user/validators/listUsersValidator';
import { IdParamSchema } from '@modules/user/validators/idParamValidator';
import { UpdateUserBodySchema } from '@modules/user/validators/updateUserValidator';

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
userRoutes.post('/', userController.create.bind(userController));

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
  '/',
  authMiddleware,
  validateRequest({ query: ListUsersQuerySchema }),
  userController.listUsers.bind(userController),
);

/**
 * GET /users/:id
 * Get a single user by ID
 *
 * Authentication: Required (JWT token via authMiddleware)
 * Authorization:
 * - MANAGER: Can view any user
 * - Other roles: Can only view their own profile
 *
 * Path Parameters:
 * - id: string (UUID) - User ID
 *
 * Example:
 * GET /api/users/550e8400-e29b-41d4-a716-446655440000
 * Authorization: Bearer <JWT_TOKEN>
 *
 * Response: 200 OK
 * {
 *   "id": "550e8400-e29b-41d4-a716-446655440000",
 *   "name": "João Silva",
 *   "email": "joao@example.com",
 *   "cpf": "12345678900",
 *   "phone": "11999999999",
 *   "role": "EMPLOYEE",
 *   "coren": null,
 *   "isActive": true,
 *   "createdAt": "2024-01-01T00:00:00.000Z",
 *   "updatedAt": "2024-01-01T00:00:00.000Z"
 * }
 *
 * Errors:
 * - 401 Unauthorized: No authentication token
 * - 403 Forbidden: User trying to view another user's profile
 * - 404 Not Found: User not found or deleted
 *
 * Middleware Chain:
 * 1. authMiddleware - Verifies JWT token, sets req.user
 * 2. validateRequest - Validates params with Zod schema
 * 3. userController.getById - Handles business logic
 */
userRoutes.get(
  '/:id',
  authMiddleware,
  validateRequest({ params: IdParamSchema }),
  userController.getById.bind(userController),
);

/**
 * PATCH /users/:id
 * Update a user
 *
 * Authentication: Required (JWT token via authMiddleware)
 * Authorization:
 * - MANAGER: Can update any user, all fields
 * - Other roles: Can only update their own profile (name, phone)
 *
 * Path Parameters:
 * - id: string (UUID) - User ID
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
 * Example:
 * PATCH /api/users/550e8400-e29b-41d4-a716-446655440000
 * Authorization: Bearer <JWT_TOKEN>
 * Content-Type: application/json
 *
 * { "name": "João Silva Updated", "phone": "11988888888" }
 *
 * Response: 200 OK
 * {
 *   "id": "550e8400-e29b-41d4-a716-446655440000",
 *   "name": "João Silva Updated",
 *   "email": "joao@example.com",
 *   "phone": "11988888888",
 *   ...
 * }
 *
 * Errors:
 * - 401 Unauthorized: No authentication token
 * - 403 Forbidden: User trying to update another user or restricted fields
 * - 404 Not Found: User not found or deleted
 * - 409 Conflict: COREN already exists
 *
 * Middleware Chain:
 * 1. authMiddleware - Verifies JWT token, sets req.user
 * 2. validateRequest - Validates params and body with Zod schemas
 * 3. userController.update - Handles business logic
 */
userRoutes.patch(
  '/:id',
  authMiddleware,
  validateRequest({ params: IdParamSchema, body: UpdateUserBodySchema }),
  userController.update.bind(userController),
);

/**
 * DELETE /users/:id
 * Delete a user (soft delete)
 *
 * Authentication: Required (JWT token via authMiddleware)
 * Authorization: Only MANAGER can delete users
 *
 * Business Rules:
 * - Sets deletedAt timestamp and isActive=false
 * - Cannot delete yourself (prevents accidental lockout)
 * - Preserves data for audit trail
 *
 * Path Parameters:
 * - id: string (UUID) - User ID
 *
 * Example:
 * DELETE /api/users/550e8400-e29b-41d4-a716-446655440000
 * Authorization: Bearer <JWT_TOKEN>
 *
 * Response: 204 No Content
 *
 * Errors:
 * - 401 Unauthorized: No authentication token
 * - 403 Forbidden: User is not MANAGER or trying to delete themselves
 * - 404 Not Found: User not found or already deleted
 *
 * Middleware Chain:
 * 1. authMiddleware - Verifies JWT token, sets req.user
 * 2. validateRequest - Validates params with Zod schema
 * 3. userController.delete - Handles business logic
 */
userRoutes.delete(
  '/:id',
  authMiddleware,
  validateRequest({ params: IdParamSchema }),
  userController.delete.bind(userController),
);

export default userRoutes;
