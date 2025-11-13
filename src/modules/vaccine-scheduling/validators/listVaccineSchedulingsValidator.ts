import { z } from 'zod';

export const ListVaccineSchedulingsQuerySchema = z.object({
  userId: z.string().uuid('User ID must be a valid UUID').optional(),
  vaccineId: z.string().uuid('Vaccine ID must be a valid UUID').optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  startDate: z.string().datetime('Invalid start date format. Must be ISO 8601 datetime').optional(),
  endDate: z.string().datetime('Invalid end date format. Must be ISO 8601 datetime').optional(),
  page: z.string().optional().default('1').transform(Number).pipe(z.number().int().min(1, 'Page must be at least 1')),
  limit: z.string().optional().default('10').transform(Number).pipe(z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100')),
});

export type ListVaccineSchedulingsDTO = z.infer<typeof ListVaccineSchedulingsQuerySchema>;
