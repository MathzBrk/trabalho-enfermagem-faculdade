import type { NotificationType } from '@infrastructure/database';
import { z } from 'zod';

/**
 * Schema for validating query parameters when listing notifications
 * Validates pagination params (page, perPage) and optional filters (isRead, type)
 */
export const ListNotificationsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, {
      message: 'Page must be at least 1',
    }),
  perPage: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 100, {
      message: 'PerPage must be between 1 and 100',
    }),
  isRead: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  type: z
    .enum(['DOSE_REMINDER', 'VACCINE_EXPIRING', 'LOW_STOCK', 'SCHEDULING_CONFIRMED', 'GENERAL'])
    .optional()
    .transform((val) => val as NotificationType),
});

export type ListNotificationsQuery = z.infer<typeof ListNotificationsQuerySchema>;
