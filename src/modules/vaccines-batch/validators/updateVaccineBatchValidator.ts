import { z } from 'zod';

export const UpdateVaccineBatchBodySchema = z.object({
  batchNumber: z
    .string()
    .min(1, 'Batch number cannot be empty if provided')
    .max(100, 'Batch number too long')
    .optional(),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .optional(),
  expirationDate: z
    .string()
    .refine((date) => !Number.isNaN(Date.parse(date)), {
      message: 'Expiration date must be a valid ISO date string',
    })
    .transform((date) => new Date(date))
    .optional(),
  receivedDate: z
    .string()
    .refine((date) => !Number.isNaN(Date.parse(date)), {
      message: 'Received date must be a valid ISO date string',
    })
    .transform((date) => new Date(date))
    .optional(),
  status: z.enum(['AVAILABLE', 'EXPIRED', 'DEPLETED', 'DISCARDED']).optional(),
});
