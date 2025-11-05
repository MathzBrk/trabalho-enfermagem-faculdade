import { z } from 'zod';
import { Role } from '@prisma/client';

/**
 * Validation schema for updating user information
 *
 * Rules:
 * - name: min 2 chars, max 255
 * - phone: 10-11 digits
 * - isActive: boolean (MANAGER only - enforced in service layer)
 * - role: EMPLOYEE | NURSE | MANAGER (MANAGER only - enforced in service layer)
 * - coren: optional string (business logic validation in service layer)
 *
 * Note: The validator only checks data types and formats.
 * Complex business rules (e.g., "COREN required when changing TO NURSE role")
 * are validated in the service layer where we have access to current user data.
 */
export const UpdateUserBodySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters')
    .trim()
    .optional(),
  phone: z
    .string()
    .regex(/^\d{10,11}$/, 'Phone must contain 10-11 digits')
    .optional(),
  isActive: z.boolean().optional(),
  role: z.nativeEnum(Role).optional(),
  coren: z.string().trim().min(1, 'COREN must not be empty').optional(),
});

export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;
