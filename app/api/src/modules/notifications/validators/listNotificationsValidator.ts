import type { NotificationType } from '@infrastructure/database';
import { z } from 'zod';

/**
 * Schema for validating query parameters when listing notifications
 * Validates pagination params (page, perPage) and optional filters (isRead, type)
 */
export const ListNotificationsQuerySchema = z
  .object({
    page: z.string().optional(),
    perPage: z.string().optional(),
    isRead: z.string().optional(),
    type: z.string().optional(),
  })
  .transform((data) => ({
    page: data.page ? parseInt(data.page, 10) : 1,
    perPage: data.perPage ? parseInt(data.perPage, 10) : 10,
    isRead: data.isRead ? data.isRead === 'true' : undefined,
    type: data.type ? (data.type as NotificationType) : undefined,
  }))
  .refine((data) => data.page >= 1, {
    message: 'Page must be at least 1',
    path: ['page'],
  })
  .refine((data) => data.perPage >= 1 && data.perPage <= 100, {
    message: 'PerPage must be between 1 and 100',
    path: ['perPage'],
  });

export type ListNotificationsQuery = z.infer<typeof ListNotificationsQuerySchema>;
