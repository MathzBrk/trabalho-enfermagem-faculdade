import { z } from 'zod';

export const idParamsSchema = z.object({
  id: z.string().uuid('ID must be a valid UUID'),
});
