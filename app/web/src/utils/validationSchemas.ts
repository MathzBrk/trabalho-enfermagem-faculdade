import { z } from 'zod';
import { UserRole } from '../types';

/**
 * Registration form validation schema
 * Matches backend RegisterSchema exactly
 */
export const RegisterFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido')
    .toLowerCase()
    .trim()
    .max(255, 'Email muito longo'),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(128, 'Senha muito longa')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(255, 'Nome muito longo')
    .trim(),
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .regex(/^\d{11}$/, 'CPF deve conter exatamente 11 dígitos'),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos'),
  role: z.enum(['EMPLOYEE', 'NURSE', 'MANAGER'], {
    errorMap: () => ({ message: 'Selecione uma função válida' }),
  }),
  coren: z.string().optional(),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) => {
    if (data.role === 'NURSE') {
      if (!data.coren || data.coren.trim().length === 0) {
        ctx.addIssue({
          path: ['coren'],
          code: z.ZodIssueCode.custom,
          message: 'COREN é obrigatório para enfermeiros',
        });
      }
    } else if (data.coren && data.coren.trim().length === 0) {
      ctx.addIssue({
        path: ['coren'],
        code: z.ZodIssueCode.custom,
        message: 'COREN não pode estar vazio se fornecido',
      });
    }
  });

export type RegisterFormData = z.infer<typeof RegisterFormSchema>;

/**
 * Update profile validation schema
 */
export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(255, 'Nome muito longo')
    .trim()
    .optional(),
  phone: z
    .string()
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
    .optional()
    .or(z.literal('')),
  role: z.enum(['EMPLOYEE', 'NURSE', 'MANAGER']).optional(),
  coren: z.string().optional(),
  isActive: z.boolean().optional(),
})
  .superRefine((data, ctx) => {
    if (data.role === 'NURSE') {
      if (!data.coren || data.coren.trim().length === 0) {
        ctx.addIssue({
          path: ['coren'],
          code: z.ZodIssueCode.custom,
          message: 'COREN é obrigatório para enfermeiros',
        });
      }
    } else if (data.coren && data.coren.trim().length === 0) {
      ctx.addIssue({
        path: ['coren'],
        code: z.ZodIssueCode.custom,
        message: 'COREN não pode estar vazio se fornecido',
      });
    }
  });

export type UpdateProfileFormData = z.infer<typeof UpdateProfileSchema>;

/**
 * Login validation schema
 */
export const LoginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;
