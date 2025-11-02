import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

/**
 * Middleware para validação de request body usando Zod schemas
 *
 * @param schema - Zod schema para validar o request body
 * @returns Middleware function
 *
 * @example
 * router.post('/login', validateRequest(LoginSchema), authController.login);
 */
export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Valida e transforma o body
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      next(error);
    }
  };
};
