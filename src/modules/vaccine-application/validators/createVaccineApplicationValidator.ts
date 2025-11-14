import { z } from 'zod';

/**
 * Validation schema for creating a vaccine application
 *
 * Supports two scenarios:
 * 1. Scheduled appointment: schedulingId provided (user/vaccine/dose derived from scheduling)
 * 2. Walk-in: receivedById + vaccineId + doseNumber provided (auto-creates scheduling)
 *
 * XOR validation ensures exactly one scenario is provided, not both or neither.
 */
export const CreateVaccineApplicationBodySchema = z
  .object({
    // Optional for scheduled appointments (derived from scheduling)
    // Required for walk-ins
    receivedById: z.string().uuid('Receiver ID must be a valid UUID').optional(),
    vaccineId: z.string().uuid('Vaccine ID must be a valid UUID').optional(),
    doseNumber: z
      .number()
      .int('Dose number must be an integer')
      .min(1, 'Dose number must be at least 1')
      .max(10, 'Dose number cannot exceed 10')
      .optional(),

    // Always required
    appliedById: z.string().uuid('Applicator ID must be a valid UUID'),
    batchId: z.string().uuid('Batch ID must be a valid UUID'),
    applicationSite: z
      .string()
      .min(1, 'Application site is required')
      .max(100, 'Application site cannot exceed 100 characters'),
    observations: z
      .string()
      .max(500, 'Observations cannot exceed 500 characters')
      .optional(),

    // Optional - indicates scheduled appointment
    schedulingId: z
      .string()
      .uuid('Scheduling ID must be a valid UUID')
      .optional(),
  })
  .refine(
    (data) => {
      // Either schedulingId OR (receivedById + vaccineId + doseNumber) must be provided
      const hasScheduling = !!data.schedulingId;
      const hasWalkInData =
        !!data.receivedById &&
        !!data.vaccineId &&
        data.doseNumber !== undefined;

      // XOR: exactly one must be true, not both or neither
      return hasScheduling !== hasWalkInData;
    },
    {
      message:
        'Either schedulingId OR (receivedById, vaccineId, doseNumber) must be provided, but not both',
    },
  );

export type CreateVaccineApplicationDTO = z.infer<
  typeof CreateVaccineApplicationBodySchema
>;
