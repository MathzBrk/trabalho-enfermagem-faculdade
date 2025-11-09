import { z } from 'zod';

export const UpdateVaccineBodySchema = z.object({
  name: z
    .string()
    .min(1, 'Vaccine name is required')
    .max(100, 'Vaccine name too long')
    .optional(),
  manufacturer: z
    .string()
    .min(1, 'Manufacturer is required')
    .max(100, 'Manufacturer name too long')
    .optional(),
  dosesRequired: z
    .number()
    .int()
    .min(1, 'Doses required must be at least 1')
    .max(10, 'Doses required too high')
    .optional(),
  description: z.string().max(500, 'Description too long').optional(),
  isObligatory: z.boolean().optional(),
  intervalDays: z
    .number()
    .min(1, 'Interval days must be at least 1')
    .optional(),
  minStockLevel: z
    .number()
    .min(0, 'Min stock level cannot be negative')
    .optional(),
});
