import type { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import type { AuthService } from '../services/authService';

/**
 * AuthController - HTTP layer for authentication endpoints
 *
 * Handles HTTP requests/responses for authentication operations.
 * Delegates business logic to AuthService.
 *
 * Dependencies:
 * - AuthService: Injected via constructor for authentication logic
 */
@injectable()
export class AuthController {
  constructor(@inject('AuthService') private readonly authService: AuthService) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userData = req.body;

      const result = await this.authService.register(userData);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
