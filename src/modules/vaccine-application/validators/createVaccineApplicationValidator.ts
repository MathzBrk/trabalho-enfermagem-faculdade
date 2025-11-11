import { z } from 'zod';

export const CreateVaccineApplicationBodySchema = z.object({
  receivedById: z.string().uuid('Receiver ID must be a valid UUID'),
  appliedById: z.string().uuid('Applicator ID must be a valid UUID'),
  vaccineId: z.string().uuid('Vaccine ID must be a valid UUID'),
  batchId: z.string().uuid('Batch ID must be a valid UUID'),
  doseNumber: z
    .number()
    .int('Dose number must be an integer')
    .min(1, 'Dose number must be at least 1')
    .max(10, 'Dose number cannot exceed 10'),
  applicationSite: z
    .string()
    .min(1, 'Application site is required')
    .max(100, 'Application site cannot exceed 100 characters'),
  observations: z
    .string()
    .max(500, 'Observations cannot exceed 500 characters')
    .optional(),
  schedulingId: z
    .string()
    .uuid('Scheduling ID must be a valid UUID')
    .optional(),
});

export type CreateVaccineApplicationDTO = z.infer<
  typeof CreateVaccineApplicationBodySchema
>;
