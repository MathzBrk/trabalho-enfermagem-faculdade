import { z } from 'zod';

export const GetSchedulingsByDateQuerySchema = z.object({
  date: z
    .string()
    .datetime('Invalid date format. Must be ISO 8601 datetime')
    .optional(),
});

export type GetSchedulingsByDateDTO = z.infer<typeof GetSchedulingsByDateQuerySchema>;
