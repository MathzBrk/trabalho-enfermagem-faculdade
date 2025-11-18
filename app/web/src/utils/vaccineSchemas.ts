import { z } from 'zod';

/**
 * Validation schema for creating a vaccine
 */
export const CreateVaccineSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  manufacturer: z
    .string()
    .min(1, 'Fabricante é obrigatório')
    .min(2, 'Fabricante deve ter no mínimo 2 caracteres')
    .max(100, 'Fabricante deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  dosesRequired: z.coerce
    .number({ message: 'Número de doses deve ser um número' })
    .int('Número de doses deve ser um número inteiro')
    .min(1, 'Número de doses deve ser no mínimo 1')
    .max(10, 'Número de doses deve ser no máximo 10'),
  isObligatory: z.boolean(),
  intervalDays: z.coerce
    .number({ message: 'Intervalo deve ser um número' })
    .int('Intervalo deve ser um número inteiro')
    .min(0, 'Intervalo deve ser no mínimo 0 dias')
    .max(365, 'Intervalo deve ser no máximo 365 dias')
    .optional(),
  minStockLevel: z.coerce
    .number({ message: 'Estoque mínimo deve ser um número' })
    .int('Estoque mínimo deve ser um número inteiro')
    .min(0, 'Estoque mínimo deve ser no mínimo 0')
    .optional(),
});

export type CreateVaccineFormData = z.infer<typeof CreateVaccineSchema>;

/**
 * Validation schema for updating a vaccine
 */
export const UpdateVaccineSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  manufacturer: z
    .string()
    .min(2, 'Fabricante deve ter no mínimo 2 caracteres')
    .max(100, 'Fabricante deve ter no máximo 100 caracteres')
    .optional(),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  dosesRequired: z.coerce
    .number({ message: 'Número de doses deve ser um número' })
    .int('Número de doses deve ser um número inteiro')
    .min(1, 'Número de doses deve ser no mínimo 1')
    .max(10, 'Número de doses deve ser no máximo 10')
    .optional(),
  isObligatory: z.boolean().optional(),
  intervalDays: z.coerce
    .number({ message: 'Intervalo deve ser um número' })
    .int('Intervalo deve ser um número inteiro')
    .min(0, 'Intervalo deve ser no mínimo 0 dias')
    .max(365, 'Intervalo deve ser no máximo 365 dias')
    .optional(),
  minStockLevel: z.coerce
    .number({ message: 'Estoque mínimo deve ser um número' })
    .int('Estoque mínimo deve ser um número inteiro')
    .min(0, 'Estoque mínimo deve ser no mínimo 0')
    .optional(),
});

export type UpdateVaccineFormData = z.infer<typeof UpdateVaccineSchema>;

/**
 * Validation schema for creating a vaccine batch
 */
export const CreateVaccineBatchSchema = z.object({
  vaccineId: z.string().min(1, 'Vacina é obrigatória'),
  batchNumber: z
    .string()
    .min(1, 'Número do lote é obrigatório')
    .min(2, 'Número do lote deve ter no mínimo 2 caracteres')
    .max(50, 'Número do lote deve ter no máximo 50 caracteres'),
  quantity: z.coerce
    .number({ message: 'Quantidade deve ser um número' })
    .int('Quantidade deve ser um número inteiro')
    .min(1, 'Quantidade deve ser no mínimo 1'),
  expirationDate: z
    .string()
    .min(1, 'Data de validade é obrigatória')
    .refine((date) => {
      const expDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return expDate >= today;
    }, 'Data de validade deve ser no futuro'),
  receivedDate: z
    .string()
    .refine((date) => {
      if (!date) return true;
      const recDate = new Date(date);
      const today = new Date();
      return recDate <= today;
    }, 'Data de recebimento não pode ser no futuro')
    .optional(),
});

export type CreateVaccineBatchFormData = z.infer<typeof CreateVaccineBatchSchema>;

/**
 * Validation schema for updating a vaccine batch
 */
export const UpdateVaccineBatchSchema = z.object({
  batchNumber: z
    .string()
    .min(2, 'Número do lote deve ter no mínimo 2 caracteres')
    .max(50, 'Número do lote deve ter no máximo 50 caracteres')
    .optional(),
  quantity: z.coerce
    .number({ message: 'Quantidade deve ser um número' })
    .int('Quantidade deve ser um número inteiro')
    .min(1, 'Quantidade deve ser no mínimo 1')
    .optional(),
  expirationDate: z
    .string()
    .refine((date) => {
      if (!date) return true;
      const expDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return expDate >= today;
    }, 'Data de validade deve ser no futuro')
    .optional(),
  receivedDate: z
    .string()
    .refine((date) => {
      if (!date) return true;
      const recDate = new Date(date);
      const today = new Date();
      return recDate <= today;
    }, 'Data de recebimento não pode ser no futuro')
    .optional(),
});

export type UpdateVaccineBatchFormData = z.infer<typeof UpdateVaccineBatchSchema>;
