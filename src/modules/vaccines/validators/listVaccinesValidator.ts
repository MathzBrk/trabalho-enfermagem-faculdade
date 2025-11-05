import { PAGINATION_DEFAULTS } from '@shared/interfaces/pagination';
import { z } from 'zod';

export const ListVaccinesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) =>
      val ? Number.parseInt(val, 10) : PAGINATION_DEFAULTS.PAGE,
    )
    .refine((val) => !Number.isNaN(val) && val >= 1, {
      message: 'Page must be a number >= 1',
    }),
  perPage: z
    .string()
    .optional()
    .transform((val) =>
      val ? Number.parseInt(val, 10) : PAGINATION_DEFAULTS.PER_PAGE,
    )
    .refine(
      (val) =>
        !Number.isNaN(val) &&
        val >= PAGINATION_DEFAULTS.MIN_PER_PAGE &&
        val <= PAGINATION_DEFAULTS.MAX_PER_PAGE,
      {
        message: `perPage must be between ${PAGINATION_DEFAULTS.MIN_PER_PAGE} and ${PAGINATION_DEFAULTS.MAX_PER_PAGE}`,
      },
    ),
  sortBy: z
    .string()
    .optional()
    .default(PAGINATION_DEFAULTS.SORT_BY)
    .refine((val) => ['name', 'createdAt', 'updatedAt'].includes(val), {
      message: 'Invalid sortBy field. Allowed: name, createdAt, updatedAt',
    }),
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default(PAGINATION_DEFAULTS.SORT_ORDER),
  manufacturer: z.string().optional(),
  isObligatory: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    })
    .refine((val) => val === undefined || typeof val === 'boolean', {
      message: 'isObligatory must be true or false',
    }),
});

export type ListVaccinesQuery = z.infer<typeof ListVaccinesQuerySchema>;
