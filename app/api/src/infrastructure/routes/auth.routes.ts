import { container } from '@infrastructure/di/container';
import { AuthController } from '@modules/user/controllers/authController';
import { LoginSchema } from '@modules/user/validators/loginValidator';
import { RegisterSchema } from '@modules/user/validators/registerValidator';
import { registerRateLimiter } from '@shared/middlewares/rateLimiter';
import { validateRequest } from '@shared/middlewares/validateRequest';
import { Router } from 'express';

/**
 * Authentication Routes
 *
 * Defines all HTTP endpoints for authentication operations.
 * Controller is resolved from DI container to ensure all dependencies
 * are properly injected.
 */
const authRoutes = Router();

// Resolve AuthController from DI container
// This ensures all dependencies (AuthService, UserStore, etc.) are injected
const authController = container.resolve(AuthController);

/**
 * POST /auth/login
 * Authenticate a user and return JWT token
 *
 * Body:
 * {
 *   "email": "user@example.com",
 *   "password": "Password123!"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "user": { ... },
 *     "token": "jwt_token_here",
 *     "expiresIn": "7d"
 *   }
 * }
 */
authRoutes.post(
  '/login',
  validateRequest(LoginSchema),
  authController.login.bind(authController),
);

/**
 * POST /auth/register
 * Register a new user and return JWT token
 *
 * Body:
 * {
 *   "name": "João Silva",
 *   "email": "joao@example.com",
 *   "password": "Password123!",
 *   "cpf": "12345678900",
 *   "phone": "11999999999",
 *   "role": "EMPLOYEE" | "NURSE" | "MANAGER",
 *   "coren": "COREN-123456" (required if role = NURSE)
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "user": { ... },
 *     "token": "jwt_token_here",
 *     "expiresIn": "7d"
 *   }
 * }
 */
authRoutes.post(
  '/register',
  registerRateLimiter,
  validateRequest(RegisterSchema),
  authController.register.bind(authController),
);

export default authRoutes;
