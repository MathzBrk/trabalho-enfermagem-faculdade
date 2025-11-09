import { z } from 'zod';

export const GetVaccineByIdQuerySchema = z.object({
  include: z.enum(['batches']).optional(),
});

export type GetVaccineByIdQuery = z.infer<typeof GetVaccineByIdQuerySchema>;
