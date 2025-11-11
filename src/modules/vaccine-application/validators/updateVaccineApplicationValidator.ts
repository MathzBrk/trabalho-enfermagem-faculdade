import { z } from 'zod';

export const UpdateVaccineApplicationBodySchema = z.object({
  applicationSite: z
    .string()
    .min(1, 'Application site cannot be empty')
    .max(100, 'Application site cannot exceed 100 characters')
    .optional(),
  observations: z
    .string()
    .max(500, 'Observations cannot exceed 500 characters')
    .optional(),
});

export type UpdateVaccineApplicationDTO = z.infer<
  typeof UpdateVaccineApplicationBodySchema
>;
