import { z } from 'zod';

/**
 * Schema for validating notification ID parameter
 * Ensures the ID is a valid UUID
 */
export const NotificationIdParamSchema = z.object({
  id: z.string().uuid('Invalid notification ID format'),
});

export type NotificationIdParam = z.infer<typeof NotificationIdParamSchema>;
