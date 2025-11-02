import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .max(255, 'Email too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name too long')
    .trim(),
  cpf: z
    .string()
    .min(1, 'CPF is required')
    .regex(/^\d{11}$/, 'CPF must be exactly 11 digits'),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .regex(/^\d{10,11}$/, 'Phone must be 10 or 11 digits'),
  role: z.enum(['EMPLOYEE', 'NURSE', 'MANAGER']),
  coren: z
    .string()
    .optional()
})
  .superRefine((data, ctx) => {
    if (data.role === 'NURSE') {
      if (!data.coren || data.coren.trim().length === 0) {
        ctx.addIssue({
          path: ['coren'],
          code: z.ZodIssueCode.custom,
          message: 'COREN is required for NURSE role',
        });
      }
    } else if (data.coren && data.coren.trim().length === 0) {
      ctx.addIssue({
        path: ['coren'],
        code: z.ZodIssueCode.custom,
        message: 'COREN cannot be empty if provided',
      });
    }
  });

export type RegisterDTO = z.infer<typeof RegisterSchema>;
