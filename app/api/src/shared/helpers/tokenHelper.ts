/**
 * Token helper utilities for JWT operations
 *
 * Provides functions for verifying and managing JWT tokens.
 * Uses centralized environment configuration for JWT_SECRET.
 */

import * as jwt from 'jsonwebtoken';
import { env } from 'node:process';
import { TokenPayload } from '../../@types/express';

/**
 * Custom error for token validation failures
 */
export class TokenValidationError extends Error {
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'TokenValidationError';
    this.originalError = originalError;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TokenValidationError);
    }
  }
}

/**
 * Verifies and decodes a JWT token
 *
 * @param token - The JWT token string to verify
 * @returns The decoded token payload
 * @throws {TokenExpiredError} If the token has expired
 * @throws {JsonWebTokenError} If the token is invalid or malformed
 * @throws {TokenValidationError} If the token payload is invalid
 *
 * @remarks
 * This function validates the token signature using JWT_SECRET from environment.
 * It also ensures the decoded payload contains the required 'userId' field.
 * Specific JWT errors are allowed to bubble up for fine-grained error handling.
 */
export const verifyToken = (token: string): TokenPayload => {
  // JWT library will throw TokenExpiredError or JsonWebTokenError
  // We intentionally let these bubble up for specific handling in middleware
  const decoded = jwt.verify(token, env.JWT_SECRET);

  // Ensure the decoded token is an object (not a string)
  if (typeof decoded === 'string') {
    throw new TokenValidationError('Token payload must be an object, not a string');
  }

  return decoded as TokenPayload;
};

/**
 * Generates a new JWT token
 *
 * @param payload - The payload to encode in the token
 * @param expiresIn - Token expiration time (e.g., '1h', '7d', '30m')
 * @returns The signed JWT token string
 *
 * @remarks
 * Default expiration is 1 hour if not specified.
 * The 'sub' claim should contain the user ID.
 */
export const generateToken = (
  payload: TokenPayload,
  expiresIn: string = '1h'
): string => {
  return jwt.sign(
    payload,
    env.JWT_SECRET,
    {
      expiresIn: expiresIn as `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}` | `${number}`,
      issuer: 'univas-enfermagem-api',
    }
  );
};