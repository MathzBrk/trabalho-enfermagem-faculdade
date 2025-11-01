import { Router } from "express";
import { UserController } from "@modules/user/controllers/userController";

/**
 * User Routes
 *
 * Defines all HTTP endpoints for user-related operations
 */
const userRoutes = Router();
const userController = new UserController();

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
