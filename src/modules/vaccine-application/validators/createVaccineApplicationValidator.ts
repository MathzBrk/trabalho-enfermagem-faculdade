import { z } from 'zod';

/**
 * Common fields shared between both application types
 */
const CommonApplicationFields = {
  batchId: z.string().uuid('Batch ID must be a valid UUID'),
  applicationSite: z
    .string()
    .min(1, 'Application site is required')
    .max(100, 'Application site cannot exceed 100 characters'),
  observations: z
    .string()
    .max(500, 'Observations cannot exceed 500 characters')
    .optional(),
};

/**
 * Schema for applications linked to an existing scheduling
 * All patient/vaccine data comes from the scheduling
 */
const ScheduledApplicationSchema = z.object({
  ...CommonApplicationFields,
  schedulingId: z.string().uuid('Scheduling ID must be a valid UUID'),
});

/**
 * Schema for walk-in applications (no prior scheduling)
 * All patient/vaccine data must be provided
 */
const WalkInApplicationSchema = z.object({
  ...CommonApplicationFields,
  receivedById: z.string().uuid('Receiver ID must be a valid UUID'),
  vaccineId: z.string().uuid('Vaccine ID must be a valid UUID'),
  doseNumber: z
    .number()
    .int('Dose number must be an integer')
    .min(1, 'Dose number must be at least 1')
    .max(10, 'Dose number cannot exceed 10'),
});

/**
 * Union of both application types
 * Validates that EITHER scheduling OR walk-in fields are provided
 *
 * This approach provides:
 * - Better type safety (TypeScript knows which fields are available)
 * - Clearer error messages (no confusing XOR logic)
 * - Automatic validation that the correct fields are present for each scenario
 */
export const CreateVaccineApplicationBodySchema = z.union(
  [ScheduledApplicationSchema, WalkInApplicationSchema],
  {
    message:
      'Either schedulingId (for scheduled applications) OR (receivedById, vaccineId, doseNumber) (for walk-in applications) must be provided, but not both',
  },
);

export type CreateVaccineApplicationDTO = z.infer<
  typeof CreateVaccineApplicationBodySchema
>;

/**
 * Type guard to check if the application is scheduled
 */
export const isScheduledApplication = (
  data: CreateVaccineApplicationDTO,
): data is z.infer<typeof ScheduledApplicationSchema> => {
  return 'schedulingId' in data;
};

/**
 * Type guard to check if the application is walk-in
 */
export const isWalkInApplication = (
  data: CreateVaccineApplicationDTO,
): data is z.infer<typeof WalkInApplicationSchema> => {
  return 'receivedById' in data;
};

/**
 * Explicit types for each application scenario
 */
export type ScheduledApplicationDTO = z.infer<
  typeof ScheduledApplicationSchema
>;
export type WalkInApplicationDTO = z.infer<typeof WalkInApplicationSchema>;
