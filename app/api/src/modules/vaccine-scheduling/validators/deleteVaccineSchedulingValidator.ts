import { z } from 'zod';

export const DeleteVaccineSchedulingParamsSchema = z.object({
  id: z.string().uuid('Scheduling ID must be a valid UUID'),
});

export type DeleteVaccineSchedulingParamsDTO = z.infer<typeof DeleteVaccineSchedulingParamsSchema>;
