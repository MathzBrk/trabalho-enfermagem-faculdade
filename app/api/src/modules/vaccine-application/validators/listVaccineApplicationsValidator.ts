import { PAGINATION_DEFAULTS } from '@shared/interfaces/pagination';
import { z } from 'zod';
import { allowedVaccineApplicationSortFields } from '../constants';

export const ListVaccineApplicationsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : PAGINATION_DEFAULTS.PAGE))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: 'Page must be a positive integer',
    }),
  perPage: z
    .string()
    .optional()
    .transform((val) =>
      val ? parseInt(val, 10) : PAGINATION_DEFAULTS.PER_PAGE,
    )
    .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
      message: 'Per page must be between 1 and 100',
    }),
  sortBy: z
    .string()
    .optional()
    .default('applicationDate')
    .refine(
      (val) =>
        allowedVaccineApplicationSortFields.includes(
          val as (typeof allowedVaccineApplicationSortFields)[number],
        ),
      {
        message: `Sort by must be one of: ${allowedVaccineApplicationSortFields.join(', ')}`,
      },
    ),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  userId: z.string().uuid('User ID must be a valid UUID').optional(),
  vaccineId: z.string().uuid('Vaccine ID must be a valid UUID').optional(),
  appliedById: z
    .string()
    .uuid('Applied by ID must be a valid UUID')
    .optional(),
  batchId: z.string().uuid('Batch ID must be a valid UUID').optional(),
  doseNumber: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 1), {
      message: 'Dose number must be a positive integer',
    }),
});

export type ListVaccineApplicationsQueryDTO = z.infer<
  typeof ListVaccineApplicationsQuerySchema
>;
