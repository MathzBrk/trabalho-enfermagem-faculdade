import { Router } from "express";
import { AuthController } from "@modules/user/controllers/authController";
import { validateRequest } from "@shared/middlewares/validateRequest";
import { loginRateLimiter, registerRateLimiter } from "@shared/middlewares/rateLimiter";
import { LoginSchema } from "@modules/user/validators/loginValidator";
import { RegisterSchema } from "@modules/user/validators/registerValidator";

/**
 * Authentication Routes
 *
 * Defines all HTTP endpoints for authentication operations
 */
const authRoutes = Router();
const authController = new AuthController();

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
  "/login",
  loginRateLimiter,
  validateRequest(LoginSchema),
  authController.login.bind(authController)
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
  "/register",
  registerRateLimiter,
  validateRequest(RegisterSchema),
  authController.register.bind(authController)
);

export default authRoutes;
