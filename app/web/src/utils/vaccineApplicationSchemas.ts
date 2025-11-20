import { z } from 'zod';

/**
 * Valid application sites for vaccine administration
 */
export const APPLICATION_SITES = [
  'Braço Esquerdo',
  'Braço Direito',
  'Deltoide Esquerdo',
  'Deltoide Direito',
  'Coxa Esquerda',
  'Coxa Direita',
  'Abdômen',
  'Glúteo',
] as const;

/**
 * Validation schema for scheduled application (Type A)
 */
export const CreateScheduledApplicationSchema = z.object({
  schedulingId: z
    .string()
    .min(1, 'Agendamento é obrigatório')
    .uuid('ID de agendamento inválido'),
  batchId: z
    .string()
    .min(1, 'Lote é obrigatório')
    .uuid('ID de lote inválido'),
  applicationSite: z
    .string()
    .min(1, 'Local de aplicação é obrigatório')
    .min(1, 'Local de aplicação deve ter no mínimo 1 caractere')
    .max(100, 'Local de aplicação deve ter no máximo 100 caracteres'),
  observations: z
    .string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional(),
});

export type CreateScheduledApplicationFormData = z.infer<typeof CreateScheduledApplicationSchema>;

/**
 * Validation schema for walk-in application (Type B)
 */
export const CreateWalkInApplicationSchema = z.object({
  receivedById: z
    .string()
    .min(1, 'Paciente é obrigatório')
    .uuid('ID de paciente inválido'),
  vaccineId: z
    .string()
    .min(1, 'Vacina é obrigatória')
    .uuid('ID de vacina inválido'),
  doseNumber: z.coerce
    .number({ message: 'Número da dose deve ser um número' })
    .int('Número da dose deve ser um número inteiro')
    .min(1, 'Número da dose deve ser no mínimo 1')
    .max(10, 'Número da dose deve ser no máximo 10'),
  batchId: z
    .string()
    .min(1, 'Lote é obrigatório')
    .uuid('ID de lote inválido'),
  applicationSite: z
    .string()
    .min(1, 'Local de aplicação é obrigatório')
    .min(1, 'Local de aplicação deve ter no mínimo 1 caractere')
    .max(100, 'Local de aplicação deve ter no máximo 100 caracteres'),
  observations: z
    .string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional(),
});

export type CreateWalkInApplicationFormData = z.infer<typeof CreateWalkInApplicationSchema>;

/**
 * Validation schema for updating a vaccine application
 */
export const UpdateVaccineApplicationSchema = z.object({
  applicationSite: z
    .string()
    .min(1, 'Local de aplicação deve ter no mínimo 1 caractere')
    .max(100, 'Local de aplicação deve ter no máximo 100 caracteres')
    .optional(),
  observations: z
    .string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional(),
});

export type UpdateVaccineApplicationFormData = z.infer<typeof UpdateVaccineApplicationSchema>;
