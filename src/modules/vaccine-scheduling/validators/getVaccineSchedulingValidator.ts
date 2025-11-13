import { z } from 'zod';

export const GetVaccineSchedulingParamsSchema = z.object({
  id: z.string().uuid('Scheduling ID must be a valid UUID'),
});

export type GetVaccineSchedulingParamsDTO = z.infer<typeof GetVaccineSchedulingParamsSchema>;
