import { Router } from "express";
import { UserController } from "@modules/user/controllers/userController";
import { container } from "@infrastructure/di/container";

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

export default userRoutes;
