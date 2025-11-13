import { z } from 'zod';

export const CreateVaccineSchedulingBodySchema = z.object({
  userId: z.string().uuid('User ID must be a valid UUID'),
  vaccineId: z.string().uuid('Vaccine ID must be a valid UUID'),
  scheduledDate: z.string().datetime('Invalid date format. Must be ISO 8601 datetime'),
  doseNumber: z.number().int().min(1, 'Dose number must be at least 1').max(10, 'Dose number cannot exceed 10').default(1),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});
