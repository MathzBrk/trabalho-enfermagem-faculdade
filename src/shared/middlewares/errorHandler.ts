import type { NextFunction, Request, Response } from "express";

/**
 * Interface para erros customizados da aplicação
 */
interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Global Error Handler Middleware
 *
 * Centralizes error handling for the entire application.
 * Catches errors passed via next(error) and returns appropriate HTTP responses.
 *
 * Handles:
 * - Custom application errors (AppError with statusCode)
 * - Prisma database errors
 * - Generic errors
 *
 * @param error - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error("Error:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    statusCode: error.statusCode,
  });

  // Handle custom application errors (EmailAlreadyExistsError, etc)
  if (error.statusCode && error.isOperational) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
    return;
  }

  // Handle Prisma errors
  if ("code" in error) {
    const prismaError = error as any;

    // Unique constraint violation
    if (prismaError.code === "P2002") {
      res.status(409).json({
        success: false,
        error: "Resource already exists",
        field: prismaError.meta?.target,
      });
      return;
    }

    // Record not found
    if (prismaError.code === "P2025") {
      res.status(404).json({
        success: false,
        error: "Resource not found",
      });
      return;
    }
  }

  // Generic error fallback
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
};
