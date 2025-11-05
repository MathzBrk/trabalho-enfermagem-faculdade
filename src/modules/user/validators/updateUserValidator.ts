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
 * - coren: required when role is NURSE
 */
export const UpdateUserBodySchema = z
  .object({
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
    coren: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      // If role is being changed to NURSE, coren must be provided
      if (data.role === Role.NURSE && !data.coren) {
        return false;
      }
      return true;
    },
    {
      message: 'COREN is required when role is NURSE',
      path: ['coren'],
    }
  );

export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;
