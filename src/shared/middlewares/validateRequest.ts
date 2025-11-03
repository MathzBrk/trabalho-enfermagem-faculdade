import { NextFunction, Request, Response } from 'express';
import { z, ZodTypeAny } from 'zod';

/**
 * ValidationOptions - Configure which parts of the request to validate
 */
interface ValidationOptions {
  /** Zod schema to validate request body */
  body?: ZodTypeAny;
  /** Zod schema to validate query parameters */
  query?: ZodTypeAny;
  /** Zod schema to validate route parameters */
  params?: ZodTypeAny;
}

/**
 * Middleware para validação de request usando Zod schemas
 *
 * Supports validation of:
 * - Request body (POST, PUT, PATCH)
 * - Query parameters (GET)
 * - Route parameters (/:id)
 *
 * @param options - Validation options with schemas
 * @returns Middleware function
 *
 * @example
 * // Validate body only (backward compatible)
 * router.post('/login', validateRequest({ body: LoginSchema }), authController.login);
 *
 * @example
 * // Validate query parameters
 * router.get('/users', validateRequest({ query: ListUsersQuerySchema }), userController.listUsers);
 *
 * @example
 * // Validate multiple parts
 * router.put('/users/:id', validateRequest({
 *   params: IdParamSchema,
 *   body: UpdateUserSchema
 * }), userController.update);
 */
export const validateRequest = (options: ValidationOptions | ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Backward compatibility: if a schema is passed directly, treat it as body validation
      let validationOptions: ValidationOptions;

      if ('body' in options || 'query' in options || 'params' in options) {
        validationOptions = options as ValidationOptions;
      } else {
        validationOptions = { body: options as ZodTypeAny };
      }

      // Validate body if schema provided
      if (validationOptions.body) {
        const validatedBody = await validationOptions.body.parseAsync(req.body);
        // Override body property to ensure validated data is used
        Object.defineProperty(req, 'body', {
          value: validatedBody,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }

      // Validate query parameters if schema provided
      if (validationOptions.query) {
        // Create a plain object copy to avoid read-only issues
        const queryData = { ...req.query };
        const validatedQuery = await validationOptions.query.parseAsync(queryData);
        Object.defineProperty(req, 'query', {
          value: validatedQuery,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }

      // Validate route parameters if schema provided
      if (validationOptions.params) {
        const paramsData = { ...req.params };
        const validatedParams = await validationOptions.params.parseAsync(paramsData);
        // Override params property for consistency
        Object.defineProperty(req, 'params', {
          value: validatedParams,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }

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
