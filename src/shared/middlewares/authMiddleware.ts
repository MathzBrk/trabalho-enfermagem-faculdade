/**
 * Authentication middleware for JWT token validation
 *
 * This middleware validates JWT tokens from the Authorization header
 * and attaches the decoded user data to req.user for downstream handlers.
 *
 */

import { verifyToken, TokenValidationError } from "@shared/helpers/tokenHelper";
import { NextFunction, Response, Request } from "express";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { env } from 'node:process';

interface AuthErrorResponse {
  error: string;
  message: string;
  code?: string;
}

/**
 * Authentication middleware that validates JWT tokens
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @security
 * - Validates Bearer token format
 * - Verifies JWT signature and expiration
 * - Attaches decoded payload to req.user (NOT req.body.user)
 * - Prevents privilege escalation via client-controlled req.body
 *
 * @returns 401 Unauthorized if authentication fails
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const response: AuthErrorResponse = {
      error: "Unauthorized",
      message: "Missing or invalid Authorization header. Expected format: 'Bearer <token>'",
    };

    res.status(401).json(response);

    return;
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.split(" ")[1];
  if (!token) {
    const response: AuthErrorResponse = {
      error: "Unauthorized",
      message: "Token is empty in Authorization header",
    };

    res.status(401).json(response);
    return;
  }

  try {
    const decoded = verifyToken(token);

    req.user = decoded;

    console.log(`Authenticated request for user ${decoded.userId}`);

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      const response: AuthErrorResponse = {
        error: "Unauthorized",
        message: "Token has expired. Please login again.",
        code: "TOKEN_EXPIRED",
      };

      if (env.NODE_ENV === "production") {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      res.status(401).json(response);
      return;
    }

    if (error instanceof JsonWebTokenError) {
      const response: AuthErrorResponse = {
        error: "Unauthorized",
        message: "Invalid token signature or format",
        code: "INVALID_TOKEN",
      };

      if (env.NODE_ENV === "production") {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      res.status(401).json(response);
      return;
    }

    if (error instanceof TokenValidationError) {
      const response: AuthErrorResponse = {
        error: "Unauthorized",
        message: error.message,
        code: "INVALID_PAYLOAD",
      };

      if (env.NODE_ENV === "production") {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      res.status(401).json(response);
      return;
    }

    // Unexpected error - log it and return generic error
    console.error("Unexpected authentication error:", error);

    res.status(401).json({ error: "Unauthorized" });
    return;
  }
};