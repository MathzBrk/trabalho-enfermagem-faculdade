import { z } from 'zod';

export const ListVaccineBatchesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum([
      'batchNumber',
      'expirationDate',
      'receivedDate',
      'currentQuantity',
      'initialQuantity',
      'status',
      'createdAt',
    ])
    .default('expirationDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  status: z.enum(['AVAILABLE', 'EXPIRED', 'DEPLETED', 'DISCARDED']).optional(),
  expiringBefore: z.string().datetime().optional(),
  expiringAfter: z.string().datetime().optional(),
  minQuantity: z.coerce.number().int().min(0).optional(),
});

export type ListVaccineBatchesQuery = z.infer<
  typeof ListVaccineBatchesQuerySchema
>;
