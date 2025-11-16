import { z } from 'zod';

/**
 * Validation schema for user ID parameter
 * Ensures the ID is a valid UUID format
 */
export const IdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export type IdParam = z.infer<typeof IdParamSchema>;
