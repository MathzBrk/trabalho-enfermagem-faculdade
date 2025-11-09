import { z } from 'zod';

export const VaccineIdParamSchema = z.object({
  id: z.string().uuid('Vaccine ID must be a valid UUID'),
});
