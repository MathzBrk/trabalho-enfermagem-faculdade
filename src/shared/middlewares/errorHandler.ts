import type { NextFunction, Request, Response } from "express";

/**
 * Global Error Handler Middleware
 *
 * Centralizes error handling for the entire application.
 * Catches errors passed via next(error) and returns appropriate HTTP responses.
 *
 * @param error - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error("Error:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  if ("code" in error) {
    const prismaError = error as any;

    if (prismaError.code === "P2002") {
      res.status(409).json({
        error: "Resource already exists",
        field: prismaError.meta?.target,
      });
      return;
    }

    // Record not found
    if (prismaError.code === "P2025") {
      res.status(404).json({
        error: "Resource not found",
      });
      return;
    }
  }

  res.status(500).json({
    error: "Internal server error",
  });
};
