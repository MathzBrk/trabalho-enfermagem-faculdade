import { z } from 'zod';

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .max(255, 'Email too long'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password too long')
});

export type LoginDTO = z.infer<typeof LoginSchema>;
