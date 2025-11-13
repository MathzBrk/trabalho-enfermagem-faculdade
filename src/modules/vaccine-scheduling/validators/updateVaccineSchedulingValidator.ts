import { z } from 'zod';

export const UpdateVaccineSchedulingParamsSchema = z.object({
  id: z.string().uuid('Scheduling ID must be a valid UUID'),
});

export const UpdateVaccineSchedulingBodySchema = z.object({
  scheduledDate: z.string().datetime('Invalid date format. Must be ISO 8601 datetime').optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' },
);

export type UpdateVaccineSchedulingParamsDTO = z.infer<typeof UpdateVaccineSchedulingParamsSchema>;
